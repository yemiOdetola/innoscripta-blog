import { useEffect, useState } from "react";
import Container from "@/components/container"
import { NewsCard } from "@/components/news/card"
import { searchAllSources } from "@/services/api/news-service";
import { Article } from "@/services/types/article";
import { SearchBar } from "./search";
import { Skeleton } from "@/components/ui/skeleton";

function Feeds() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    page: 1,
    pageSize: 12
  });

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        const response = await searchAllSources(searchParams);

        if (response.error) {
          setError(response.error);
        } else {
          setArticles(response.data);
        }
      } catch (err) {
        setError('Failed to fetch articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [searchParams]);

  const handleSearch = (keyword: string) => {
    setSearchParams(prev => ({
      ...prev,
      keyword,
      page: 1
    }));
  };

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

  if (error) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => setSearchParams(prev => ({ ...prev }))}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </Container>
    );
  }

  if (articles.length === 0) {
    return (
      <Container>
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
            image={article.imageUrl || "/images/article-placeholder.png"}
            title={article.title}
            author={article.author}
            date={new Date(article.publishedAt).toISOString().split('T')[0]}
            description={article.description}
            tags={[article.category, article.source].filter(Boolean)}
            url={article.url}
          />
        ))}
      </div>
    </Container>
  )
}

export default Feeds
