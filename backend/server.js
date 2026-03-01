const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")

dotenv.config()
const app = express()

// CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Vite frontend
    credentials: true,
  })
)

app.use(express.json())
app.use("/uploads", express.static("uploads"))

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err))

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/reports", require("./routes/reports"))

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err)
  res.status(500).json({ error: err.message })
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))