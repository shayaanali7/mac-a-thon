const express = require("express");
// const transcribeRoute = require("./routes/transcribe.js");

const app = express();

app.use(express.json());

// app.use("/api", transcribeRoute);

const PORT = 3000;
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}/`;
  console.log(`Server running — click: ${url}`);
});
