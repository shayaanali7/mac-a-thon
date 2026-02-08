const express = require("express");
const multer = require("multer");
const { transcribeAudio } = require("../services/eleven.js");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    console.log("🎯 Transcribe request received");
    console.log("📋 File:", req.file?.originalname, "-", req.file?.size, "bytes");
    console.log("📋 Conversation ID:", req.body.conversationId);

    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    if (!req.body.conversationId) {
      return res.status(400).json({ error: "No conversationId provided" });
    }

    console.log("⏳ Transcribing...");
    const dialogue = await transcribeAudio(req.file.buffer, req.file.mimetype);
    console.log("✅ Transcription complete:", dialogue.length, "entries");

    return res.json({
      success: true,
      dialogue,
      conversationId: req.body.conversationId,
    });
  } catch (error) {
    console.error("❌ Transcription error:", error);
    return res.status(500).json({
      error: "Transcription failed",
      details: error instanceof Error ? error.message : "Unknown",
    });
  }
});

module.exports = router;