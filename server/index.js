import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { spawn } from "child_process";
import path from "path";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const pythonScript = path.resolve("../model/main.py");
const pythonVenv = path.resolve("../model/venv/Scripts/python.exe");
// On Linux: "../model/venv/bin/python"

app.post("/api/model", (req, res) => {
  const { message, model } = req.body;

  if (!message || !model) {
    return res.status(400).json({ error: "Message and model are required" });
  }

  const pythonProcess = spawn(pythonVenv, [pythonScript, model, message]);

  let output = "";
  let error = "";

  pythonProcess.stdout.on("data", (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    error += data.toString();
  });


  pythonProcess.on("close", (code) => {
    try {
      const parsed = JSON.parse(output);
      if (parsed.error) {
        res.status(500).json({ error: parsed.error });
      } else {
        res.json({ reply: parsed.result });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to parse Python output" });
    }
  });


});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

