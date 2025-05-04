import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

// Route to generate an image using Gemini

// Route to stream a Gemini text response based on query
app.get("/ask", async (req: Request, res: Response) => {
  const ai = new GoogleGenAI({apiKey:process.env.GENAI_API_KEY || ""});
  const question = req.query.question as string;

  if (!question) {
    return res.status(400).json({ error: "Query parameter 'question' is required" });
  }

  try {
      const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: question,
  });
  console.log(response.text);

    res.setHeader("Content-Type", "text/plain");


     res.write(response);

    res.end();
  } 
  catch (error) {
    console.error("Error streaming response:", error);
    res.status(500).send("Failed to generate response");
  }
});

// Optional: Simple testing form
app.get("/", (req: Request, res: Response) => {
  res.send("index.html");
});

// Start the server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
