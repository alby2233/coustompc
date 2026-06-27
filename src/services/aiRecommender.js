import { GoogleGenerativeAI } from "@google/generative-ai";

export const getPCRecommendation = async (apiKey, modelName, budget, useCase, aesthetics, formFactor, brandPref) => {
  if (!apiKey) {
    throw new Error("API Key is required.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName || "gemini-2.5-flash" });

  const prompt = `
    You are an expert PC builder. A user from Kerala, India wants a PC recommendation based on the following constraints:
    - Budget: ₹${budget} (Indian Rupees)
    - Primary Use Case: ${useCase}
    - Aesthetics preference: ${aesthetics}
    - Form Factor: ${formFactor}
    - Brand Preference: ${brandPref}

    You MUST strictly adhere to the Brand Preference and Form Factor. For example, if Brand Preference is 'AMD CPU + NVIDIA GPU', you must only recommend an AMD CPU and an NVIDIA GPU.

    Provide EXACTLY 3 distinct alternative build options for the SAME budget (e.g., if Brand Preference is 'No Preference', you might do one AMD build, one Intel build, and one balanced build. If they specified brands, maybe provide one focused on max CPU performance, one balanced, and one focused on aesthetics).
    Generate a search URL for Amazon.in or Flipkart for each component.
    
    Return ONLY a JSON object matching this schema without any markdown wrappers or extra text:
    {
      "builds": [
        {
          "optionName": "Intel Performance Build",
          "totalEstimatedPrice": 85000,
          "benchmarks": {
            "fps1080p": 144,
            "fps1440p": 90,
            "wattage": 450
          },
          "components": [
            {
              "type": "CPU",
              "name": "Intel Core i5-12400F",
              "price": 12000,
              "link": "https://www.amazon.in/s?k=Intel+Core+i5-12400F"
            }
          ]
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching recommendation:", error);
    throw new Error("API Error: " + error.message);
  }
}
