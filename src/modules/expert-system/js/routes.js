export default {
  "ExpertSystem": {
    "path": "/expert-system",
    "component": "@/modules/expert-system/ParentLayout.vue",
    "redirect": "ChoiceRole",
    "meta": {
      "requiresAuth": true
    }
  },
  "ChoiceRole": {
    "path": "/expert-system/choice-role",
    "component": "@/modules/expert-system/ChoiceRole.vue",
    "meta": {
      "title": "Выбор роли",
      "requiresAuth": true
    }
  },
  "Skills": {
    "path": "/expert-system/skills",
    "component": "@/modules/expert-system/SkillManager.vue",
    "meta": {
      "title": "Навыки",
      "requiresAuth": true
    }
  },
  "Profile": {
    "path": "/expert-system/account",
    "component": "@/modules/expert-system/ProfileDashboard.vue",
    "meta": {
      "title": "Профиль",
      "requiresAuth": true
    }
  },
  "Groups": {
    "path": "/expert-system/group-manager",
    "component": "@/modules/expert-system/GroupManager.vue",
    "meta": {
      "title": "Группы обучения",
      "requiresAuth": true
    }
  },
  "Vacancies": {
    "path": "/expert-system/vacancies",
    "component": "@/modules/expert-system/StudentVacancies.vue",
    "meta": {
      "title": "Вакансии",
      "requiresAuth": true
    }
  },
  "Proforientation": {
    "path": "/expert-system/proforientation",
    "component": "@/modules/expert-system/ProforientationTest.vue",
    "meta": {
      "title": "Профориентация",
      "requiresAuth": true
    }
  },
  "Profession": {
    "path": "/expert-system/profession-manager",
    "component": "@/modules/expert-system/ProfessionManager.vue",
    "meta": {
      "title": "Менеджер профессий",
      "requiresAuth": true
    }
  },
  "OrientationTest": {
    "path": "/expert-system/orientation-test",
    "component": "@/modules/expert-system/OrientationTestManager.vue",
    "meta": {
      "title": "Менеджер ориентационных тестов",
      "requiresAuth": true
    }
  },
  "AllTests": {
    "path": "/expert-system/all-tests",
    "component": "@/modules/expert-system/Tests/AllTestsPage.vue",
    "meta": {
      "title": "Тесты",
      "requiresAuth": true
    }
  },
  "StudentCourses": {
    "path": "/expert-system/student-courses",
    "component": "@/modules/expert-system/StudentCourses.vue",
    "meta": {
      "title": "Рекомендованные курсы",
      "requiresAuth": true
    }
  },
  "StudentsList": {
    "path": "/expert-system/students",
    "component": "@/modules/expert-system/StudentList.vue",
    "meta": {
      "title": "Поиск студентов",
      "requiresAuth": true
    }
  },
  "OrientationQuestionManager": {
    "path": "/expert-system/orientation-question/:testId",
    "component": "@/modules/expert-system/OrientationQuestionManager.vue",
    "meta": {
      "title": "Менеджер вопросов",
      "requiresAuth": true
    }
  },
  "OrientationAnswerManager": {
    "path": "/expert-system/orientation-answer/:questionId",
    "component": "@/modules/expert-system/OrientationAnswerManager.vue",
    "meta": {
      "title": "Менеджер ответов",
      "requiresAuth": true
    }
  },
  "ProforientationTest": {
    "path": "/expert-system/proforientation-test/:testId",
    "component": "@/modules/expert-system/ProforientationTest.vue",
    "meta": {
      "title": "Прохождение теста",
      "requiresAuth": true
    }
  },
  "StudentRegister": {
    "path": "/expert-system/student-register",
    "component": "@/modules/expert-system/StudentRegister.vue",
    "meta": {
      "title": "Регистрация студента",
      "requiresAuth": true
    }
  },
  "CompanyRegister": {
    "path": "/expert-system/company-register",
    "component": "@/modules/expert-system/CompanyRegister.vue",
    "meta": {
      "title": "Вход / Регистрация работодателя",
      "requiresAuth": true
    }
  },
  "Addstudentskills": {
    "path": "/expert-system/addstudent-skills",
    "component": "@/modules/expert-system/AddSkillForStudentsWithExpirience.vue",
    "meta": {
      "title": "Добавление навыков студенту",
      "requiresAuth": true
    }
  },
  "OrientationQuestion": {
    "path": "/expert-system/orientation-question",
    "component": "@/modules/expert-system/OrientationQuestionManager.vue",
    "meta": {
      "title": "Менеджер управление ориентационными вопросами",
      "requiresAuth": true
    }
  },
  "OrientationAnswer": {
    "path": "/expert-system/orientation-answer",
    "component": "@/modules/expert-system/OrientationAnswerManager.vue",
    "meta": {
      "title": "Менеджер управление вариантов ответов на вопросы",
      "requiresAuth": true
    }
  },
  "TestCreation": {
    "path": "/expert-system/test-creation",
    "component": "@/modules/expert-system/Tests/TestCreation.vue",
    "meta": {
      "title": "Создание тестов",
      "requiresAuth": true
    }
  },
  "TestPreview": {
    "path": "/expert-system/test-preview/:id",
    "component": "@/modules/expert-system/Tests/TestViewPage.vue",
    "meta": {
      "title": "Предпросмотр теста",
      "requiresAuth": true
    }
  },
  "TestPage": {
    "path": "/expert-system/test/:id",
    "component": "@/modules/expert-system/Tests/TestPage.vue",
    "meta": {
      "title": "Предпросмотр теста",
      "requiresAuth": true
    }
  },
  "TestResult": {
    "path": "/expert-system/test-result/:id",
    "component": "@/modules/expert-system/Tests/TestResult.vue",
    "meta": {
      "title": "Результат теста",
      "requiresAuth": true
    }
  },
  "VacancyDetail": {
    "path": "/expert-system/vacancy/:id",
    "component": "@/modules/expert-system/VacancyDetail.vue",
    "meta": {
      "title": "Детали вакансии",
      "requiresAuth": true
    }
  },
  "CompanyDetail": {
    "path": "/expert-system/company/:id",
    "component": "@/modules/expert-system/CompanyDetail.vue",
    "meta": {
      "title": "Детали компании",
      "requiresAuth": true
    }
  },
  "StudentDetail": {
    "path": "/expert-system/student/:id",
    "component": "@/modules/expert-system/StudentDetail.vue",
    "meta"  : {
      "title": "Детали студента",
      "requiresAuth": true
    }
  },
  "CourseDetail": {
    "path": "/expert-system/course/:id",
    "component": "@/modules/expert-system/CourseDetail.vue",
    "meta": {
      "title": "Детали курса",
      "requiresAuth": true
    }
  },
  "ExpertDashboard": {
    "path": "/expert-system/expdashboard",
    "component": "@/modules/expert-system/ExpertSystemDashboard.vue",
    "meta": {
      "requiresAuth": true,
      "title": "Дашборд экспертной системы"
    }
  }
}

