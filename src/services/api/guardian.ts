import { Article } from '../types/article';
import { ApiResponse, NewsApiParams } from './types';

const GUARDIAN_API_KEY = import.meta.env.VITE_GUARDIAN_API_KEY;
const GUARDIAN_BASE_URL = 'https://content.guardianapis.com';

const mapGuardianArticle = (article: any): Article => ({
  id: article.id,
  title: article.webTitle,
  description: article.fields?.trailText || '',
  content: article.fields?.bodyText || '',
  author: article.fields?.byline || 'Unknown',
  source: 'The Guardian',
  category: article.sectionName,
  publishedAt: article.webPublicationDate,
  url: article.webUrl,
  imageUrl: article.fields?.thumbnail || undefined,
});

const formatSearchQuery = (keyword: string): string => {
  return keyword
    .trim()
    .split(/\s+/)
    .filter(term => term.length > 0)
    .join(',');
};

export const searchGuardianArticles = async (
  params: NewsApiParams
): Promise<ApiResponse<Article[]>> => {
  try {
    if (!GUARDIAN_API_KEY) {
      throw new Error('Guardian API key is not configured');
    }

    const queryParams = new URLSearchParams({
      'api-key': GUARDIAN_API_KEY,
      'page-size': String(params.pageSize || 10),
      'page': String(params.page || 1),
      'from-date': params.startDate || new Date().toISOString().split('T')[0],
      'to-date': params.endDate || new Date().toISOString().split('T')[0],
      'show-fields': 'all,thumbnail,trailText,bodyText,byline',
    });
    if (params.category) {
      queryParams.set('section', params.category);
    }

    if (params.keyword) {
      queryParams.set('q', formatSearchQuery(params.keyword));
    }

    const url = `${GUARDIAN_BASE_URL}/search?${queryParams.toString()}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('Guardian API error:', data);
      throw new Error(data.response?.message || `Guardian API error: ${response.statusText}`);
    }

    return {
      data: data.response.results.map(mapGuardianArticle),
    };
  } catch (error) {
    console.error('Guardian API error:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}; 