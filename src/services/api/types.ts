import { Article } from '../types/article';

export interface ApiResponse<T> {
  data: T;
  error?: string;
  total?: number;  // Total number of results available
}

export type CategoryMapping = {
  [key: string]: {
    guardian: string;
    nyt: string;
    newsApi: string;
  };
};

export const CATEGORY_MAPPINGS: CategoryMapping = {
  'World': {
    guardian: 'world',
    nyt: 'World',
    newsApi: 'news/World'
  },
  'Politics': {
    guardian: 'politics',
    nyt: 'Politics',
    newsApi: 'news/Politics'
  },
  'Business': {
    guardian: 'business',
    nyt: 'Business',
    newsApi: 'news/Business'
  },
  'Technology': {
    guardian: 'technology',
    nyt: 'Technology',
    newsApi: 'news/Technology'
  },
  'Science': {
    guardian: 'science',
    nyt: 'Science',
    newsApi: 'news/Science'
  },
  'Health': {
    guardian: 'healthcare',
    nyt: 'Health',
    newsApi: 'news/Health'
  },
  'Sports': {
    guardian: 'sport',
    nyt: 'Sports',
    newsApi: 'news/Sports'
  },
  'Entertainment': {
    guardian: 'culture',
    nyt: 'Arts',
    newsApi: 'news/Arts_Entertainment'
  }
};

export interface NewsApiParams {
  keyword?: string;
  startDate?: string;  // ISO string
  endDate?: string;    // ISO string
  category?: string;   // One of the keys from CATEGORY_MAPPINGS
  source?: string;
  page?: number;
  pageSize?: number;
} 