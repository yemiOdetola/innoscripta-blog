import { Article } from '../types/article';
import { ApiResponse, NewsApiParams } from './types';
import { searchGuardianArticles as searchGuardianNews } from './guardian';
import { searchNYTimesArticles as searchNYTNews } from './nyt';
import { searchNewsArticles as searchNewsAPI } from './news';

const processApiResult = (
  result: PromiseSettledResult<ApiResponse<Article[]>>,
  sourceName: string,
  articles: Article[],
  errors: string[]
): void => {
  if (result.status === 'fulfilled') {
    if (result.value.error) {
      errors.push(`${sourceName}: ${result.value.error}`);
    }
    articles.push(...result.value.data);
  } else {
    errors.push(`${sourceName}: ${result.reason}`);
  }
};

export interface SearchParams {
  keyword: string;
  page: number;
  pageSize: number;
}

export interface SearchResponse {
  data: Article[];
  error?: string;
}

export const searchAllSources = async (params: SearchParams): Promise<SearchResponse> => {
  const sources = [
    { name: 'Guardian', fn: searchGuardianNews },
    { name: 'News API', fn: searchNewsAPI },
    { name: 'New York Times', fn: searchNYTNews }
  ];

  const results = await Promise.allSettled(
    sources.map(source => source.fn(params))
  );

  let allArticles: Article[] = [];
  let errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      if (result.value.error) {
        errors.push(`${sources[index].name}: ${result.value.error}`);
      } else {
        allArticles = [...allArticles, ...result.value.data];
      }
    } else {
      errors.push(`${sources[index].name}: ${result.reason}`);
    }
  });

  if (allArticles.length > 0) {
    return {
      data: allArticles,
      error: errors.length > 0 ? errors.join('; ') : undefined
    };
  }

  if (errors.length === sources.length) {
    return {
      data: [],
      error: 'All news sources failed to respond'
    };
  }

  return { data: allArticles };
}; 
