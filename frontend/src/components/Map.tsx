"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import MapGL, { Marker, Popup, Source, Layer, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  AlertCircle, MapPin, Globe2, Map as MapIcon, Thermometer, Droplets,
  Wind, ShieldAlert, X, Info, Loader2, Navigation
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────
interface Zone {
  name: string; lat: number; lng: number; color: string;
  zone_type: string; layer: string; source: string;
  aqi?: number; temperature?: number; feels_like?: number;
  precipitation?: number; current_rain?: number; is_heatwave?: boolean;
}
interface ZoneInsight {
  safety_level: string; travel_advice: string;
  key_risks: string[]; recommendation: string;
}

// ─── Color helpers ────────────────────────────────────────
const ZONE_FILL: Record<string, string> = {
  red: "#ef4444", orange: "#f97316", green: "#22c55e", blue: "#3b82f6",
};
const SAFETY_COLORS: Record<string, string> = {
  Safe: "text-green-500", Caution: "text-orange-500", Avoid: "text-red-500",
};
const LAYER_ICONS: Record<string, typeof AlertCircle> = {
  aqi: Wind, heatwave: Thermometer, water: Droplets, crime: ShieldAlert,
};

function ZoneDot({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <span
      className="inline-block rounded-full border-2 border-white shadow-md"
      style={{ width: size, height: size, background: ZONE_FILL[color] || color }}
    />
  );
}

// ─── Main Component ───────────────────────────────────────
export default function Map() {
  const [mounted, setMounted] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [activeLayer, setActiveLayer] = useState<"osm" | "isro">("osm");

  // Zone layers
  const [aqiZones, setAqiZones] = useState<Zone[]>([]);
  const [heatwaveZones, setHeatwaveZones] = useState<Zone[]>([]);
  const [waterZones, setWaterZones] = useState<Zone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [showAqi, setShowAqi] = useState(true);
  const [showHeat, setShowHeat] = useState(true);
  const [showWater, setShowWater] = useState(true);
  const [showReports, setShowReports] = useState(true);

  // Side panel
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [zoneInsight, setZoneInsight] = useState<ZoneInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  // Local data widget
  const [localData, setLocalData] = useState<any | null>(null);
  const [mapCenter, setMapCenter] = useState({ latitude: 22.5937, longitude: 82.9629 });

  const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const fetchLocalData = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(`${API}/api/map/local-data?lat=${lat}&lng=${lng}`);
      setLocalData(await res.json());
    } catch { /* ignore */ }
  }, [API]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // Fetch reports + hotspots
    fetch(`${API}/api/reports`).then(r => r.json()).then(setReports).catch(() => {});
    fetch(`${API}/api/hotspots`).then(r => r.json()).then(setHotspots).catch(() => {});
    fetchLocalData(22.5937, 82.9629);

    // Fetch India zone data
    setZonesLoading(true);
    fetch(`${API}/api/map/india-zones`)
      .then(r => r.json())
      .then(d => {
        setAqiZones(d.aqi_zones || []);
        setHeatwaveZones(d.heatwave_zones || []);
        setWaterZones(d.water_zones || []);
      })
      .catch(e => console.warn("Zone fetch:", e))
      .finally(() => setZonesLoading(false));
  }, [API, fetchLocalData]);

  const handleZoneClick = useCallback(async (zone: Zone) => {
    setSelectedZone(zone);
    setZoneInsight(null);
    setInsightLoading(true);
    try {
      const val = zone.aqi
        ? `AQI ${zone.aqi}`
        : zone.temperature
        ? `${zone.temperature}°C`
        : zone.precipitation
        ? `${zone.precipitation}mm rain`
        : "Active";
      const url = `${API}/api/map/zone-insight?zone_type=${encodeURIComponent(zone.zone_type)}&zone_name=${encodeURIComponent(zone.name)}&value=${encodeURIComponent(val)}&layer=${zone.layer}`;
      const res = await fetch(url);
      setZoneInsight(await res.json());
    } catch {
      setZoneInsight({
        safety_level: "Caution",
        travel_advice: "Check local environmental conditions before traveling.",
        key_risks: ["Air quality may be poor"],
        recommendation: "Stay informed and carry a mask.",
      });
    } finally {
      setInsightLoading(false);
    }
  }, [API]);

  // GeoJSON for hotspot circles
  const hotspotsGeoJSON = useMemo(() => ({
    type: "FeatureCollection",
    features: hotspots.map(h => ({
      type: "Feature",
      properties: { id: h.id, name: h.name, severity: h.severity, count: h.active_reports_count },
      geometry: { type: "Point", coordinates: [h.lng, h.lat] },
    })),
  }), [hotspots]);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-foreground/5 animate-pulse flex items-center justify-center font-medium text-foreground/40">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading GeoAI Map Engine...
      </div>
    );
  }

  const osmStyle: any = {
    version: 8,
    sources: { osm: { type: "raster", tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256 } },
    layers: [{ id: "osm-layer", type: "raster", source: "osm", minzoom: 0, maxzoom: 19 }],
  };

  const isroStyle: any = {
    version: 8,
    sources: { isro: { type: "raster", scheme: "tms", tiles: ["/api/bhuvan-tms/1.0.0/india3@EPSG:900913@png/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© ISRO Bhuvan / NRSC" } },
    layers: [{ id: "isro-layer", type: "raster", source: "isro", minzoom: 0, maxzoom: 18 }],
  };

  const visibleZones = [
    ...(showAqi ? aqiZones : []),
    ...(showHeat ? heatwaveZones : []),
    ...(showWater ? waterZones : []),
  ];

  return (
    <div className="w-full h-[calc(100vh-4rem)] md:h-screen relative z-0 overflow-hidden">
      <MapGL
        initialViewState={{ longitude: 82.9629, latitude: 22.5937, zoom: 4.5 }}
        onMove={e => setMapCenter({ latitude: e.viewState.latitude, longitude: e.viewState.longitude })}
        onMoveEnd={e => fetchLocalData(e.viewState.latitude, e.viewState.longitude)}
        style={{ width: "100%", height: "100%" }}
        mapStyle={activeLayer === "osm" ? osmStyle : isroStyle}
      >
        <NavigationControl position="top-left" />

        {/* ── Hotspot Circles ── */}
        <Source id="hotspots-source" type="geojson" data={hotspotsGeoJSON as never}>
          <Layer id="hotspots-layer" type="circle" paint={{
            "circle-radius": 50,
            "circle-color": ["match", ["get", "severity"], "Critical", "#dc2626", "#f97316"],
            "circle-opacity": 0.25,
            "circle-stroke-width": 2,
            "circle-stroke-color": ["match", ["get", "severity"], "Critical", "#dc2626", "#f97316"],
          }} />
        </Source>

        {/* ── Zone Markers ── */}
        {visibleZones.map((zone, i) => (
          <Marker
            key={`${zone.layer}-${i}`}
            longitude={zone.lng}
            latitude={zone.lat}
            anchor="center"
            onClick={e => { e.originalEvent.stopPropagation(); handleZoneClick(zone); }}
          >
            <div
              className="relative group cursor-pointer"
              title={`${zone.name}: ${zone.zone_type}`}
            >
              {/* Outer pulse ring */}
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ background: ZONE_FILL[zone.color], transform: "scale(1.8)" }}
              />
              {/* Inner dot */}
              <div
                className="relative w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-125 duration-200"
                style={{ background: ZONE_FILL[zone.color] }}
              >
                {zone.layer === "heatwave" && <span className="text-[7px]">🌡</span>}
                {zone.layer === "water" && <span className="text-[7px]">💧</span>}
                {zone.layer === "aqi" && <span className="text-[7px]">💨</span>}
              </div>
              {/* Tooltip label on hover */}
              <div className="absolute bottom-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {zone.name}
              </div>
            </div>
          </Marker>
        ))}

        {/* ── Report Markers ── */}
        {showReports && reports.map(report => (
          <Marker
            key={`rpt-${report.id}`}
            longitude={report.lng}
            latitude={report.lat}
            anchor="bottom"
            onClick={e => { e.originalEvent.stopPropagation(); setSelectedReport(report); setSelectedZone(null); }}
          >
            <div className={`cursor-pointer drop-shadow-md transition-all hover:scale-125 duration-200 flex items-center justify-center w-8 h-8 rounded-full border-2 border-white ${
              report.aqi > 200 ? "bg-red-500" : report.aqi > 100 ? "bg-orange-500" : "bg-primary"
            } text-white`}>
              {report.aqi > 200 ? <AlertCircle className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            </div>
          </Marker>
        ))}

        {/* ── Pulsing center dot ── */}
        <Marker longitude={mapCenter.longitude} latitude={mapCenter.latitude} anchor="center" style={{ pointerEvents: "none" }}>
          <div className="relative flex items-center justify-center">
            <div className={`absolute w-10 h-10 rounded-full animate-ping opacity-30 ${
              localData?.is_heatwave ? "bg-orange-500" :
              typeof localData?.aqi === "number" && localData.aqi > 200 ? "bg-red-500" :
              typeof localData?.aqi === "number" && localData.aqi > 100 ? "bg-orange-500" :
              localData ? "bg-green-500" : "bg-gray-400"
            }`} />
            <div className={`relative w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg ${
              localData?.is_heatwave ? "bg-orange-500" :
              typeof localData?.aqi === "number" && localData.aqi > 200 ? "bg-red-500" :
              typeof localData?.aqi === "number" && localData.aqi > 100 ? "bg-orange-500" :
              localData ? "bg-green-500" : "bg-gray-400"
            }`} />
          </div>
        </Marker>

        {/* ── Report Popup ── */}
        {selectedReport && (
          <Popup longitude={selectedReport.lng} latitude={selectedReport.lat} anchor="top"
            onClose={() => setSelectedReport(null)} className="rounded-xl overflow-hidden z-50" closeButton={false}>
            <div className="p-3 max-w-xs">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-sm text-black flex items-center gap-1">
                  {selectedReport.aqi > 200 ? <AlertCircle className="w-3.5 h-3.5 text-red-600" /> : <MapPin className="w-3.5 h-3.5 text-blue-600" />}
                  {selectedReport.category}
                </h3>
                <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
              </div>
              <p className="text-xs text-gray-600 mb-2 leading-relaxed">{selectedReport.description?.slice(0, 120)}{selectedReport.description?.length > 120 ? "…" : ""}</p>
              {selectedReport.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedReport.image_url.startsWith("/") ? `${API}${selectedReport.image_url}` : selectedReport.image_url}
                  alt="proof" className="w-full h-20 object-cover rounded-lg mb-2" />
              )}
              <div className="flex flex-wrap gap-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedReport.aqi > 200 ? "bg-red-100 text-red-700" :
                  selectedReport.aqi > 100 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                  AQI {selectedReport.aqi}
                </span>
                {selectedReport.verified && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">✓ Verified</span>}
                {selectedReport.priority && selectedReport.priority !== "Pending" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{selectedReport.priority}</span>
                )}
              </div>
            </div>
          </Popup>
        )}
      </MapGL>

      {/* ══════════════════════════════════════════
          TOP-RIGHT: GeoAI Status + Local Data
      ══════════════════════════════════════════ */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 max-w-[210px]">
        {/* Engine Status */}
        <div className="bg-background/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-black/5 dark:border-white/5 font-semibold text-xs flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          GeoAI Engine: ACTIVE
        </div>

        {/* Local Data */}
        {localData && (
          <div className="bg-background/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-black/5 dark:border-white/5 text-xs space-y-1.5">
            <div className="font-bold text-foreground/60 uppercase tracking-wider text-[9px] mb-1">📍 Local Area</div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Temp</span>
              <span className={`font-bold ${localData.is_heatwave ? "text-orange-500" : ""}`}>
                {localData.temperature}°C {localData.is_heatwave ? "🔥" : ""}
              </span>
            </div>
            {localData.feels_like && (
              <div className="flex justify-between">
                <span className="text-foreground/60">Feels</span>
                <span className="font-semibold">{localData.feels_like}°C</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-foreground/60">AQI</span>
              <span className={`font-bold ${
                typeof localData.aqi === "number" && localData.aqi > 200 ? "text-red-500" :
                typeof localData.aqi === "number" && localData.aqi > 100 ? "text-orange-500" : "text-green-500"
              }`}>{localData.aqi}</span>
            </div>
            {localData.windspeed && localData.windspeed !== "N/A" && (
              <div className="flex justify-between">
                <span className="text-foreground/60">Wind</span>
                <span className="font-semibold">{localData.windspeed} km/h</span>
              </div>
            )}
          </div>
        )}

        {/* Zone loading indicator */}
        {zonesLoading && (
          <div className="bg-background/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-black/5 dark:border-white/5 flex items-center gap-2 text-xs font-medium text-foreground/60">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading India zones...
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          ZONE SIDE PANEL (ISRO-style)
      ══════════════════════════════════════════ */}
      {selectedZone && (
        <div className="absolute top-4 left-14 z-[400] w-72 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden animate-in slide-in-from-left-2 duration-300">
          {/* Panel Header */}
          <div
            className="p-4 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${ZONE_FILL[selectedZone.color]}, ${ZONE_FILL[selectedZone.color]}99)` }}
          >
            <button
              onClick={() => setSelectedZone(null)}
              className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                {selectedZone.layer === "heatwave" && <Thermometer className="w-5 h-5" />}
                {selectedZone.layer === "aqi" && <Wind className="w-5 h-5" />}
                {selectedZone.layer === "water" && <Droplets className="w-5 h-5" />}
                {selectedZone.layer === "crime" && <ShieldAlert className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-bold text-base">{selectedZone.name}</div>
                <div className="text-white/80 text-xs">{selectedZone.zone_type}</div>
                <div className="text-white/60 text-[10px] mt-0.5">Source: {selectedZone.source}</div>
              </div>
            </div>

            {/* Zone metrics */}
            <div className="flex gap-3 mt-3">
              {selectedZone.aqi !== undefined && (
                <div className="bg-white/15 rounded-lg px-3 py-1.5 text-center">
                  <div className="font-bold text-lg">{selectedZone.aqi}</div>
                  <div className="text-[9px] text-white/70 uppercase">AQI</div>
                </div>
              )}
              {selectedZone.temperature !== undefined && (
                <div className="bg-white/15 rounded-lg px-3 py-1.5 text-center">
                  <div className="font-bold text-lg">{selectedZone.temperature}°</div>
                  <div className="text-[9px] text-white/70 uppercase">Temp</div>
                </div>
              )}
              {selectedZone.precipitation !== undefined && (
                <div className="bg-white/15 rounded-lg px-3 py-1.5 text-center">
                  <div className="font-bold text-lg">{selectedZone.precipitation}mm</div>
                  <div className="text-[9px] text-white/70 uppercase">Rain</div>
                </div>
              )}
              {selectedZone.is_heatwave && (
                <div className="bg-white/15 rounded-lg px-3 py-1.5 text-center">
                  <div className="font-bold text-lg">🌡️</div>
                  <div className="text-[9px] text-white/70 uppercase">HEAT WAVE</div>
                </div>
              )}
            </div>
          </div>

          {/* AI Insight */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/60 uppercase tracking-wider">
              <Info className="w-3.5 h-3.5" /> AI Safety Insight
            </div>

            {insightLoading ? (
              <div className="flex items-center gap-2 text-sm text-foreground/50">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing with Gemini AI...
              </div>
            ) : zoneInsight ? (
              <>
                {/* Safety Level */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground/60">Safety:</span>
                  <span className={`text-sm font-bold ${SAFETY_COLORS[zoneInsight.safety_level] || "text-foreground"}`}>
                    {zoneInsight.safety_level === "Safe" ? "✅" : zoneInsight.safety_level === "Caution" ? "⚠️" : "🚫"} {zoneInsight.safety_level}
                  </span>
                </div>

                {/* Travel Advice */}
                <p className="text-xs text-foreground/70 leading-relaxed bg-foreground/5 rounded-xl p-3">
                  {zoneInsight.travel_advice}
                </p>

                {/* Key Risks */}
                {zoneInsight.key_risks?.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-foreground/50 uppercase mb-1.5">Key Risks</div>
                    <div className="flex flex-wrap gap-1">
                      {zoneInsight.key_risks.map((r, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-medium">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-xs text-primary font-medium">
                  💡 {zoneInsight.recommendation}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          BOTTOM-LEFT: Map Legend
      ══════════════════════════════════════════ */}
      <div className="absolute bottom-24 left-4 z-[400] bg-background/90 backdrop-blur-md rounded-xl shadow-lg border border-black/5 dark:border-white/5 p-3 min-w-[170px]">
        <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/50 mb-2">Zone Legend</div>
        <div className="space-y-1.5">
          {[
            { color: "red",    label: "High Pollution / Hazard",  desc: "AQI > 200, Critical" },
            { color: "orange", label: "Moderate Risk / Heat Wave",desc: "AQI 100-200, Temp > 35°C" },
            { color: "green",  label: "Safe / Good Air Quality",  desc: "AQI < 100, Normal" },
            { color: "blue",   label: "Water Stress / Flooding",  desc: "Rain, River Risk" },
          ].map(({ color, label, desc }) => (
            <div key={color} className="flex items-start gap-2 group cursor-default">
              <ZoneDot color={color} size={12} />
              <div>
                <div className="text-[11px] font-semibold text-foreground/80">{label}</div>
                <div className="text-[9px] text-foreground/40">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM: Layer Controls
      ══════════════════════════════════════════ */}
      <div className="absolute bottom-4 left-4 right-4 z-[400] flex flex-col gap-2">
        {/* Layer Toggles */}
        <div className="flex flex-wrap gap-1.5 bg-background/90 backdrop-blur-md rounded-xl shadow-lg border border-black/5 dark:border-white/5 p-2">
          {[
            { key: "aqi",     label: "🌫️ AQI Zones",   active: showAqi,     toggle: () => setShowAqi(v => !v) },
            { key: "heat",    label: "🌡️ Heat Waves",   active: showHeat,    toggle: () => setShowHeat(v => !v) },
            { key: "water",   label: "💧 Water Stress", active: showWater,   toggle: () => setShowWater(v => !v) },
            { key: "reports", label: "📍 Reports",       active: showReports, toggle: () => setShowReports(v => !v) },
          ].map(({ key, label, active, toggle }) => (
            <button
              key={key}
              onClick={toggle}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                active ? "bg-primary text-white shadow-md" : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Base Map Toggle */}
        <div className="flex bg-background/90 backdrop-blur-md rounded-xl shadow-lg border border-black/5 dark:border-white/5 p-1">
          <button
            onClick={() => setActiveLayer("osm")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold flex-1 justify-center transition-colors ${
              activeLayer === "osm" ? "bg-primary text-white" : "hover:bg-foreground/5 text-foreground/70"
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" /> OSM Global
          </button>
          <button
            onClick={() => setActiveLayer("isro")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold flex-1 justify-center transition-colors ${
              activeLayer === "isro" ? "bg-primary text-white" : "hover:bg-foreground/5 text-foreground/70"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" /> ISRO Bhuvan
          </button>
        </div>
      </div>
    </div>
  );
}
