import { Article } from '../types/article';
import { ApiResponse, NewsApiParams } from './types';

const NYT_API_KEY = import.meta.env.VITE_NYT_API_KEY;
const NYT_BASE_URL = 'https://api.nytimes.com/svc/search/v2';

const mapNYTimesArticle = (article: any): Article => ({
  id: article._id,
  title: article.headline.main,
  description: article.abstract,
  content: article.lead_paragraph,
  author: article.byline?.original?.replace('By ', '') || 'Unknown',
  source: 'The New York Times',
  category: article.news_desk,
  publishedAt: article.pub_date,
  url: article.web_url,
  imageUrl: article.multimedia?.[0]?.url 
    ? `https://www.nytimes.com/${article.multimedia[0].url}`
    : undefined,
});

export const searchNYTimesArticles = async (
  params: NewsApiParams
): Promise<ApiResponse<Article[]>> => {
  try {
    if (!NYT_API_KEY) {
      throw new Error('NYTimes API key is not configured');
    }

    let filterQueries: string[] = [];
    
    filterQueries.push('source:("The New York Times")');
    
    if (params.category) {
      filterQueries.push(`news_desk:("${params.category}")`);
    }

    const queryParams = new URLSearchParams({
      'api-key': NYT_API_KEY,
      'q': params.keyword || '*',
      'page': String((params.page || 1) - 1),
      'sort': 'newest',
    });

    const endDate = params.endDate || new Date().toISOString().split('T')[0];
    const startDate = params.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    queryParams.set('begin_date', startDate.replace(/-/g, ''));
    queryParams.set('end_date', endDate.replace(/-/g, ''));

    if (filterQueries.length > 0) {
      queryParams.set('fq', filterQueries.join(' AND '));
    }

    const url = `${NYT_BASE_URL}/articlesearch.json?${queryParams.toString()}`;
    console.log('NYT API request:', url);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('NYTimes API error:', data);
      throw new Error(data.fault?.faultstring || `NYTimes API error: ${response.statusText}`);
    }

    if (!data.response?.docs) {
      return { data: [], error: 'No results found' };
    }

    return {
      data: data.response.docs.map(mapNYTimesArticle),
    };
  } catch (error) {
    console.error('NYTimes API error:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}; 