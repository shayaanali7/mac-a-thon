const backboard = require("./backboard.js");

(async () => {
    // console.log('Assistants:', await backboard.listAssistants());
    // console.log('Threads:', await backboard.listThreads());
    // console.log('Deleting all threads:', await backboard.deleteThread('eb985312-027f-4709-ba63-60f44003ac0e'));
    // console.log('Test:', await backboard.createThread('de204905-bce2-4712-a4cf-0ab0787bb1ca'));
    console.log('Creating message:', await backboard.sendMessage('f5329896-4063-4e22-a2b2-cb47c0820537', "what did i say i fractured"));
    // console.log('Test:', await backboard.listThreads());
    // const threads = await backboard.listThreads();
    // console.log('Threads:', JSON.stringify(threads, null, 2));
    // console.log('memories:', await backboard.getMemory('de204905-bce2-4712-a4cf-0ab0787bb1ca'));
})();
