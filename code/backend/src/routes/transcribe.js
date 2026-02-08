const express = require("express");
const multer = require("multer");
const { transcribeAudio } = require("../services/eleven.js");
const { createThread, sendMessageAnalyzer } = require("../services/backboard.js");

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

    let analysis = null;
    const assistantId = process.env.BACKBOARD_ASSISTANT_ID;

    if (assistantId) {
      try {
        console.log("🤖 Creating analyzer thread...");
        console.log("🧩 Assistant ID:", assistantId);
        const thread = await createThread(assistantId);
        console.log("🧵 Thread response:", thread);

        const threadId = thread?.id || thread?.thread_id;
        if (!threadId) {
          console.warn("⚠️ Analyzer thread creation failed; missing thread id");
        } else {
          console.log("🧠 Sending transcript for analysis...");
          analysis = await sendMessageAnalyzer(threadId, dialogue);
        }

        if (!analysis) {
          console.warn("⚠️ Analyzer returned no data");
        }
      } catch (analysisError) {
        console.error("❌ Analyzer failed:", analysisError);
      }
    } else {
      console.warn("⚠️ BACKBOARD_ASSISTANT_ID not set; skipping analysis");
    }

    return res.json({
      success: true,
      dialogue,
      analysis,
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