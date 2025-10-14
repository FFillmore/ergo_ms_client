export const videoAnalysisEndpoints = {
    video_analysis: {
        list: 'video_analysis/video-analysis/',
        create: 'video_analysis/video-analysis/',
        bulkCreate: 'video_analysis/video-analysis/bulk_create/',
        detail: (id) => `video_analysis/video-analysis/${id}/`,
        delete: (id) => `video_analysis/video-analysis/${id}/`,
        bulkDelete: 'video_analysis/video-analysis/bulk_delete/',
        download: (id) => `video_analysis/video-analysis/${id}/download_file/`,
        cancel: (id) => `video_analysis/video-analysis/${id}/cancel/`,
        statistics: 'video_analysis/video-analysis/statistics/'
    }
};

