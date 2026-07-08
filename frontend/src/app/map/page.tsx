"use client";

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="w-full h-screen bg-foreground/5 animate-pulse flex items-center justify-center font-medium">Loading Map interface...</div>
});

export default function MapPage() {
  return (
    <div className="w-full h-full relative">
      <Map />
    </div>
  );
}
