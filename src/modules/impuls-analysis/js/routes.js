export default {
  "ImpulsAnalysis": {
    "path": "/impuls-analysis",
    "component": "@/modules/impuls-analysis/ParentLayout.vue",
    "redirect": "ImpulsAnalysisMain",
    "meta": {
      "title": "Анализ импульсов",
      "requiresAuth": true
    }
  },
  "ImpulsAnalysisMain": {
    "path": "/impuls-analysis/create",
    "component": "@/modules/impuls-analysis/MainPage.vue",
    "meta": {
      "title": "Загрузка файлов",
      "requiresAuth": true
    }
  },
  "ImpulsAnalysisList": {
    "path": "/impuls-analysis/analyses",
    "component": "@/modules/impuls-analysis/AnalysesList.vue",
    "meta": {
      "title": "Мои анализы",
      "requiresAuth": true
    }
  },
  "ImpulsAnalysisDetail": {
    "path": "/impuls-analysis/analysis/:id",
    "component": "@/modules/impuls-analysis/AnalysisDetail.vue",
    "meta": {
      "title": "Детали анализа",
      "requiresAuth": true
    }
  },
  "ImpulsAnalysisProtocols": {
    "path": "/impuls-analysis/protocols",
    "component": "@/modules/impuls-analysis/ProtocolsPage.vue",
    "meta": {
      "title": "Протоколы",
      "requiresAuth": true
    }
  }
}

