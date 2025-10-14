export default {
  "ProjectEd": {
    "path": "/crm/project-ed",
    "component": "@/modules/crm/project-ed/ParentLayout.vue",
    "redirect": "ProjectEdMain",
    "meta": {
      "title": "Управление проектами",
      "requiresAuth": true
    }
  },
  "ProjectEdMain": {
    "path": "/crm/project-ed/main",
    "component": "@/modules/crm/project-ed/MainPage.vue",
    "meta": {
      "title": "Управление проектами",
      "requiresAuth": true
    }
  },
  "ProjectEdMyProjects": {
    "path": "/crm/project-ed/my-projects",
    "component": "@/modules/crm/project-ed/MyProjectsPage.vue",
    "meta": {
      "title": "Мои проекты",
      "requiresAuth": true
    }
  },
  "ProjectEdTechnical": {
    "path": "/crm/project-ed/technical",
    "component": "@/modules/crm/project-ed/Technical/TechnicalPage.vue",
    "meta": {
      "title": "Служебная страница",
      "requiresAuth": true,
      "requiresAdmin": true
    }
  },
  "ProjectEdProgramDevelopment": {
    "path": "/crm/project-ed/program-development",
    "component": "@/modules/crm/project-ed/ProgramDevelopmentPage.vue",
    "meta": {
      "title": "Программа развития БГТУ",
      "requiresAuth": true,
      "requiresAdmin": true
    }
  },
  "ProjectEdImport": {
    "path": "/crm/project-ed/import",
    "component": "@/modules/crm/project-ed/ImportPage.vue",
    "meta": {
      "title": "Импорт блоков мероприятий",
      "requiresAuth": true,
      "requiresAdmin": true
    }
  },
  "ProjectEdEventBlock": {
    "path": "/crm/project-ed/event-block/:id",
    "component": "@/modules/crm/project-ed/Events/EventBlockPage.vue",
    "meta": {
      "title": "Блок мероприятий",
      "requiresAuth": true,
      "requiresAdmin": true
    }
  },
  "ProjectEdEvent": {
    "path": "/crm/project-ed/event/:id",
    "component": "@/modules/crm/project-ed/Events/EventPage.vue",
    "meta": {
      "title": "Мероприятие",
      "requiresAuth": true,
      "requiresAdmin": true
    }
  },
  "ProjectEdCreate": {
    "path": "/crm/project-ed/create",
    "component": "@/modules/crm/project-ed/ProjectCreate.vue",
    "meta": {
      "title": "Создание проекта",
      "requiresAuth": true
    }
  },
  "ProjectEdProjectDetailById": {
    "path": "/crm/project-ed/project/id/:id",
    "component": "@/modules/crm/project-ed/Project/ProjectRedirect.vue",
    "meta": {
      "title": "Карточка проекта",
      "requiresAuth": true
    }
  },
  "ProjectEdProjectDetailByDirectId": {
    "path": "/crm/project-ed/project/:id(\\d+)",
    "component": "@/modules/crm/project-ed/Project/ProjectRedirect.vue",
    "meta": {
      "title": "Карточка проекта",
      "requiresAuth": true
    }
  },
  "ProjectEdProjectDetail": {
    "path": "/crm/project-ed/project/:slug",
    "component": "@/modules/crm/project-ed/Project/ProjectPage.vue",
    "meta": {
      "title": "Карточка проекта",
      "requiresAuth": true
    }
  },
  "ProjectEdProjectReview": {
    "path": "/project/:slug/review",
    "component": "@/modules/crm/project-ed/Project/ProjectTabs/ProjectReview.vue",
    "meta": {
      "title": "Ревью проекта",
      "requiresAuth": true
    }
  },
  "ProjectEdProjectReviewAlt": {
    "path": "/crm/project-ed/project/:slug/review",
    "component": "@/modules/crm/project-ed/Project/ProjectTabs/ProjectReview.vue",
    "meta": {
      "title": "Ревью проекта",
      "requiresAuth": true
    }
  },
  "ProjectEdTargetIndicators": {
    "path": "/crm/project-ed/target-indicators",
    "component": "@/modules/crm/project-ed/TargetIndicatorsPage.vue",
    "meta": {
      "title": "Целевые показатели",
      "requiresAuth": true,
      "requiresAdmin": true
    }
  },
  "ProjectEdSchemas": {
    "path": "/crm/project-ed/schemas",
    "component": "@/modules/crm/project-ed/Technical/Schemas/SchemasPage.vue",
    "meta": {
      "title": "Таблицы",
      "requiresAuth": true,
      "requiresAdmin": true
    }
  },
  "ProjectEdProfile": {
    "path": "/project-ed/profile/:userId",
    "component": "@/modules/crm/project-ed/Profile/ProfilePage.vue",
    "meta": {
      "title": "Профиль",
      "requiresAuth": true
    }
  },
  "ProjectEdUserList": {
    "path": "/users",
    "component": "@/modules/crm/project-ed/Profile/UserList.vue",
    "meta": {
      "title": "Пользователи",
      "requiresAuth": true
    }
  },
  "ProjectEdCreateIndicator": {
    "path": "/crm/project-ed/target-indicators/create",
    "component": "@/modules/crm/project-ed/CreateIndicatorPage.vue",
    "meta": {
      "title": "Создание показателя",
      "requiresAuth": true
    }
  },
  "ProjectEdEditIndicator": {
    "path": "/crm/project-ed/target-indicators/:id/edit",
    "component": "@/modules/crm/project-ed/CreateIndicatorPage.vue",
    "meta": {
      "title": "Редактирование показателя",
      "requiresAuth": true
    }
  }
};

