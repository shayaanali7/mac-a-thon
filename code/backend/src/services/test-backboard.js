const backboard = require("./backboard.js");

(async () => {
    // console.log('Assistants:', await backboard.createAssistant());
    // console.log('Assistants:', await backboard.deleteAssistant('4b0c46b1-6f9b-4d53-95bc-eda6684fd35e'));
    // console.log('Assistants:', await backboard.listAssistants());
    // console.log('Deleting all threads:', await backboard.createThreadAnalyzer('6743d1d7-0a1c-4f1d-b0ac-5250423d4722'));
    // console.log('Threads:', await backboard.listThreads());
    console.log('Creating message:', await backboard.sendMessageAnalyzer('7df9d1ba-0fb8-47bb-b2ef-a8bd8b5032bb', [
  {
    speakerId: 'speaker_0',
    text: 'Hey, Doc, how was walking yesterday?',
    start: 0.68,
    end: 2.66
  },
  {
    speakerId: 'speaker_1',
    text: "Yeah, my diagnosis is that, uh, you have arm rip-off ellitis, and pretty much I need-- you need to take Advils for a week, and that's it.",
    start: 3.779,
    end: 17.199
  }
]));
})();
