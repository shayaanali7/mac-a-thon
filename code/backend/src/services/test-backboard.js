const backboard = require("./backboard.js");

(async () => {
    // console.log('Assistants:', await backboard.createAssistant());
    // console.log('Assistants:', await backboard.deleteAssistant('80c9fca0-5c1e-40dd-a62c-f2a8d505bbc3'));
    console.log('Assistants:', await backboard.listAssistants());
    // console.log('Deleting all threads:', await backboard.createThreadAnalyzer('4b0c46b1-6f9b-4d53-95bc-eda6684fd35e'));
    console.log('Threads:', await backboard.listThreads());
    // console.log('Test:', await backboard.createThreadAnalyzer('80c9fca0-5c1e-40dd-a62c-f2a8d505bbc3'));
    console.log('Creating message:', await backboard.sendMessageAnalyzer('2bb976c2-929c-4a1e-a92a-3e106d2c1d1a', [
  {
    speakerId: 'speaker_0',
    text: 'Hey there, how you doing?',
    start: 1.299,
    end: 2.939
  },
  {
    speakerId: 'speaker_1',
    text: "I'm, I'm good.",
    start: 3.079,
    end: 5.3
  },
  {
    speakerId: 'speaker_0',
    text: "That's fire.",
    start: 5.299,
    end: 6.76
  },
  {
    speakerId: 'speaker_0',
    text: "What's the problem?",
    start: 6.799,
    end: 8.119
  },
  {
    speakerId: 'speaker_1',
    text: 'Uh, I broke my knee.',
    start: 8.199,
    end: 10.639
  },
  {
    speakerId: 'speaker_0',
    text: 'Good for you.',
    start: 10.68,
    end: 12.099
  }
]));
})();
