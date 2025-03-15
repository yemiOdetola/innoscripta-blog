import { Article } from '../types/article';
import { ApiResponse, NewsApiParams, CATEGORY_MAPPINGS } from './types';

interface GuardianArticle {
  id: string;
  type: string;
  sectionId: string;
  sectionName: string;
  webPublicationDate: string;
  webTitle: string;
  webUrl: string;
  apiUrl: string;
  fields?: {
    thumbnail?: string;
    bodyText?: string;
    byline?: string;
  };
}

interface GuardianResponse {
  response: {
    status: string;
    total: number;
    startIndex: number;
    pageSize: number;
    currentPage: number;
    pages: number;
    orderBy: string;
    results: GuardianArticle[];
  };
}

export async function searchGuardianArticles(params: NewsApiParams): Promise<ApiResponse<Article[]>> {
  try {
    const apiKey = import.meta.env.VITE_GUARDIAN_API_KEY;
    if (!apiKey) {
      throw new Error('Guardian API key is not configured');
    }
    const baseUrl = 'https://content.guardianapis.com/search';

    // Build query parameters
    const queryParams = new URLSearchParams({
      'api-key': apiKey || '',
      'q': params.keyword || '',
      'page': params.page?.toString() || '1',
      'page-size': params.pageSize?.toString() || '10',
      'show-fields': 'thumbnail,bodyText,byline',
      'order-by': 'newest',
    });

    // Add date range if provided
    if (params.startDate) {
      queryParams.append('from-date', new Date(params.startDate).toISOString().split('T')[0]);
    }
    if (params.endDate) {
      queryParams.append('to-date', new Date(params.endDate).toISOString().split('T')[0]);
    }

    // Add section/category if provided
    if (params.category && CATEGORY_MAPPINGS[params.category]) {
      queryParams.append('section', CATEGORY_MAPPINGS[params.category].guardian);
    }

    const response = await fetch(`${baseUrl}?${queryParams}`);
    const data: GuardianResponse = await response.json();

    console.log('Guardian API response:', {
      status: data.response.status,
      total: data.response.total,
      currentPage: data.response.currentPage
    });

    if (data.response.status !== 'ok') {
      return {
        data: [],
        error: 'Failed to fetch articles from Guardian'
      };
    }

    const articles: Article[] = data.response.results.map(article => ({
      id: article.id,
      title: article.webTitle,
      description: article.fields?.bodyText?.slice(0, 200) || '',
      content: article.fields?.bodyText || '',
      url: article.webUrl,
      imageUrl: article.fields?.thumbnail || '',
      publishedAt: article.webPublicationDate,
      source: 'Guardian',
      category: article.sectionName,
      author: article.fields?.byline || 'The Guardian'
    }));

    return { data: articles };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch articles from Guardian'
    };
  }
} 