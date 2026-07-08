"use client";

import { useState } from "react";
import { ExternalLink, Clock, Newspaper, ChevronRight } from "lucide-react";

interface NewsArticle {
  title: string;
  description?: string;
  ai_summary?: string;
  url: string;
  image?: string;
  source: string;
  published_at?: string;
}

interface NewsCardProps {
  article: NewsArticle;
}

const SOURCE_COLORS: Record<string, string> = {
  "Down To Earth": "bg-emerald-500",
  "NDTV Environment": "bg-red-500",
  "Times of India": "bg-blue-500",
  "NDTV": "bg-red-500",
  "Times of India - Environment": "bg-blue-500",
  "ISRO / FSI": "bg-purple-500",
  "ISRO": "bg-purple-500",
  default: "bg-primary",
};

function getRelativeTime(dateStr: string): string {
  if (!dateStr) return "Recently";
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "Recently";
  }
}

export default function NewsCard({ article }: NewsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const summary = article.ai_summary || article.description || article.title;
  const sourceColor = SOURCE_COLORS[article.source] || SOURCE_COLORS.default;

  return (
    <article
      className="relative flex-shrink-0 w-72 rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 bg-background shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Image or Gradient Header */}
      <div className="relative h-28 overflow-hidden">
        {article.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
        <div
          className={`absolute inset-0 ${
            article.image ? "bg-gradient-to-t from-black/60 via-black/20 to-transparent" : "bg-gradient-to-br from-primary/30 via-secondary/20 to-primary/10"
          } flex items-end p-3`}
        >
          {!article.image && (
            <Newspaper className="w-8 h-8 text-primary/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          )}
          {/* Source Badge */}
          <span className={`${sourceColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0`}>
            {article.source}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h3 className="font-bold text-[13px] leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>

        <p className={`text-[11px] text-foreground/60 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
          {summary}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-[10px] text-foreground/40 font-medium">
            <Clock className="w-3 h-3" />
            <span>{getRelativeTime(article.published_at || "")}</span>
          </div>
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-0.5 text-[10px] font-bold text-primary hover:underline"
            >
              Read <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

interface NewsScrollProps {
  articles: NewsArticle[];
}

export function NewsScroll({ articles }: NewsScrollProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-sm flex items-center gap-1.5 text-foreground/80">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Live Environment News
        </h2>
        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">InShorts Style</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory no-scrollbar -mx-1 px-1">
        {articles.map((article, i) => (
          <div key={i} className="snap-start">
            <NewsCard article={article} />
          </div>
        ))}
      </div>
    </div>
  );
}
