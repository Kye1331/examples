import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY || "");

// Function to ask Gemini a question
async function AskGemini(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    // Ensuring response is awaited properly
    const response = await result.response;
    return await response.text();  // Awaiting text() to properly return the string
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate response");
  }
}

// POST /ask route
app.post("/ask", async (req: Request, res: Response) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const answer = await AskGemini(question);
    res.json({ question, answer });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// Start server locally (optional for dev only)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
