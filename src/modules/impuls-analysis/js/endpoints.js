export const impulsAnalysisEndpoints = {
    impuls_analysis: {
        // Основные CRUD операции
        list: 'impuls_analysis/analyses/',
        detail: id => `impuls_analysis/analyses/${id}/`,
        create: 'impuls_analysis/analyses/',
        update: id => `impuls_analysis/analyses/${id}/`,
        delete: id => `impuls_analysis/analyses/${id}/`,
        
        // Массовые операции
        bulkDelete: 'impuls_analysis/analyses/bulk_delete/',
        bulkDeleteByNumbers: 'impuls_analysis/analyses/bulk_delete_by_numbers/',
        bulkDownloadProtocols: 'impuls_analysis/analyses/bulk_download_protocols/',
        
        // Загрузка файлов
        uploadFiles: 'impuls_analysis/analyses/upload_files/',
        uploadMultipleFiles: 'impuls_analysis/analyses/upload_multiple_files/',
        
        // Протоколы
        protocols: id => `impuls_analysis/analyses/${id}/protocols/`,
        downloadProtocol: id => `impuls_analysis/analyses/${id}/download_protocol/`,
        availableProtocols: 'impuls_analysis/analyses/available_protocols/',
        createFromProtocol: 'impuls_analysis/analyses/create_from_protocol/',
        
        // Статистика и статусы
        statistics: 'impuls_analysis/analyses/statistics/',
        status: id => `impuls_analysis/analyses/${id}/status/`,
        restart: id => `impuls_analysis/analyses/${id}/restart/`,
        
        // Скачивание результатов
        downloadResults: id => `impuls_analysis/analyses/${id}/download_results/`,
        downloadFile: id => `impuls_analysis/analyses/${id}/download_file/`,
    }
};

