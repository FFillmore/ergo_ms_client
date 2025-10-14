export default {
  "LMS": {
    "path": "/lms",
    "component": "@/modules/lms/ParentLayout.vue",
    "redirect": "LMSDashboard",
    "meta": {
      "requiresAuth": true
    }
  },
  "LMSDashboard": {
    "path": "/lms/dashboard",
    "component": "@/modules/lms/Dashboard/DashboardView.vue",
    "meta": {
      "title": "Дашборд LMS",
      "requiresAuth": true
    }
  },
  "LMSCatalog": {
    "path": "/lms/catalog",
    "component": "@/modules/lms/Catalog/CatalogView.vue",
    "meta": {
      "title": "Каталог курсов",
      "requiresAuth": true
    }
  },
  "LMSCourses": {
    "path": "/lms/courses",
    "component": "@/modules/lms/Courses/CoursesView.vue",
    "meta": {
      "title": "Мои курсы",
      "requiresAuth": true
    }
  },
  "LMSGrades": {
    "path": "/lms/grades",
    "component": "@/modules/lms/Grades/GradesView.vue",
    "meta": {
      "title": "Оценки",
      "requiresAuth": true
    }
  },
  "LMSCalendar": {
    "path": "/lms/calendar",
    "component": "@/modules/lms/Calendar/CalendarView.vue",
    "meta": {
      "title": "Календарь LMS",
      "requiresAuth": true
    }
  },
  "LMSBadges": {
    "path": "/lms/badges",
    "component": "@/modules/lms/Badges/BadgesView.vue",
    "meta": {
      "title": "Достижения",
      "requiresAuth": true
    }
  },
  "LMSLessonsManagement": {
    "path": "/lms/lessons-management",
    "component": "@/modules/lms/LessonsManagement/LessonsManagementView.vue",
    "meta": {
      "title": "Управление курсами",
      "requiresAuth": true
    }
  },
  "LMSCategoriesAndFormats": {
    "path": "/lms/categories-and-formats",
    "component": "@/modules/lms/CategoriesAndFormats/CategoriesAndFormatsView.vue",
    "meta": {
      "title": "Структура курсов",
      "requiresAuth": true
    }
  },
  "LMSCourseView": {
    "path": "/lms/course/:id",
    "component": "@/modules/lms/Courses/CourseView.vue",
    "meta": {
      "title": "Просмотр курса",
      "requiresAuth": true
    }
  }
}

