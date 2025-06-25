require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Mount routes
app.use('/prompts_api', require('./routes/prompts'));
app.use('/persona_api', require('./routes/persona'));
app.use('/stats_api', require('./routes/stats'));


// Page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/prompts', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'prompts.html'));
});

app.get('/persona', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'persona.html'));
});

app.get('/stats', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});



// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
