export default {
  "AssetsAnalyse": {
    "path": "/assets-analyse",
    "component": "@/modules/assets_analysis/DatabaseAnalyze.vue",
    "meta": {
      "requiresAuth": true
    }
  },
  "Analyze": {
    "path": "/user/analyze",
    "component": "@/modules/user/analyze/Analyze.vue",
    "meta": {
      "requiresAuth": true
    }
  },
  "DatabaseAnalyze": {
    "path": "/user/analyze/databaseanalyze",
    "component": "@/core/user/analyze/DatabaseAnalyze.vue",
    "meta": {
      "requiresAuth": true
    }
  },
  "Dashboard": {
    "path": "/dashboard",
    "component": "@/modules/dashboard/AnaliticsView.vue",
    "redirect": "Analytics",
    "meta": {
      "requiresAuth": true
    }
  },
  "Analytics": {
    "path": "/analytics",
    "component": "@/modules/dashboard/AnaliticsView.vue",
    "meta": {
      "requiresAuth": true
    }
  }
}

