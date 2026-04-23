import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Megaphone, Trophy, Image as ImageIcon, 
  Save, Edit3, Heart, Star, Sparkles
} from 'lucide-react';

export default function Organization() {
  const { user } = useAuth();
  const [org, setOrg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    announcement: '',
    bestPerformerName: '',
    organizationImageUrl: '',
    name: ''
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchOrgData();
  }, []);

  const fetchOrgData = async () => {
    try {
      const res = await axios.get('/api/dashboard/organization');
      setOrg(res.data);
      setFormData({
        announcement: res.data.announcement || '',
        bestPerformerName: res.data.bestPerformerName || '',
        organizationImageUrl: res.data.organizationImageUrl || '',
        name: res.data.name || ''
      });
    } catch (err) {
      console.error("Error fetching org data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('/api/dashboard/organization', formData);
      setOrg(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating org:", err);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-48 bg-gray-100 rounded-xl"></div></div>;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="text-indigo-600" />
            {org?.name || 'Organization'} Hub
          </h1>
          <p className="text-sm text-gray-500 mt-1">Configure your organization workspace and highlights.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? "btn-secondary-saas" : "btn-primary-saas"}
          >
            {isEditing ? 'Cancel' : <><Edit3 size={18} /> Edit Hub</>}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Announcements & Info */}
        <div className="lg:col-span-2 space-y-8">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Organization Name</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Company Announcement</label>
                <textarea 
                  value={formData.announcement}
                  onChange={(e) => setFormData({...formData, announcement: e.target.value})}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all min-h-[120px]"
                  placeholder="Share something with the team..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Spotlight Performer</label>
                  <input 
                    type="text"
                    value={formData.bestPerformerName}
                    onChange={(e) => setFormData({...formData, bestPerformerName: e.target.value})}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Employee name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Cover Image URL</label>
                  <input 
                    type="text"
                    value={formData.organizationImageUrl}
                    onChange={(e) => setFormData({...formData, organizationImageUrl: e.target.value})}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="btn-primary-saas w-full py-3"
              >
                <Save size={18} /> Update Workspace
              </button>
            </form>
          ) : (
            <>
              {/* Cover Image */}
              <div className="relative h-64 rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <img 
                  src={org?.organizationImageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80'} 
                  alt="Organization"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex items-end p-8">
                  <h2 className="text-2xl font-bold text-white">{org?.name}</h2>
                </div>
              </div>

              {/* Announcement Card */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                    <Megaphone size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Official Announcement</h3>
                </div>
                <p className="text-gray-600 leading-relaxed font-medium">
                  "{org?.announcement || 'Welcome to our organization hub! Stay tuned for updates and highlights.'}"
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Wall of Fame */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform"></div>
            <Trophy className="text-indigo-600 mb-6" size={40} />
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Quarterly Recognition</h4>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performer</h3>
            
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-200">
                {org?.bestPerformerName?.[0] || '★'}
              </div>
              <div>
                <p className="font-bold text-gray-900">{org?.bestPerformerName || 'Awaiting Results'}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Excellence Hub</p>
              </div>
            </div>
            
            <p className="mt-6 text-sm text-gray-500 leading-relaxed">
              Recognized for exceptional contribution and dedication to team goals.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Organization Metrics</h4>
            <div className="space-y-3">
              {[
                { label: 'Engagement', value: '94%', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
                { label: 'Performance', value: '8.8/10', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Innovation', value: 'High', icon: Sparkles, color: 'text-indigo-500', bg: 'bg-indigo-50' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`${item.bg} p-1.5 rounded-lg`}>
                      <item.icon size={14} className={item.color} />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
