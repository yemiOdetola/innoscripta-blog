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

export const searchAllSources = async (params: SearchParams): Promise<ApiResponse<Article[]>> => {
  const selectedSources = params.source ? params.source.split(',') : [];

  const availableSources = [
    { name: 'The Guardian', fn: searchGuardianNews },
    { name: 'News API', fn: searchNewsAPI },
    { name: 'The New York Times', fn: searchNYTNews }
  ];

  const sourcesToSearch = selectedSources.length > 0
    ? availableSources.filter(source =>
      selectedSources.some(selected =>
        source.name.toLowerCase().includes(selected.toLowerCase())
      )
    )
    : availableSources;

  console.log('Searching sources:', {
    selectedSources,
    sourcesToSearch: sourcesToSearch.map(s => s.name),
    params: {
      from: params.from,
      to: params.to,
      category: params.category,
      keyword: params.keyword
    }
  });

  const results = await Promise.allSettled(
    sourcesToSearch.map(source => source.fn({
      ...params,
      startDate: params.from,
      endDate: params.to,
      source: undefined
    }))
  );

  let allArticles: Article[] = [];
  let errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      if (result.value.error) {
        errors.push(`${sourcesToSearch[index].name}: ${result.value.error}`);
      } else {
        allArticles = [...allArticles, ...result.value.data];
      }
    } else {
      errors.push(`${sourcesToSearch[index].name}: ${result.reason}`);
    }
  });

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