export default {
  "PorosityAnalysis": {
    "path": "/porosity-analysis",
    "component": "@/modules/porosity-analysis/ParentLayout.vue",
    "redirect": "PorosityAnalysisMain",
    "meta": {
      "title": "Анализ поверхности",
      "requiresAuth": true
    }
  },
  "PorosityAnalysisMain": {
    "path": "/porosity-analysis/create",
    "component": "@/modules/porosity-analysis/MainPage.vue",
    "meta": {
      "title": "Создать анализ",
      "requiresAuth": true
    }
  },
  "PorosityAnalysisList": {
    "path": "/porosity-analysis/analyses",
    "component": "@/modules/porosity-analysis/AnalysesList.vue",
    "meta": {
      "title": "Мои анализы",
      "requiresAuth": true
    }
  }
}

