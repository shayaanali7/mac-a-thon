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
  if (input instanceof Blob) {
    return input;
  }

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
    diarize: true,
    languageCode: "eng",
  });

  return result;
}

module.exports = { transcribeAudio };