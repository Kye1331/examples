import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

// Route to generate an image using Gemini
app.get("/gen", async (req: Request, res: Response) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY || "" });
  const contents = req.query.question as string;

  if (!contents) {
    return res.status(400).json({ error: "Query parameter 'question' is required" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: [{ role: "user", parts: [{ text: contents }] }],
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const imageData = part.inlineData.data;

          // Return base64-encoded image string as data URI
          return res.status(200).json({
            message: "Image generated successfully",
            imageBase64: `data:image/png;base64,${imageData}`,
          });
        }
      }

      res.status(500).json({ error: "Image data was not found in the response." });
    } else {
      res.status(500).json({ error: "No content returned from AI" });
    }
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

// Route to stream a Gemini text response based on query
app.get("/ask", async (req: Request, res: Response) => {
  const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY || "");
  const question = req.query.question as string;

  if (!question) {
    return res.status(400).json({ error: "Query parameter 'question' is required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
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

// Optional: Simple testing form
app.get("/", (req: Request, res: Response) => {
  res.send(`
    <form action="/gen" method="get">
      <input type="text" name="question" placeholder="Describe your image" style="width:300px" />
      <button type="submit">Generate Image</button>
    </form>
    <br/>
    <form action="/ask" method="get">
      <input type="text" name="question" placeholder="Ask something" style="width:300px" />
      <button type="submit">Ask AI</button>
    </form>
  `);
});

// Start the server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
