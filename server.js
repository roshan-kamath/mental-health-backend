const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* =======================
   ROOT CHECK (FOR RENDER)
======================= */
app.get("/", (req, res) => {
  res.status(200).send("Mental Health Backend is running 🚀");
});

/* =======================
   DATA STRUCTURES
======================= */

// Stack (LIFO) → last 5 moods
let stack = [];

// Queue (FIFO) → last 10 moods
let queue = [];

// Hash Map → mood → triggers & symptoms
let hashMap = {};

// Mood values
const moodValues = {
  "Very Happy": 5,
  "Happy": 4,
  "Neutral": 3,
  "Sad": 2,
  "Very Sad": 1
};

/* =======================
   API ROUTES
======================= */

// ➕ Add Mood Entry
app.post("/addMood", (req, res) => {
  const { mood, trigger, symptom } = req.body;

  if (!mood) {
    return res.status(400).json({ message: "Mood is required" });
  }

  const entry = {
    mood,
    value: moodValues[mood],
    trigger: trigger || "",
    symptom: symptom || "",
    time: new Date().toLocaleString()
  };

  // STACK (LIFO)
  stack.unshift(entry);
  if (stack.length > 5) stack.pop();

  // QUEUE (FIFO)
  queue.push(entry);
  if (queue.length > 10) queue.shift();

  // HASH MAP
  if (!hashMap[mood]) {
    hashMap[mood] = { count: 0, triggers: [], symptoms: [] };
  }

  hashMap[mood].count++;
  if (trigger) hashMap[mood].triggers.push(trigger);
  if (symptom) hashMap[mood].symptoms.push(symptom);

  res.json({ message: "Mood added successfully" });
});

// 📚 Get Stack
app.get("/stack", (req, res) => res.json(stack));

// 🔄 Get Queue
app.get("/queue", (req, res) => res.json(queue));

// 📊 Get Hash Map
app.get("/hashmap", (req, res) => res.json(hashMap));

// 🗑️ Pop from Stack
app.delete("/stack/pop", (req, res) => {
  if (!stack.length) return res.status(400).json({ message: "Stack empty" });
  stack.shift();
  res.json(stack);
});

// 🗑️ Dequeue from Queue
app.delete("/queue/dequeue", (req, res) => {
  if (!queue.length) return res.status(400).json({ message: "Queue empty" });
  queue.shift();
  res.json(queue);
});

// 🚨 Mood Alert
app.get("/alert", (req, res) => {
  if (stack.length < 3) return res.json({ alert: false });

  const recent = stack.slice(0, 3).map(e => e.value);
  const allLow = recent.every(v => v <= 2);
  const spike = Math.max(...recent) - Math.min(...recent) >= 3;

  res.json({ alert: allLow || spike });
});

/* =======================
   START SERVER
======================= */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
