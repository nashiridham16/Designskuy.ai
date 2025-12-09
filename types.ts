export enum WritingStyle {
  INFORMATIONAL = 'Informational',
  EDUCATIONAL = 'Educational',
  TRANSACTIONAL = 'Transactional',
}

export enum ArticleGoal {
  REVIEW = 'Review',
  TIPS = 'Tips',
  INFORMATION = 'Information',
  SELLING = 'Selling',
  COMPARISON = 'Comparison',
  RECOMMENDATION = 'Recommendation',
}

export enum Language {
  INDONESIA = 'Bahasa Indonesia',
  ENGLISH = 'English',
}

export interface ArticleFormData {
  title: string;
  language: Language;
  keywords: string;
  wordCount: number;
  style: WritingStyle;
  goal: ArticleGoal;
  brand: string;
  subtitles: string[];
  subtitlesWithImages: number[]; // Index of subtitles that should have images
  additionalPrompt: string;
}

export interface GeneratedImages {
  titleImage?: string;
  subheadingImages: Record<string, string>; // Map subheading text to image data
}

export interface GeneratedContent {
  articleBody: string;
  metaDescription: string;
  tags: string[];
  images: GeneratedImages;
  originalKeywords: string; // Needed for density checker
}