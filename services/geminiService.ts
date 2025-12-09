import { GoogleGenAI, Type } from "@google/genai";
import { ArticleFormData, GeneratedContent, GeneratedImages } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    articleBody: {
      type: Type.STRING,
      description: "The main content of the article formatted in Markdown. Use headers (##) and lists. Do NOT use bold text.",
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
    generatedSubheadings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of the H2 subheadings used in the article body. Return this exactly as they appear in the markdown.",
    }
  },
  required: ["articleBody", "metaDescription", "tags", "generatedSubheadings"],
};

// Helper function to generate an image
const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // Set aspect ratio to 16:9 (1280x720 approx equivalent ratio)
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });
    
    // Iterate through parts to find image data
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const generateSEOArticle = async (formData: ArticleFormData): Promise<GeneratedContent> => {
  const modelId = "gemini-2.5-flash"; // Text generation

  const systemInstruction = `
    You are a world-class SEO Content Writer and Copywriter with deep expertise in E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) principles.
    
    Your task is to write articles that are:
    1. 100% Unique and Human-written (avoid robotic patterns).
    2. Highly readable (use simple language suitable for laypeople).
    3. Optimized for SEO.
    
    STRICT WRITING RULES:
    - **NO BOLD TEXT:** Do NOT use bold formatting (**text**) anywhere in the paragraphs or lists. Only use headers (##) for structure.
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

  // Logic to handle optional subtitles
  const subheadingInstruction = formData.subtitles.length > 0
    ? formData.subtitles.map(s => `- ${s}`).join('\n')
    : "- Auto-generate at least 3 relevant subheadings that cover the topic comprehensively.";

  const prompt = `
    Generate a complete SEO article based on the following specifications:
    
    - **Title:** ${formData.title}
    - **Language:** ${formData.language}
    - **Primary Keywords:** ${formData.keywords}
    - **Target Length:** Approximately ${formData.wordCount} words
    - **Writing Style:** ${formData.style}
    - **Article Goal:** ${formData.goal}
    - **Brand/Product Name:** ${formData.brand}
    - **Structure/Subheadings:**
      ${subheadingInstruction}

    **CRITICAL STRUCTURAL REQUIREMENTS:**
    1. **Introduction:** The very first paragraph MUST be an introduction that naturally includes the primary keywords (${formData.keywords}).
    2. **Brand Recommendation:** You MUST include a dedicated paragraph recommending the brand/product '${formData.brand}' immediately *before* the Conclusion section. Make this natural but persuasive.
    3. **Conclusion:** The FINAL section of the article must be a Header 2 (##) titled "Conclusion" (or "Kesimpulan" if the language is Indonesian).
    4. **User Custom Instructions:** Follow these additional instructions from the user: "${formData.additionalPrompt}"
    5. **Subheadings:** If the user provided specific subheadings, use them exactly as Header 2 (##) or Header 3 (###) in Markdown. If generated automatically, list them in the generatedSubheadings field.

    Please output the result in JSON format containing the article body (markdown), meta description, tags, and generatedSubheadings.
  `;

  try {
    // 1. Generate Text
    const textResponse = await ai.models.generateContent({
      model: modelId,
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.7,
      },
    });

    const text = textResponse.text;
    if (!text) throw new Error("No response generated");
    
    const parsedContent = JSON.parse(text);

    // 2. Generate Images (Parallel)
    const imagePromises: Promise<{key: string, data: string | null}>[] = [];
    const generatedImages: GeneratedImages = { subheadingImages: {} };

    // A. Title Image (Always)
    imagePromises.push(
      generateImage(`Photorealistic, cinematic lighting, 16:9 aspect ratio, high quality, 4k image representing the concept: "${formData.title}". Style: Professional, Editorial. No text, no typography, clean image.`)
        .then(data => ({ key: 'title', data }))
    );

    // B. Subheading Images Logic
    let subheadingsToVisualize: string[] = [];

    // Check if user provided subtitles explicitly
    const hasUserSubtitles = formData.subtitles.some(s => s.trim().length > 0);

    if (hasUserSubtitles) {
      // Use user selection
      formData.subtitlesWithImages.forEach(index => {
        const subtitleText = formData.subtitles[index];
        if (subtitleText && subtitleText.trim() !== '') {
          subheadingsToVisualize.push(subtitleText);
        }
      });
    } else {
      // Auto Mode: User didn't provide subtitles, so we use the ones generated by AI.
      // We pick the first 3 relevant subheadings (excluding "Conclusion" if possible, handled by slice usually)
      if (parsedContent.generatedSubheadings && Array.isArray(parsedContent.generatedSubheadings)) {
        subheadingsToVisualize = parsedContent.generatedSubheadings
          .filter((h: string) => !h.toLowerCase().includes('conclusion') && !h.toLowerCase().includes('kesimpulan'))
          .slice(0, 3);
      }
    }

    // Generate images for selected subheadings
    subheadingsToVisualize.forEach(subtitle => {
      imagePromises.push(
        generateImage(`Illustration or photo representing: "${subtitle}". Context: ${formData.title}. Cinematic lighting, 16:9 aspect ratio, High quality, 4k. No text, no typography, clean image.`)
          .then(data => ({ key: subtitle, data }))
      );
    });

    // Wait for all images
    const imageResults = await Promise.all(imagePromises);

    imageResults.forEach(res => {
      if (res.data) {
        if (res.key === 'title') {
          generatedImages.titleImage = res.data;
        } else {
          generatedImages.subheadingImages[res.key] = res.data;
        }
      }
    });

    return {
      ...parsedContent,
      images: generatedImages,
      originalKeywords: formData.keywords
    };

  } catch (error) {
    console.error("Error generating article:", error);
    throw error;
  }
};