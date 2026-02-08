// code/backend/src/services/create-assistant.js
require("dotenv").config();
const { createChatAssistant } = require("./backboard");

async function main() {
    const assistant = await createChatAssistant();
    console.log("Assistant:", assistant);
    console.log("Assistant ID:", assistant.assistant_id || assistant.id);
}

main().catch(console.error);