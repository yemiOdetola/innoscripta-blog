import { Article } from '../types/article';
import { ApiResponse } from './types';
import { searchGuardianArticles as searchGuardianNews } from './guardian';
import { searchNYTimesArticles as searchNYTNews } from './nyt';
import { searchNewsArticles as searchNewsAPI } from './news';

interface SearchParams {
  keyword: string;
  page: number;
  pageSize: number;
  from?: string;
  to?: string;
  category?: string;
  source?: string;
}

interface NewsSource {
  name: string;
  fn: (params: any) => Promise<ApiResponse<Article[]>>;
}

const NEWS_SOURCES: NewsSource[] = [
  { name: 'The Guardian', fn: searchGuardianNews },
  { name: 'News API', fn: searchNewsAPI },
  { name: 'The New York Times', fn: searchNYTNews }
];

const filterSourcesBySelection = (selectedSources: string[]): NewsSource[] => {
  return selectedSources.length > 0
    ? NEWS_SOURCES.filter(source =>
        selectedSources.some(selected =>
          source.name.toLowerCase().includes(selected.toLowerCase())
        )
      )
    : NEWS_SOURCES;
};

const processResults = (results: PromiseSettledResult<ApiResponse<Article[]>>[], sources: NewsSource[]) => {
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

  return { allArticles, errors };
};

export const searchAllSources = async (params: SearchParams): Promise<ApiResponse<Article[]>> => {
  const selectedSources = params.source ? params.source.split(',') : [];
  const sourcesToSearch = filterSourcesBySelection(selectedSources);

  const results = await Promise.allSettled(
    sourcesToSearch.map(source => source.fn({
      ...params,
      startDate: params.from,
      endDate: params.to,
      source: undefined
    }))
  );

  const { allArticles, errors } = processResults(results, sourcesToSearch);

  // Sort articles by date
  allArticles.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  if (allArticles.length > 0) {
    return {
      data: allArticles,
      error: errors.length > 0 ? errors.join('; ') : undefined
    };
  }

  if (errors.length === sourcesToSearch.length) {
    return {
      data: [],
      error: 'All news sources failed to respond'
    };
  }

  return { data: allArticles };
};