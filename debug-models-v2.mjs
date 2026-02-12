import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Read .env.local
const envPath = path.resolve('.env.local');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
    }
} catch (e) {
    console.error("Could not read .env.local", e);
    process.exit(1);
}

if (!apiKey) {
    console.error("API Key not found");
    process.exit(1);
}

console.log("Using API Key ending in:", apiKey.slice(-4));

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        let output = "AVAILABLE MODELS:\n";
        if (data.models) {
            data.models.forEach(m => {
                output += `Name: ${m.name}\n`;
                output += `Methods: ${JSON.stringify(m.supportedGenerationMethods)}\n`;
                output += `----\n`;
            });
        } else {
            output += "No models found in response.\n";
            output += JSON.stringify(data, null, 2);
        }

        fs.writeFileSync('available_models.txt', output, 'utf8');
        console.log("Model list written to available_models.txt");

    } catch (error) {
        console.error("Failed to list models:", error);
        fs.writeFileSync('available_models.txt', `Error: ${error.message}`, 'utf8');
    }
}

listModels();
