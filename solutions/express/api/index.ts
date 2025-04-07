import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();
const port = process.env.PORT || 3000;

// Setup middleware to parse JSON body
app.use(express.json());

// Check if the API key is set in the environment variables
const apiKey = process.env.GENAI_API_KEY;
if (!apiKey) {
  throw new Error("API key is missing in environment variables");
}

// Initialize the GoogleGenerativeAI client
const ai = new GoogleGenerativeAI({ apiKey });

// Function to ask Gemini AI and get the response
async function AskGemini(prompt: string): Promise<string> {
  try {
    // Make API request to the Gemini model
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",  // Replace with the actual model you're using
      contents: prompt,
    });

    // Check if the response contains valid text
    if (response && response.text) {
      return response.text;
    } else {
      throw new Error('No response text returned from AI model');
    }
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate response");
  }
}

// Handle POST requests to /ask
app.post('/ask', async (req: Request, res: Response) => {
  const prompt = req.body.question;

  // Check if the question is provided
  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    // Call the AskGemini function to get the response from the AI
    const answer = await AskGemini(prompt);

    // Return the response as a JSON object
    res.json({
      question: prompt,
      answer: answer,
    });
  } catch (error) {
    console.error("Error handling /ask request:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
