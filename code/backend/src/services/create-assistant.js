// code/backend/src/services/create-assistant.js
require("dotenv").config();
const { createAssistant } = require("./backboard");

async function main() {
    const assistant = await createAssistant();
    console.log("Assistant:", assistant);
    console.log("Assistant ID:", assistant.assistant_id || assistant.id);
}

main().catch(console.error);