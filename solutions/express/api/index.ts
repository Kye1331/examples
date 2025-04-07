import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

import path from "path";

dotenv.config();

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY || "");

app.use(express.static(path.join(__dirname, "../public")));


// Accept question via query string (GET /ask?question=...)
app.get("/ask", async (req: Request, res: Response) => {
  const question = req.query.question as string;

  if (!question) {
    return res.status(400).json({ error: "Query parameter 'question' is required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" }); // Or gemini-pro if supported
    const stream = await model.generateContentStream(question);

    res.setHeader("Content-Type", "text/plain");

    for await (const chunk of stream.stream) {
      const text = chunk.text();
      if (text) res.write(text);
    }

    res.end();
  } catch (error) {
    console.error("Error streaming response:", error);
    res.status(500).send("Failed to generate response");
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
