"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, PlusSquare, Bell, User, Settings, Trophy, BookOpen, Calendar, BarChart2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Live Map", href: "/map", icon: Map },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Leaderboard", href: "/leaderboards", icon: Trophy },
  { name: "Knowledge Hub", href: "/knowledge", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Report Pollution", href: "/report", icon: PlusSquare },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-black/5 dark:border-white/5 h-screen sticky top-0 bg-background/80 backdrop-blur-xl z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tighter text-primary">ENVISION<span className="text-foreground">AI</span></h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-out font-medium",
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "hover:bg-foreground/5 text-foreground/80 hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-foreground/5 text-foreground/80 transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
