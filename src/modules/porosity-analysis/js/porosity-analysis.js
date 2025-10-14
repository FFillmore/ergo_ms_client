import { apiClient } from '../../../js/api/manager.js'

/**
 * Класс для работы с API анализа поверхности
 */
class PorosityAnalysisAPI {
  constructor() {
    this.baseEndpoint = 'porosity_analysis/analyses/'
    this.baseUrl = apiClient.getBaseUrl()
  }

  /**
   * Получить токен авторизации
   */
  getAuthToken() {
    return apiClient.getAuthToken()
  }

  /**
   * Получить список всех анализов
   */
  async getAnalyses(params = {}) {
    try {
      const response = await apiClient.get(this.baseEndpoint, params)
      return response
    } catch (error) {
      console.error('API: Ошибка при получении анализов:', error)
      // Возвращаем объект с ошибкой в том же формате
      return {
        success: false,
        message: error.message || 'Ошибка при загрузке анализов',
        data: null
      }
    }
  }

  /**
   * Получить анализ по ID
   */
  async getAnalysis(id) {
    return await apiClient.get(`${this.baseEndpoint}${id}/`)
  }

  /**
   * Создать новый анализ
   */
  async createAnalysis(data) {
    try {
      const response = await apiClient.post(this.baseEndpoint, data)
      return response
    } catch (error) {
      console.error('Error in createAnalysis:', error)
      // Возвращаем объект с ошибкой в том же формате
      return {
        success: false,
        message: error.message || 'Ошибка при создании анализа',
        data: null
      }
    }
  }

  /**
   * Обновить анализ
   */
  async updateAnalysis(id, data) {
    return await apiClient.put(`${this.baseEndpoint}${id}/`, data)
  }

  /**
   * Удалить анализ
   */
  async deleteAnalysis(id) {
    const response = await apiClient.delete(`${this.baseEndpoint}${id}/`)
    return response
  }

  /**
   * Массовое удаление анализов
   */
  async deleteMultipleAnalyses(params) {
    // params: { analysis_ids?: number[], input?: string }
    return await apiClient.post(`${this.baseEndpoint}delete_multiple/`, params)
  }

  /**
   * Загрузить изображение для анализа
   */
  async uploadImage(analysisId, imageFile) {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      const response = await apiClient.post(`${this.baseEndpoint}${analysisId}/upload_image/`, formData)
      return response
    } catch (error) {
      console.error(`Error uploading image for analysis ${analysisId}:`, error)
      // Возвращаем объект с ошибкой в том же формате
      return {
        success: false,
        message: error.message || 'Ошибка при загрузке изображения',
        data: null
      }
    }
  }

  /**
   * Перезапустить анализ
   */
  async restartAnalysis(analysisId) {
    try {
      const response = await apiClient.post(`${this.baseEndpoint}${analysisId}/restart/`)
      return response
    } catch (error) {
      console.error('Error in restartAnalysis:', error)
      // Возвращаем объект с ошибкой в том же формате, что и успешный ответ
      return {
        success: false,
        message: error.message || 'Ошибка при перезапуске анализа',
        data: null
      }
    }
  }

  /**
   * Массовый перезапуск анализов
   */
  async restartMultipleAnalyses(params) {
    try {
      const response = await apiClient.post(`${this.baseEndpoint}restart_multiple/`, params)
      return response
    } catch (error) {
      console.error('Error in restartMultipleAnalyses:', error)
      // Возвращаем объект с ошибкой в том же формате, что и успешный ответ
      return {
        success: false,
        message: error.message || 'Ошибка при массовом перезапуске анализов',
        data: null
      }
    }
  }

  /**
   * Получить статус анализа
   */
  async getAnalysisStatus(analysisId) {
    return await apiClient.get(`${this.baseEndpoint}${analysisId}/status/`)
  }


  /**
   * Скачать конкретный файл результатов
   */
  async downloadFile(analysisId, filePath) {
    const params = { file: filePath }
    return await apiClient.downloadFile(`${this.baseEndpoint}${analysisId}/download_file/`, params, 'GET')
  }


  /**
   * Получить статистику анализов
   */
  async getStatistics() {
    return await apiClient.get(`${this.baseEndpoint}statistics/`)
  }

  /**
   * Получить конфигурацию загрузки файлов
   */
  async getUploadConfig() {
    try {
      const response = await apiClient.get('porosity_analysis/groups/upload_config/')
      return response
    } catch (error) {
      console.error('Error getting upload config:', error)
      // Возвращаем значения по умолчанию при ошибке
      return {
        success: true,
        data: {
          upload_threads: 8,
          max_concurrent_uploads: 8
        }
      }
    }
  }

  // ===== Группы анализов =====
  async getGroups(params = {}) {
    return await apiClient.get('porosity_analysis/groups/', params)
  }

  async createGroup(data) {
    // data: { name, description? }
    return await apiClient.post('porosity_analysis/groups/', data)
  }

  async updateGroup(groupId, data) {
    return await apiClient.put(`porosity_analysis/groups/${groupId}/`, data)
  }

  async deleteGroup(groupId) {
    return await apiClient.delete(`porosity_analysis/groups/${groupId}/`)
  }

  async setAnalysisGroup(analysisId, payload) {
    // payload: { group_id? , new_group_name? , remove? }
    return await apiClient.post(`${this.baseEndpoint}${analysisId}/set_group/`, payload)
  }

  async bulkSetGroup(payload) {
    // payload: { analysis_ids: number[], group_id? , new_group_name? , remove? }
    return await apiClient.post(`${this.baseEndpoint}bulk_set_group/`, payload)
  }


  /**
   * Получить URL для скачивания файла
   */
  getDownloadUrl(analysisId, filePath) {
    return `${apiClient.baseUrl}${apiClient.apiPath}${this.baseEndpoint}${analysisId}/download_file/?file=${encodeURIComponent(filePath)}`
  }

  /**
   * Получить URL исходного изображения
   */
  getImageUrl(imageUuid) {
    return `${apiClient.baseUrl}media/porosity_analysis/initial_photo/${imageUuid}.png`
  }


  /**
   * Получить URL для скачивания отчета
   */
  getReportDownloadUrl(analysisId, reportType) {
    return `${apiClient.baseUrl}${apiClient.apiPath}${this.baseEndpoint}${analysisId}/download_report/?type=${reportType}`
  }

  /**
   * Скачать исходное изображение
   */
  async downloadOriginal(analysisId) {
    try {
      const response = await apiClient.downloadFile(`${this.baseEndpoint}${analysisId}/download_original/`, {}, 'GET')
      
      // Проверяем, что response.data является Blob
      if (response && response.data instanceof Blob) {
        return {
          success: true,
          data: response.data,
          message: 'Исходное изображение успешно загружено'
        }
      } else {
        return {
          success: false,
          message: 'Получен некорректный формат файла',
          data: null
        }
      }
    } catch (error) {
      console.error('API: Original image download error:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при скачивании исходного изображения',
        data: null
      }
    }
  }

  /**
   * Скачать отчет
   */
  async downloadReport(analysisId, reportType = 'pdf') {
    try {
      const response = await apiClient.downloadFile(`${this.baseEndpoint}${analysisId}/download_report/`, { type: reportType }, 'GET')
      return response
    } catch (error) {
      console.error('API: Report download error:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при скачивании отчета',
        data: null
      }
    }
  }

  /**
   * Скачать отчет с прогрессом (использует временную ссылку с токеном)
   */
  async downloadReportWithProgress(analysisId, reportType = 'pdf', filename) {
    try {
      // Запрашиваем временную ссылку с токеном
      const response = await apiClient.post(`${this.baseEndpoint}${analysisId}/generate_download_token/`, {
        file_type: 'report',
        report_type: reportType
      })
      
      if (response && response.success && response.data.download_url) {
        const downloadUrl = response.data.download_url
        
        // Открываем ссылку для скачивания
        // Браузер автоматически покажет прогресс
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = filename || `analysis_${analysisId}_report.${reportType}`
        link.target = '_blank'
        link.style.display = 'none'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        return {
          success: true,
          message: 'Скачивание начато'
        }
      } else {
        return {
          success: false,
          message: response?.message || 'Не удалось создать ссылку для скачивания'
        }
      }
    } catch (error) {
      console.error('Ошибка генерации ссылки для скачивания отчета:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при скачивании отчета'
      }
    }
  }

  /**
   * Скачать архив отчетов по нескольким анализам
   */
  async downloadMultipleReports(params) {
    try {
      const response = await apiClient.downloadFile(`${this.baseEndpoint}download_multiple_reports/`, params, 'POST')
      return response
    } catch (error) {
      console.error('API: Multiple reports download error:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при скачивании архива отчетов',
        data: null
      }
    }
  }

  /**
   * Скачать архив с результатами анализов (изображения, данные, отчеты)
   * Использует download_multiple_reports для скачивания отчетов
   */
  async downloadAnalysesArchive(params) {
    try {
      // Используем download_multiple_reports для скачивания отчетов
      const response = await apiClient.downloadFile(`${this.baseEndpoint}download_multiple_reports/`, params, 'POST')
      return response
    } catch (error) {
      console.error('API: Analyses archive download error:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при скачивании архива анализов',
        data: null
      }
    }
  }

  // Убран метод getLimits, так как ограничения сняты

  /**
   * Получить список всех архивов
   */
  async getArchives(params = {}) {
    try {
      const response = await apiClient.get('porosity_analysis/archives/', params)
      return response
    } catch (error) {
      console.error('API: Ошибка при получении архивов:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при загрузке архивов',
        data: null
      }
    }
  }

  /**
   * Создать новый архив
   */
  async createArchive(data) {
    try {
      const response = await apiClient.post('porosity_analysis/archives/', data)
      return response
    } catch (error) {
      console.error('Error in createArchive:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при создании архива',
        data: null
      }
    }
  }

  /**
   * Скачать архив
   */
  async downloadArchive(archiveId) {
    try {
      const response = await apiClient.downloadFile(`porosity_analysis/archives/${archiveId}/download/`, {}, 'GET')
      return response
    } catch (error) {
      console.error('API: Archive download error:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при скачивании архива',
        data: null
      }
    }
  }

  /**
   * Скачать архив с прогрессом (использует временную ссылку с токеном)
   */
  async downloadArchiveWithProgress(archiveId, filename) {
    try {
      // Запрашиваем временную ссылку с токеном
      const response = await apiClient.post(`porosity_analysis/archives/${archiveId}/generate_download_token/`)
      
      if (response && response.success && response.data.download_url) {
        const downloadUrl = response.data.download_url
        
        // Открываем ссылку в новой вкладке для скачивания
        // Браузер автоматически покажет прогресс
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = filename || `archive_${archiveId}.zip`
        link.target = '_blank'
        link.style.display = 'none'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        return {
          success: true,
          message: 'Скачивание начато'
        }
      } else {
        return {
          success: false,
          message: response?.message || 'Не удалось создать ссылку для скачивания'
        }
      }
    } catch (error) {
      console.error('Ошибка генерации ссылки для скачивания архива:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при скачивании архива'
      }
    }
  }

  /**
   * Скачать архив с реальным прогрессом загрузки
   */
  async downloadArchiveWithRealProgress(archiveId, filename, onProgress) {
    try {
      const token = this.getAuthToken()
      const url = `${this.baseUrl}api/porosity_analysis/archives/${archiveId}/download/`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`)
      }
      
      const contentLength = response.headers.get('content-length')
      const total = parseInt(contentLength, 10)
      let loaded = 0
      
      const reader = response.body.getReader()
      const chunks = []
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        chunks.push(value)
        loaded += value.length
        
        if (onProgress && total > 0) {
          const progress = (loaded / total) * 100
          onProgress({
            loaded,
            total,
            progress: Math.round(progress)
          })
        }
      }
      
      // Создаем blob из чанков
      const blob = new Blob(chunks)
      const blobUrl = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename || `archive_${archiveId}.zip`
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Освобождаем память
      URL.revokeObjectURL(blobUrl)
      
      return {
        success: true,
        message: 'Архив успешно скачан'
      }
    } catch (error) {
      console.error('Ошибка скачивания архива с прогрессом:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при скачивании архива'
      }
    }
  }

  /**
   * Удалить архив
   */
  async deleteArchive(archiveId) {
    try {
      const response = await apiClient.delete(`porosity_analysis/archives/${archiveId}/delete_archive/`)
      return response
    } catch (error) {
      console.error('API: Archive deletion error:', error)
      return {
        success: false,
        message: error.message || 'Ошибка при удалении архива',
        data: null
      }
    }
  }
}

// Создать и экспортировать синглтон-объект
export const porosityAnalysisAPI = new PorosityAnalysisAPI() 