import * as React from "react"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"
import { Button } from "../ui/button";

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

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <article className="group relative rounded overflow-hidden">
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative aspect-[16/11] overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}
          <img
            src={image}
            alt={title}
            onLoad={() => setImageLoaded(true)}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
          />

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient from-white/60 to-transparent backdrop-blur-[12px] group-hover:backdrop-blur-[14px] transition-all z-20">
            <div className="flex justify-between items-center text-white">
              <div className="flex items-start flex-col gap-0.5">
                <span className="block text-[13px] font-semibold">{author.split(' ').slice(0, 2).join(' ')}</span>
                <span className="block text-[13px]">{formattedDate}</span>
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
          <h3 className="text-xl font-medium text-gray-900 line-clamp-1 h-[32px]">
            {title}
          </h3>
          <p className="text-sm text-gray-500 leading-6 line-clamp-2 h-[48px]">
            {description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Button variant="ghost" size="sm" className="!pl-0 text-primary hover:bg-transparent cursor-pointer">
              <span className="text-sm text-primary">
                Read More
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-4 transition-all duration-300 text-primary" />
            </Button>
          </div>
        </div>
      </a>
    </article>
  );
}
