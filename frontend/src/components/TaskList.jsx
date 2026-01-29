import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import './TaskList.css'

function TaskList({ tasks, onAddTask, onToggleTask }) {
    const [newTaskText, setNewTaskText] = useState('')

    const handleAddTask = (e) => {
        e.preventDefault()
        if (newTaskText.trim()) {
            onAddTask(newTaskText.trim())
            setNewTaskText('')
        }
    }

    const pendingTasks = tasks.filter(task => !task.completed)
    const completedTasks = tasks.filter(task => task.completed)

    return (
        <div className="task-list-container">
            <h2 className="task-list-title">Shared Tasks</h2>
            <p className="task-list-subtitle">Track your study session goals together</p>

            {/* Add New Task Form */}
            <form onSubmit={handleAddTask} className="add-task-form">
                <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Add a new task..."
                    className="add-task-input"
                    aria-label="New task text"
                />
                <button
                    type="submit"
                    className="add-task-btn"
                    disabled={!newTaskText.trim()}
                    aria-label="Add task"
                >
                    <Plus size={18} />
                    <span>Add Task</span>
                </button>
            </form>

            {/* Tasks List */}
            <div className="tasks-section">
                {/* Pending Tasks */}
                {pendingTasks.length > 0 && (
                    <div className="tasks-group">
                        <h3 className="tasks-group-title">To Do ({pendingTasks.length})</h3>
                        <ul className="tasks-list" role="list">
                            {pendingTasks.map((task) => (
                                <li key={task.id} className="task-item">
                                    <button
                                        className="task-checkbox"
                                        onClick={() => onToggleTask(task.id)}
                                        aria-label={`Mark "${task.text}" as completed`}
                                    >
                                        <span className="checkbox-icon"></span>
                                    </button>
                                    <span className="task-text">{task.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                    <div className="tasks-group">
                        <h3 className="tasks-group-title completed-title">
                            Completed ({completedTasks.length})
                        </h3>
                        <ul className="tasks-list" role="list">
                            {completedTasks.map((task) => (
                                <li key={task.id} className="task-item completed">
                                    <button
                                        className="task-checkbox checked"
                                        onClick={() => onToggleTask(task.id)}
                                        aria-label={`Mark "${task.text}" as not completed`}
                                    >
                                        <Check size={14} className="check-icon" />
                                    </button>
                                    <span className="task-text">{task.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Empty State */}
                {tasks.length === 0 && (
                    <div className="tasks-empty">
                        <p>No tasks yet. Add a task to get started!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TaskList
