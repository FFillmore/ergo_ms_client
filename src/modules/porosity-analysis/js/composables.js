/**
 * Композаблы для модуля анализа пористости
 */

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { porosityAnalysisAPI } from './porosity-analysis.js'
import { ANALYSIS_STATUS, STATUS_LABELS, STATUS_COLORS } from './constants.js'

/**
 * Композабл для работы с анализами
 */
export function useAnalyses() {
  const analyses = ref([])
  const loading = ref(false)
  const error = ref(null)
  const toast = useToast()

  const loadAnalyses = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await porosityAnalysisAPI.getAnalyses(params)
      if (response && response.success) {
        analyses.value = response.data.results || []
        return response.data
      } else {
        throw new Error(response?.message || 'Ошибка загрузки анализов')
      }
    } catch (err) {
      error.value = err.message
      toast.error(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createAnalysis = async (data) => {
    try {
      const response = await porosityAnalysisAPI.createAnalysis(data)
      if (response && response.success) {
        toast.success('Анализ создан успешно')
        return response.data
      } else {
        throw new Error(response?.message || 'Ошибка создания анализа')
      }
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const updateAnalysis = async (id, data) => {
    try {
      const response = await porosityAnalysisAPI.updateAnalysis(id, data)
      if (response && response.success) {
        toast.success('Анализ обновлен')
        return response.data
      } else {
        throw new Error(response?.message || 'Ошибка обновления анализа')
      }
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const deleteAnalysis = async (id) => {
    try {
      const response = await porosityAnalysisAPI.deleteAnalysis(id)
      if (response && response.success) {
        toast.success('Анализ удален')
        analyses.value = analyses.value.filter(a => a.id !== id)
        return true
      } else {
        throw new Error(response?.message || 'Ошибка удаления анализа')
      }
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const restartAnalysis = async (id) => {
    try {
      const response = await porosityAnalysisAPI.restartAnalysis(id)
      if (response && response.success) {
        toast.success('Анализ перезапущен')
        return true
      } else {
        throw new Error(response?.message || 'Ошибка перезапуска анализа')
      }
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  return {
    analyses,
    loading,
    error,
    loadAnalyses,
    createAnalysis,
    updateAnalysis,
    deleteAnalysis,
    restartAnalysis
  }
}

/**
 * Композабл для работы с группами
 */
export function useGroups() {
  const groups = ref([])
  const loading = ref(false)
  const error = ref(null)
  const toast = useToast()

  const loadGroups = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await porosityAnalysisAPI.getGroups()
      if (response && response.success) {
        groups.value = response.data || []
        return groups.value
      } else {
        throw new Error(response?.message || 'Ошибка загрузки групп')
      }
    } catch (err) {
      error.value = err.message
      toast.error(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createGroup = async (data) => {
    try {
      const response = await porosityAnalysisAPI.createGroup(data)
      if (response && response.success) {
        toast.success('Группа создана')
        groups.value.push(response.data)
        return response.data
      } else {
        throw new Error(response?.message || 'Ошибка создания группы')
      }
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const updateGroup = async (id, data) => {
    try {
      const response = await porosityAnalysisAPI.updateGroup(id, data)
      if (response && response.success) {
        toast.success('Группа обновлена')
        const index = groups.value.findIndex(g => g.id === id)
        if (index !== -1) {
          groups.value[index] = response.data
        }
        return response.data
      } else {
        throw new Error(response?.message || 'Ошибка обновления группы')
      }
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const deleteGroup = async (id) => {
    try {
      const response = await porosityAnalysisAPI.deleteGroup(id)
      if (response && response.success) {
        toast.success('Группа удалена')
        groups.value = groups.value.filter(g => g.id !== id)
        return true
      } else {
        throw new Error(response?.message || 'Ошибка удаления группы')
      }
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  return {
    groups,
    loading,
    error,
    loadGroups,
    createGroup,
    updateGroup,
    deleteGroup
  }
}

/**
 * Композабл для работы с фильтрами
 */
export function useFilters() {
  const search = ref('')
  const status = ref('all')
  const groupId = ref(null)
  const ordering = ref('-created_at')
  const pageSize = ref(10)

  const resetFilters = () => {
    search.value = ''
    status.value = 'all'
    groupId.value = null
    ordering.value = '-created_at'
    pageSize.value = 10
  }

  const hasActiveFilters = computed(() => {
    return search.value || status.value !== 'all' || groupId.value !== null
  })

  const filterParams = computed(() => {
    const params = {}
    
    if (search.value) params.search = search.value
    if (status.value !== 'all') params.status = status.value
    if (groupId.value !== null) params.group = groupId.value
    if (ordering.value) params.ordering = ordering.value
    if (pageSize.value) params.page_size = pageSize.value
    
    return params
  })

  return {
    search,
    status,
    groupId,
    ordering,
    pageSize,
    resetFilters,
    hasActiveFilters,
    filterParams
  }
}

/**
 * Композабл для работы с выбором
 */
export function useSelection() {
  const selectedIds = ref([])
  const selectedStatus = ref(null)

  const selectedCount = computed(() => selectedIds.value.length)

  const toggleSelection = (id) => {
    const index = selectedIds.value.indexOf(id)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    } else {
      selectedIds.value.push(id)
    }
  }

  const selectAll = (items) => {
    selectedIds.value = items.map(item => item.id)
  }

  const selectByStatus = (status, items) => {
    selectedStatus.value = status
    selectedIds.value = items
      .filter(item => item.status === status)
      .map(item => item.id)
  }

  const clearSelection = () => {
    selectedIds.value = []
    selectedStatus.value = null
  }

  const isSelected = (id) => {
    return selectedIds.value.includes(id)
  }

  return {
    selectedIds,
    selectedStatus,
    selectedCount,
    toggleSelection,
    selectAll,
    selectByStatus,
    clearSelection,
    isSelected
  }
}

/**
 * Композабл для работы с пагинацией
 */
export function usePagination() {
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalItems = ref(0)

  const totalPages = computed(() => {
    return Math.ceil(totalItems.value / pageSize.value)
  })

  const hasNextPage = computed(() => {
    return currentPage.value < totalPages.value
  })

  const hasPrevPage = computed(() => {
    return currentPage.value > 1
  })

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const nextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  const prevPage = () => {
    if (hasPrevPage.value) {
      currentPage.value--
    }
  }

  const resetPagination = () => {
    currentPage.value = 1
  }

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
    changePage,
    nextPage,
    prevPage,
    resetPagination
  }
}

/**
 * Композабл для работы со статистикой
 */
export function useStatistics() {
  const stats = ref({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  })
  const loading = ref(false)
  const error = ref(null)

  const loadStats = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await porosityAnalysisAPI.getStatistics()
      if (response && response.success) {
        stats.value = response.data
        return stats.value
      } else {
        throw new Error(response?.message || 'Ошибка загрузки статистики')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const totalAnalyses = computed(() => {
    return stats.value.pending + stats.value.processing + stats.value.completed + stats.value.failed
  })

  const getStatusCount = (status) => {
    return stats.value[status] || 0
  }

  const getStatusPercentage = (status) => {
    const total = totalAnalyses.value
    if (!total) return 0
    return Math.round((getStatusCount(status) / total) * 100)
  }

  return {
    stats,
    loading,
    error,
    loadStats,
    totalAnalyses,
    getStatusCount,
    getStatusPercentage
  }
}

/**
 * Композабл для работы с файлами
 */
export function useFileUpload() {
  const selectedFiles = ref([])
  const uploading = ref(false)
  const progress = ref({ total: 0, processed: 0, success: 0, failed: 0 })

  const addFiles = (files) => {
    const newFiles = Array.from(files)
    const merged = [...selectedFiles.value, ...newFiles]
    
    // Удаляем дубликаты
    const seen = new Set()
    const unique = []
    for (const file of merged) {
      const key = `${file.name}__${file.size}__${file.lastModified}`
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(file)
      }
    }
    
    selectedFiles.value = unique
  }

  const removeFile = (index) => {
    if (index >= 0 && index < selectedFiles.value.length) {
      selectedFiles.value.splice(index, 1)
    }
  }

  const clearFiles = () => {
    selectedFiles.value = []
  }

  const uploadFiles = async (analysisId, files) => {
    uploading.value = true
    progress.value = { total: files.length, processed: 0, success: 0, failed: 0 }
    
    try {
      for (const file of files) {
        try {
          await porosityAnalysisAPI.uploadImage(analysisId, file)
          progress.value.success++
        } catch (error) {
          progress.value.failed++
          console.error('Ошибка загрузки файла:', error)
        } finally {
          progress.value.processed++
        }
      }
    } finally {
      uploading.value = false
    }
  }

  return {
    selectedFiles,
    uploading,
    progress,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles
  }
}

/**
 * Композабл для работы с модальными окнами
 */
export function useModals() {
  const modals = ref({})

  const showModal = (name) => {
    modals.value[name] = true
  }

  const hideModal = (name) => {
    modals.value[name] = false
  }

  const toggleModal = (name) => {
    modals.value[name] = !modals.value[name]
  }

  const isModalVisible = (name) => {
    return !!modals.value[name]
  }

  return {
    modals,
    showModal,
    hideModal,
    toggleModal,
    isModalVisible
  }
}
