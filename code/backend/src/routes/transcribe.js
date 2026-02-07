const express = require("express");
const { getAudio, saveTranscript } = require("../services/supabase.js");
const { transcribeAudio } = require("../services/eleven.js");

const router = express.Router();

router.post("/transcribe/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;

    const blob = await getAudio(filename);

    const transcript = await transcribeAudio(blob);

    await saveTranscript(filename, transcript.text);

    res.json(transcript);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
