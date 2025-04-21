import React, { useState, useEffect } from 'react';
import axios from 'axios';  // Ensure axios is installed
import './Member.css';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { DroppableContainer } from './DroppableContainer';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const initialTasks = {
  todo: [],
  inprogress: [],
  done: [],
};

const Member = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [user, setUser] = useState({ name: '', role: '' }); // Store user info
  const [activeId, setActiveId] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignee: '',
    priority: 'Low',
    // assignee: 'myself'
  });

  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}` // Assumes token is stored in localStorage
          }
        });
        // console.log("jabgvjksdb");
        // console.log(response.data);
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    fetchUser();
  }, []);


  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem('token'); // replace with your token storage key

      if (!token) {
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/tasks/tasks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        // console.log(data);  
        const arr= {
          todo: [],
          inprogress: [],
          done: [],
        };
        for (let index = 0; index < data.length; index++) {
          // console.log(data[index].status);
          if(data[index].status === "Todo"){
            arr.todo.push({
              id: data[index].id,
              title: data[index].title,
              description: data[index].description,
              dueDate: data[index].due_date,
              assignee: "myself",
              priority: data[index].priority
            });
          }
          else if(data[index].status === "Inprogress"){
            arr.inprogress.push({
              id: data[index].id,
              title: data[index].title,
              description: data[index].description,
              dueDate: data[index].due_date,
              assignee: "myself",
              priority: data[index].priority
            });
          }
          else if(data[index].status === "Done"){
            arr.done.push({
              id: data[index].id,
              title: data[index].title,
              description: data[index].description,
              dueDate: data[index].due_date,
              assignee: "myself",
              priority: data[index].priority
            });
          }
        
      }
      // console.log(arr); 
        setTasks(arr);
      } catch (err) {
      } finally {
      }
    };

    fetchTasks();
  }, []);


  const [overdueTasks, setOverdueTasks] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const today = dayjs();
    const allTasks = [...tasks.todo, ...tasks.inprogress, ...tasks.done];
    const overdue = allTasks.filter(task => dayjs(task.dueDate).isBefore(today, 'day'));
    setOverdueTasks(overdue);
  }, [tasks]);



  // import axios from 'axios';

  const handleCreateTask = async () => {
    if (newTask.title && newTask.description && newTask.dueDate && newTask.priority) {
      try {
        const task = { 
          ...newTask, 
          status: 'To Do', 
          id: `task-${Date.now().toString()}` 
        };
  
        const token = localStorage.getItem('token'); 
  
        if (!token) {
          console.error('Authentication token is missing.');
          return;
        }
  
        const res = await axios.post(
          'http://localhost:5000/api/tasks/tasks',
          {
            title: task.title,
            description: task.description,
            status: task.status,
            due_date: task.dueDate,
            priority: task.priority,
            assignee: task.assignee,  
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (res.status === 200) {
          console.log('Task created successfully:', res.data);
          setTasks(prev => ({
            ...prev,
            todo: [...prev.todo, res.data],
          }));
  
          setNewTask({
            title: '',
            description: '',
            dueDate: '',
            assignee: '',  // <-- Reset assignee
            priority: 'Low',
            // assignee: 'myself'
          });
        }
      } catch (err) {
        console.error('Error creating task:', err.response ? err.response.data.error : err.message);
      }
    } else {
      console.log('Please provide all required fields: title, description, due date, priority, and assignee.');
    }
  };
  
  
  const findContainer = (id) => {
    if (id in tasks) {
      return id;
    }

    for (const [containerId, containerItems] of Object.entries(tasks)) {
      const item = containerItems.find((item) => item.id === id);
      if (item) {
        return containerId;
      }
    }

    return null;
  };

  const getTaskById = (id) => {
    for (const column of Object.values(tasks)) {
      const task = column.find(item => item.id === id);
      if (task) {
        return task;
      }
    }
    return null;
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    
    if (
      !activeContainer || 
      !overContainer || 
      activeContainer === overContainer
    ) {
      return;
    }

    setTasks(prev => {
      const activeItems = prev[activeContainer];
      // const overItems = prev[overContainer];
      
      const activeIndex = activeItems.findIndex(item => item.id === active.id);
      // const overIndex = overItems.length;
      
      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter(item => item.id !== active.id)
        ],
        [overContainer]: [
          ...prev[overContainer],
          prev[activeContainer][activeIndex]
        ]
      };
    });
  };

  // const handleDragEnd = (event) => {
  //   const { active, over } = event;
    
  //   if (!active || !over) {
  //     setActiveId(null);
  //     return;
  //   }
    
  //   const activeContainer = findContainer(active.id);
  //   const overContainer = findContainer(over.id);
    
  //   if (
  //     !activeContainer || 
  //     !overContainer || 
  //     activeContainer !== overContainer
  //   ) {
  //     // This case is handled in handleDragOver
  //     setActiveId(null);
  //     return;
  //   }
    
  //   const activeIndex = tasks[activeContainer].findIndex(
  //     task => task.id === active.id
  //   );
  //   const overIndex = tasks[overContainer].findIndex(
  //     task => task.id === over.id
  //   );
    
  //   if (activeIndex !== overIndex) {
  //     setTasks(prev => ({
  //       ...prev,
  //       [overContainer]: arrayMove(
  //         prev[overContainer],
  //         activeIndex,
  //         overIndex
  //       )
  //     }));
  //   }
    
  //   setActiveId(null);
  // };


// const handleDragEnd = async (event) => {
//   const { active, over } = event;

//   if (!active || !over) {
//     setActiveId(null);
//     return;
//   }

//   const activeContainer = findContainer(active.id);
//   const overContainer = findContainer(over.id);

//   if (!activeContainer || !overContainer) {
//     setActiveId(null);
//     return;
//   }

//   const activeIndex = tasks[activeContainer].findIndex(
//     (task) => task.id === active.id
//   );
//   const overIndex = tasks[overContainer].findIndex(
//     (task) => task.id === over.id
//   );

//   // If dropped in a new column (status change)
//   if (activeContainer !== overContainer) {
//     const movedTask = tasks[activeContainer][activeIndex];
    
//     try {
//       // Make PUT request to update task status on backend
//       await axios.put(`http://localhost:5000/api/tasks/tasks/${movedTask.id}`, {
//         status: overContainer, // Example: "inProgress"
//       }, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}` // replace with your actual token
//         }
//       });

//       // Reflect the change in the frontend state
//       setTasks(prev => {
//         const newSource = [...prev[activeContainer]];
//         const newDest = [...prev[overContainer]];

//         newSource.splice(activeIndex, 1);
//         newDest.splice(overIndex, 0, { ...movedTask, status: overContainer });

//         return {
//           ...prev,
//           [activeContainer]: newSource,
//           [overContainer]: newDest,
//         };
//       });

//     } catch (error) {
//       console.error('Failed to update task status:', error);
//       alert('Could not update task. Please try again.');
//     }
//   }
//   // If same column, just reorder
//   else if (activeIndex !== overIndex) {
//     setTasks(prev => ({
//       ...prev,
//       [overContainer]: arrayMove(prev[overContainer], activeIndex, overIndex)
//     }));
//   }

//   setActiveId(null);
// };

const handleDragEnd = async (event) => {
  const { active, over } = event;
  
  if (!active || !over) {
    setActiveId(null);
    return;
  }


  
  const activeContainer = findContainer(active.id);
  const overContainer = findContainer(over.id);
  
  if (!activeContainer || !overContainer) {
    setActiveId(null);
    return;
  }

  // Map the frontend container names to backend status values
  const containerToStatusMap = {
    todo: "Todo",
    inprogress: "Inprogress",
    done: "Done"
  };
  
  const activeIndex = tasks[activeContainer].findIndex(
    task => task.id === active.id
  );
  
  const overIndex = overContainer === activeContainer 
    ? tasks[overContainer].findIndex(task => task.id === over.id)
    : tasks[overContainer].length;
  
  // If dropped in a new column (status change)
  if (activeContainer !== overContainer) {
    const movedTask = tasks[activeContainer][activeIndex];
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Authentication token is missing.');
        return;
      }
      
      // Make PUT request to update task status on backend
      const response = await axios.put(
        `http://localhost:5000/api/tasks/tasks/${movedTask.id}`, 
        {
          status: containerToStatusMap[overContainer] // Convert container name to backend status format
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        console.log('Task status updated successfully:', response.data);
        
        // Update the local state to reflect the change
        setTasks(prev => {
          const newTasks = { ...prev };
          const taskToMove = { ...newTasks[activeContainer][activeIndex] };
          
          // Remove from the original container
          newTasks[activeContainer] = newTasks[activeContainer].filter(
            item => item.id !== active.id
          );
          
          // Add to the new container
          newTasks[overContainer] = [
            ...newTasks[overContainer].slice(0, overIndex),
            taskToMove,
            ...newTasks[overContainer].slice(overIndex)
          ];
          
          return newTasks;
        });
      } else {
        console.error('Failed to update task status:', response);
        alert('Failed to update task status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('An error occurred while updating the task. Please try again.');
    }
  }
  // If same column, just reorder (no status change, no backend update needed)
  else if (activeIndex !== overIndex) {
    setTasks(prev => ({
      ...prev,
      [overContainer]: arrayMove(
        prev[overContainer],
        activeIndex,
        overIndex
      )
    }));
  }
  
  setActiveId(null);
};

  const priorityCounts = ['Low', 'Medium', 'High'].map(
    level => [...tasks.todo, ...tasks.inprogress, ...tasks.done].filter(task => task.priority === level).length
  );

  const priorityData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        data: priorityCounts,
        backgroundColor: ['#4caf50', '#ffeb3b', '#f44336'],
        hoverBackgroundColor: ['#388e3c', '#fbc02d', '#e53935'],
      },
    ],
  };

  const deadlineData = {
    labels: tasks.todo.map(task => task.title),
    datasets: [
      {
        label: 'Days Remaining',
        data: tasks.todo.map(task => dayjs(task.dueDate).diff(dayjs(), 'day')),
        backgroundColor: '#1976d2',
      },
    ],
  };

  return (
    <div className="member-container">
      <header className="member-header">
      <div className="member-name">
        👤 {user ? user.name : 'Loading...'}
      </div>

        <div className="member-info">Member | 🧑‍💻</div>
      </header>

      <div className="member-content">
        {/* Create Task Section */}
        <section className="create-task-section">
          <h3>Create Task</h3>
          <input
            type="text"
            placeholder="Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          
          <input
            type="date"
            value={newTask.dueDate}
            min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
            onChange={(e) =>
              setNewTask({ ...newTask, dueDate: e.target.value })
            }
          />

          <select
            value={newTask.assignee}
            onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
          >
            <option value="none">None</option>
            <option value="myself">MySelf</option>
          </select>

          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button onClick={handleCreateTask}>Create Task</button>
        </section>

        {/* Charts Section */}
        <section className="visualization-section">
          <h3>Task Distribution</h3>
          <div className="charts">
            <div className="chart">
              <h4>Priority Distribution</h4>
              <Doughnut data={priorityData} />
            </div>
            <div className="chart">
              <h4>Task Deadlines</h4>
              <Bar data={deadlineData} />
            </div>
          </div>
        </section>

        {/* Kanban Section */}
        <section className="kanban-section">
          <h3>Kanban Board</h3>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="kanban-columns">
              {Object.keys(tasks).map((columnId) => (
                <DroppableContainer
                  key={columnId}
                  id={columnId}
                  title={columnId.toUpperCase()}
                >
                  <SortableContext
                    items={tasks[columnId].map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {tasks[columnId].map(task => (
                      <SortableItem
                        key={task.id}
                        id={task.id}
                        title={task.title}
                        description={task.description}
                        dueDate={task.dueDate}
                        priority={task.priority}
                      />
                    ))}
                  </SortableContext>
                </DroppableContainer>
              ))}
              <DragOverlay>
                {activeId ? (
                  <div className="task-card">
                    <h5>{getTaskById(activeId)?.title}</h5>
                    <p>{getTaskById(activeId)?.description}</p>
                    <p>📅 {getTaskById(activeId)?.dueDate}</p>
                    <p>🔥 {getTaskById(activeId)?.priority}</p>
                    <button>Edit</button>
                  </div>
                ) : null}
              </DragOverlay>
            </div>
          </DndContext>
        </section>

        {/* Overdue Section */}
        <section className="overdue-section">
          <h3>⚠️ Overdue Tasks</h3>
          {overdueTasks.length > 0 ? (
            <ul>
              {overdueTasks.map(task => (
                <li key={task.id}>
                  {task.title} (Due: {task.dueDate})
                </li>
              ))}
            </ul>
          ) : (
            <p>No overdue tasks! 🎉</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Member;