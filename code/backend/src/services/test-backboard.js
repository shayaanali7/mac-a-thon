const backboard = require("./backboard.js");

(async () => {
    //     // ===== SETUP: DELETE ALL (UNCOMMENT TO START FRESH) =====

    //     // DELETE ALL ASSISTANTS
    //     // const allAssistants = await backboard.listAssistants();
    //     // for (const assistant of allAssistants) {
    //     //     console.log(`Deleting assistant: ${assistant.name} (${assistant.assistant_id})`);
    //     //     await backboard.deleteAssistant(assistant.assistant_id);
    //     // }
    //     // console.log('All assistants deleted!\n');

    //     // DELETE ALL THREADS
    //     // const allThreads = await backboard.listThreads();
    //     // for (const thread of allThreads) {
    //     //     console.log(`Deleting thread: ${thread.thread_id}`);
    //     //     await backboard.deleteThread(thread.thread_id);
    //     // }
    //     // console.log('All threads deleted!\n');

    //     // ===== GET OR CREATE ASSISTANTS =====
    await backboard.deleteAssistant('4d4b8ac1-5780-40c0-8488-ad281eadabce');
    let assistants = await backboard.listAssistants();
    console.log('Existing assistants:', assistants);

    //     let analyzerAssistant = assistants.find(a => a.name.includes("Doctor Analyzer Assistant Gemini"));
    //     let chatAssistant = assistants.find(a => a.name.includes("Chat Assistant Gemini"));

    //     // Create analyzer assistant if it doesn't exist
    //     if (!analyzerAssistant) {
    //         console.log('Creating Analyzer Assistant...');
    //         analyzerAssistant = await backboard.createAnalyzerAssistant();
    //     }

    //     // Create chat assistant if it doesn't exist
    //     if (!chatAssistant) {
    //         console.log('Creating Chat Assistant...');
    //         chatAssistant = await backboard.createChatAssistant();
    //     }

    //     const analyzerAssistantId = analyzerAssistant.assistant_id;
    //     const chatAssistantId = chatAssistant.assistant_id;


    //     // ===== GET OR CREATE THREADS =====
    //     let threads = await backboard.listThreads();

    //     let analyzerThread = threads.find(t => t.assistant_id === analyzerAssistantId);
    //     let chatThread = threads.find(t => t.assistant_id === chatAssistantId);

    //     // Create analyzer thread if it doesn't exist
    //     if (!analyzerThread) {
    //         console.log('Creating Analyzer Thread...');
    //         analyzerThread = await backboard.createThread(analyzerAssistantId);
    //     }

    //     // Create chat thread if it doesn't exist
    //     if (!chatThread) {
    //         console.log('Creating Chat Thread...');
    //         chatThread = await backboard.createThread(chatAssistantId);
    //     }

    //     const analyzerThreadId = analyzerThread.thread_id;
    //     const chatThreadId = chatThread.thread_id;


    //     // ===== DISPLAY RESOURCES =====
    //     console.log('\n===== AVAILABLE RESOURCES =====');
    //     console.log('Analyzer Assistant ID:', analyzerAssistantId);
    //     console.log('Chat Assistant ID:', chatAssistantId);
    //     console.log('Analyzer Thread ID:', analyzerThreadId);
    //     console.log('Chat Thread ID:', chatThreadId);
    //     console.log('===============================\n');

    //     // ===== ACTIONS (UNCOMMENT WHAT YOU NEED) =====

    //     // List all assistants
    //     // console.log('All Assistants:', await backboard.listAssistants());

    //     // List all threads
    //     // console.log('All Threads:', await backboard.listThreads());

    //     // Send analyzer message (expects transcript array)
    //     // console.log('Analyzer Response:', await backboard.sendMessageAnalyzer(analyzerThreadId, [
    //     //   {
    //     //     speakerId: 'speaker_0',
    //     //     text: 'Hey, Doc, how was walking yesterday?',
    //     //     start: 0.68,
    //     //     end: 2.66
    //     //   },
    //     //   {
    //     //     speakerId: 'speaker_1',
    //     //     text: "Yeah, my diagnosis is that, uh, you have arm rip-off ellitis, and pretty much I need-- you need to take Advils for a week, and that's it.",
    //     //     start: 3.779,
    //     //     end: 17.199
    //     //   }
    //     // ]));

    //     // Send chat message (expects string prompt)
    //     // console.log('Chat Response:', await backboard.sendMessageChat(chatThreadId, "What medications was I prescribed?"));
})();