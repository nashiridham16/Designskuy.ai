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
  additionalPrompt: string;
}

export interface GeneratedContent {
  articleBody: string;
  metaDescription: string;
  tags: string[];
}