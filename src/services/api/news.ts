import { Article } from '../types/article';
import { ApiResponse, NewsApiParams, CATEGORY_MAPPINGS } from './types';
import { handleApiError, validateApiKey, formatDate, processApiResponse, DEFAULT_PAGE_SIZE } from './utils';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://eventregistry.org/api/v1/article/getArticles';

interface NewsApiRequestBody {
  action: string;
  keyword: string;
  sourceLocationUri: string[];
  ignoreSourceGroupUri: string;
  articlesPage: number;
  articlesCount: number;
  articlesSortBy: string;
  articlesSortByAsc: boolean;
  dataType: string[];
  forceMaxDataTimeWindow: number;
  resultType: string;
  apiKey: string;
  dateStart?: string;
  dateEnd?: string;
  categoryUri?: string;
}

interface NewsApiResponse {
  articles: {
    results: any[];
    totalResults: number;
  };
}

const mapNewsApiArticle = (article: any): Article => ({
  id: article.uri || article.url,
  title: article.title,
  description: article.description || article.body,
  content: article.body,
  author: article.authors?.[0]?.name || 'Unknown',
  source: article.source?.title || 'Unknown Source',
  category: article.categories?.[0]?.label || '',
  publishedAt: article.dateTime,
  url: article.url,
  imageUrl: article.image,
});

export const searchNewsArticles = async (
  params: NewsApiParams
): Promise<ApiResponse<Article[]>> => {
  try {
    validateApiKey(NEWS_API_KEY, 'NewsAPI');

    const requestBody: NewsApiRequestBody = {
      action: "getArticles",
      keyword: params.keyword || "",
      sourceLocationUri: [
        "http://en.wikipedia.org/wiki/United_States",
        "http://en.wikipedia.org/wiki/Canada",
        "http://en.wikipedia.org/wiki/United_Kingdom"
      ],
      ignoreSourceGroupUri: "paywall/paywalled_sources",
      articlesPage: params.page || 1,
      articlesCount: params.pageSize || DEFAULT_PAGE_SIZE,
      articlesSortBy: "date",
      articlesSortByAsc: false,
      dataType: ["news", "pr"],
      forceMaxDataTimeWindow: 31,
      resultType: "articles",
      apiKey: NEWS_API_KEY
    };

    if (params.startDate) {
      requestBody.dateStart = formatDate(params.startDate);
    }
    if (params.endDate) {
      requestBody.dateEnd = formatDate(params.endDate);
    }

    if (params.category && CATEGORY_MAPPINGS[params.category]) {
      requestBody.categoryUri = CATEGORY_MAPPINGS[params.category].newsApi;
    }

    const data = await processApiResponse<NewsApiResponse>(
      await fetch(NEWS_API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }),
      'NewsAPI'
    );

    if (!data.articles || !Array.isArray(data.articles.results)) {
      throw new Error('Unexpected API response format');
    }

    return {
      data: data.articles.results.map(mapNewsApiArticle),
      total: data.articles.totalResults
    };
  } catch (error) {
    return handleApiError(error, 'NewsAPI');
  }
}; 