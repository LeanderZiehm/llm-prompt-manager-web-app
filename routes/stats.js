const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prompts.json');
const db = fs.existsSync(dbPath)
  ? JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
  : { prompts: {}, usageStats: {} };

router.get('/', (req, res) => {
  res.json(db.usageStats);
});

module.exports = router;
