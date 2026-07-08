"use client";

import { useState, useRef, useEffect } from "react";
import { X, Camera, MapPin, Loader2, Flame, Droplets, Thermometer, ShieldAlert, Wind, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  { id: "Pollution", label: "Pollution", icon: Wind, color: "bg-gray-500", textColor: "text-gray-600 dark:text-gray-300", emoji: "🌫️" },
  { id: "Smoke", label: "Smoke", icon: Flame, color: "bg-slate-600", textColor: "text-slate-600 dark:text-slate-300", emoji: "🔥" },
  { id: "Water Issue", label: "Water", icon: Droplets, color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-300", emoji: "💧" },
  { id: "Heat Alert", label: "Heat", icon: Thermometer, color: "bg-orange-500", textColor: "text-orange-600 dark:text-orange-300", emoji: "🌡️" },
  { id: "Crime/Safety", label: "Safety", icon: ShieldAlert, color: "bg-red-500", textColor: "text-red-600 dark:text-red-300", emoji: "⚠️" },
];

interface PostComposerProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function PostComposer({ onClose, onSuccess }: PostComposerProps) {
  const { token } = useAuth();
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Pollution");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("Detecting location...");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_CHARS = 280;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ lat: latitude, lng: longitude });
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/map/local-data?lat=${latitude}&lng=${longitude}`
            );
            const d = await res.json();
            setLocationName(d.location || `${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E`);
          } catch {
            setLocationName(`${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E`);
          }
        },
        () => setLocationName("Location unavailable")
      );
    }

    // Auto-focus textarea
    textareaRef.current?.focus();
  }, []);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      let image_base64: string | null = null;
      if (image) image_base64 = await toBase64(image);

      const body: Record<string, unknown> = {
        content: content.trim(),
        category: selectedCategory,
        image_base64,
      };
      if (location) {
        body.lat = location.lat;
        body.lng = location.lng;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error("Failed to post");
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 1500);
    } catch (e) {
      console.error(e);
      setError("Failed to post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = MAX_CHARS - content.length;
  const isOverLimit = remaining < 0;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <p className="font-bold text-lg">Posted!</p>
        <p className="text-sm text-foreground/60">+5 Eco Points earned 🌱</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">What&apos;s happening?</h2>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? `${cat.color} text-white shadow-md scale-105`
                  : `bg-foreground/5 ${cat.textColor} hover:bg-foreground/10`
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Textarea */}
      <div className="relative mb-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Report ${selectedCategory.toLowerCase()} in your area...`}
          rows={4}
          className="w-full p-4 rounded-xl bg-foreground/5 border border-black/5 dark:border-white/5 focus:ring-2 focus:ring-primary outline-none resize-none text-sm leading-relaxed transition-colors"
        />
        {/* Character counter */}
        <div className={`absolute bottom-3 right-3 text-xs font-bold transition-colors ${
          isOverLimit ? "text-red-500" : remaining <= 20 ? "text-orange-500" : "text-foreground/30"
        }`}>
          {remaining}
        </div>
      </div>

      {/* Image Preview */}
      {previewUrl && (
        <div className="relative mb-3 rounded-xl overflow-hidden aspect-video">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Proof" className="w-full h-full object-cover" />
          <button
            onClick={() => { setImage(null); setPreviewUrl(null); }}
            className="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-0.5 text-[10px] font-bold text-white">
            📸 Proof Photo
          </div>
        </div>
      )}

      {/* Location Tag */}
      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/50 mb-4 px-1">
        <MapPin className="w-3.5 h-3.5 text-primary" />
        <span className="truncate">{locationName}</span>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs mb-3 font-medium">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-primary/10 text-primary transition-colors"
            title="Add proof photo"
          >
            <Camera className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) =>
                  setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                );
              }
            }}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-primary/10 text-primary transition-colors"
            title="Pin location"
          >
            <MapPin className="w-4.5 h-4.5" />
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !content.trim() || isOverLimit}
          className="px-5 py-2 bg-primary text-white rounded-full font-bold text-sm shadow-md shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
        >
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</> : "Post"}
        </button>
      </div>
    </div>
  );
}
