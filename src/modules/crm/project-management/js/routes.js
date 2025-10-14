export default {
  "ProjectManagement": {
    "path": "/crm/project-management",
    "component": "@/modules/crm/project-management/ParentLayout.vue",
    "redirect": "MyProjectsList",
    "meta": {
      "requiresAuth": true
    }
  },
  "ProjectCalendar": {
    "path": "/crm/project-management/calendar",
    "component": "@/modules/crm/project-management/TaskCalendar.vue",
    "meta": {
      "title": "Календарь задач",
      "requiresAuth": true
    }
  },
  "KanbanBoard": {
    "path": "/crm/project-management/kanban",
    "component": "@/modules/crm/project-management/KanbanBoard.vue",
    "meta": {
      "title": "Канбан доска",
      "requiresAuth": true
    }
  },
  "MyProjectsList": {
    "path": "/crm/project-management/my-projects",
    "component": "@/modules/crm/project-management/ProjectsList.vue",
    "meta": {
      "title": "Мои проекты",
      "requiresAuth": true
    }
  },
  "ProjectsAndTasksManagement": {
    "path": "/crm/project-management/management",
    "component": "@/modules/crm/project-management/ProjectsAndTasksManagement.vue",
    "meta": {
      "title": "Проекты и задачи",
      "requiresAuth": true
    }
  },
  "MyTasksList": {
    "path": "/crm/project-management/tasks",
    "component": "@/modules/crm/project-management/TasksList.vue",
    "meta": {
      "title": "Мои задачи",
      "requiresAuth": true
    }
  },
  "ProjectDetail": {
    "path": "/crm/project-management/project/:id",
    "component": "@/modules/crm/project-management/ProjectDetail.vue",
    "meta": {
      "title": "Детали проекта",
      "requiresAuth": true
    }
  },
  "TaskDetail": {
    "path": "/crm/project-management/task/:id",
    "component": "@/modules/crm/project-management/TaskDetail.vue",
    "meta": {
      "title": "Детали задачи",
      "requiresAuth": true
    }
  }
};

