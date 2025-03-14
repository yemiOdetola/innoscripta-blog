import { Article } from '../types/article';
import { ApiResponse, NewsApiParams } from './types';

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

const mapNewsApiArticle = (article: any): Article => ({
  id: article.uri || article.url,
  title: article.title,
  description: article.description || article.body,
  content: article.body,
  author: article.authors?.[0]?.name || 'Unknown',
  source: article.source?.title || 'Unknown Source',
  category: article.categories?.[0]?.label || '',
  publishedAt: article.dateTime,
  dateStart: article.dateTime,
  dateEnd: article.dateTime,
  url: article.url,
  imageUrl: article.image,
});

export const searchNewsArticles = async (
  params: NewsApiParams
): Promise<ApiResponse<Article[]>> => {
  try {
    if (!NEWS_API_KEY) {
      throw new Error('NewsAPI key is not configured');
    }

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
      articlesCount: params.pageSize || 10,
      articlesSortBy: "date",
      articlesSortByAsc: false,
      dataType: ["news", "pr"],
      forceMaxDataTimeWindow: 31,
      resultType: "articles",
      apiKey: NEWS_API_KEY
    };

    if (params.startDate || params.endDate) {
      requestBody.dateStart = params.startDate;
      requestBody.dateEnd = params.endDate;
    }

    if (params.category) {
      requestBody.categoryUri = `dmoz/${params.category}`;
    }

    const response = await fetch(NEWS_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('NewsAPI error:', data);
      throw new Error(data.error || `NewsAPI error: ${response.statusText}`);
    }

    // Check if the response has the expected structure
    if (!data.articles || !Array.isArray(data.articles.results)) {
      throw new Error('Unexpected API response format');
    }

    return {
      data: data.articles.results.map(mapNewsApiArticle),
    };
  } catch (error) {
    console.error('NewsAPI error:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}; 