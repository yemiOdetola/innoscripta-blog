import { useEffect, useState, useRef } from "react";
import Container from "@/components/container"
import { NewsCard } from "@/components/news/card"
import { searchAllSources } from "@/services/api/news-service";
import { Article } from "@/services/types/article";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import Banner from "../banner";

export interface FiltersState {
  dateRange?: DateRange;
  category?: string;
  source?: string;
}

function Feeds() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    page: 1,
    pageSize: 12,
    dateRange: undefined as DateRange | undefined,
    category: undefined as string | undefined,
    source: undefined as string | undefined,
  });

  const [preferences, setPreferences] = useState({
    sources: [] as string[],
    categories: [] as string[],
    dateRange: undefined as DateRange | undefined,
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  const extractKeywords = (title: string, description: string, category: string): string[] => {
    const baseKeywords = category ? [category] : [];
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'has', 'have', 'had',
      'what', 'when', 'where', 'who', 'which', 'why', 'how', 'all', 'any', 'both', 'each',
      'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very', 'can', 'will',
      'just', 'should', 'now', 'says', 'said', 'like', 'also', 'well', 'only', 'then',
      'first', 'new', 'one', 'may', 'its', 'it', 'they', 'after', 'their', 'been', 'would',
      'could', 'from', 'news', 'latest', 'update', 'breaking'
    ]);

    const processWords = (text: string) => text.toLowerCase()
      .split(/\s+/)
      .map(word => word.replace(/[^a-z0-9]/g, ''))
      .filter(word => word.length >= 3 && word.length <= 15 && !commonWords.has(word));

    const allKeywords = new Set([
      ...baseKeywords,
      ...processWords(title),
      ...processWords(description)
    ]);

    return [...allKeywords]
      .slice(0, 3)
      .map(keyword => keyword
        .split(/[^a-zA-Z0-9]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      );
  };

  const removeDuplicates = (articles: Article[]): Article[] => {
    const seen = new Map();
    return articles.filter(article => {
      const key = `${article.title}-${article.url}`;
      return !seen.has(key) && seen.set(key, true);
    });
  };

  const fetchArticles = async (isLoadingMore = false) => {
    const loadingState = isLoadingMore ? setIsLoadingMore : setIsLoading;
    loadingState(true);

    try {
      const dateRange = searchParams.dateRange || preferences.dateRange;
      const apiParams = {
        ...searchParams,
        from: dateRange?.from?.toISOString(),
        to: dateRange?.to?.toISOString(),
        category: searchParams.category || (preferences.categories[0] || undefined),
        source: searchParams.source || (preferences.sources.join(',') || undefined),
      };

      const response = await searchAllSources(apiParams);

      if (response.error) {
        toast.error(response.error);
      }

      if (response.data.length < searchParams.pageSize) {
        setHasMore(false);
      }

      const uniqueArticles = removeDuplicates(
        isLoadingMore ? [...articles, ...response.data] : response.data
      );

      setArticles(uniqueArticles);
    } catch (err) {
      toast.error("Failed to fetch articles. Please try again later.");
    } finally {
      loadingState(false);
    }
  };

  useEffect(() => {
    setHasMore(true);
    fetchArticles();
  }, [
    searchParams.keyword,
    searchParams.category,
    searchParams.source,
    searchParams.dateRange,
    preferences.sources,
    preferences.categories,
    preferences.dateRange
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !isLoadingMore && hasMore) {
          setSearchParams(prev => ({ ...prev, page: prev.page + 1 }));
          fetchArticles(true);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [isLoading, isLoadingMore, hasMore]);


  const handleSearch = (keyword: string, filters?: FiltersState) => {
    setSearchParams(prev => ({
      ...prev,
      keyword,
      page: 1,
      dateRange: filters?.dateRange,
      category: filters?.category,
      source: filters?.source
    }));
  };

  const handlePreferencesChange = (newPreferences: {
    sources: string[];
    categories: string[];
    dateRange?: DateRange;
  }) => {
    setPreferences({
      ...newPreferences,
      dateRange: newPreferences.dateRange || undefined
    });
    setSearchParams(prev => ({
      ...prev,
      category: undefined,
      source: undefined,
      dateRange: newPreferences.dateRange
    }));
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="h-[200px] w-full rounded-lg bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-[80%] bg-gray-200 animate-pulse" />
                <div className="h-4 w-[90%] bg-gray-200 animate-pulse" />
                <div className="h-4 w-[60%] bg-gray-200 animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-3 w-16 bg-gray-200 animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (articles.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[600px]">
          <p className="text-gray-500">No articles found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 lg:gap-x-8 gap-y-10">
        {articles.map((article, index) => (
          <NewsCard
            key={`${article.id}-${index}`}
            image={article.imageUrl || "/images/placeholder.png"}
            title={article.title}
            author={article.author}
            date={new Date(article.publishedAt).toISOString().split('T')[0]}
            description={article.description}
            tags={extractKeywords(article.title, article.description, article.category)}
            url={article.url}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Banner
        onSearch={handleSearch}
        onPreferencesChange={handlePreferencesChange}
        isLoading={isLoading}
      />
      <Container className="py-8">
        {renderContent()}
        <div ref={observerTarget} className="h-16 mt-8 mb-4 flex items-center justify-center">
          {isLoadingMore ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
              <p className="text-primary">Loading more articles...</p>
            </div>
          ) : hasMore ? (
            <div className="h-4" />
          ) : (
            <p className="text-gray-500">No more articles to load</p>
          )}
        </div>
      </Container>
    </>
  );
}

export default Feeds;
