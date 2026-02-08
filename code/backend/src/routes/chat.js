const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createThread, sendMessageChat, uploadDocument } = require("../services/backboard.js");

const router = express.Router();

router.post("/chat", express.json(), async (req, res) => {
    try {
        const { message, threadId, transcript } = req.body || {};

        if (!message || typeof message !== "string") {
            return res.status(400).json({ error: "Missing message" });
        }

        const assistantId =
            process.env.BACKBOARD_CHAT_ASSISTANT_ID || process.env.BACKBOARD_ASSISTANT_ID;

        if (!assistantId) {
            return res.status(500).json({ error: "BACKBOARD_CHAT_ASSISTANT_ID not set" });
        }

        let activeThreadId = threadId;

        if (!activeThreadId) {
            const thread = await createThread(assistantId);
            activeThreadId = thread?.thread_id || thread?.id;

            if (activeThreadId && typeof transcript === "string" && transcript.trim()) {
                const tempFile = path.join(os.tmpdir(), `mediscribe-transcript-${Date.now()}.txt`);

                try {
                    fs.writeFileSync(tempFile, transcript, "utf8");
                    await uploadDocument(activeThreadId, tempFile);
                } catch (uploadError) {
                    console.error("❌ Transcript upload failed:", uploadError);
                } finally {
                    try {
                        fs.unlinkSync(tempFile);
                    } catch (cleanupError) {
                        console.error("⚠️ Temp transcript cleanup failed:", cleanupError);
                    }
                }
            }
        }

        if (!activeThreadId) {
            return res.status(500).json({ error: "Failed to create chat thread" });
        }

        const reply = await sendMessageChat(activeThreadId, message);

        if (!reply || !reply.content) {
            return res.status(500).json({ error: "Chat response unavailable" });
        }

        return res.json({ threadId: activeThreadId, reply: reply.content });
    } catch (error) {
        console.error("❌ Chat error:", error);
        return res.status(500).json({
            error: "Chat failed",
            details: error instanceof Error ? error.message : "Unknown",
        });
    }
});

module.exports = router;
