import { Bell, ShieldAlert, Users, TreePine, FileCheck } from "lucide-react";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      icon: ShieldAlert,
      color: "text-danger bg-danger/10",
      title: "Hazardous AQI Alert",
      description: "AQI has crossed 300 in your saved location (Koramangala). Please wear a mask and avoid outdoor activities.",
      time: "10 mins ago",
      unread: true,
    },
    {
      id: 2,
      icon: FileCheck,
      color: "text-primary bg-primary/10",
      title: "Report Resolved",
      description: "Your report 'Garbage Fire' has been marked as resolved by the BBMP.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 3,
      icon: Users,
      color: "text-secondary bg-secondary/10",
      title: "Community Update",
      description: "Priya Patel and 12 others liked your pollution report.",
      time: "5 hours ago",
      unread: false,
    },
    {
      id: 4,
      icon: TreePine,
      color: "text-green-500 bg-green-500/10",
      title: "New Event Nearby",
      description: "A Mega Plantation Drive is happening 2km away this Sunday.",
      time: "1 day ago",
      unread: false,
    }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Bell className="w-6 h-6 text-primary" />
        Alerts & Notifications
      </h1>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n.id} className={`p-4 rounded-2xl flex gap-4 ${n.unread ? "bg-foreground/5 border border-foreground/10 shadow-sm" : "bg-transparent opacity-80 hover:bg-foreground/5"}`}>
            <div className={`p-3 rounded-full h-12 w-12 flex items-center justify-center ${n.color}`}>
              <n.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${n.unread ? "text-foreground" : "text-foreground/80"}`}>{n.title}</h3>
              <p className="text-sm text-foreground/70 mt-1 leading-relaxed">{n.description}</p>
              <p className="text-xs text-foreground/50 mt-2 font-medium">{n.time}</p>
            </div>
            {n.unread && <div className="w-2.5 h-2.5 bg-primary rounded-full mt-2" />}
          </div>
        ))}
      </div>
    </div>
  );
}
