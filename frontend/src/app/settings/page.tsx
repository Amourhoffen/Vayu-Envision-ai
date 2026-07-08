import { Settings, User, Bell, Shield, Moon, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Settings
        </h1>
        <p className="text-foreground/60">Manage your account preferences and app settings.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary font-medium rounded-xl transition-colors">
            <User className="w-5 h-5" /> Account
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-foreground/5 text-foreground/80 font-medium rounded-xl transition-colors">
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-foreground/5 text-foreground/80 font-medium rounded-xl transition-colors">
            <Shield className="w-5 h-5" /> Privacy & Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-foreground/5 text-foreground/80 font-medium rounded-xl transition-colors">
            <Moon className="w-5 h-5" /> Appearance
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-foreground/5 text-foreground/80 font-medium rounded-xl transition-colors">
            <Globe className="w-5 h-5" /> Language & Region
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-foreground/5 p-6 rounded-2xl border border-black/5 dark:border-white/5">
            <h2 className="text-xl font-bold mb-4">Account Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Display Name</label>
                <input 
                  type="text" 
                  defaultValue="Jay Mehta"
                  className="w-full px-4 py-2 bg-background border border-black/10 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Email Address</label>
                <input 
                  type="email" 
                  defaultValue="jay@example.com"
                  className="w-full px-4 py-2 bg-background border border-black/10 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Location</label>
                <input 
                  type="text" 
                  defaultValue="Mumbai, India"
                  className="w-full px-4 py-2 bg-background border border-black/10 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors">
                  Save Changes
                </button>
                <button className="px-6 py-2 bg-foreground/10 text-foreground/80 font-medium rounded-lg hover:bg-foreground/20 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-danger/5 p-6 rounded-2xl border border-danger/20">
             <h2 className="text-xl font-bold text-danger mb-2">Danger Zone</h2>
             <p className="text-sm text-foreground/70 mb-4">Permanently delete your account and all associated data.</p>
             <button className="px-6 py-2 bg-danger text-white font-medium rounded-lg hover:bg-danger/90 transition-colors">
                Delete Account
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
