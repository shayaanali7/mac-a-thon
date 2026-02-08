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
function toAudioBlob(input, mimeType = "audio/mp3") {
  if (input instanceof Blob) {
    return input;
  }

  if (Buffer.isBuffer(input)) {
    return new Blob([input], { type: mimeType });
  }

  if (typeof input === "string") {
    const buffer = fs.readFileSync(input);
    return new Blob([buffer], { type: "audio/mp3" });
  }

  throw new Error("Unsupported audio input type");
}

async function transcribeAudio(input, mimeType) {
  const audioBlob = toAudioBlob(input, mimeType);

  const result = await elevenlabs.speechToText.convert({
    file: audioBlob,
    modelId: "scribe_v2",
    tagAudioEvents: true,
    diarize: true,
    languageCode: "eng",
  });

  if (!result || !Array.isArray(result.words)) {
    return [];
  }

  // Group words by speaker
  const speakers = {};

  result.words.forEach((word) => {
    if (word.type !== "word") {
      return; // skip spacing/punctuation
    }

    const speakerId = word.speakerId;
    if (!speakers[speakerId]) {
      speakers[speakerId] = [];
    }
    speakers[speakerId].push({
      text: word.text,
      start: word.start,
      end: word.end,
    });
  });

  // Combine words into sentences per speaker
  const dialogue = [];

  Object.entries(speakers).forEach(([speakerId, words]) => {
    let sentence = "";
    let startTime = null;
    let endTime = null;

    words.forEach((word, idx) => {
      if (!sentence) {
        startTime = word.start;
      }

      sentence += (sentence ? " " : "") + word.text;
      endTime = word.end;

      if (/[.!?]$/.test(word.text) || idx === words.length - 1) {
        dialogue.push({
          speakerId,
          text: sentence,
          start: startTime,
          end: endTime,
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