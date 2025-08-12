import React, { useState } from 'react';
import Nav from "../Nav/Nav";
import './Home.css';

function Home() {
  // Dashboard state and handlers
  const [tasks, setTasks] = useState({
    todo: ['Inspect site A', 'Order cement'],
    inProgress: ['Foundation work'],
    completed: ['Design approval'],
  });

  const onDragStart = (e, task, from) => {
    e.dataTransfer.setData('task', task);
    e.dataTransfer.setData('from', from);
  };

  const onDrop = (e, to) => {
    const task = e.dataTransfer.getData('task');
    const from = e.dataTransfer.getData('from');

    if (from === to) return;

    setTasks(prev => {
      const newTasks = { ...prev };
      newTasks[from] = newTasks[from].filter(t => t !== task);
      newTasks[to] = [...newTasks[to], task];
      return newTasks;
    });
  };

  const onDragOver = (e) => e.preventDefault();

  return (
    <div>
      <Nav />
      <h1>Hi ITP</h1>

      {/* Dashboard content starts here */}
      <div className="dashboard">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2>AD Construction</h2>
          <nav>
            <ul>
              {['Dashboard', 'Projects', 'Tasks', 'Budget', 'Inventory', 'Messages', 'Reports', 'Settings'].map(item => (
                <li
                  key={item}
                >
                  {item}
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="main-content">
          <header className="header">
            <input
              type="text"
              placeholder="Search projects..."
            />
            <div className="profile">Admin ▼</div>
          </header>

          {/* Summary Cards */}
          <section className="summary-cards">
            {[
              { title: 'Active Projects', value: '8 projects', progress: 65, label: '65% complete' },
              { title: 'Tasks Pending', value: '5 tasks' },
              { title: 'Materials Low', value: '3 items' },
              { title: 'Budget Used', value: '72%', progress: 72 }
            ].map(({ title, value, progress, label }) => (
              <div key={title} className="card">
                <h3>{title}</h3>
                <p>{value}</p>
                {progress !== undefined && (
                  <>
                    <progress value={progress} max="100" style={{ width: '100%', margin: '0.5rem 0' }} />
                    {label && <small>{label}</small>}
                  </>
                )}
              </div>
            ))}
          </section>

          {/* Tasks Kanban */}
          <section className="tasks-section">
            <h2>Tasks Kanban</h2>
            <div className="kanban">
              {['todo', 'inProgress', 'completed'].map(status => (
                <div
                  key={status}
                  onDrop={(e) => onDrop(e, status)}
                  onDragOver={onDragOver}
                  className="kanban-column"
                >
                  <h3>
                    {status === 'todo' ? 'To Do' : status === 'inProgress' ? 'In Progress' : 'Completed'}
                  </h3>
                  {tasks[status].map(task => (
                    <div
                      key={task}
                      draggable
                      onDragStart={(e) => onDragStart(e, task, status)}
                      className="task-card"
                      onMouseDown={e => e.currentTarget.style.backgroundColor = '#dff9fb'}
                      onMouseUp={e => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      {task}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Home;
