import React, { useEffect, useState } from 'react';
import { projectService } from '../../services/projectService';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';

const API_BASE = "http://localhost:5000/api/projects"; // Change port if needed

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState([
    { label: 'Total Projects', value: 0, icon: '📁', color: 'bg-blue-500' },
    { label: 'Active Users', value: 0, icon: '👷', color: 'bg-green-500' },
    { label: 'Pending Tasks', value: 0, icon: '📝', color: 'bg-yellow-500' },
    { label: 'Revenue', value: '$0', icon: '💰', color: 'bg-purple-500' },
  ]);

  const [activity, setActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [projectTotal, setProjectTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch project stats
        const projectStats = await projectService.getProjectStats();
        // Fetch project stats (distribution for chart)
        const projStats = await projectService.getProjectStats();
        setDistribution(projStats.distribution || []);
        setProjectTotal(projStats.total || 0);

        // Fetch users
        const userResponse = await userService.getAllUsers();
        const usersList = userResponse.users || [];
        setUsers(usersList);

        // Fetch full projects list for pending tasks and activity
        const allProjectsData = await projectService.getAllProjects();
        const projectsArr = Array.isArray(allProjectsData?.projects) ? allProjectsData.projects : [];

        // Active users excluding Clients
        const nonClientCount = usersList.filter(u => u.role && u.role !== 'Client').length;

        // Pending tasks heuristic: projects not completed
        const pendingTasks = projectsArr.filter(p => (p.status !== 'Completed') && (Number(p.completion ?? 0) < 100)).length;

        setStats([
          { label: 'Total Projects', value: projStats.total || 0, icon: '📁', color: 'bg-blue-500' },
          { label: 'Active Users', value: nonClientCount, icon: '👷', color: 'bg-green-500' },
          { label: 'Pending Tasks', value: pendingTasks, icon: '📝', color: 'bg-yellow-500' },
          { label: 'Revenue', value: '$0', icon: '💰', color: 'bg-purple-500' },
        ]);

        // Fetch recent activity
        const projects = await fetch(`${API_BASE}`).then(res => res.json()).catch(() => []);
        if (projects.length > 0) {
          const logs = await fetch(`${API_BASE}/${projects[0]._id}/audit-logs`)
            .then(res => res.json())
            .catch(() => []);
          setActivity(logs.slice(0, 5)); // Show last 5 logs
        // Recent activity: use most recently updated project (by updatedAt)
        const sortedByUpdated = projectsArr
          .slice()
          .sort((a,b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
        if (sortedByUpdated.length) {
          const first = sortedByUpdated[0];
          const logsData = await projectService.getProjectAuditLogs(first._id);
          const logs = logsData.auditLogs || [];
          setActivity(logs.slice(0,5));
        } else {
          setActivity([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

      {/* Stats Cards */}
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className={`rounded-xl shadow-lg p-6 flex items-center ${stat.color} text-white`}
          >
            <span className="text-4xl mr-4">{stat.icon}</span>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-white/80">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Users</h2>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          {loading ? (
            <div className="text-gray-400">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-gray-400">No users found.</div>
          ) : (
            <ul className="space-y-3">
              {users.slice(0, 5).map((user, idx) => (
                <li
                  key={idx}
                  onClick={() => navigate('/admin/users')}
                  className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
                    {user.name ? user.name.charAt(0).toUpperCase() : (user.gmail ? user.gmail.charAt(0).toUpperCase() : '?')}
                  </div>
                  <div>
                    <div className="font-medium">{user.name || 'No name'}</div>
                    <div className="text-sm text-gray-500">{user.gmail}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Placeholder for chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Project Progress Overview</h2>
          <div className="h-48 flex items-center justify-center text-gray-400">[Chart Placeholder]</div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ul className="space-y-3">
            {activity.length === 0 ? (
              <li className="text-gray-400">No recent activity.</li>
            ) : (
              activity.map((log, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="mr-2">✅</span> {log.action} on {log.field} by {log.user} ({log.date})
                </li>
              ))
      {/* Users + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Users</h2>
              <button 
                onClick={() => navigate('/admin/users')}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
            {loading ? (
              <div className="text-gray-400">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-gray-400">No users found.</div>
            ) : (
              <ul className="space-y-3">
                {users.slice(0, 5).map((user, idx) => (
                  <li 
                    key={idx} 
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
                      {user.name ? user.name.charAt(0).toUpperCase() : (user.gmail || '').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{user.name || 'No name'}</div>
                      <div className="text-sm text-gray-500">{user.gmail || 'No email'}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Project Progress */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Project Progress Overview</h2>
            {/* Simple bar chart from distribution */}
            <div className="space-y-3">
              {distribution.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {distribution.map((d) => {
                    const pct = projectTotal ? Math.round((d.count / projectTotal) * 100) : Math.round(d.percentage || 0);
                    const color = d.status === 'Completed' ? 'bg-green-600' : d.status === 'In Progress' ? 'bg-yellow-500' : d.status === 'On Hold' ? 'bg-orange-500' : 'bg-blue-500';
                    return (
                      <div key={d.status} className="flex items-center gap-3">
                        <div className="w-28 text-sm text-gray-600">{d.status}</div>
                        <div className="flex-1 bg-gray-100 rounded h-2">
                          <div className={`h-2 rounded ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                        <div className="w-10 text-right text-sm text-gray-600">{pct}%</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">No data</div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <ul className="space-y-3">
              {activity.length === 0 ? (
                <li className="text-gray-400">No recent activity.</li>
              ) : (
                activity.map((log, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="mr-2">✅</span>
                    {log.action} on {log.field} by {log.user || 'System'} ({new Date(log.timestamp).toLocaleString()})
                  </li>
                ))
              )}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
