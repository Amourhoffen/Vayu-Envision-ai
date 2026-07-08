"use client";

import PostCard from "@/components/PostCard";
import WeatherWidget from "@/components/WeatherWidget";
import PostComposer from "@/components/PostComposer";
import { NewsScroll } from "@/components/NewsCard";
import { Filter, Edit3, X, Flame, Droplets, Thermometer, ShieldAlert, Wind, Globe } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const FEED_TABS = [
  { id: "all",     label: "All",      icon: Globe,      color: "" },
  { id: "pollution",label: "Pollution",icon: Wind,       color: "text-gray-500" },
  { id: "smoke",   label: "Smoke",    icon: Flame,      color: "text-slate-500" },
  { id: "water",   label: "Water",    icon: Droplets,   color: "text-blue-500" },
  { id: "heat",    label: "Heat",     icon: Thermometer, color: "text-orange-500" },
  { id: "crime",   label: "Safety",   icon: ShieldAlert, color: "text-red-500" },
];

type FeedItem = {
  id: number;
  isPost?: boolean;
  username?: string;
  location_name?: string;
  location?: string;
  created_at?: string;
  description?: string;
  content?: string;
  image_url?: string;
  aqi?: number;
  category: string;
  verified?: boolean;
  likes?: number;
  lat?: number;
  lng?: number;
};

function matchesTab(item: FeedItem, tab: string): boolean {
  if (tab === "all") return true;
  const cat = item.category.toLowerCase();
  if (tab === "pollution") return cat.includes("dust") || cat.includes("emiss") || cat.includes("pollution") || cat.includes("waste") || cat.includes("garbage") || cat.includes("chemical");
  if (tab === "smoke")     return cat.includes("smoke") || cat.includes("fire") || cat.includes("burn") || cat.includes("haze");
  if (tab === "water")     return cat.includes("water") || cat.includes("flood") || cat.includes("river") || cat.includes("waterlog");
  if (tab === "heat")      return cat.includes("heat");
  if (tab === "crime")     return cat.includes("crime") || cat.includes("safety");
  return true;
}

export default function Home() {
  const [reports, setReports] = useState<FeedItem[]>([]);
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showComposer, setShowComposer] = useState(false);
  const [newsError, setNewsError] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const fetchAll = useCallback(async () => {
    // Fetch reports
    try {
      const res = await fetch(`${API}/api/reports`, { cache: "no-store" });
      if (res.ok) { setReports(await res.json()); setError(false); }
      else setError(true);
    } catch { setError(true); }

    // Fetch user posts
    try {
      const res = await fetch(`${API}/api/posts`, { cache: "no-store" });
      if (res.ok) setPosts(await res.json());
    } catch { /* ignore */ }
  }, [API]);

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/news`, { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setNews(d.articles || []);
      } else setNewsError(true);
    } catch { setNewsError(true); }
  }, [API]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
    fetchNews();
    const interval = setInterval(fetchAll, 15000);
    const newsInterval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => { clearInterval(interval); clearInterval(newsInterval); };
  }, [fetchAll, fetchNews]);

  // Merge reports + posts into single feed, sorted by time
  const allItems: FeedItem[] = [
    ...reports.map(r => ({ ...r, isPost: false })),
    ...posts.map(p => ({ ...p, isPost: true, description: p.content })),
  ].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return tb - ta;
  });

  const filteredItems = allItems.filter(item => matchesTab(item, activeTab));

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md z-30 py-3 -mx-4 px-4 mb-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Community Feed</h1>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/5 rounded-full font-bold text-sm hover:bg-foreground/10 transition-colors">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>
      </div>

      {/* Weather + Alerts */}
      <WeatherWidget />

      {/* ──── InShorts News Feed ──── */}
      {news.length > 0 && <NewsScroll articles={news} />}
      {newsError && (
        <div className="mb-4 text-xs text-foreground/40 text-center font-medium">
          News feed unavailable — backend may be offline.
        </div>
      )}

      {/* ──── Twitter-like Post Composer ──── */}
      {showComposer ? (
        <div className="mb-6 bg-background border border-black/8 dark:border-white/8 rounded-2xl p-4 shadow-sm">
          <PostComposer
            onClose={() => setShowComposer(false)}
            onSuccess={() => { setShowComposer(false); fetchAll(); }}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowComposer(true)}
          className="w-full flex items-center gap-3 bg-background p-4 rounded-2xl border border-black/5 dark:border-white/5 mb-6 shadow-sm hover:border-primary/40 hover:shadow-md transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 transition-all flex-shrink-0">
            <Edit3 className="w-4.5 h-4.5 text-primary/60 group-hover:text-primary transition-colors" />
          </div>
          <span className="text-foreground/45 flex-1 font-medium text-sm">
            What&apos;s happening in your environment? 🌿
          </span>
          <div className="px-4 py-2 bg-primary text-white rounded-full font-bold text-sm shadow-md shadow-primary/20 hover:scale-105 transition-transform">
            Post
          </div>
        </button>
      )}

      {/* ──── Feed Category Tabs ──── */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar mb-4 -mx-1 px-1">
        {FEED_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                  : `bg-foreground/5 ${tab.color || "text-foreground/60"} hover:bg-foreground/10`
              }`}
            >
              <Icon className="w-3 h-3" /> {tab.label}
              {isActive && tab.id !== "all" && filteredItems.length > 0 && (
                <span className="bg-white/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-0.5">
                  {filteredItems.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ──── Feed Items ──── */}
      <div className="space-y-0 pb-24">
        {/* Empty / Loading states */}
        {filteredItems.length === 0 && error && (
          <div className="py-12 text-center border border-dashed border-foreground/20 rounded-2xl">
            <div className="text-3xl mb-3">🔌</div>
            <p className="font-bold text-foreground/60">Backend Offline</p>
            <p className="text-xs text-foreground/40 mt-1">Make sure FastAPI is running on port 8000</p>
          </div>
        )}
        {filteredItems.length === 0 && !error && allItems.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-3xl mb-3 animate-pulse">🌿</div>
            <p className="font-bold text-foreground/60">Loading feed...</p>
          </div>
        )}
        {filteredItems.length === 0 && !error && allItems.length > 0 && (
          <div className="py-10 text-center">
            <div className="text-3xl mb-3">🔍</div>
            <p className="font-bold text-foreground/60">No {activeTab} reports yet</p>
            <p className="text-xs text-foreground/40 mt-1">Be the first to report one!</p>
          </div>
        )}

        {filteredItems.map(item => (
          <PostCard
            key={`${item.isPost ? "post" : "report"}-${item.id}`}
            id={item.id}
            user={item.username || "Citizen"}
            username={item.username}
            location={item.location_name || item.location || "Unknown"}
            timeAgo="Just now"
            createdAt={item.created_at}
            description={item.isPost ? (item.content || "") : (item.description || "")}
            image={item.image_url}
            aqi={item.isPost ? undefined : item.aqi}
            category={item.category}
            verified={item.verified}
            likes={item.likes}
            lat={item.lat}
            lng={item.lng}
            isPost={item.isPost}
          />
        ))}
      </div>
    </div>
  );
}
