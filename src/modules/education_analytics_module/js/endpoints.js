export const learningAnalyticsEndpoints = {
    learning_analytics: {
        tables: 'learning_analytics/tables/',
        clearTables: 'learning_analytics/tables/clear/',

        excel: {
            upload: 'learning_analytics/data_formalization_submodule/upload-excel/',
            process: 'learning_analytics/data_formalization_submodule/process-excel/'
        },

        relations: {
            disciplineTechnology: 'learning_analytics/data_formalization_submodule/relations/discipline-technology/',
            disciplineCompetency: 'learning_analytics/data_formalization_submodule/relations/discipline-competency/',
            vacancyTechnology: 'learning_analytics/data_formalization_submodule/relations/vacancy-technology/',
            vacancyCompetency: 'learning_analytics/data_formalization_submodule/relations/vacancy-competency/',
            vcmTechnology: 'learning_analytics/data_formalization_submodule/relations/vcm-technology/',
            vcmCompetency: 'learning_analytics/data_formalization_submodule/relations/vcm-competency/',
        },

        employers: {
            get: 'learning_analytics/employers/',
            create: 'learning_analytics/employers/',
            update: (pk) => `learning_analytics/employers/${pk}/`,
            delete: (pk) => `learning_analytics/employers/${pk}/`,
            loadSampleData: 'learning_analytics/employers/loadsampledata/',
        },

        specialities: {
            get: 'learning_analytics/data_formalization_submodule/specialities/',
            create: 'learning_analytics/data_formalization_submodule/specialities/',
            update: (pk) => `learning_analytics/data_formalization_submodule/specialities/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/specialities/${pk}/`,
            loadSampleData: 'learning_analytics/data_formalization_submodule/specialities/loadsampledata/',
        },
        curriculums: {
            get: 'learning_analytics/data_formalization_submodule/curriculums/',
            create: 'learning_analytics/data_formalization_submodule/curriculums/',
            update: (pk) => `learning_analytics/data_formalization_submodule/curriculums/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/curriculums/${pk}/`,
            loadSampleData: 'learning_analytics/data_formalization_submodule/curriculums/loadsampledata/',
        },
        technologies: {
            get: 'learning_analytics/data_formalization_submodule/technologies/',
            create: 'learning_analytics/data_formalization_submodule/technologies/',
            update: (pk) => `learning_analytics/data_formalization_submodule/technologies/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/technologies/${pk}/`,
            loadSampleData: 'learning_analytics/data_formalization_submodule/technologies/loadsampledata/',
        },
        competencies: {
            get: 'learning_analytics/data_formalization_submodule/competencies/',
            create: 'learning_analytics/data_formalization_submodule/competencies/',
            update: (pk) => `learning_analytics/data_formalization_submodule/competencies/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/competencies/${pk}/`,
            loadSampleData: 'learning_analytics/data_formalization_submodule/competencies/loadsampledata/',
        },
        baseDisciplines: {
            get: 'learning_analytics/data_formalization_submodule/base_disciplines/',
            create: 'learning_analytics/data_formalization_submodule/base_disciplines/',
            update: (pk) => `learning_analytics/data_formalization_submodule/base_disciplines/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/base_disciplines/${pk}/`,
            loadSampleData: 'learning_analytics/data_formalization_submodule/base_disciplines/loadsampledata/',
        },
        disciplines: {
            get: 'learning_analytics/data_formalization_submodule/disciplines/',
            create: 'learning_analytics/data_formalization_submodule/disciplines/',
            update: (pk) => `learning_analytics/data_formalization_submodule/disciplines/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/disciplines/${pk}/`,
            loadSampleData: 'learning_analytics/data_formalization_submodule/disciplines/loadsampledata/',
        },
        vacancies: {
            get: 'learning_analytics/data_formalization_submodule/vacancies/',
            create: 'learning_analytics/data_formalization_submodule/vacancies/',
            update: (pk) => `learning_analytics/data_formalization_submodule/vacancies/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/vacancies/${pk}/`,
            loadSampleData: 'learning_analytics/data_formalization_submodule/vacancies/loadsampledata/',
        },
        acms: {
            get: 'learning_analytics/data_formalization_submodule/acms/',
            create: 'learning_analytics/data_formalization_submodule/acms/',
            update: (pk) => `learning_analytics/data_formalization_submodule/acms/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/acms/${pk}/`,
            loadSampleData: 'learning_analytics/data_formalization_submodule/acms/loadsampledata/',
        },
        vcms: {
            get: 'learning_analytics/data_formalization_submodule/vcms/',
            create: 'learning_analytics/data_formalization_submodule/vcms/',
            update: (pk) => `learning_analytics/data_formalization_submodule/vcms/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/vcms/${pk}/`,
            loadSampleData: 'learning_analytics/data_formalization_submodule/vcms/loadsampledata/',
        },
        ucms: {
            get: 'learning_analytics/data_formalization_submodule/ucms/',
            create: 'learning_analytics/data_formalization_submodule/ucms/',
            update: (pk) => `learning_analytics/data_formalization_submodule/ucms/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/ucms/${pk}/`,
            loadSampleData: 'learning_analytics/data_formalization_submodule/ucms/loadsampledata/',
        },
        importHistory: {
            get: 'learning_analytics/data_formalization_submodule/import_history/',
            create: 'learning_analytics/data_formalization_submodule/import_history/',
            update: (pk) => `learning_analytics/data_formalization_submodule/import_history/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/import_history/${pk}/`,
        },
        importStats: {
            get: 'learning_analytics/data_formalization_submodule/import_stats/',
            update: (pk) => `learning_analytics/data_formalization_submodule/import_stats/${pk}/`,
        },
    }
};

