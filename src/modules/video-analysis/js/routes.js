export default {
  "VideoAnalysis": {
    "path": "/video-analysis",
    "component": "@/modules/video-analysis/ParentLayout.vue",
    "redirect": "VideoAnalysisList",
    "meta": {
      "title": "Видео-анализ",
      "requiresAuth": true
    }
  },
  "VideoAnalysisList": {
    "path": "/video-analysis/analyses",
    "component": "@/modules/video-analysis/AnalysesList.vue",
    "meta": {
      "title": "Мои видео-анализы",
      "requiresAuth": true
    }
  },
  "VideoAnalysisDetail": {
    "path": "/video-analysis/analysis/:id",
    "component": "@/modules/video-analysis/AnalysisDetail.vue",
    "meta": {
      "title": "Детали анализа",
      "requiresAuth": true
    }
  }
}

