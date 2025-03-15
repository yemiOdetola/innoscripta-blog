import Container from "./container";
import { SearchBar } from "./news/search";
import { Preferences } from "./news/preferences";
import { FiltersState } from "./news/feeds";
import { DateRange } from "react-day-picker";

interface BannerProps {
  onSearch: (keyword: string, filters?: FiltersState) => void;
  onPreferencesChange: (preferences: {
    sources: string[];
    categories: string[];
    dateRange?: DateRange;
  }) => void;
  isLoading: boolean;
}

export default function Banner({ onSearch, onPreferencesChange, isLoading }: BannerProps) {
  const sources = ['Guardian', 'New York Times', 'News API'];
  const categories = [
    'World',
    'Politics',
    'Business',
    'Technology',
    'Science',
    'Health',
    'Sports',
    'Entertainment'
  ];

  return (
    <div className="bg-gray-100 w-full h-96">
      <Container className="flex flex-col justify-center container mx-auto px-4 h-full">
        <span className="text-primary text-sm  font-semibold mb-4">Innoscripta</span>
        <h1 className="text-2xl lg:text-4xl font-semibold mb-2">Untitled News</h1>
        <p className="text-gray-500 mb-8">
          Get the latest news from around the world in one place. Get the latest news from around the world...
        </p>
        <div className="flex flex-col gap-2">
          <SearchBar
            onSearch={onSearch}
            isLoading={isLoading}
          />
          <Preferences
            sources={sources}
            categories={categories}
            onPreferencesChange={onPreferencesChange}
          />
        </div>
      </Container>
    </div>
  );
}
