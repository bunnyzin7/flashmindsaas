import { GoogleGenerativeAI } from "@google/generative-ai";
import { Flashcard } from "../types";

export const generateFlashcards = async (topic: string, count: number = 3): Promise<Flashcard[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Chave de API do Google Gemini não configurada.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Gere ${count} flashcards de estudo sobre o tema: "${topic}". 
    Cada flashcard deve ter uma pergunta concisa na frente e uma resposta explicativa no verso.
    Responda EXCLUSIVAMENTE com um JSON array, sem markdown, seguindo este formato:
    [
      { "front": "Pergunta 1", "back": "Resposta 1" },
      { "front": "Pergunta 2", "back": "Resposta 2" }
    ]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const rawData = JSON.parse(cleanText);

    if (!Array.isArray(rawData)) {
      throw new Error("Formato de resposta inválido");
    }

    return rawData.map((item: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      front: item.front,
      back: item.back,
    }));
  } catch (error: any) {
    console.error("Full error object:", error);
    console.error("Error calling Gemini:", error.message || error);

    // Check for specific API errors
    if (error.message?.includes('API key')) {
      throw new Error("Chave de API inválida ou expirada. Verifique suas configurações.");
    }

    if (error.message?.includes('429')) {
      throw new Error("Muitas requisições. Aguarde um momento e tente novamente.");
    }

    throw new Error(`Falha ao gerar cards: ${error.message || "Erro desconhecido"}`);
  }
};
