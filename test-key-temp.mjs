import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyCi2B8RDGTW-gjgEkZFPOr7xRQVFl7Om5M";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function testKey() {
    try {
        const prompt = "Hello, are you working?";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Success! API Key is working.");
        console.log("Response:", text);
    } catch (error) {
        console.error("Error testing API key:");
        console.error(error.message);
    }
}

testKey();
