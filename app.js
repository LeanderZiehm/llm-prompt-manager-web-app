require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});




const dbPath = path.join(__dirname, 'prompts.json');

// Check if prompts.json exists; if not, create it with default structure
if (!fs.existsSync(dbPath)) {
  const initialData = {
    prompts: {},
    usageStats: {}
  };
  fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
}

// Load or initialize prompt data
let db = JSON.parse(fs.readFileSync('prompts.json', 'utf-8'));

// Helper to save DB to file
function saveDB() {
  fs.writeFileSync('prompts.json', JSON.stringify(db, null, 2));
}

// POST /prompts - Add a new prompt
app.post('/prompts', (req, res) => {
  const { name, text } = req.body;
  if (!name || !text) return res.status(400).send("Missing name or text");

  const versionId = uuidv4();
  if (!db.prompts[name]) db.prompts[name] = [];

  db.prompts[name].push({ versionId, text, createdAt: new Date().toISOString() });
  db.usageStats[versionId] = 0;
  saveDB();

  res.json({ message: 'Prompt added', versionId });
});

// GET /prompts/:name - Get latest version
app.get('/prompts/:name', (req, res) => {
  const name = req.params.name;
  const versions = db.prompts[name];
  if (!versions || versions.length === 0) return res.status(404).send("Prompt not found");

  const latest = versions[versions.length - 1];
  db.usageStats[latest.versionId]++;
  saveDB();

  res.json({ prompt: latest });
});

// GET /prompts/:name/history - Get all versions
app.get('/prompts/:name/history', (req, res) => {
  const name = req.params.name;
  const versions = db.prompts[name];
  if (!versions) return res.status(404).send("Prompt not found");

  res.json({ versions });
});

// GET /stats - See usage stats
app.get('/stats', (req, res) => {
  res.json(db.usageStats);
});

// POST /persona - Generate persona using Groq API
app.post('/persona', async (req, res) => {
  const { instructions } = req.body;
  if (!instructions) return res.status(400).send("Missing instructions");

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "mixtral-8x7b-32768",
        messages: [
          { role: "system", content: "You are a persona generator AI." },
          { role: "user", content: instructions }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error calling Groq API");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
