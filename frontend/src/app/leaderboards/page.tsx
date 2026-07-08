import { Trophy } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function LeaderboardsPage() {
  let users = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/leaderboard`, { cache: 'no-store' });
    if (res.ok) users = await res.json();
  } catch(e) {
    console.error(e);
  }

  const getRankColor = (index: number) => {
    if (index === 0) return "text-yellow-500";
    if (index === 1) return "text-slate-400";
    if (index === 2) return "text-amber-600";
    return "text-foreground/40";
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <Trophy className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold">Leaderboards</h1>
        <p className="text-foreground/60 mt-2">Compete with friends and local heroes.</p>
      </div>

      <div className="flex gap-2 p-1 bg-foreground/5 rounded-xl mb-6">
        <button className="flex-1 py-2 bg-background rounded-lg font-bold shadow-sm">City (Mumbai)</button>
        <button className="flex-1 py-2 font-medium text-foreground/60 hover:text-foreground">Global</button>
        <button className="flex-1 py-2 font-medium text-foreground/60 hover:text-foreground">Friends</button>
      </div>

      <div className="space-y-3">
        {users.length === 0 && <div className="text-center text-foreground/50 py-12 border border-dashed border-foreground/20 rounded-2xl font-medium">Could not connect to backend server. Make sure FastAPI is running on port 8000.</div>}
        {users.map((u: any, index: number) => {
          const rank = index + 1;
          const isCurrentUser = u.username === "jaymehta_eco";
          const colorClass = isCurrentUser ? "text-primary bg-primary/10 rounded-xl" : "bg-foreground/5 rounded-xl hover:bg-foreground/10";
          const rankColor = isCurrentUser ? "text-primary" : getRankColor(index);
          
          return (
            <div key={u.id} className={`flex items-center p-4 border border-black/5 dark:border-white/5 ${colorClass}`}>
              <div className={`w-8 font-bold text-lg ${rankColor}`}>
                #{rank}
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center font-bold mr-4 text-foreground">
                {u.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{u.name} {isCurrentUser && "(You)"}</h3>
                <p className="text-xs text-foreground/60 uppercase tracking-wider font-semibold">{u.level}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{u.eco_points}</div>
                <div className="text-[10px] text-foreground/50 uppercase tracking-widest font-bold">Points</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
