import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, Search, Filter, MoreVertical,
  Calendar, CheckCircle2, Clock, AlertCircle,
  User, Flag, ChevronDown, Trash2, Edit2, X, Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { toast } from 'react-toastify';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'PENDING',
    priority: 'MEDIUM', deadline: '', assignedUserIds: []
  });
  const [filter, setFilter] = useState({ status: '', priority: '', search: '' });
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        axios.get('/api/tasks'),
        axios.get('/api/users')
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
      setLoading(false);

      // Alert for overdue tasks
      const overdueCount = tasksRes.data.filter(t => 
        t.status !== 'COMPLETED' && t.deadline && new Date(t.deadline) < new Date()
      ).length;

      if (overdueCount > 0) {
        toast.warning(`System Alert: ${overdueCount} task(s) are currently overdue!`, {
          icon: <AlertCircle className="text-red-500" />,
          autoClose: 5000
        });
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask.id}`, formData);
        toast.success('Task configuration updated successfully.');
      } else {
        await axios.post('/api/tasks', formData);
        toast.success('New task initiated and assigned.');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error('Operation failed. Please verify input.');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(`/api/tasks/${taskId}/status`, null, { params: { status: newStatus } });
      if (newStatus === 'COMPLETED') {
        toast.success('Achievement Unlocked: Task marked as completed!', {
          icon: <CheckCircle2 className="text-emerald-500" />
        });
      } else {
        toast.info(`Task status migrated to ${newStatus.replace('_', ' ')}.`);
      }
      fetchData();
    } catch (err) {
      toast.error('Status synchronization failed.');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Confirm deletion of this record?")) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      toast.info('Task record purged from system.');
      fetchData();
    } catch (err) {
      toast.error('Deletion failed.');
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      deadline: task.deadline ? task.deadline.substring(0, 16) : '',
      assignedUserIds: task.assignedUsers?.map(u => u.id) || []
    });
    setShowModal(true);
  };

  const filteredTasks = tasks.filter(t => {
    return (!filter.status || t.status === filter.status) &&
      (!filter.priority || t.priority === filter.priority) &&
      (!filter.search || t.title.toLowerCase().includes(filter.search.toLowerCase()));
  });

  if (loading) return <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Accessing Task Ledger...</div>;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* SaaS Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Project Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track organization-wide activities.</p>
        </div>
        {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') && (
          <button
            onClick={() => { setEditingTask(null); setFormData({ title: '', description: '', status: 'PENDING', priority: 'MEDIUM', deadline: '', assignedUserIds: [] }); setShowModal(true); }}
            className="btn-primary-saas"
          >
            <Plus size={18} /> New Assignment
          </button>
        )}
      </div>

      {/* SaaS Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search records..."
            value={filter.search}
            onChange={e => setFilter({ ...filter, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={filter.status}
            onChange={e => setFilter({ ...filter, status: e.target.value })}
            className="bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 p-2.5 px-4 cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm"
          >
            <option value="">ALL STATUS</option>
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="OVERDUE">OVERDUE</option>
          </select>
          <select
            value={filter.priority}
            onChange={e => setFilter({ ...filter, priority: e.target.value })}
            className="bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 p-2.5 px-4 cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm"
          >
            <option value="">ALL PRIORITY</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>
      </div>

      {/* Task List - Clean SaaS Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title & Priority</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignees</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deadline</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredTasks.map(t => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-start gap-3">
                    {t.status === 'COMPLETED' && (
                      <div className="mt-0.5 bg-emerald-100 p-1 rounded-full">
                        <CheckCircle2 className="text-emerald-600 h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <p className={`text-sm font-bold ${t.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{t.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${t.priority === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' :
                            t.priority === 'MEDIUM' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                              'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}>
                          {t.priority}
                        </span>
                        {t.status !== 'COMPLETED' && t.deadline && new Date(t.deadline) < new Date() && (
                          <span className="flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-600 text-white animate-pulse">
                            <AlertCircle size={10} /> Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <select
                    value={t.status}
                    onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                    className={`text-[11px] font-bold uppercase px-3 py-1.5 rounded-lg border border-transparent cursor-pointer transition-all ${t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 hover:border-emerald-200' :
                        t.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 hover:border-blue-200' :
                          t.status === 'OVERDUE' ? 'bg-red-600 text-white animate-pulse' :
                            'bg-indigo-50 text-indigo-700 hover:border-indigo-200'
                      }`}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </td>
                <td className="px-6 py-5">
                  <div className="flex -space-x-2">
                    {t.assignedUsers?.map(u => (
                      <div key={u.id} title={u.username} className="h-7 w-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {u.username[0].toUpperCase()}
                      </div>
                    ))}
                    {(!t.assignedUsers || t.assignedUsers.length === 0) && <span className="text-[10px] text-slate-400 italic">Unassigned</span>}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={14} />
                    <span className="text-xs font-medium">{t.deadline ? new Date(t.deadline).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') ? (
                      <>
                        <button onClick={() => openEdit(t)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"><Trash2 size={14} /></button>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium italic">Read Only</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTasks.length === 0 && (
          <div className="p-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No matching records found.</div>
        )}
      </div>

      {/* Task Modal (Formal) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden card-outline">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">{editingTask ? 'Update Record' : 'Task Initiation'}</h3>
                <X size={20} className="cursor-pointer text-slate-400 hover:text-slate-600" onClick={() => setShowModal(false)} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Assignment Title</label>
                    <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="input-saas" placeholder="e.g. Q2 Security Audit" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Detailed Specification</label>
                    <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input-saas" placeholder="Describe the scope and deliverables..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Priority Rank</label>
                    <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="input-saas font-semibold">
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Target Deadline</label>
                    <input type="datetime-local" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} className="input-saas" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Personnel Assignment</label>
                    <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto p-4 bg-white border border-gray-200 rounded-xl">
                      {users.map(u => (
                        <label key={u.id} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-slate-900">
                          <input
                            type="checkbox"
                            checked={formData.assignedUserIds.includes(u.id)}
                            onChange={(e) => {
                              const newIds = e.target.checked
                                ? [...formData.assignedUserIds, u.id]
                                : formData.assignedUserIds.filter(id => id !== u.id);
                              setFormData({ ...formData, assignedUserIds: newIds });
                            }}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                          {u.username}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-lg border border-slate-200">Dismiss</button>
                  <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 shadow-sm transition-all flex items-center justify-center gap-2">
                    <Save size={18} /> {editingTask ? 'Save Changes' : 'Initiate Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
