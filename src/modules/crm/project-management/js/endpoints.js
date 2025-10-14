export const projectManagementEndpoints = {
    project_management: {
        // Проекты
        projects: 'crm/projects/',
        projectDetail: id => `crm/projects/${id}/`,
        projectTasks: id => `crm/projects/${id}/tasks/`,
        projectStatistics: id => `crm/projects/${id}/statistics/`,
        addProjectMember: id => `crm/projects/${id}/add_member/`,
        removeProjectMember: id => `crm/projects/${id}/remove_member/`,
        exportProjects: 'crm/projects/export/',
        
        // Задачи
        tasks: 'crm/tasks/',
        taskDetail: id => `crm/tasks/${id}/`,
        changeTaskStatus: id => `crm/tasks/${id}/change_status/`,
        addTaskComment: id => `crm/tasks/${id}/add_comment/`,
        addTimeLog: id => `crm/tasks/${id}/add_time_log/`,
        updateTaskKanbanOrder: id => `crm/tasks/${id}/update_kanban_order/`,
        exportTasks: 'crm/tasks/export/',
        
        // Календарь
        tasksCalendar: 'crm/tasks/calendar/',
        createTaskFromCalendar: 'crm/tasks/create_from_calendar/',
        
        // Канбан
        tasksKanban: 'crm/tasks/kanban/',
        
        // Комментарии
        taskComments: 'crm/task-comments/',
        taskCommentDetail: id => `crm/task-comments/${id}/`,
        
        // Учет времени
        timeLogs: 'crm/time-logs/',
        timeLogDetail: id => `crm/time-logs/${id}/`,
        myTimeLogs: 'crm/time-logs/my_time_logs/',
        
        // Пользователи
        users: 'crm/users/',
        
        // Загрузка файлов
        uploadFile: 'crm/upload-file/',
        
        // Статусы проектов
        projectStatuses: 'crm/project-statuses/',
        projectStatusDetail: id => `crm/project-statuses/${id}/`,
        activeProjectStatuses: 'crm/project-statuses/active/',
        defaultProjectStatus: 'crm/project-statuses/default/',
        
        // Приоритеты проектов
        projectPriorities: 'crm/project-priorities/',
        projectPriorityDetail: id => `crm/project-priorities/${id}/`,
        activeProjectPriorities: 'crm/project-priorities/active/',
        defaultProjectPriority: 'crm/project-priorities/default/',
        
        // Статусы задач
        taskStatuses: 'crm/task-statuses/',
        taskStatusDetail: id => `crm/task-statuses/${id}/`,
        activeTaskStatuses: 'crm/task-statuses/active/',
        kanbanTaskStatuses: 'crm/task-statuses/kanban_columns/',
        defaultTaskStatus: 'crm/task-statuses/default/',
        
        // Приоритеты задач
        taskPriorities: 'crm/task-priorities/',
        taskPriorityDetail: id => `crm/task-priorities/${id}/`,
        activeTaskPriorities: 'crm/task-priorities/active/',
        defaultTaskPriority: 'crm/task-priorities/default/',
    }
};

