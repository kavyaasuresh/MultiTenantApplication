import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Plus, User as UserIcon, Shield, Briefcase, 
  Trash2, Edit2, X, Save, Image as ImageIcon, 
  Search, CheckCircle2, AlertCircle, MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { toast } from 'react-toastify';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'EMPLOYEE', profileImageUrl: '' });
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const { user: currentUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error('Failed to synchronize directory.');
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setEditingId('new');
    setFormData({ username: '', password: '', role: 'EMPLOYEE', profileImageUrl: '' });
    setError('');
    setShowModal(true);
  };

  const startInlineEdit = (user) => {
    setEditingId(user.id);
    setFormData({ 
      username: user.username, 
      password: '', 
      role: user.role, 
      profileImageUrl: user.profileImageUrl || '' 
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowModal(false);
  };

  const handleUpdate = async (userId) => {
    try {
      setError('');
      await axios.put(`/api/users/${userId}`, formData);
      setEditingId(null);
      toast.success('Personnel record updated successfully.');
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data || 'Update failed';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await axios.post('/api/users', formData);
      setShowModal(false);
      toast.success('New personnel enrolled in system.');
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data || 'Creation failed';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Purge this personnel record?")) return;
    try {
      await axios.delete(`/api/users/${userId}`);
      toast.info('Personnel record purged.');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data || 'Deletion failed');
    }
  };

  const isManagement = (role) => ['ADMIN', 'MANAGER'].includes(role?.toUpperCase());

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* SaaS Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Organization Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage personnel access and roles.</p>
        </div>
        {isManagement(currentUser?.role) && (
          <button 
            onClick={handleOpenCreate}
            className="btn-primary-saas"
          >
            <Plus size={18} /> New Personnel
          </button>
        )}
      </div>

      {/* SaaS Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text"
          placeholder="Filter by name or designation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-sm font-semibold text-gray-400 uppercase tracking-widest">Fetching Records...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {users.filter(u => u.username.toLowerCase().includes(search.toLowerCase())).map((u) => {
            const isEditing = editingId === u.id;
            return (
              <div key={u.id} className={`bg-white rounded-xl border transition-all flex flex-col ${isEditing ? 'border-indigo-500 ring-2 ring-indigo-50 shadow-lg' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="h-14 w-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                      {isEditing ? (
                        <div className="bg-gray-50 w-full h-full flex items-center justify-center"><ImageIcon className="text-gray-300" size={20} /></div>
                      ) : (
                        u.profileImageUrl ? <img src={u.profileImageUrl} className="h-full w-full object-cover" /> : <span className="text-lg font-bold text-gray-400">{u.username[0].toUpperCase()}</span>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      {isManagement(currentUser?.role) && (
                        <>
                          {isEditing ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleUpdate(u.id)} className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"><Save size={16} /></button>
                              <button onClick={cancelEdit} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"><X size={16} /></button>
                            </div>
                          ) : (
                            <button onClick={() => startInlineEdit(u)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <input 
                          value={formData.profileImageUrl} 
                          onChange={e => setFormData({...formData, profileImageUrl: e.target.value})} 
                          className="w-full p-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-indigo-500 transition-colors" 
                          placeholder="Photo URL" 
                        />
                        <select 
                          value={formData.role} 
                          onChange={e => setFormData({...formData, role: e.target.value})} 
                          className="w-full p-2 text-xs bg-white border border-gray-200 rounded-lg font-bold text-gray-700 outline-none focus:border-indigo-500"
                        >
                          <option value="EMPLOYEE">EMPLOYEE</option>
                          <option value="MANAGER">MANAGER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <input 
                          type="password"
                          placeholder="Reset Password"
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                          className="w-full p-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
                        />
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{u.username}</h3>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold border border-indigo-100">
                            {u.role}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            <CheckCircle2 size={10} className="text-emerald-500" /> Active
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-gray-400 font-mono">ID: {u.id}</span>
                  {currentUser?.role?.toUpperCase() === 'ADMIN' && String(u.id) !== String(currentUser.userId) && !isEditing && (
                    <button onClick={() => handleDelete(u.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SaaS Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Personnel Enrollment</h3>
                <X size={20} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={cancelEdit} />
              </div>
              {error && <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2 border border-red-100"><AlertCircle size={14}/> {error}</div>}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Username</label>
                  <input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="j.doe" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Password</label>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Assigned Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 outline-none focus:border-indigo-500">
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={cancelEdit} className="btn-secondary-saas flex-1">Dismiss</button>
                <button onClick={handleCreate} className="btn-primary-saas flex-1">Enrol Personnel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
