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
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate response");
  }
}

// Accept question via query string (GET /ask?question=...)
app.get("/ask", async (req: Request, res: Response) => {
  const question = req.query.question as string;

  if (!question) {
    return res.status(400).json({ error: "Query parameter 'question' is required" });
  }

  try {
    const answer = await AskGemini(question);
    res.json({ question, answer });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// Optionally keep your POST /ask route for JSON too
app.post("/ask", async (req: Request, res: Response) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const answer = await AskGemini(question);
    res.json({ question, answer });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// Start the server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
