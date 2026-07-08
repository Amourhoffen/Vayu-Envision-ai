"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserCircle2, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  
  const [name, setName] = useState(user?.displayName || "");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) {
      setError("Please fill out all fields");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/users/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, username })
      });
      
      if (res.ok) {
        router.push("/report");
      } else {
        const data = await res.json();
        setError(data.detail || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to save profile. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
      
      <div className="z-10 flex flex-col items-center max-w-md w-full px-6 py-10 bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-3xl shadow-2xl">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <UserCircle2 className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight mb-2">Create Your Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-8">
          Pick a username to represent yourself on the leaderboard and community maps.
        </p>

        {error && (
          <div className="w-full p-3 mb-4 text-sm font-medium text-red-600 bg-red-100 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 w-full bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
              placeholder="e.g. John Doe"
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="mt-1 w-full bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
              placeholder="e.g. eco_warrior99"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Complete Profile"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
