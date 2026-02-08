// code/backend/src/services/list-assistants.js
require("dotenv").config();
const { listAssistants } = require("./backboard");

(async () => {
    const assistants = await listAssistants();
    console.log(assistants);
})();