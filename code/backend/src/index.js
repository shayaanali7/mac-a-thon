require("dotenv").config({ override: true });
const express = require("express");
const transcribeRoute = require("./routes/transcribe.js");
const chatRoute = require("./routes/chat.js");

const app = express();

app.use(express.json());
app.use("/api", transcribeRoute);
app.use("/api", chatRoute);


const PORT = 4000;
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}/`;
  console.log(`Server running — click: ${url}`);
});


console.log("BACKBOARD_ASSISTANT_ID set:", Boolean(process.env.BACKBOARD_ASSISTANT_ID));
