const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth"); // for Word docs
const fetch = require("node-fetch");
const Report = require("../models/Report");
const Metric = require("../models/Metric");

const router = express.Router();

// ---------------- Multer setup ----------------
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only image, PDF, or Word files are allowed!"),
        false
      );
    }
    cb(null, true);
  },
});

// ---------------- JWT middleware ----------------
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ---------------- Upload & Process Report ----------------
router.post(
  "/upload",
  authenticate,
  upload.single("report"),
  async (req, res) => {
    try {
      let extractedText = "";

      // -------- Extract text from file --------
      if (req.file.mimetype === "application/pdf") {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;

        // fallback OCR if PDF text empty
        if (!extractedText.trim()) {
          const {
            data: { text },
          } = await Tesseract.recognize(req.file.path, "eng");
          extractedText = text;
        }
      } else if (
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Word document
        const dataBuffer = fs.readFileSync(req.file.path);
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        extractedText = result.value;
      } else {
        // Image file
        const {
          data: { text },
        } = await Tesseract.recognize(req.file.path, "eng");
        extractedText = text;
      }

      // -------- Call Gemini --------
      const prompt = `
Extract structured medical information as JSON:
- reportDetails: hospital, MRN, dates, doctor
- patientDetails: name, age, gender
- tests: name, method (Ultrasound/Lab/etc.), value, unit, referenceRange, status (low/normal/high/abnormal)
- summary: plain-English summary of the report

Make sure all numeric values are numbers, units are strings, and if not available use null.
Only return valid JSON.

Report text:
${extractedText}
`;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.GEMINI_API_KEY,
          },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      const data = await response.json();

      if (!data.candidates || !data.candidates.length) {
        return res.status(500).json({ error: "No response from AI" });
      }

      const rawText = data.candidates[0].content.parts
        .map((p) => p.text)
        .join("\n");

      // -------- Parse JSON from AI --------
      let parsedData;
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        parsedData = JSON.parse(jsonMatch[0]);

        // Normalize tests array safely
        parsedData.tests = (parsedData.tests || []).map((t) => {
          let value = null;
          if (t.value !== undefined && t.value !== null && !isNaN(parseFloat(t.value))) {
            value = parseFloat(t.value);
          }

          return {
            testName: t.testName || t.name || "Unknown",
            method: t.method || null,
            value, // null if invalid
            unit: t.unit || "-",
            referenceRange: t.referenceRange || null,
            status: (t.status || "normal").toLowerCase(),
          };
        });

        // Ensure a summary exists
        if (!parsedData.summary) {
          parsedData.summary = "No summary provided by AI.";
        }
      } catch (e) {
        return res.status(500).json({
          error: "AI returned invalid JSON",
          rawText,
        });
      }

      // -------- Save report --------
      const report = new Report({
        userId: req.userId,
        filePath: req.file.path,
        extractedText,
        parsedData,
        summary: parsedData.summary,
      });
      await report.save();

      // -------- Save metrics (skip invalid values) --------
      for (const test of parsedData.tests) {
        if (test.value !== null && !isNaN(test.value)) {
          await new Metric({
            userId: req.userId,
            metric: test.testName,
            value: test.value,
            unit: test.unit,
            status: test.status,
            timestamp: new Date(),
          }).save();
        }
      }

      res.json({ report, parsedData });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Processing error" });
    }
  }
);

// ---------------- Get all reports ----------------
router.get("/", authenticate, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json({ reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// ---------------- Dashboard summary (must be ABOVE /:id) ----------------
router.get("/summary", authenticate, async (req, res) => {
  try {
    const metrics = await Metric.find({ userId: req.userId }).sort({
      timestamp: 1,
    });

    // Count statuses
    const counts = { normal: 0, high: 0, low: 0 };
    metrics.forEach((m) => {
      if (counts[m.status] !== undefined) counts[m.status]++;
    });

    // Group trends by metric
    const trendMap = {};
    metrics.forEach((m) => {
      const key = m.metric;
      if (!trendMap[key]) trendMap[key] = [];
      trendMap[key].push({
        label: new Date(m.timestamp).toLocaleDateString(),
        value: m.value,
      });
    });

    const charts = Object.entries(trendMap)
      .slice(0, 3)
      .map(([name, data]) => ({ name, data }));

    res.json({ counts, charts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// ---------------- Get single report ----------------
router.get("/:id", authenticate, async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json({ report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

module.exports = router;
