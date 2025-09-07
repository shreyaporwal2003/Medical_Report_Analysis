import 'dotenv/config';
import fetch from 'node-fetch';

const apiKey = process.env.GEMINI_API_KEY;

async function testGemini() {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey
        },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: "Explain how AI works in a few words" }] }
          ]
        })
      }
    );

    const data = await response.json();
    console.log("Gemini Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Gemini request failed:", err);
  }
}

testGemini();
