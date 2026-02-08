require("dotenv/config");
const express = require("express");
const transcribeRoute = require("./routes/transcribe.js");
const cors = require('cors');
const multer = require('multer');
const { analyzeImagesWithGemini, generateSummaryWithGemini } = require('./services/gemini.js');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use("/api", transcribeRoute);

// NEW: Regenerate summary with additional images
app.post('/api/regenerate-summary', upload.any(), async (req, res) => {
  try {
    console.log('🔄 Regenerate summary request received');

    const conversationId = req.body.conversationId;
    const imageFiles = req.files;

    console.log('📋 Conversation ID:', conversationId);
    console.log('📸 New images:', imageFiles.length);

    if (!conversationId) {
      return res.status(400).json({ error: 'Missing conversationId' });
    }

    if (!imageFiles || imageFiles.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    console.log('⏳ Analyzing images with Gemini...');
    const imageAnalysis = await analyzeImagesWithGemini(imageFiles);
    console.log('✅ Image analysis complete');

    res.json({
      success: true,
      imageAnalysis,
      conversationId
    });

  } catch (error) {
    console.error('❌ Regenerate summary error:', error);
    res.status(500).json({
      error: 'Failed to regenerate summary',
      details: error.message
    });
  }
});

// Generate summary (separate endpoint for reuse)
app.post('/api/generate-summary', express.json(), async (req, res) => {
  try {
    const { dialogue, imageAnalysis } = req.body;

    console.log('📝 Generating summary...');
    console.log('   Dialogue entries:', dialogue?.length || 0);
    console.log('   Image analyses:', imageAnalysis?.length || 0);

    const summary = await generateSummaryWithGemini(dialogue, imageAnalysis);

    res.json({ success: true, summary });

  } catch (error) {
    console.error('❌ Summary generation error:', error);
    res.status(500).json({
      error: 'Failed to generate summary',
      details: error.message
    });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}/`;
  console.log(`Server running — click: ${url}`);
});
