import React, { useEffect, useState } from 'react';
import { projectService } from '../../services/projectService';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import userService from '../../services/userService';

const API_BASE = "http://localhost:5000/api/projects"; // Change port if needed

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Projects', value: 0, icon: '\ud83d\udcc1', color: 'bg-blue-500' },
    { label: 'Active Users', value: 0, icon: '\ud83d\udc77', color: 'bg-green-500' },
    { label: 'Pending Tasks', value: 0, icon: '\ud83d\udcdd', color: 'bg-yellow-500' },
    { label: 'Revenue', value: '$0', icon: '\ud83d\udcb0', color: 'bg-purple-500' },
  ]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    // Fetch stats using projectService for consistency
    projectService.getProjectStats()
      .then(data => {
        setStats([
          { label: 'Total Projects', value: data.total, icon: '\ud83d\udcc1', color: 'bg-blue-500' },
          { label: 'Active Users', value: 0, icon: '\ud83d\udc77', color: 'bg-green-500' },
          { label: 'Pending Tasks', value: 0, icon: '\ud83d\udcdd', color: 'bg-yellow-500' },
          { label: 'Revenue', value: '$0', icon: '\ud83d\udcb0', color: 'bg-purple-500' },
        ]);
      });
    // Fetch recent activity (audit logs from latest project)
    fetch(`${API_BASE}`)
      .then(res => res.json())
      .then(projects => {
        if (projects.length > 0) {
          fetch(`${API_BASE}/${projects[0]._id}/audit-logs`)
            .then(res => res.json())
            .then(logs => setActivity(logs.slice(0, 5))) // Show last 5 logs
            .catch(() => setActivity([]));
        }
      });
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { label: 'Total Projects', value: 0, icon: '📁', color: 'bg-blue-500' },
    { label: 'Active Users', value: 0, icon: '👷', color: 'bg-green-500' },
    { label: 'Pending Tasks', value: 0, icon: '📝', color: 'bg-yellow-500' },
    { label: 'Revenue', value: '$0', icon: '💰', color: 'bg-purple-500' },
  ]);
  const [activity, setActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch project stats
        const projectStats = await projectService.getProjectStats();
        
        // Fetch users
        const userResponse = await userService.getAllUsers();
        const usersList = userResponse.users || [];
        setUsers(usersList);

        // Update stats with real data
        setStats([
          { label: 'Total Projects', value: projectStats.total || 0, icon: '📁', color: 'bg-blue-500' },
          { label: 'Active Users', value: usersList.length, icon: '👷', color: 'bg-green-500' },
          { label: 'Pending Tasks', value: 0, icon: '📝', color: 'bg-yellow-500' },
          { label: 'Revenue', value: '$0', icon: '💰', color: 'bg-purple-500' },
        ]);

        // Fetch recent activity (audit logs from latest project)
        fetch(`${API_BASE}`)
          .then(res => res.json())
          .then(projects => {
            if (projects.length > 0) {
              fetch(`${API_BASE}/${projects[0]._id}/audit-logs`)
                .then(res => res.json())
                .then(logs => setActivity(logs.slice(0, 5))) // Show last 5 logs
                .catch(() => setActivity([]));
            }
          })
          .catch(() => setActivity([]));

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-xl shadow-lg p-6 flex items-center ${stat.color} text-white`}>
            <span className="text-4xl mr-4">{stat.icon}</span>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Charts & Recent Activity */}
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
                    {user.name ? user.name.charAt(0).toUpperCase() : user.gmail.charAt(0).toUpperCase()}
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
                  <span className="mr-2">\u2705</span> {log.action} on {log.field} by {log.user} ({log.date})
                  <span className="mr-2">✅</span> {log.action} on {log.field} by {log.user} ({log.date})
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
