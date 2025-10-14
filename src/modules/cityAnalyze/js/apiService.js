import { apiClient } from '@/js/api/manager'
import { endpoints } from '@/js/api/endpoints'

/**
 * Сервис для работы с City Analyze API
 */
class CityAnalyzeApiService {
    constructor() {
        this.endpoints = endpoints.city_analyze
    }

    // ===== Задачи =====
    
    /**
     * Получить список задач пользователя
     */
    async getMyTasks(params = {}) {
        return await apiClient.get(this.endpoints.myTasks, params)
    }

    /**
     * Получить статус задачи
     * @param {number} taskId - ID задачи
     */
    async getTaskStatus(taskId) {
        return await apiClient.get(this.endpoints.taskStatus(taskId))
    }

    // ===== Загрузки карт =====
    
    /**
     * Загрузить карты
     * @param {FormData} formData - Данные формы с картами
     */
    async uploadMaps(formData) {
        return await apiClient.post(this.endpoints.uploadMaps, formData)
    }

    /**
     * Получить список загрузок пользователя
     */
    async getMyUploads(params = {}) {
        return await apiClient.get(this.endpoints.myUploads, params)
    }

    /**
     * Удалить группу загрузок
     * @param {number} id - ID группы
     */
    async deleteGroup(id) {
        return await apiClient.delete(this.endpoints.deleteGroup(id))
    }

    // ===== Файлы =====
    
    /**
     * Получить файл
     * @param {number} id - ID файла
     */
    async getFile(id) {
        return await apiClient.downloadFile(this.endpoints.getFile(id), {}, 'GET')
    }

    // ===== Аналитика =====
    
    /**
     * Запустить анализ
     * @param {number} groupId - ID группы для анализа
     * @param {number} k - Количество кластеров
     */
    async performAnalysis(groupId, k = 2) {
        return await apiClient.get(this.endpoints.performAnalysis(groupId, k))
    }
}

export const cityAnalyzeApiService = new CityAnalyzeApiService()
export default cityAnalyzeApiService

