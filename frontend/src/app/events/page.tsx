import { Calendar, MapPin, Users, PlusCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  let events = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/events`, { cache: 'no-store' });
    if (res.ok) events = await res.json();
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Community Events</h1>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold hover:scale-105 transition-transform shadow-md shadow-primary/20">
          <PlusCircle className="w-5 h-5" /> Create Event
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {events.length === 0 && <div className="col-span-2 text-center text-foreground/50 py-12 border border-dashed border-foreground/20 rounded-2xl font-medium">Could not connect to backend server. Make sure FastAPI is running on port 8000.</div>}
        {events.map((e: any) => (
          <div key={e.id} className="bg-foreground/5 rounded-3xl overflow-hidden border border-black/5 dark:border-white/5 shadow-sm group cursor-pointer hover:border-primary/30 transition-colors">
            <div className={`w-full h-32 ${e.image_color} opacity-80 group-hover:opacity-100 transition-opacity`} />
            <div className="p-5">
              <h3 className="text-xl font-bold mb-1">{e.title}</h3>
              <p className="text-sm text-foreground/60 mb-4">{e.organizer}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                  <Calendar className="w-4 h-4 text-primary" /> {e.date_str}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                  <MapPin className="w-4 h-4 text-primary" /> {e.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                  <Users className="w-4 h-4 text-primary" /> {e.participants} Attending
                </div>
              </div>

              <button className="w-full py-3 bg-foreground/10 hover:bg-primary hover:text-white rounded-xl font-bold transition-colors">
                Join Event
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
