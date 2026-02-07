const fs = require("fs");
const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");

const elevenlabs = new ElevenLabsClient();

/*
  Converts ANY of these:
  - Blob
  - Buffer
  - file path string
  → into an audio Blob
*/
function toAudioBlob(input) {
  if (input instanceof Blob) return input;

  if (Buffer.isBuffer(input)) {
    return new Blob([input], { type: "audio/mp3" });
  }

  if (typeof input === "string") {
    const buffer = fs.readFileSync(input);
    return new Blob([buffer], { type: "audio/mp3" });
  }

  throw new Error("Unsupported audio input type");
}

async function transcribeAudio(input) {
  const audioBlob = toAudioBlob(input);

  const result = await elevenlabs.speechToText.convert({
    file: audioBlob,
    modelId: "scribe_v2",
    tagAudioEvents: true,
    languageCode: "eng",
    diarize: true
  });

  // group words by speaker
  const speakers = {};

  result.words.forEach(word => {
    if (word.type !== "word") return; // skip spacing/punctuation

    const speakerId = word.speakerId; // keep raw speakerId
    if (!speakers[speakerId]) speakers[speakerId] = [];
    speakers[speakerId].push({
      text: word.text,
      start: word.start,
      end: word.end
    });
  });

  // combine words into sentences per speaker
  const dialogue = [];

  Object.entries(speakers).forEach(([speakerId, words]) => {
    let sentence = "";
    let startTime = null;
    let endTime = null;

    words.forEach((word, idx) => {
      if (!sentence) startTime = word.start;

      sentence += (sentence ? " " : "") + word.text;
      endTime = word.end;

      // split on punctuation or last word
      if (/[.!?]$/.test(word.text) || idx === words.length - 1) {
        dialogue.push({
          speakerId,   // keep the raw speakerId
          text: sentence,
          start: startTime,
          end: endTime
        });

        sentence = "";
        startTime = null;
        endTime = null;
      }
    });
  });

  dialogue.sort((a, b) => a.start - b.start);

  return dialogue;
}

module.exports = { transcribeAudio };
