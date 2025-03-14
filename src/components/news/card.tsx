import * as React from "react"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"
import { ArrowRight } from "../icons"

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
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-gray-200">
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={image}
          alt={title}
          className="h-48 w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
              {title}
            </h3>
          </a>
          <p className="mt-3 text-base text-gray-500 line-clamp-3">
            {description}
          </p>
        </div>
        <div className="mt-6 flex items-center">
          <div className="flex-shrink-0">
            <span className="sr-only">{author}</span>
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              {author.charAt(0)}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{author}</p>
            <div className="flex space-x-1 text-sm text-gray-500">
              <time dateTime={date}>{date}</time>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
