import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

// Route to generate an image using Gemini
app.get("/gen", async (req: Request, res: Response) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY || "" });

  const contents = req.query.question as string;


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
        if (part.text) {
          console.log(part.text);
        } else if (part.inlineData?.data) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, "base64");
          fs.writeFileSync("public/gemini-native-image.png", buffer);
          console.log("Image saved as gemini-native-image.png");
        }
      }

      res.status(200).json({ message: "Image generated and saved as gemini-native-image.png" });
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

// Start the server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
