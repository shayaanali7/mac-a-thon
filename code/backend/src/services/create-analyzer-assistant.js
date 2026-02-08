// code/backend/src/services/create-analyzer-assistant.js
require("dotenv").config();
const { createAnalyzerAssistant } = require("./backboard");

async function main() {
    const assistant = await createAnalyzerAssistant();
    console.log("Analyzer Assistant:", assistant);
    console.log("Analyzer ID:", assistant.assistant_id || assistant.id);
}

main().catch(console.error);