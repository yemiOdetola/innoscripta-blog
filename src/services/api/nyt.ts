import { Article } from '../types/article';
import { ApiResponse, NewsApiParams, CATEGORY_MAPPINGS } from './types';

const NYT_API_KEY = import.meta.env.VITE_NYT_API_KEY;
const NYT_SEARCH_BASE_URL = 'https://api.nytimes.com/svc/search/v2';
const NYT_POPULAR_BASE_URL = 'https://api.nytimes.com/svc/mostpopular/v2';
const DEFAULT_PAGE_SIZE = 10;

// Utility functions
const handleNYTError = (error: any, context: string): ApiResponse<Article[]> => {
  console.error(`NYTimes ${context} API error:`, error);
  return {
    data: [],
    error: error instanceof Error ? error.message : 'Unknown error occurred',
  };
};

const validateApiKey = () => {
  if (!NYT_API_KEY) {
    throw new Error('NYTimes API key is not configured');
  }
};

const processApiResponse = async (response: Response, context: string) => {
  const data = await response.json();
  
  if (!response.ok) {
    console.error(`NYTimes ${context} API error:`, data);
    throw new Error(data.fault?.faultstring || `NYTimes API error: ${response.statusText}`);
  }
  
  return data;
};

const getImageUrl = (article: any): string | undefined => {
  if (article.multimedia?.[0]?.url) {
    return article.multimedia[0].url.startsWith('http')
      ? article.multimedia[0].url
      : `https://www.nytimes.com/${article.multimedia[0].url}`;
  }

  if (article.media?.[0]?.type === 'image') {
    const metadata = article.media[0]['media-metadata'];
    if (Array.isArray(metadata) && metadata.length > 0) {
      return metadata[metadata.length - 1].url;
    }
  }

  return undefined;
};

const mapNYTimesArticle = (article: any): Article => ({
  id: article._id || article.id || article.uri,
  title: article.headline?.main || article.title,
  description: article.abstract,
  content: article.lead_paragraph || article.abstract,
  author: article.byline?.original?.replace('By ', '') || article.byline || 'Unknown',
  source: 'The New York Times',
  category: article.news_desk || article.section,
  publishedAt: article.pub_date || article.published_date,
  url: article.web_url || article.url,
  imageUrl: getImageUrl(article),
});

const paginateResults = (articles: Article[], page: number = 1, pageSize: number = DEFAULT_PAGE_SIZE) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return articles.slice(startIndex, endIndex);
};

const filterByCategory = (articles: Article[], category: string | undefined) => {
  if (!category || !CATEGORY_MAPPINGS[category]) return articles;
  
  const nytCategory = CATEGORY_MAPPINGS[category].nyt.toLowerCase();
  return articles.filter((article: Article) => 
    article.category?.toLowerCase() === nytCategory
  );
};

export const searchNYTimesArticles = async (
  params: NewsApiParams
): Promise<ApiResponse<Article[]>> => {
  try {
    validateApiKey();

    if (!params.keyword && !params.startDate && !params.endDate && !params.category) {
      return fetchMostPopularArticles(params);
    }

    const queryParams = new URLSearchParams({
      'api-key': NYT_API_KEY,
      'sort': 'newest',
      'page': String(Math.max(0, (params.page || 1) - 1)),
      'q': params.keyword || '',
    });

    if (params.startDate) {
      queryParams.set('begin_date', new Date(params.startDate).toISOString().split('T')[0].replace(/-/g, ''));
    }

    if (params.endDate) {
      queryParams.set('end_date', new Date(params.endDate).toISOString().split('T')[0].replace(/-/g, ''));
    }

    const filterQueries = ['source:("The New York Times")'];
    if (params.category && CATEGORY_MAPPINGS[params.category]) {
      filterQueries.push(`news_desk:("${CATEGORY_MAPPINGS[params.category].nyt}")`);
    }
    queryParams.set('fq', filterQueries.join(' AND '));

    const url = `${NYT_SEARCH_BASE_URL}/articlesearch.json?${queryParams.toString()}`;
    const data = await processApiResponse(await fetch(url), 'Search');

    if (!data.response?.docs) {
      return { data: [], error: 'No results found' };
    }

    return {
      data: data.response.docs.map(mapNYTimesArticle),
      total: data.response.meta?.hits,
    };
  } catch (error) {
    return handleNYTError(error, 'Search');
  }
};

async function fetchMostPopularArticles(params: NewsApiParams): Promise<ApiResponse<Article[]>> {
  try {
    validateApiKey();
    
    const period = '1';
    const url = `${NYT_POPULAR_BASE_URL}/viewed/${period}.json?api-key=${NYT_API_KEY}`;
    const data = await processApiResponse(await fetch(url), 'Popular');

    if (!Array.isArray(data.results)) {
      return { data: [], error: 'No results found' };
    }

    let articles = data.results.map(mapNYTimesArticle);
    articles = filterByCategory(articles, params.category);
    const paginatedArticles = paginateResults(articles, params.page);

    return {
      data: paginatedArticles,
      total: articles.length
    };
  } catch (error) {
    return handleNYTError(error, 'Popular');
  }
} 