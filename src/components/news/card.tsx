import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "../ui/skeleton"
import { Button } from "../ui/button";
import { ArrowRight } from "../icons";

interface NewsCardProps {
  image: string;
  title: string;
  author: string;
  date: string;
  description: string;
  tags: string[];
  url: string;
}

export function NewsCard({ image, title, author, date, description, tags, url }: NewsCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <article className="group">
      <div className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-black/30 transition-all duration-300 " />
          <img
            src={imageError ? "/images/placeholder.png" : image}
            alt={title}
            className={cn(
              "w-full h-full object-cover transition-all duration-300 group-hover:scale-102",
              !imageLoaded && "opacity-0",
              imageLoaded && "opacity-100"
            )}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent backdrop-blur-[10px] group-hover:backdrop-blur-[16px] transition-all z-20">
            <div className="flex justify-between items-center text-white">
              <div className="flex items-start flex-col gap-1">
                <span className="block text-sm font-semibold">{author.split(' ').slice(0, 2).join(' ')}</span>
                <span className="block text-sm">{formattedDate}</span>
              </div>
              {tags.slice(0, 1).map((tag, index) => (
                <span
                  key={index}
                  className="block text-sm font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <h3 className="text-xl font-medium text-gray-900 line-clamp-2 h-[52px]">
            {title}
          </h3>
          <p className="text-sm text-gray-500 font-light leading-6 line-clamp-2 h-[48px]">
            {description}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="!pl-0 text-primary hover:bg-transparent cursor-pointer">
              <span className="text-sm text-gray-500">
                Read More
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-4 transition-all duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
