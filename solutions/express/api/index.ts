const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();  // Load environment variables
const apiKey = process.env.GENAI_API_KEY;
const ai = new GoogleGenerativeAI({ apiKey });

const app = express();
app.use(express.json()); // Middleware to parse JSON request body

async function AskGemini(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  return response.text;
}

// Route to handle the /ask endpoint
app.post('/ask', async (req, res) => {
  const prompt = req.body.question;  // Get the question from the request body
  if (!prompt) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const answer = await AskGemini(prompt);
    res.json({
      question: prompt,
      answer: answer
    });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Read file content (optional, just to show file reading functionality)
fs.readFile('prompts/mytextfile.txt', 'utf-8', (err, data) => {
  if (err) {
    console.error("An error occurred:", err);
    return;
  }
  console.log(data);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
