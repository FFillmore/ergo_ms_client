export default {
  "ErgoCityStruct": {
    "path": "/ergo-city-struct",
    "component": "@/modules/cityAnalyze/ParentLayout.vue",
    "redirect": "MapUpload",
    "meta": {
      "requiresAuth": true
    }
  },
  "MapUpload": {
    "path": "/ergo-city-struct/map-upload",
    "component": "@/modules/cityAnalyze/mapUpload/ParentLayout.vue",
    "meta": {
      "title": "Индикаторы",
      "requiresAuth": true
    }
  },
  "MyUploads": {
    "path": "/ergo-city-struct/uploads",
    "component": "@/modules/cityAnalyze/myUploads/ParentLayout.vue",
    "meta": {
      "title": "Мои загрузки",
      "requiresAuth": true
    }
  },
  "MyTasks": {
    "path": "/ergo-city-struct/tasks",
    "component": "@/modules/cityAnalyze/task/TaskPage.vue",
    "meta": {
      "title": "Мои задачи",
      "requiresAuth": true
    }
  }
}

