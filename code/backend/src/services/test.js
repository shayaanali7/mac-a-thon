const { listAssistants, deleteAssistant, createAssistant, listModels } = require("./backboard.js"); // adjust file name

(async () => {
    // await createAssistant();
    await listAssistants();
    // await listModels();
})();
