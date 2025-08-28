import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { spawn } from "child_process";
import path from "path";

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

const pythonScript = path.resolve("../model/main.py");
const pythonVenv = path.resolve("../model/venv/bin/python"); 
// On Windows: "../model/venv/Scripts/python.exe"

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
    if (code === 0) {
      res.json({ reply: output.trim() });
    } else {
      res.status(500).json({ error: error || "Python script failed" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

