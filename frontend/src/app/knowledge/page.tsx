"use client";

import { useEffect, useState } from "react";
import { BookOpen, PlayCircle, Bookmark, ExternalLink, Search, Loader2, Newspaper } from "lucide-react";

const TOPIC_FILTERS = [
  { id: "",               label: "All Topics" },
  { id: "Air Pollution",  label: "🌫️ Air Pollution" },
  { id: "Waste",          label: "🗑️ Waste Management" },
  { id: "Heat Wave",      label: "🌡️ Heat Waves" },
  { id: "Water",          label: "💧 Water Pollution" },
  { id: "Plantation",     label: "🌿 Plantation" },
  { id: "ISRO",           label: "🛰️ ISRO / Satellite" },
  { id: "Technology",     label: "⚙️ Technology" },
];

interface Article {
  id: number;
  title: string;
  type: "Article" | "Video";
  category: string;
  readTime: string;
  summary: string;
  url: string;
  source: string;
  image?: string;
  videoId?: string;
  tags?: string[];
}

interface Video {
  title: string;
  videoId: string;
  thumbnail: string;
}

const SOURCE_BADGE: Record<string, string> = {
  "CPCB India":       "bg-green-500/10 text-green-700 dark:text-green-400",
  "ISRO / NRSC":      "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  "IMD India":        "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "NMCG / Jal Shakti":"bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  "MoEFCC":           "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "Swachh Bharat Mission": "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

export default function KnowledgePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState("");
  const [search, setSearch] = useState("");
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());

  const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const fetchContent = async (topic: string) => {
    setLoading(true);
    try {
      const url = `${API}/api/knowledge/articles?topic=${encodeURIComponent(topic || "environment India")}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setArticles(d.articles || []);
        setVideos(d.videos || []);
      }
    } catch (e) {
      console.error("Knowledge fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent(activeTopic);
  }, [activeTopic]);

  const toggleBookmark = (id: number) => {
    setBookmarked(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const filtered = articles.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.source.toLowerCase().includes(q) ||
      a.tags?.some(t => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <BookOpen className="w-7 h-7 text-primary" />
          Knowledge Hub
        </h1>
        <p className="text-foreground/55 text-sm">
          Real data from CPCB, ISRO, IMD, and MoEFCC. Learn about India's environment.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
        <input
          type="text"
          placeholder="Search articles, topics, sources..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-foreground/5 border border-black/5 dark:border-white/5 focus:ring-2 focus:ring-primary outline-none text-sm"
        />
      </div>

      {/* Topic Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-6">
        {TOPIC_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveTopic(f.id)}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap text-xs transition-all duration-200 flex-shrink-0 ${
              activeTopic === f.id
                ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                : "bg-foreground/5 hover:bg-foreground/10 text-foreground/70"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-foreground/50">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium">Loading knowledge content...</span>
        </div>
      )}

      {/* Articles Grid */}
      {!loading && filtered.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-4 h-4 text-foreground/50" />
            <span className="text-sm font-bold text-foreground/60">
              Articles & Guides <span className="text-foreground/30">({filtered.length})</span>
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {filtered.map(article => {
              const isBookmarked = bookmarked.has(article.id);
              const sourceBadgeStyle = SOURCE_BADGE[article.source] || "bg-foreground/5 text-foreground/60";

              return (
                <div
                  key={article.id}
                  className="bg-background rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-primary/15 via-secondary/10 to-primary/5 flex items-center justify-center overflow-hidden">
                    {article.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : article.type === "Video" ? (
                      <PlayCircle className="w-12 h-12 text-primary/30 group-hover:text-primary/60 transition-colors" />
                    ) : (
                      <BookOpen className="w-10 h-10 text-primary/20 group-hover:text-primary/40 transition-colors" />
                    )}
                    {/* Category + Type badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="bg-background/80 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {article.category}
                      </span>
                      {article.type === "Video" && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <PlayCircle className="w-2.5 h-2.5" /> VIDEO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-[14px] mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-foreground/55 leading-relaxed line-clamp-3 mb-3 flex-1">
                      {article.summary}
                    </p>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {article.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/5 text-primary/70">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sourceBadgeStyle}`}>
                          {article.source}
                        </span>
                        <span className="text-[10px] text-foreground/40 font-medium">{article.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleBookmark(article.id)}
                          className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                            isBookmarked ? "text-primary bg-primary/10" : "text-foreground/40 hover:text-primary hover:bg-primary/5"
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
                        </button>
                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 flex items-center justify-center rounded-full text-foreground/40 hover:text-primary hover:bg-primary/5 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* No results */}
      {!loading && filtered.length === 0 && (
        <div className="py-12 text-center">
          <div className="text-4xl mb-3">📚</div>
          <p className="font-bold text-foreground/60">No articles found</p>
          <p className="text-xs text-foreground/40 mt-1">Try a different topic or search term</p>
        </div>
      )}

      {/* YouTube Videos Section */}
      {!loading && videos.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <PlayCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-bold text-foreground/60">
              Video Resources <span className="text-foreground/30">({videos.length})</span>
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {videos.map((v, i) => (
              <a
                key={i}
                href={`https://www.youtube.com/watch?v=${v.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative aspect-video overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <PlayCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold leading-snug text-foreground/80 group-hover:text-primary transition-colors line-clamp-2">
                    {v.title}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-red-500 font-bold">
                    <PlayCircle className="w-3 h-3" /> YouTube
                  </div>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
