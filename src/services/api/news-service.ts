import { Article } from '../types/article';
import { ApiResponse, NewsApiParams } from './types';
import { searchGuardianArticles } from './guardian';
import { searchNYTimesArticles } from './nyt';
import { searchNewsArticles } from './news';

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

export const searchAllSources = async (
  params: NewsApiParams
): Promise<ApiResponse<Article[]>> => {
  try {
    const [guardianResults, nytResults, newsApiResults] = await Promise.allSettled([
      searchGuardianArticles(params),
      searchNYTimesArticles(params),
      searchNewsArticles(params),
    ]);

    const errors: string[] = [];
    const articles: Article[] = [];

    processApiResult(guardianResults, 'Guardian', articles, errors);
    processApiResult(nytResults, 'NYTimes', articles, errors);
    processApiResult(newsApiResults, 'NewsAPI', articles, errors);

    return {
      data: articles,
      error: errors.length > 0 ? errors.join('; ') : undefined,
    };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}; 
