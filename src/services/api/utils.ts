import { Article } from '../types/article';
import { ApiResponse } from './types';

export const DEFAULT_PAGE_SIZE = 10;

export const handleApiError = (error: any, source: string): ApiResponse<Article[]> => {
  console.error(`${source} API error:`, error);
  return {
    data: [],
    error: error instanceof Error ? error.message : `Failed to fetch articles from ${source}`
  };
};

export const validateApiKey = (apiKey: string | undefined, source: string) => {
  if (!apiKey) {
    throw new Error(`${source} API key is not configured`);
  }
};

export const formatDate = (date: string) => {
  return new Date(date).toISOString().split('T')[0];
};

export const processApiResponse = async <T>(
  response: Response, 
  source: string
): Promise<T> => {
  const data = await response.json();
  
  if (!response.ok) {
    console.error(`${source} API error:`, data);
    throw new Error(data.error || data.fault?.faultstring || `${source} API error: ${response.statusText}`);
  }
  
  return data;
}; 