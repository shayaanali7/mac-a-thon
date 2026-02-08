const express = require("express");
const { createThread, sendMessageChat } = require("../services/backboard.js");

const router = express.Router();

router.post("/chat", express.json(), async (req, res) => {
    try {
        const { message, threadId } = req.body || {};

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
