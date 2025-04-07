import { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from .env file
dotenv.config();

// Initialize GoogleGenerativeAI client
const apiKey = process.env.GENAI_API_KEY;
if (!apiKey) {
  throw new Error("API key is missing in environment variables");
}

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

// Export the serverless function handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const prompt = req.body.question;

    // Check if the question is provided
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Question is required" });
    }

    try {
      // Call the AskGemini function to get the response from the AI
      const answer = await AskGemini(prompt);

      // Return the response as a JSON object
      res.status(200).json({
        question: prompt,
        answer: answer,
      });
    } catch (error) {
      console.error("Error handling /ask request:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  } else {
    // If method is not POST, return a method not allowed error
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
