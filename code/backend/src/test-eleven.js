// src/test-eleven.js
require("dotenv/config");
const { transcribeAudio } = require("./services/eleven.js");
const https = require("https");
const fs = require("fs");
const path = require("path");

async function downloadSampleAudio() {
  const url =
    "https://storage.googleapis.com/eleven-public-cdn/audio/marketing/nicole.mp3";
  const filePath = path.join(process.cwd(), "sample-audio.mp3");

  if (fs.existsSync(filePath)) {
    console.log("✅ Sample audio already exists");
    return filePath;
  }

  return new Promise((resolve, reject) => {
    console.log("📥 Downloading sample audio...");
    https.get(url, (response) => {
      const file = fs.createWriteStream(filePath);
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        console.log(`✅ Downloaded to ${filePath}`);
        resolve(filePath);
      });
      file.on("error", reject);
    });
  });
}

async function main() {
  const arg = process.argv[2];

  let audioFile;
  if (arg) {
    audioFile = arg;
    if (!fs.existsSync(audioFile)) {
      console.error(`❌ File not found: ${audioFile}`);
      process.exit(1);
    }
  } else {
    audioFile = await downloadSampleAudio();
  }

  console.log("\n🧪 Testing transcribeAudio() from eleven.js...\n");

  try {
    const result = await transcribeAudio(audioFile);
    console.log("✅ Success! Result:");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();