import React, { useState } from 'react';
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import './Home.css';

function Home() {
  const [role] = useState('Admin'); // role is fixed here

  const [tasks, setTasks] = useState({
    todo: ['Inspect site A', 'Order cement'],
    inProgress: ['Foundation work'],
    completed: ['Design approval'],
  });

  const onDragStart = (e, task, from) => {
    if (!['Admin', 'Manager'].includes(role)) return;
    e.dataTransfer.setData('task', task);
    e.dataTransfer.setData('from', from);
  };

  const onDrop = (e, to) => {
    if (!['Admin', 'Manager'].includes(role)) return;

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

  return (
    <div>
      <Nav />

      <div className="dashboard">
        <main className="main-content">
          <header className="header">
            <input type="text" placeholder="Search projects..." />
          </header>

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
                    <progress value={progress} max="100" />
                    {label && <small>{label}</small>}
                  </>
                )}
              </div>
            ))}
          </section>

          <section className="tasks-section">
            <h2>Task Board</h2>
            <div className="board">
              {['todo', 'inProgress', 'completed'].map(status => (
                <div
                  key={status}
                  onDrop={(e) => onDrop(e, status)}
                  onDragOver={(e) => e.preventDefault()}
                  className="task-column"
                >
                  <h3>
                    {status === 'todo'
                      ? 'To Do'
                      : status === 'inProgress'
                      ? 'In Progress'
                      : 'Completed'}
                  </h3>
                  {tasks[status].map(task => (
                    <div
                      key={task}
                      draggable
                      onDragStart={(e) => onDragStart(e, task, status)}
                      className="task-card"
                      onMouseDown={e => e.currentTarget.style.backgroundColor = '#F5CB5C'}
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
      <Footer />
    </div>
  );
}

export default Home;
