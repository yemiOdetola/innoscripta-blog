import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface PreferencesProps {
  sources: string[];
  categories: string[];
  onPreferencesChange: (preferences: {
    sources: string[];
    categories: string[];
    dateRange?: DateRange;
  }) => void;
}

export function Preferences({ sources, categories, onPreferencesChange }: PreferencesProps) {
  const [selectedSources, setSelectedSources] = React.useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  const handleSourceChange = (value: string) => {
    const newSources = selectedSources.includes(value)
      ? selectedSources.filter(s => s !== value)
      : [...selectedSources, value];
    setSelectedSources(newSources);
    onPreferencesChange({ sources: newSources, categories: selectedCategories, dateRange });
  };

  const handleCategoryChange = (value: string) => {
    const newCategories = selectedCategories.includes(value)
      ? selectedCategories.filter(c => c !== value)
      : [...selectedCategories, value];
    setSelectedCategories(newCategories);
    onPreferencesChange({ sources: selectedSources, categories: newCategories, dateRange });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    onPreferencesChange({ sources: selectedSources, categories: selectedCategories, dateRange: range });
  };

  const clearDateRange = () => {
    setDateRange(undefined);
    onPreferencesChange({ sources: selectedSources, categories: selectedCategories, dateRange: undefined });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-1 text-sm w-fit">
          <span className="text-gray-500">Try the</span>
          <span className="text-primary font-medium underline cursor-pointer">Filter</span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium">Feed Preferences</DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            Customize your news feed by selecting your preferred sources, categories, and date range.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-3 mb-4">
            <h4 className="font-medium text-sm mb-1">Default Date Range</h4>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal w-full",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                  {dateRange && (
                    <X
                      className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearDateRange();
                      }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2 mb-4">
            <h4 className="font-medium text-sm mb-1">Preferred Sources</h4>
            <div className="flex flex-wrap gap-2">
              {sources.map((source) => (
                <Button
                  key={source}
                  className="font-normal text-sm rounded"
                  variant={selectedSources.includes(source) ? "default" : "outline"}
                  onClick={() => handleSourceChange(source)}
                  size="sm"
                >
                  {source}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm mb-1">Preferred Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  className="font-normal text-sm rounded"
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  onClick={() => handleCategoryChange(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 