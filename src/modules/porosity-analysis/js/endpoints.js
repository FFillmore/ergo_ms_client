export const porosityAnalysisEndpoints = {
    porosity_analysis: {
        // Основные CRUD операции
        list: 'porosity_analysis/analyses/',
        detail: id => `porosity_analysis/analyses/${id}/`,
        create: 'porosity_analysis/analyses/',
        update: id => `porosity_analysis/analyses/${id}/`,
        delete: id => `porosity_analysis/analyses/${id}/`,
        
        // Массовые операции
        bulkDelete: 'porosity_analysis/analyses/bulk_delete/',
        bulkDownload: 'porosity_analysis/analyses/bulk_download/',
        
        // Статистика
        statistics: 'porosity_analysis/analyses/statistics/',
        
        // Скачивание результатов
        downloadResults: id => `porosity_analysis/analyses/${id}/download_results/`,
    }
};

