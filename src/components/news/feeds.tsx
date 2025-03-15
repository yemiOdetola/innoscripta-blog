import { useEffect, useState, useRef } from "react";
import Container from "@/components/container"
import { NewsCard } from "@/components/news/card"
import { searchAllSources } from "@/services/api/news-service";
import { Article } from "@/services/types/article";
import { SearchBar } from "./search";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function Feeds() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    page: 1,
    pageSize: 12
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  const extractKeywords = (title: string, description: string, category: string): string[] => {
    const baseKeywords = category ? [category] : [];

    const titleWords = title.toLowerCase().split(/\s+/);
    const descriptionWords = description.toLowerCase().split(/\s+/);

    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'has', 'have', 'had',
      'what', 'when', 'where', 'who', 'which', 'why', 'how', 'all', 'any', 'both', 'each',
      'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very', 'can', 'will',
      'just', 'should', 'now', 'says', 'said', 'like', 'also', 'well', 'only', 'then',
      'first', 'new', 'one', 'may', 'its', 'it', 'they', 'after', 'their', 'been', 'would',
      'could', 'from', 'news', 'latest', 'update', 'breaking'
    ]);

    const titleKeywords = titleWords
      .filter(word => {
        const cleaned = word.replace(/[^a-z0-9]/g, '');
        return cleaned.length >= 3 &&
          cleaned.length <= 15 &&
          !commonWords.has(cleaned);
      })
      .map(word => word.replace(/[^a-z0-9]/g, ''));


    const descriptionKeywords = descriptionWords
      .filter(word => {
        const cleaned = word.replace(/[^a-z0-9]/g, '');
        return cleaned.length >= 3 &&
          cleaned.length <= 15 &&
          !commonWords.has(cleaned);
      })
      .map(word => word.replace(/[^a-z0-9]/g, ''));

    const allKeywords = new Set([
      ...baseKeywords,
      ...titleKeywords,
      ...descriptionKeywords
    ]);

    const finalKeywords = [...allKeywords]
      .filter(keyword => keyword.length <= 15)
      .slice(0, 3)
      .map(keyword => {
        return keyword
          .split(/[^a-zA-Z0-9]+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      });

    return finalKeywords;
  };

  const removeDuplicates = (articles: Article[]): Article[] => {
    const seen = new Map();
    return articles.filter(article => {
      const key = `${article.title}-${article.url}`;
      if (seen.has(key)) {
        return false;
      }
      seen.set(key, true);
      return true;
    });
  };

  const fetchArticles = async (isLoadingMore = false) => {
    if (!isLoadingMore) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await searchAllSources(searchParams);

      if (response.error) {
        console.log('Error occured', response.error);
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
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setHasMore(true);
    fetchArticles();
  }, [searchParams.keyword]);

  const handleSearch = (keyword: string) => {
    setSearchParams(prev => ({
      ...prev,
      keyword,
      page: 1
    }));
  };


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !isLoadingMore && hasMore) {
          setSearchParams(prev => ({
            ...prev,
            page: prev.page + 1
          }));
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

  if (isLoading) {
    return (
      <Container>
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[60%]" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  if (articles.length === 0) {
    return (
      <Container>
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">No articles found</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {articles.map((article, index) => (
          <NewsCard
            key={`${article.id}-${index}`}
            image={article.imageUrl || "/images/placeholder.png"}
            title={article.title}
            author={article.author}
            date={new Date(article.publishedAt).toISOString().split('T')[0]}
            description={article.description}
            // tags={[article.category]}
            tags={extractKeywords(article.title, article.description, article.category)}
            url={article.url}
          />
        ))}
      </div>

      <div ref={observerTarget} className="h-16 mt-8 mb-4 flex items-center justify-center">
        {isLoadingMore ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
            <p className="text-gray-500">Loading more articles...</p>
          </div>
        ) : hasMore ? (
          <div className="h-4" />
        ) : (
          <p className="text-gray-500">No more articles to load</p>
        )}
      </div>
    </Container>
  );
}

export default Feeds
