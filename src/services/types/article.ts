export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  source: string;
  category: string;
  publishedAt: string;
  url: string;
  imageUrl?: string;
  dateStart?: string;
  dateEnd?: string;
}

export interface SearchFilters {
  keyword: string;
  startDate: string;
  endDate: string;
  categories: string[];
  sources: string[];
  authors: string[];
}

export interface UserPreferences {
  preferredSources: string[];
  preferredCategories: string[];
  preferredAuthors: string[];
} 