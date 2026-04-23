import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Clock, AlertCircle, PlayCircle, Activity,
  TrendingUp, UserCheck, ShieldAlert, BellRing, Info,
  Users, ChevronRight, X, Trophy
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeStats, setEmployeeStats] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        axios.get('/api/dashboard/analytics'),
        axios.get('/api/dashboard/audit-logs')
      ]);
      setStats(statsRes.data);
      setAuditLogs(Array.isArray(logsRes.data) ? logsRes.data.slice(0, 10) : []);
      if (statsRes.data.role === 'ADMIN' || statsRes.data.role === 'MANAGER') {
        const empRes = await axios.get('/api/dashboard/employees');
        setEmployees(empRes.data);
      }
    } catch (err) {
      setError("System data unavailable. Please reconnect.");
    }
  };

  const fetchEmployeeInsight = async (userId) => {
    try {
      setSelectedEmployee(userId);
      setEmployeeStats(null);
      const res = await axios.get(`/api/dashboard/user-analytics/${userId}`);
      setEmployeeStats(res.data);
    } catch (err) { }
  };

  if (error) return <div className="p-8 text-slate-600 bg-slate-50 border border-slate-200 rounded-xl">{error}</div>;
  if (!stats) return <div className="p-20 text-center text-slate-400 font-medium">Loading analytics...</div>;

  const isManagement = stats.role === 'ADMIN' || stats.role === 'MANAGER';

  // Modern SaaS Palette for Status
  const STATUS_COLORS = {
    Completed: '#10B981', // Emerald 500
    InProgress: '#3B82F6', // Blue 500
    Pending: '#6366F1',    // Indigo 500
    Overdue: '#F43F5E'     // Rose 500
  };

  // Dedicated Palette for Priority
  const PRIORITY_COLORS = {
    HIGH: '#EF4444',   // Red 500
    MEDIUM: '#6366F1', // Indigo 500
    LOW: '#06B6D4'     // Cyan 500
  };

  const statusData = [
    { name: 'Completed', value: stats.completedTasks, color: STATUS_COLORS.Completed },
    { name: 'In Progress', value: stats.inProgressTasks, color: STATUS_COLORS.InProgress },
    { name: 'Pending', value: stats.pendingTasks, color: STATUS_COLORS.Pending },
    { name: 'Overdue', value: stats.overdueTasks, color: STATUS_COLORS.Overdue },
  ].filter(d => d.value > 0);

  const priorityData = Object.entries(stats.priorityBreakdown || {}).map(([name, value]) => ({
    name, 
    value, 
    color: PRIORITY_COLORS[name] || '#6366F1'
  }));

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Recognition Banner (Formal) */}
      {/* Recognition Banner - Premium SaaS Style */}
      {stats.isBestPerformer && (
        <div className="card-premium p-6 flex items-center justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="bg-indigo-600 p-3 rounded-xl shadow-indigo-200 shadow-lg">
              <Trophy className="text-white h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Quarterly Recognition</h2>
              <p className="text-gray-500 text-sm">Outstanding performance and contribution to the team.</p>
            </div>
          </div>
          <div className="hidden md:block relative z-10">
            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-bold uppercase tracking-wider border border-indigo-100">
              Top Performer
            </span>
          </div>
        </div>
      )}

      {/* High Priority Overdue Alert */}
      {stats.overdueTasks > 0 && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg text-white shadow-lg shadow-red-200">
              <ShieldAlert size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-red-900">System Alert: {stats.overdueTasks} Overdue Tasks Detected</p>
              <p className="text-xs text-red-700">Immediate action required on high-priority records.</p>
            </div>
          </div>
          <button 
             onClick={() => navigate('/dashboard/tasks')}
             className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:underline"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isManagement ? 'Operational Overview' : 'My Performance Hub'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">System analytics and task distribution metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Level:</span>
          <div className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-black uppercase border border-slate-200">
            {stats.role}
          </div>
        </div>
      </div>

      {/* Key Metrics - Minimal & High End */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Volume', value: stats.totalTasks, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Completed', value: stats.completedTasks, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Action', value: stats.pendingTasks, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Efficiency', value: `${stats.successRate}%`, icon: TrendingUp, color: 'text-sky-600', bg: 'bg-sky-50' },
        ].map((item, i) => (
          <div key={i} className="card-premium p-6 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{item.value}</p>
              </div>
              <div className={`${item.bg} p-2.5 rounded-xl transition-colors`}>
                <item.icon className={`${item.color} h-6 w-6`} strokeWidth={2} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Charts Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm h-[450px] flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Status Distribution</h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                      {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm h-[450px] flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Priority Load Analysis</h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={priorityData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} width={60} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Activity Logs (Formal) */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-900 text-sm flex items-center gap-2">
              <BellRing size={16} className="text-slate-400" /> System Activity Ledger
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 items-start">
                    <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {log.user?.username?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1 border-b border-slate-50 pb-4">
                      <p className="text-sm text-slate-700"><span className="font-bold text-slate-900">{log.user?.username}</span> {log.action}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Roster (Formal) */}
        {isManagement && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-900 text-white font-bold text-sm flex items-center gap-2">
                <Users size={16} /> Team Members
              </div>
              <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                {employees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => fetchEmployeeInsight(emp.id)}
                    className={`w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left ${selectedEmployee === emp.id ? 'bg-slate-50 border-l-4 border-slate-900' : ''}`}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{emp.username}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{emp.role}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300" />
                  </button>
                ))}
              </div>
            </div>

            {/* Insight Card (Formal) */}
            {selectedEmployee && employeeStats && (
              <div className="bg-slate-900 p-6 rounded-2xl text-white space-y-4 animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Employee Insight</h3>
                  <X size={14} className="cursor-pointer text-slate-500 hover:text-white" onClick={() => setSelectedEmployee(null)} />
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Performance Index</p>
                    <p className="text-2xl font-bold mt-1 text-sky-400">{employeeStats.successRate}%</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Total</p>
                      <p className="text-lg font-bold">{employeeStats.totalTasks}</p>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Overdue</p>
                      <p className="text-lg font-bold text-red-400">{employeeStats.overdueTasks}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
