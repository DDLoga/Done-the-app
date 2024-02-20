import React from 'react';
import { parseISO, isValid, differenceInDays } from 'date-fns';

export const getProjectPriority = (parentId, projectsData) => {
    if (parentId === null || !Array.isArray(projectsData)) {
        return '';
    }
    const project = projectsData.find((project) => project.id === parentId);
    return project ? project.project_priority : '';
};

export const getTaskDeadline = (params) => {
    let date = params ? parseISO(params) : null;
    return date && isValid(date) ? date : null;
};

export const getTodayDate = () => {
    return new Date();
};

export const getTaskPriority = (params) => {
    return params || '';
};

export const calculateUrgency = (taskDeadline, todayDate) => {
    if (!taskDeadline) {
        return 1;
    }
    if (
        new Date(taskDeadline.getFullYear(), taskDeadline.getMonth(), taskDeadline.getDate()).getTime() ===
        new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()).getTime()
    ) {
        return 1.5;
    }
    if (taskDeadline < todayDate) {
        return differenceInDays(todayDate, taskDeadline) + 1;
    }
    let diffDays = differenceInDays(taskDeadline, todayDate);
    return 1 / (diffDays + 1);
};

export const calculateProjectPriorityScore = (projectPriority) => {
    switch (projectPriority) {
        case 'A': return 4;
        case 'B': return 3;
        case 'C': return 2;
        case 'D': return 1;
        default: return 1;
    }
};

export const calculateTaskPriorityScore = (taskPriority) => {
    switch (taskPriority) {
        case 'A': return 4 * 0.75;
        case 'B': return 3 * 0.75;
        case 'C': return 2 * 0.75;
        case 'D': return 1 * 0.75;
        default: return 0;
    }
};

export const calculateCompoundPriority = (taskPriorityScore, projectPriorityScore, urgency) => {
    return Math.round(taskPriorityScore * projectPriorityScore * urgency * 100);
};

const CompoundPriority = ({ taskPriorityScore, projectPriorityScore, urgency }) => {
    const compoundPriority = calculateCompoundPriority(taskPriorityScore, projectPriorityScore, urgency);
    return (
        <div>
            Compound Priority: {compoundPriority}
        </div>
    );
};
export default CompoundPriority;