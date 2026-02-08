const backboard = require("./backboard.js");
const path = require("path");
const fs = require("fs");

(async () => {

    console.log('Adding assistant:', await backboard.createAnalyzerAssistant());
    console.log('Adding assistant:', await backboard.createChatAssistant());

    console.log('Assistants:', await backboard.listAssistants());
    console.log('Threads:', await backboard.listThreads());

})();