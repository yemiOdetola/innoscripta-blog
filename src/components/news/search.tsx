import { useState } from "react";
import { Button } from "../ui/button";

interface SearchBarProps {
  onSearch: (keyword: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search articles..."
          className="w-full lg:max-w-[520px] bg-white flex-1 px-4 h-12 border border-gray-300 rounded focus:outline-none focus:ring-primary"
        />
        <Button
          type="submit"
          className="px-6 py-2 h-12 bg-primary text-white hover:bg-primary/80 disabled:opacity-20 cursor-not-allowed rounded"
          disabled={isLoading}
        >
          Search
        </Button>
      </form>
    </div>
  );
} 