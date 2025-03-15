import { Article } from '../types/article';
import { ApiResponse, NewsApiParams, CATEGORY_MAPPINGS } from './types';

const NYT_API_KEY = import.meta.env.VITE_NYT_API_KEY;
const NYT_SEARCH_BASE_URL = 'https://api.nytimes.com/svc/search/v2';
const NYT_POPULAR_BASE_URL = 'https://api.nytimes.com/svc/mostpopular/v2';

const mapNYTimesArticle = (article: any): Article => {
  // Helper to get the best available image URL
  const getImageUrl = (article: any): string | undefined => {
    // For article search endpoint
    if (article.multimedia?.[0]?.url) {
      return article.multimedia[0].url.startsWith('http')
        ? article.multimedia[0].url
        : `https://www.nytimes.com/${article.multimedia[0].url}`;
    }
    
    // For most popular articles endpoint
    if (article.media?.[0]?.type === 'image') {
      const metadata = article.media[0]['media-metadata'];
      // Get the largest image from metadata
      if (Array.isArray(metadata) && metadata.length > 0) {
        return metadata[metadata.length - 1].url;
      }
    }
    
    return undefined;
  };

  return {
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
  };
};

export const searchNYTimesArticles = async (
  params: NewsApiParams
): Promise<ApiResponse<Article[]>> => {
  try {
    if (!NYT_API_KEY) {
      throw new Error('NYTimes API key is not configured');
    }

    // If no search parameters are provided, fetch most popular articles
    if (!params.keyword && !params.startDate && !params.endDate && !params.category) {
      return fetchMostPopularArticles(params);
    }

    // Construct the query parameters
    const queryParams = new URLSearchParams({
      'api-key': NYT_API_KEY,
      'sort': 'newest',
      'page': String(Math.max(0, (params.page || 1) - 1)), // Convert to 0-based pagination
    });

    // Add search query if provided, otherwise use wildcard
    queryParams.set('q', params.keyword || '');

    // Handle date filters
    if (params.startDate) {
      const startDate = new Date(params.startDate)
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '');
      queryParams.set('begin_date', startDate);
    }

    if (params.endDate) {
      const endDate = new Date(params.endDate)
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '');
      queryParams.set('end_date', endDate);
    }

    // Construct filter queries
    const filterQueries: string[] = [];
    
    // Always filter for NYT source
    filterQueries.push('source:("The New York Times")');

    // Add category filter if provided
    if (params.category && CATEGORY_MAPPINGS[params.category]) {
      filterQueries.push(`news_desk:("${CATEGORY_MAPPINGS[params.category].nyt}")`);
    }

    // Add filter query if we have any filters
    if (filterQueries.length > 0) {
      queryParams.set('fq', filterQueries.join(' AND '));
    }

    const url = `${NYT_SEARCH_BASE_URL}/articlesearch.json?${queryParams.toString()}`;
    console.log('NYT Search API request:', {
      url,
      params,
      queryParams: Object.fromEntries(queryParams.entries())
    });

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('NYTimes Search API error:', data);
      throw new Error(data.fault?.faultstring || `NYTimes API error: ${response.statusText}`);
    }

    if (!data.response?.docs) {
      console.log('NYTimes API returned no docs:', data);
      return { data: [], error: 'No results found' };
    }

    const articles = data.response.docs.map(mapNYTimesArticle);
    console.log(`NYTimes API returned ${articles.length} articles`);

    return {
      data: articles,
      total: data.response.meta?.hits,
    };
  } catch (error) {
    console.error('NYTimes API error:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

async function fetchMostPopularArticles(params: NewsApiParams): Promise<ApiResponse<Article[]>> {
  try {
    // Default to most viewed articles in the last day
    const period = '1'; // 1, 7, or 30 days
    const url = `${NYT_POPULAR_BASE_URL}/viewed/${period}.json?api-key=${NYT_API_KEY}`;

    console.log('NYT Popular API request:', { url });

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('NYTimes Popular API error:', data);
      throw new Error(data.fault?.faultstring || `NYTimes API error: ${response.statusText}`);
    }

    if (!Array.isArray(data.results)) {
      return { data: [], error: 'No results found' };
    }

    return {
      data: data.results.map(mapNYTimesArticle),
    };
  } catch (error) {
    console.error('NYTimes Popular API error:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
} 