export default {
  "EducationAnalyticModule": {
    "path": "/education_analytics",
    "component": "@/modules/education_analytics_module/ParentLayout.vue",
    "redirect": "MainPage",
    "meta": {
      "requiresAuth": true
    }
  },
  "MainPage": {
    "path": "/education_analytics/main",
    "component": "@/modules/education_analytics_module/MainPage.vue",
    "meta": {
      "title": "MainPage",
      "requiresAuth": true
    }
  },
  "StatsPage": {
    "path": "/education_analytics/stats",
    "component": "@/modules/education_analytics_module/StatsPage.vue",
    "meta": {
      "title": "StatsPage",
      "requiresAuth": true
    }
  },
  "LearningTrackPage": {
    "path": "/education_analytics/learning_track",
    "component": "@/modules/education_analytics_module/LearningTrack.vue",
    "meta": {
      "title": "LearningTrackPage",
      "requiresAuth": true
    }
  },
  "ReportsPage": {
    "path": "/education_analytics/reports",
    "component": "@/modules/education_analytics_module/ReportsPage.vue",
    "meta": {
      "title": "ReportsPage",
      "requiresAuth": true
    }
  },
  "ProfilePage": {
    "path": "/education_analytics/profile",
    "component": "@/modules/education_analytics_module/ProfilePage.vue",
    "meta": {
      "title": "ProfilePage",
      "requiresAuth": true
    }
  },
  "AdminPanelPage": {
    "path": "/education_analytics/admin",
    "component": "@/modules/education_analytics_module/AdminPanelPage.vue",
    "meta": {
      "title": "AdminPanelPage",
      "requiresAuth": true
    }
  },
  "SuperUserPage": {
    "path": "/education_analytics/root",
    "component": "@/modules/education_analytics_module/SuperUserPanelPage.vue",
    "meta": {
      "title": "SuperUserPage",
      "requiresAuth": true
    }
  }
}

