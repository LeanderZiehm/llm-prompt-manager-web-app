const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
    console.log(req,res);
  const { instructions } = req.body;
  if (!instructions) return res.status(400).send("Missing instructions");

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.3-70b-versatile",
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
    console.log(response);

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error calling Groq API");
  }
});

module.exports = router;
