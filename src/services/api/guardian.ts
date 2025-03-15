import { Article } from '../types/article';
import { ApiResponse, NewsApiParams, CATEGORY_MAPPINGS } from './types';
import { handleApiError, validateApiKey, formatDate, processApiResponse, DEFAULT_PAGE_SIZE } from './utils';

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

const mapGuardianArticle = (article: GuardianArticle): Article => ({
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
});

export async function searchGuardianArticles(params: NewsApiParams): Promise<ApiResponse<Article[]>> {
  const apiKey = import.meta.env.VITE_GUARDIAN_API_KEY;
  
  try {
    validateApiKey(apiKey, 'Guardian');
    const baseUrl = 'https://content.guardianapis.com/search';

    const queryParams = new URLSearchParams({
      'api-key': apiKey,
      'q': params.keyword || '',
      'page': params.page?.toString() || '1',
      'page-size': params.pageSize?.toString() || String(DEFAULT_PAGE_SIZE),
      'show-fields': 'thumbnail,bodyText,byline',
      'order-by': 'newest',
    });

    if (params.startDate) {
      queryParams.append('from-date', formatDate(params.startDate));
    }
    if (params.endDate) {
      queryParams.append('to-date', formatDate(params.endDate));
    }

    if (params.category && CATEGORY_MAPPINGS[params.category]) {
      queryParams.append('section', CATEGORY_MAPPINGS[params.category].guardian);
    }

    const data = await processApiResponse<GuardianResponse>(
      await fetch(`${baseUrl}?${queryParams}`),
      'Guardian'
    );

    if (data.response.status !== 'ok') {
      return { data: [], error: 'Failed to fetch articles from Guardian' };
    }

    return { 
      data: data.response.results.map(mapGuardianArticle),
      total: data.response.total
    };
  } catch (error) {
    return handleApiError(error, 'Guardian');
  }
} 