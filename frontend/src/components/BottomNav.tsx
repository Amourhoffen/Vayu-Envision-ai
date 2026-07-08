"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Plus, Bell, User } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Map", href: "/map", icon: Map },
  { name: "Report", href: "/report", icon: Plus, isAction: true },
  { name: "Alerts", href: "/notifications", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.isAction) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative -top-5 flex flex-col items-center justify-center p-4 bg-primary text-white rounded-full shadow-lg shadow-primary/30 transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <item.icon className="w-7 h-7" />
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 min-w-[64px] transition-colors duration-200",
                isActive ? "text-primary" : "text-foreground/60 hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-6 h-6 mb-1", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
