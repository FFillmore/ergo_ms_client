export default {
    "BioModule": {
        "path": "/bio",
        "component": "@/modules/bio/ParentLayout.vue",
        "redirect": "Sites",
        "meta": {
        "title": "Биологический модуль",
        "requiresAuth": true
        }
    },
    "Sites": {
        "path": "/bio/sites",
        "component": "@/modules/bio/submodules/geobotany/views/SiteListView.vue",
        "meta": {
        "title": "Площадки",
        "requiresAuth": true
        }
    },
    "SitesMap": {
        "path": "/bio/map",
        "component": "@/modules/bio/submodules/geobotany/views/SitesMap.vue",
        "meta": {
        "title": "Карта площадок",
        "requiresAuth": true
        }
    },
    "SiteConsolidatedAnalysis": {
        "path": "/bio/consolidated-analysis",
        "component": "@/modules/bio/submodules/geobotany/views/SiteConsolidatedAnalysis.vue",
        "meta": {
        "title": "Сводный анализ площадок",
        "requiresAuth": true
        }
    },
    "SiteView": {
        "path": "/bio/site/:siteNumber/:zoneType",
        "component": "@/modules/bio/submodules/geobotany/views/SiteView.vue",
        "meta": {
        "title": "Просмотр площадки",
        "requiresAuth": true
        }
    },
    "ZoologySpecies": {
        "path": "/bio/zoology/species",
        "component": "@/modules/bio/submodules/zoology/views/SpeciesListView.vue",
        "meta": {
        "title": "Зоология: виды",
        "requiresAuth": true
        }
    },
    "ZoologyPopulations": {
        "path": "/bio/zoology/populations",
        "component": "@/modules/bio/submodules/zoology/views/PopulationsListView.vue",
        "meta": {
        "title": "Зоология: популяции",
        "requiresAuth": true
        }
    },
    "ZoologyObservations": {
        "path": "/bio/zoology/observations",
        "component": "@/modules/bio/submodules/zoology/views/ObservationsListView.vue",
        "meta": {
        "title": "Зоология: наблюдения",
        "requiresAuth": true
        }
    },
    "BioInteractions": {
        "path": "/bio/interactions",
        "component": "@/modules/bio/submodules/interactions/views/InteractionsListView.vue",
        "meta": {
        "title": "Взаимодействия",
        "requiresAuth": true
        }
    },
    "Successions": {
        "path": "/bio/successions",
        "component": "@/modules/bio/submodules/successions/views/SuccessionsListView.vue",
        "meta": {
        "title": "Сукцессии",
        "requiresAuth": true
        }
    },
    "SuccessionStages": {
        "path": "/bio/successions/stages",
        "component": "@/modules/bio/submodules/successions/views/StagesListView.vue",
        "meta": {
        "title": "Стадии сукцессий",
        "requiresAuth": true
        }
    },
    "SuccessionStageSpecies": {
        "path": "/bio/successions/stage-species",
        "component": "@/modules/bio/submodules/successions/views/StageSpeciesListView.vue",
        "meta": {
        "title": "Виды на стадиях",
        "requiresAuth": true
        }
    },
    "PaleoSamples": {
        "path": "/bio/paleobotany/samples",
        "component": "@/modules/bio/submodules/paleobotany/views/SamplesListView.vue",
        "meta": {
        "title": "Палео: образцы",
        "requiresAuth": true
        }
    },
    "PaleoImages": {
        "path": "/bio/paleobotany/images",
        "component": "@/modules/bio/submodules/paleobotany/views/ImagesListView.vue",
        "meta": {
        "title": "Палео: изображения",
        "requiresAuth": true
        }
    },
    "FloraLists": {
        "path": "/bio/floristics/lists",
        "component": "@/modules/bio/submodules/floristics/views/ListsListView.vue",
        "meta": {
        "title": "Флористика: списки",
        "requiresAuth": true
        }
    },
    "FloraItems": {
        "path": "/bio/floristics/items",
        "component": "@/modules/bio/submodules/floristics/views/ItemsListView.vue",
        "meta": {
        "title": "Флористика: элементы",
        "requiresAuth": true
        }
    },
    "GeomorphProfiles": {
        "path": "/bio/geomorphology/profiles",
        "component": "@/modules/bio/submodules/geomorphology/views/ProfilesListView.vue",
        "meta": {
        "title": "Геоморфология: профили",
        "requiresAuth": true
        }
    },
    "GeomorphLayers": {
        "path": "/bio/geomorphology/layers",
        "component": "@/modules/bio/submodules/geomorphology/views/LayersListView.vue",
        "meta": {
        "title": "Геоморфология: слои",
        "requiresAuth": true
        }
    },
    "GeomorphImages": {
        "path": "/bio/geomorphology/images",
        "component": "@/modules/bio/submodules/geomorphology/views/ImagesListView.vue",
        "meta": {
        "title": "Геоморфология: изображения",
        "requiresAuth": true
        }
    },
}
