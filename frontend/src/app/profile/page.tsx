import { Medal, MapPin, Calendar, Award } from "lucide-react";
import PostCard from "@/components/PostCard";

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-1 mb-4 shadow-lg shadow-primary/20">
          <div className="w-full h-full bg-background rounded-full border-4 border-background flex items-center justify-center overflow-hidden">
             <span className="text-4xl font-bold text-primary">J</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold">Jay Mehta</h1>
        <p className="text-foreground/60 font-medium">@jaymehta_eco</p>
        
        <div className="flex items-center gap-4 mt-4 text-sm font-medium text-foreground/70">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Mumbai</span>
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined Mar 2024</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-foreground/5 p-4 rounded-2xl text-center border border-black/5 dark:border-white/5 shadow-sm hover:scale-105 transition-transform cursor-pointer">
          <div className="text-2xl font-bold text-primary mb-1">840</div>
          <div className="text-[10px] text-foreground/60 font-bold uppercase tracking-wider">Eco Points</div>
        </div>
        <div className="bg-foreground/5 p-4 rounded-2xl text-center border border-black/5 dark:border-white/5 shadow-sm hover:scale-105 transition-transform cursor-pointer">
          <div className="text-2xl font-bold text-secondary mb-1">12</div>
          <div className="text-[10px] text-foreground/60 font-bold uppercase tracking-wider">Reports</div>
        </div>
        <div className="bg-foreground/5 p-4 rounded-2xl text-center border border-black/5 dark:border-white/5 shadow-sm hover:scale-105 transition-transform cursor-pointer">
          <div className="text-2xl font-bold text-accent mb-1">5</div>
          <div className="text-[10px] text-foreground/60 font-bold uppercase tracking-wider">Badges</div>
        </div>
      </div>

      {/* Level */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-2xl mb-8 flex items-center justify-between border border-primary/20">
        <div>
          <h3 className="font-bold text-lg text-primary flex items-center gap-2"><Medal className="w-5 h-5" /> Green Guardian</h3>
          <p className="text-sm text-foreground/70 mt-1">160 points away from Eco Warrior!</p>
        </div>
        <Award className="w-12 h-12 text-primary opacity-20" />
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Reports</h2>
        <PostCard 
          id={0}
          user="Jay Mehta"
          location="Andheri East, Mumbai"
          timeAgo="2 days ago"
          description="Reported massive water logging causing severe traffic and potential health hazards."
          aqi={110}
          category="Water Logging"
          verified={true}
        />
      </div>
    </div>
  );
}
