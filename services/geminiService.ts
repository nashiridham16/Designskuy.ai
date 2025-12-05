import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { ArticleFormData } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    articleBody: {
      type: Type.STRING,
      description: "The main content of the article formatted in Markdown. Include headers (##), lists, and bold text where appropriate.",
    },
    metaDescription: {
      type: Type.STRING,
      description: "An SEO-optimized meta description between 115-125 characters.",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 recommended SEO tags.",
    },
  },
  required: ["articleBody", "metaDescription", "tags"],
};

export const generateSEOArticle = async (formData: ArticleFormData): Promise<any> => {
  const modelId = "gemini-2.5-flash"; // Using Flash for speed and efficiency with large context

  const systemInstruction = `
    You are a world-class SEO Content Writer and Copywriter with deep expertise in E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) principles.
    
    Your task is to write articles that are:
    1. 100% Unique and Human-written (avoid robotic patterns).
    2. Highly readable (use simple language suitable for laypeople).
    3. Optimized for SEO.
    
    STRICT WRITING RULES:
    - **Sentence Length:** Keep sentences short. Do not exceed 20 words per sentence.
    - **Transition Words:** Use transition words frequently (aim for 1 per sentence/clause) to ensure smooth flow.
    - **Passive Voice:** Use passive voice moderately to sound objective, but balance with active voice.
    - **Semantic Keywords:** Naturally integrate semantic keywords related to the main topic.
    - **Structure:** Use clear Markdown formatting (## for H2, ### for H3, bullet points).
    - **Value:** The content must be actionable, helpful, and provide specific value to the reader.
    
    META DESCRIPTION RULE:
    - Create a compelling meta description between 115 and 125 characters.
    - Include the main keyword.
  `;

  const prompt = `
    Generate a complete SEO article based on the following specifications:
    
    - **Title:** ${formData.title}
    - **Language:** ${formData.language}
    - **Primary Keywords:** ${formData.keywords}
    - **Target Length:** Approximately ${formData.wordCount} words
    - **Writing Style:** ${formData.style}
    - **Article Goal:** ${formData.goal}
    - **Brand/Product Name:** ${formData.brand}
    - **Required Subheadings:**
      ${formData.subtitles.filter(s => s.trim() !== '').map(s => `- ${s}`).join('\n')}
      (Feel free to add more subheadings if necessary to reach the word count or improve flow)

    **CRITICAL STRUCTURAL REQUIREMENTS:**
    1. **Introduction:** The very first paragraph MUST be an introduction that naturally includes the primary keywords (${formData.keywords}).
    2. **Brand Recommendation:** You MUST include a dedicated paragraph recommending the brand/product '${formData.brand}' immediately *before* the Conclusion section. Make this natural but persuasive.
    3. **Conclusion:** The FINAL section of the article must be a Header 2 (##) titled "Conclusion" (or "Kesimpulan" if the language is Indonesian).
    4. **User Custom Instructions:** Follow these additional instructions from the user: "${formData.additionalPrompt}"

    Please output the result in JSON format containing the article body (markdown), meta description, and tags.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.7, // Slightly creative but structured
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Error generating article:", error);
    throw error;
  }
};