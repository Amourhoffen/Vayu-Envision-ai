"use client";

import { useEffect, useState } from "react";
import { Thermometer, AlertCircle, Wind, Droplets, Flame } from "lucide-react";

interface WeatherData {
  temperature: number | string;
  feels_like?: number | string;
  windspeed?: number | string;
  humidity?: number | string;
  aqi: number | string;
  location?: string;
  is_heatwave?: boolean;
}

function getAqiLabel(aqi: number | string): { label: string; color: string } {
  const v = typeof aqi === "number" ? aqi : parseInt(String(aqi));
  if (isNaN(v)) return { label: "N/A", color: "text-foreground/60" };
  if (v <= 50)  return { label: "Good",      color: "text-green-500" };
  if (v <= 100) return { label: "Moderate",  color: "text-yellow-500" };
  if (v <= 150) return { label: "Sensitive", color: "text-orange-400" };
  if (v <= 200) return { label: "Unhealthy", color: "text-orange-600" };
  if (v <= 300) return { label: "Very Poor", color: "text-red-500" };
  return               { label: "Hazardous", color: "text-purple-500" };
}

export default function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);

    const fetchWeather = async (lat: number, lng: number) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/map/local-data?lat=${lat}&lng=${lng}`
        );
        const result = await res.json();
        setData(result);
      } catch (e) {
        console.warn(e);
      }
    };

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(19.076, 72.8777) // Fallback: Mumbai
      );
    } else {
      fetchWeather(19.076, 72.8777);
    }

    return () => clearInterval(timer);
  }, []);

  if (!data) return null;

  const aqiInfo = getAqiLabel(data.aqi);
  const isHeatwave = data.is_heatwave;
  const temp = typeof data.temperature === "number" ? data.temperature : parseFloat(String(data.temperature));
  const aqi = typeof data.aqi === "number" ? data.aqi : parseInt(String(data.aqi));

  return (
    <div className="mb-6 space-y-2">
      {/* Main Widget */}
      <div className={`relative overflow-hidden flex flex-col md:flex-row items-stretch gap-0 rounded-2xl border shadow-sm transition-colors ${
        isHeatwave
          ? "border-orange-300/40 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20"
          : "border-black/5 dark:border-white/5 bg-foreground/5"
      }`}>
        {/* Left: Time + Temp */}
        <div className="flex items-center gap-4 p-4 flex-1">
          <div>
            <div className="text-2xl font-bold tracking-tight">{time}</div>
            <div className="text-xs text-foreground/60 font-medium">{date}</div>
            {data.location && (
              <div className="text-[10px] text-foreground/40 font-medium mt-0.5 truncate max-w-[120px]">
                📍 {data.location}
              </div>
            )}
          </div>

          <div className="w-px h-10 bg-foreground/10 hidden md:block" />

          {/* Temperature */}
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isHeatwave ? "bg-orange-500/20" : "bg-orange-500/10"}`}>
              <Thermometer className={`w-5 h-5 ${isHeatwave ? "text-orange-600" : "text-orange-500"}`} />
            </div>
            <div>
              <div className="text-lg font-bold">{data.temperature}°C</div>
              <div className="text-[10px] text-foreground/50 font-medium">
                {data.feels_like ? `Feels ${data.feels_like}°C` : "Local Temp"}
              </div>
            </div>
          </div>
        </div>

        {/* Right: AQI + Wind */}
        <div className="flex items-center gap-4 bg-background/50 px-4 py-3 md:rounded-r-2xl border-t md:border-t-0 md:border-l border-black/5 dark:border-white/5">
          {/* AQI */}
          <div className="flex items-center gap-2">
            <AlertCircle className={`w-5 h-5 ${aqiInfo.color}`} />
            <div>
              <div className={`text-sm font-bold ${aqiInfo.color}`}>AQI {data.aqi}</div>
              <div className="text-[10px] text-foreground/50 uppercase font-bold tracking-wider">{aqiInfo.label}</div>
            </div>
          </div>

          {/* Wind */}
          {data.windspeed !== undefined && data.windspeed !== "N/A" && (
            <>
              <div className="w-px h-8 bg-foreground/10" />
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-sm font-bold">{data.windspeed} <span className="text-xs font-normal">km/h</span></div>
                  <div className="text-[10px] text-foreground/50 uppercase font-bold tracking-wider">Wind</div>
                </div>
              </div>
            </>
          )}

          {/* Humidity */}
          {data.humidity !== undefined && data.humidity !== "N/A" && (
            <>
              <div className="w-px h-8 bg-foreground/10" />
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-sm font-bold">{data.humidity}<span className="text-xs font-normal">%</span></div>
                  <div className="text-[10px] text-foreground/50 uppercase font-bold tracking-wider">Humidity</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Heat Wave Alert Banner */}
      {isHeatwave && (
        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-orange-500/20 animate-pulse-slow">
          <Flame className="w-4 h-4 flex-shrink-0" />
          <span>🌡️ HEAT WAVE ALERT — Temperature exceeds 40°C. Avoid outdoor activities. Stay hydrated.</span>
        </div>
      )}

      {/* High AQI Warning */}
      {!isNaN(aqi) && aqi > 200 && (
        <div className="flex items-center gap-2 bg-gradient-to-r from-red-500/90 to-orange-500/90 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-red-500/20">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>⚠️ POOR AIR QUALITY — Wear N95 masks. Avoid outdoor exercise. Keep windows closed.</span>
        </div>
      )}
    </div>
  );
}
