import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();  // Load environment variables
const apiKey = process.env.GENAI_API_KEY;
const ai = new GoogleGenerativeAI({ apiKey });

const app = express();
app.use(express.json());  // Middleware to parse JSON request body

// Function to ask Gemini
async function AskGemini(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  return response.text;
}

// /ask endpoint
app.post('/ask', async (req: Request, res: Response) => {
  const prompt = req.body.question;  // Get the question from the request body
  if (!prompt) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const answer = await AskGemini(prompt);
    res.json({
      question: prompt,
      answer: answer,
    });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Optional: Read file content
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
