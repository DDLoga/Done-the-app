import React, { useState } from 'react';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import TaskPropertiesDialog from './_TaskPropertiesDialog'; // Import the TaskPropertiesDialog component

function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

function TasksTable({ tasks }) {
    const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false); // New state for the TaskPropertiesDialog
    const [taskToEdit, setTaskToEdit] = useState(null); // New state for the task to edit

    const handleEditTask = (task) => { // New handler for editing a task
        setTaskToEdit(task);
        setEditTaskDialogOpen(true);
    };

    const handleSaveTask = (updatedTask) => { // New handler for saving a task
        // Save the updated task here...
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const defaultDate = new Date(1970, 0, 1);
    defaultDate.setHours(0, 0, 0, 0);

    return (
        <>
            <table id="external-events" className="table-auto bg-gray-800 text-white my-4 rounded shadow-lg">
                <thead>
                    <tr>
                        <th className="border-gray-700 border p-2">Task Names</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks && tasks.sort((a, b) => b.compound_priority - a.compound_priority).map((task) => {
                        const taskDeadline = new Date(task.deadline);
                        taskDeadline.setHours(0, 0, 0, 0);

                        let chipLabel = '';
                        let chipColor = '';

                        if (taskDeadline.getTime() !== defaultDate.getTime()) {
                            if (taskDeadline < today) {
                                chipLabel = 'overdue';
                                chipColor = 'error';
                            } else if (taskDeadline.getTime() === today.getTime()) {
                                chipLabel = 'today';
                                chipColor = 'warning';
                            } else if (taskDeadline.getTime() === tomorrow.getTime()) {
                                chipLabel = 'tomorrow';
                                chipColor = 'primary';
                            }
                        }

                        return (
                            <tr key={task.id} data-title={task.name} data-id={task.id} className="fc-event draggable bg-gray-700 hover:bg-gray-600 cursor-move" draggable="true" onClick={() => handleEditTask(task)}>
                                <td className="border-gray-700 border p-2">
                                    <Tooltip title={<div style={{ fontSize: '1.25em' }}>
                                        Compound Priority: {task.compound_priority}<br/>
                                        Due Date: {taskDeadline.getTime() === defaultDate.getTime() ? 'none' : formatDate(taskDeadline)}
                                    </div>}>
                                        <span >{task.name}</span>
                                    </Tooltip>
                                    {chipLabel && <Chip className="ml-2" label={chipLabel} color={chipColor} size="small" />}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <TaskPropertiesDialog // New TaskPropertiesDialog component
                open={editTaskDialogOpen}
                onClose={() => setEditTaskDialogOpen(false)}
                task={taskToEdit}
                onSave={handleSaveTask}
            />
        </>
    );
}

export default TasksTable;