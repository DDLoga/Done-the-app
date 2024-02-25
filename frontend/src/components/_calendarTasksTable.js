import React from 'react';

function TasksTable({ tasks }) {
    return (
        <table id="external-events" className="bg-gray-800 text-white my-4 rounded shadow-lg w-full">
            <thead>
                <tr>
                    <th className="border-gray-700 border p-2">Task Name</th>
                    <th className="border-gray-700 border p-2">Compound Priority</th>
                    <th className="border-gray-700 border p-2">Deadline</th>
                </tr>
            </thead>
            <tbody>
                {tasks && [...tasks].sort((a, b) => b.compound_priority - a.compound_priority).map((task, index) => (
                    <tr key={task.id} title={task.name} data-id={task.id} className="fc-event draggable bg-gray-700 hover:bg-gray-600 cursor-move" draggable="true">
                        <td className="border-gray-700 border p-2">{task.name}</td>
                        <td className="border-gray-700 border p-2">{task.compound_priority}</td>
                        <td className="border-gray-700 border p-2">{task.deadline}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default TasksTable;