"use client";

import { useEffect, useState } from "react";
import { BarChart2, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import WeatherWidget from "@/components/WeatherWidget";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/analytics`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(e => console.error("Analytics fetch error:", e));
  }, []);

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 h-screen flex flex-col items-center justify-center text-foreground/50">
        <BarChart2 className="w-12 h-12 mb-4 animate-pulse" />
        <p className="font-medium">Loading Analytics from API...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <BarChart2 className="w-8 h-8 text-primary" />
          Environmental Analytics
        </h1>
        <p className="text-foreground/60">City-wide pollution trends and reporting statistics.</p>
      </div>

      <WeatherWidget />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-foreground/5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
           <AlertCircle className="w-6 h-6 text-danger mb-2" />
           <div className="text-2xl font-bold">{data.active_hotspots}</div>
           <div className="text-xs text-foreground/60 font-bold uppercase tracking-wide mt-1">Active Hotspots</div>
        </div>
        <div className="p-5 bg-foreground/5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
           <TrendingUp className="w-6 h-6 text-primary mb-2" />
           <div className="text-2xl font-bold">+{data.reports_increase}%</div>
           <div className="text-xs text-foreground/60 font-bold uppercase tracking-wide mt-1">Reports this week</div>
        </div>
        <div className="p-5 bg-foreground/5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
           <Clock className="w-6 h-6 text-secondary mb-2" />
           <div className="text-2xl font-bold">{data.avg_resolution_hrs} hrs</div>
           <div className="text-xs text-foreground/60 font-bold uppercase tracking-wide mt-1">Avg Resolution</div>
        </div>
        <div className="p-5 bg-foreground/5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
           <BarChart2 className="w-6 h-6 text-accent mb-2" />
           <div className="text-2xl font-bold">{data.ai_predictions}+</div>
           <div className="text-xs text-foreground/60 font-bold uppercase tracking-wide mt-1">AI Predictions</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-foreground/5 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
          <h2 className="text-xl font-bold mb-6">AQI Trend (Past 7 Days)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.aqi_trend}>
                <defs>
                  <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis dataKey="name" stroke="currentColor" opacity={0.5} fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="currentColor" opacity={0.5} fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', borderRadius: '12px', border: 'none' }} />
                <Area type="monotone" dataKey="aqi" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAqi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-foreground/5 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Reports by Category</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.category_reports}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis dataKey="name" stroke="currentColor" opacity={0.5} fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="currentColor" opacity={0.5} fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'var(--foreground)', opacity: 0.05}} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
