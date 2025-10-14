export const cityAnalyzeEndpoints = {
    city_analyze: {
        // Задачи
        myTasks: 'cities_expansion/get_my_tasks/',
        taskStatus: (taskId) => `cities_expansion/geoanalyzer/task_status?task_id=${taskId}`,
        
        // Загрузки карт
        uploadMaps: 'cities_expansion/geoanalyzer/upload_maps',
        myUploads: 'cities_expansion/get_my_groups/',
        deleteGroup: (id) => `cities_expansion/delete_group/${id}`,
        
        // Файлы
        getFile: (id) => `cities_expansion/get_file/?id=${id}`,
        
        // Аналитика
        performAnalysis: (groupId, k) => `cities_expansion/geoanalyzer/perform_analysis?group_id=${groupId}&k=${k}`,
    }
};

