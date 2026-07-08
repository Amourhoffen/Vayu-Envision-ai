"use client";

import { useState } from "react";
import { MapPin, MessageCircle, Heart, Share2, ShieldCheck, Bookmark, Camera, Clock } from "lucide-react";

interface PostCardProps {
  id: number;
  user: string;
  username?: string;
  avatar?: string;
  location: string;
  timeAgo: string;
  createdAt?: string;
  image?: string | null;
  description: string;
  aqi?: number;
  category: string;
  verified?: boolean;
  likes?: number;
  lat?: number;
  lng?: number;
  // for twitter-like posts
  isPost?: boolean;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; emoji: string }> = {
  "Garbage Fire":     { bg: "bg-red-500/10",    text: "text-red-600 dark:text-red-400",    emoji: "🔥" },
  "Construction Dust":{ bg: "bg-amber-500/10",  text: "text-amber-600 dark:text-amber-400",emoji: "🏗️" },
  "Industrial Emissions":{ bg:"bg-gray-500/10", text: "text-gray-600 dark:text-gray-400",  emoji: "🏭" },
  "Vehicle Smoke":    { bg: "bg-slate-500/10",  text: "text-slate-600 dark:text-slate-400",emoji: "🚗" },
  "Open Waste":       { bg: "bg-green-500/10",  text: "text-green-600 dark:text-green-400",emoji: "🗑️" },
  "Plastic Waste":    { bg: "bg-teal-500/10",   text: "text-teal-600 dark:text-teal-400",  emoji: "♻️" },
  "Water Pollution":  { bg: "bg-blue-500/10",   text: "text-blue-600 dark:text-blue-400",  emoji: "💧" },
  "Flooding":         { bg: "bg-blue-600/10",   text: "text-blue-700 dark:text-blue-300",  emoji: "🌊" },
  "Burning Leaves":   { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400",emoji: "🍂" },
  "Chemical Spill":   { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400",emoji: "⚗️" },
  "Smoke/Haze":       { bg: "bg-slate-500/10",  text: "text-slate-600 dark:text-slate-400",emoji: "🌫️" },
  "Industrial Smoke": { bg: "bg-gray-600/10",   text: "text-gray-700 dark:text-gray-300",  emoji: "💨" },
  "Heat Alert":       { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400",emoji: "🌡️" },
  "Waterlogging":     { bg: "bg-cyan-500/10",   text: "text-cyan-600 dark:text-cyan-400",  emoji: "🌧️" },
  "River Pollution":  { bg: "bg-blue-500/10",   text: "text-blue-600 dark:text-blue-400",  emoji: "🏞️" },
  "Crime/Safety":     { bg: "bg-red-500/10",    text: "text-red-600 dark:text-red-400",    emoji: "⚠️" },
  "Pollution":        { bg: "bg-gray-500/10",   text: "text-gray-600 dark:text-gray-400",  emoji: "🌫️" },
  "Smoke":            { bg: "bg-slate-500/10",  text: "text-slate-600 dark:text-slate-400",emoji: "🔥" },
  "Water Issue":      { bg: "bg-blue-500/10",   text: "text-blue-600 dark:text-blue-400",  emoji: "💧" },
};

const AQI_STYLE = (val: number) => {
  if (val <= 50)  return { bg: "bg-green-500/10",  text: "text-green-600 dark:text-green-400",  label: "Good" };
  if (val <= 100) return { bg: "bg-green-400/10",  text: "text-green-500",                       label: "Moderate" };
  if (val <= 150) return { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", label: "Sensitive" };
  if (val <= 200) return { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", label: "Unhealthy" };
  if (val <= 300) return { bg: "bg-red-500/10",    text: "text-red-600 dark:text-red-400",       label: "Very Bad" };
  return               { bg: "bg-purple-500/10",   text: "text-purple-600 dark:text-purple-400", label: "Hazardous" };
};

function getRelativeTime(iso: string): string {
  if (!iso) return "Just now";
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7)  return `${days}d ago`;
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "Just now";
  }
}

export default function PostCard({
  id, user, username, avatar, location, timeAgo, createdAt,
  image, description, aqi, category, verified, likes, lat, lng, isPost
}: PostCardProps) {
  const catStyle = CATEGORY_STYLES[category] || { bg: "bg-foreground/5", text: "text-foreground/80", emoji: "📍" };
  const [likeCount, setLikeCount] = useState(likes || 0);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    if (isLiked) return;
    setIsLiked(true);
    setLikeCount((p) => p + 1);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const endpoint = isPost ? `${apiUrl}/api/posts/${id}/like` : `${apiUrl}/api/reports/${id}/like`;
      await fetch(endpoint, { method: "POST" });
    } catch {
      setIsLiked(false);
      setLikeCount((p) => p - 1);
    }
  };

  const displayUser = username || user;
  const displayTime = createdAt ? getRelativeTime(createdAt) : timeAgo;

  return (
    <article className="bg-background rounded-2xl shadow-sm shadow-black/5 dark:shadow-none border border-black/5 dark:border-white/5 overflow-hidden mb-4 transition-all hover:-translate-y-0.5 hover:shadow-md duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-black/5 dark:border-white/5 flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-tr from-primary/40 to-secondary/40 flex items-center justify-center font-bold text-primary/80 text-sm">
              {avatar
                ? <img src={avatar} alt={displayUser} className="w-full h-full object-cover" />
                : displayUser.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[14px]">{displayUser}</span>
              {verified && <ShieldCheck className="w-3.5 h-3.5 text-primary" />}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-foreground/50 font-medium mt-0.5">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate max-w-[150px]">{location || "Unknown Location"}</span>
              <span className="opacity-50">·</span>
              <Clock className="w-2.5 h-2.5" />
              <span>{displayTime}</span>
            </div>
          </div>
        </div>

        {/* Category Badge */}
        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${catStyle.bg} ${catStyle.text}`}>
          {catStyle.emoji} {category}
        </span>
      </div>

      {/* Media */}
      {image && image.trim() !== "" && image.trim() !== "None" ? (
        <div className="relative w-full aspect-[16/9] bg-foreground/5 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.startsWith("/") ? `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}${image}` : image}
            alt="Report image"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Camera className="w-2.5 h-2.5" /> Proof Photo
          </div>
        </div>
      ) : lat !== undefined && lng !== undefined ? (
        <div className="relative w-full aspect-[16/9] bg-foreground/5 overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
            className="w-full h-full border-0 pointer-events-none"
            title="Location Map"
          />
        </div>
      ) : null}

      {/* Content */}
      <div className="px-4 py-3 space-y-3">
        <p className="text-sm leading-relaxed text-foreground/90">{description}</p>

        {/* AQI Badge (only for reports) */}
        {aqi !== undefined && aqi > 0 && !isPost && (() => {
          const aqiS = AQI_STYLE(aqi);
          return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${aqiS.bg} ${aqiS.text}`}>
              <span className="font-mono">AQI {aqi}</span>
              <span className="opacity-70">·</span>
              <span>{aqiS.label}</span>
            </div>
          );
        })()}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center gap-5">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors group ${isLiked ? "text-red-500" : "text-foreground/50 hover:text-red-500"}`}
            >
              <Heart className={`w-4.5 h-4.5 group-hover:scale-110 transition-transform ${isLiked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm font-medium text-foreground/50 hover:text-secondary transition-colors group">
              <MessageCircle className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            </button>
            <button className="flex items-center gap-1.5 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors group">
              <Share2 className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          <button className="text-foreground/40 hover:text-foreground transition-colors">
            <Bookmark className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
