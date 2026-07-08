"use client";

import { useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Leaf, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      
      // Sync with backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/sync`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.needs_onboarding) {
          router.push("/onboarding");
        } else {
          router.push("/report");
        }
      } else {
        console.error("Backend auth sync failed");
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />

      <div className="z-10 flex flex-col items-center max-w-md w-full px-6 py-12 bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-3xl shadow-2xl">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <Leaf className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to ENVISION AI</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
          Join the community of eco-warriors and make your city greener, cleaner, and smarter.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
