const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '..', 'prompts.json');
let db = fs.existsSync(dbPath)
  ? JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
  : { prompts: {}, usageStats: {} };

function saveDB() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// Add a new prompt
router.post('/', (req, res) => {
  const { name, text } = req.body;
  if (!name || !text) return res.status(400).send("Missing name or text");

  const versionId = uuidv4();
  if (!db.prompts[name]) db.prompts[name] = [];

  db.prompts[name].push({ versionId, text, createdAt: new Date().toISOString() });
  db.usageStats[versionId] = 0;
  saveDB();

  res.json({ message: 'Prompt added', versionId });
});

// Get latest version
router.get('/:name', (req, res) => {
  const versions = db.prompts[req.params.name];
  if (!versions || versions.length === 0) return res.status(404).send("Prompt not found");

  const latest = versions[versions.length - 1];
  db.usageStats[latest.versionId]++;
  saveDB();

  res.json({ prompt: latest });
});

// Get all versions
router.get('/:name/history', (req, res) => {
  const versions = db.prompts[req.params.name];
  if (!versions) return res.status(404).send("Prompt not found");

  res.json({ versions });
});

module.exports = router;
