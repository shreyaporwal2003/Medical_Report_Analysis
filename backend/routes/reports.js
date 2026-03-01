const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fetch = require("node-fetch");
const Report = require("../models/Report");
const Metric = require("../models/Metric");

const router = express.Router();


// ================= ENSURE UPLOADS FOLDER EXISTS =================
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}


// ================= MULTER =================
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});


// ================= AUTH =================
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};


// ================= UPLOAD ROUTE =================
router.post(
  "/upload",
  authenticate,
  upload.single("report"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let extractedText = "";

      // ===== TEXT EXTRACTION =====
      if (req.file.mimetype === "application/pdf") {
        const buffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;

        if (!extractedText.trim()) {
          const { data: { text } } =
            await Tesseract.recognize(req.file.path, "eng");
          extractedText = text;
        }
      }
      else if (
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const buffer = fs.readFileSync(req.file.path);
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      }
      else {
        const { data: { text } } =
          await Tesseract.recognize(req.file.path, "eng");
        extractedText = text;
      }

      if (!extractedText.trim()) {
        return res.status(400).json({ error: "Text extraction failed" });
      }

      console.log("Extracted length:", extractedText.length);

      const limitedText = extractedText.slice(0, 12000);

      const prompt = `
Return ONLY valid JSON.
No markdown.
No explanation.

{
  "reportDetails": { "hospital": null, "MRN": null, "dates": null, "doctor": null },
  "patientDetails": { "name": null, "age": null, "gender": null },
  "tests": [
    { "testName": null, "method": null, "value": null, "unit": null, "referenceRange": null, "status": null }
  ],
  "summary": "plain English summary"
}

Report:
${limitedText}
`;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        return res.status(500).json({
          error: data.error.message || "Gemini API error",
        });
      }

      if (!data.candidates?.length) {
        return res.status(500).json({
          error: "Gemini returned no candidates",
        });
      }

      const rawText = data.candidates[0].content.parts
        .map((p) => p.text)
        .join("\n");

      const cleanedText = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      let parsedData;

      try {
        parsedData = JSON.parse(cleanedText);
      } catch {
        return res.status(500).json({
          error: "AI returned invalid JSON",
        });
      }

      // ===== NORMALIZE TESTS =====
      parsedData.tests = (parsedData.tests || []).map((t) => ({
        testName: t.testName || "Unknown",
        method: t.method || null,
        value: !isNaN(parseFloat(t.value)) ? parseFloat(t.value) : null,
        unit: t.unit || "-",
        referenceRange: t.referenceRange || null,
        status: (t.status || "normal").toLowerCase(),
      }));

      // ===== SAVE REPORT =====
      const report = await Report.create({
        userId: req.userId,
        filePath: req.file.path,
        extractedText,
        parsedData,
        summary: parsedData.summary || "No summary",
      });

      // ===== SAVE METRICS =====
      for (const test of parsedData.tests) {
        if (test.value !== null) {
          await Metric.create({
            userId: req.userId,
            metric: test.testName,
            value: test.value,
            unit: test.unit,
            status: test.status,
            timestamp: new Date(),
          });
        }
      }

      res.json({ report, parsedData });

    } catch (err) {
      console.error("Processing error:", err);
      res.status(500).json({ error: "Processing error" });
    }
  }
);


// ================= GET ALL REPORTS =================
router.get("/", authenticate, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (err) {
    console.error("Fetch reports error:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});


// ================= SUMMARY ROUTE =================
router.get("/summary", authenticate, async (req, res) => {
  try {
    const metrics = await Metric.find({ userId: req.userId })
      .sort({ timestamp: 1 });

    const counts = { normal: 0, high: 0, low: 0 };
    const trendMap = {};

    for (const m of metrics) {
      if (counts[m.status] !== undefined) {
        counts[m.status]++;
      }

      if (!trendMap[m.metric]) {
        trendMap[m.metric] = [];
      }

      trendMap[m.metric].push({
        label: new Date(m.timestamp).toLocaleDateString(),
        value: m.value,
      });
    }

    // 🔥 NO LIMIT — SHOW ALL CHARTS
    const charts = Object.entries(trendMap).map(([name, data]) => ({
      name,
      data,
    }));

    res.json({ counts, charts });

  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});


// ================= SINGLE REPORT (ALWAYS LAST) =================
router.get("/:id", authenticate, async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({ report });

  } catch (err) {
    console.error("Fetch single report error:", err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});


module.exports = router;