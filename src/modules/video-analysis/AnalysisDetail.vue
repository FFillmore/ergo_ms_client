<template>
  <div class="analysis-detail-page" v-if="analysis">
    <!-- Заголовок страницы -->
    <div class="page-header">
      <div class="header-content">
        <nav aria-label="breadcrumb" class="breadcrumb-nav">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <router-link to="/video-analysis/analyses" class="breadcrumb-link">
                <Video :size="16" />
                <span>Анализ видео</span>
              </router-link>
            </li>
            <li class="breadcrumb-item active">
              {{ analysis.title || 'Детали анализа' }}
            </li>
          </ol>
        </nav>
        
        <div class="analysis-title-section">
          <div class="analysis-icon-container">
            <div class="analysis-icon" :class="getAnalysisIconClass(analysis.status)">
              <component :is="getStatusIcon(analysis.status)" :size="24" color="white" />
            </div>
            <!-- Кнопка редактирования под иконкой -->
            <button 
              v-if="!isEditing"
              @click="startEditing" 
              class="btn btn-edit-under-icon"
              title="Редактировать название и описание"
            >
              <Edit3 :size="14" />
            </button>
          </div>
          <div class="analysis-title">
            <!-- Режим редактирования -->
            <div v-if="isEditing" class="editing-form">
              <div class="form-group">
                <label for="edit-title" class="form-label">Название</label>
                <input
                  id="edit-title"
                  v-model="editingData.title"
                  type="text"
                  class="form-control"
                  placeholder="Введите название анализа"
                  maxlength="255"
                />
              </div>
              <div class="form-group">
                <label for="edit-description" class="form-label">Описание</label>
                <textarea
                  id="edit-description"
                  v-model="editingData.description"
                  class="form-control"
                  rows="3"
                  placeholder="Введите описание анализа (необязательно)"
                ></textarea>
              </div>
              <div class="editing-actions">
                <button 
                  @click="saveChanges" 
                  class="btn btn-success btn-sm"
                  :disabled="isUpdating"
                >
                  <Save :size="16" />
                  <span v-if="isUpdating">Сохранение...</span>
                  <span v-else>Сохранить</span>
                </button>
                <button 
                  @click="cancelEditing" 
                  class="btn btn-secondary btn-sm"
                  :disabled="isUpdating"
                >
                  <X :size="16" />
                  <span>Отмена</span>
                </button>
              </div>
            </div>
            
            <!-- Обычный режим просмотра -->
            <div v-else>
              <h1>{{ analysis.title || 'Анализ видео' }}</h1>
              <div class="analysis-meta-badges">
                <span class="badge status-badge" :class="statusClass(analysis.status)">
                  {{ analysis.status_display }}
                </span>
                <span class="badge time-badge bg-light text-dark" v-if="analysis.duration_formatted">
                  <Clock :size="14" />
                  {{ analysis.duration_formatted }}
                </span>
                <span class="badge time-badge bg-light text-dark" v-if="analysis.status === 'completed' && analysis.processing_time_formatted">
                  <Clock :size="14" />
                  {{ analysis.processing_time_formatted }}
                </span>
              </div>
              <p class="analysis-description" v-if="analysis.description">
                {{ analysis.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="header-actions">
        <router-link to="/video-analysis/analyses" class="btn btn-back-to-list">
          <ArrowLeft :size="16" />
          <span>Назад к списку</span>
        </router-link>
        <button 
          class="btn btn-warning btn-refresh"
          @click="load"
          :disabled="loading"
        >
          <RefreshCw v-if="!loading" :size="16" />
          <Loader v-else :size="16" class="spinner" />
          <span v-if="!loading">Обновить</span>
          <span v-else>Обновление...</span>
        </button>
        <button 
          v-if="analysis.status === 'processing' || analysis.status === 'pending'" 
          class="btn btn-cancel-analysis" 
          @click="cancelAnalysis"
          :disabled="isCancelling"
        >
          <X v-if="!isCancelling" :size="16" />
          <Loader v-else :size="16" class="spinner" />
          <span v-if="!isCancelling">Отменить</span>
          <span v-else>Отмена...</span>
        </button>
        <button 
          v-if="analysis.status === 'completed'" 
          class="btn btn-delete-analysis" 
          @click="showDeleteConfirm"
        >
          <Trash2 :size="16" />
          <span>Удалить</span>
        </button>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="analysis-content">
      <div class="info-section">
        <div class="row g-3 g-lg-4 align-items-stretch">
          <div class="col-12">
          <!-- Просмотр видео -->
          <div class="info-card video-player-card h-100" v-if="analysis.original_video || analysis.output_video">
            <div class="card-header">
              <Video :size="20" />
              <h3>Просмотр видео</h3>
            </div>
            <div class="card-body">
              <div class="video-grid">
                <div class="video-wrapper" v-if="analysis.original_video" :class="{ 'video-playing': isOriginalVideoPlaying }">
                  <div class="video-title">
                    <span>Исходное видео</span>
                    <span v-if="isOriginalVideoPlaying" class="playing-indicator">
                      <Play :size="14" />
                      Воспроизводится
                    </span>
                  </div>
                  <template v-if="isMp4(analysis.original_video)">
                    <video
                      ref="originalVideoRef"
                      :key="originalVideoBlobUrl || getMediaUrl(analysis.original_video)"
                      class="video-player"
                      :src="originalVideoBlobUrl || getMediaUrl(analysis.original_video)"
                      controls
                      preload="auto"
                      playsinline
                      webkit-playsinline
                      @play="onOriginalVideoPlay"
                      @pause="onOriginalVideoPause"
                    ></video>
                  </template>
                  <template v-else>
                    <div class="unsupported-note">
                      <AlertTriangle :size="16" />
                      <span>Формат исходного видео не поддерживается браузером для онлайн-просмотра. Вы можете скачать файл по ссылке ниже.</span>
                    </div>
                    <a
                      class="btn btn-primary mt-2"
                      :href="getMediaUrl(analysis.original_video)"
                      target="_blank"
                      rel="noopener"
                    >
                      <Download :size="16" />
                      <span>Скачать исходное видео</span>
                    </a>
                  </template>
                </div>
                <div class="video-wrapper" v-if="analysis.output_video" :class="{ 'video-playing': isOutputVideoPlaying }">
                  <div class="video-title">
                    <span>Обработанное видео</span>
                    <span v-if="isOutputVideoPlaying" class="playing-indicator">
                      <Play :size="14" />
                      Воспроизводится
                    </span>
                  </div>
                  <template v-if="isMp4(analysis.output_video)">
                    <video
                      ref="outputVideoRef"
                      :key="outputVideoBlobUrl || getMediaUrl(analysis.output_video)"
                      class="video-player"
                      :src="outputVideoBlobUrl || getMediaUrl(analysis.output_video)"
                      controls
                      preload="auto"
                      playsinline
                      webkit-playsinline
                      @play="onOutputVideoPlay"
                      @pause="onOutputVideoPause"
                    ></video>
                  </template>
                  <template v-else>
                    <div class="unsupported-note">
                      <AlertTriangle :size="16" />
                      <span>Формат обработанного видео не поддерживается браузером для онлайн-просмотра. Вы можете скачать файл по ссылке ниже.</span>
                    </div>
                    <a
                      class="btn btn-primary mt-2"
                      :href="getMediaUrl(analysis.output_video)"
                      target="_blank"
                      rel="noopener"
                    >
                      <Download :size="16" />
                      <span>Скачать обработанное видео</span>
                    </a>
                  </template>
                </div>
                <div class="video-placeholder" v-else>
                  <div class="placeholder-content">
                    <Loader :size="20" class="me-2" />
                    <span>Обработанное видео появится после завершения</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
          <div class="col-12">
            <div class="info-card combined-info">
              <div class="card-header">
                <Info :size="20" />
                <h3>Информация и файлы</h3>
              </div>
              <div class="card-body">
                <div class="meta-grid mb-3">
                  <div class="meta-item">
                    <div class="meta-icon">
                      <Calendar :size="16" />
                    </div>
                    <div class="meta-content">
                      <span class="meta-label">Создан</span>
                      <span class="meta-value">{{ formatDate(analysis.created_at) }}</span>
                    </div>
                  </div>
                  <div class="meta-item" v-if="analysis.started_at">
                    <div class="meta-icon">
                      <Play :size="16" />
                    </div>
                    <div class="meta-content">
                      <span class="meta-label">Начало обработки</span>
                      <span class="meta-value">{{ formatDate(analysis.started_at) }}</span>
                    </div>
                  </div>
                  <div class="meta-item" v-if="analysis.completed_at">
                    <div class="meta-icon">
                      <CheckCircle :size="16" />
                    </div>
                    <div class="meta-content">
                      <span class="meta-label">Завершен</span>
                      <span class="meta-value">{{ formatDate(analysis.completed_at) }}</span>
                    </div>
                  </div>
                  <div class="meta-item">
                    <div class="meta-icon">
                      <FileText :size="16" />
                    </div>
                    <div class="meta-content">
                      <span class="meta-label">Сегментов субтитров</span>
                      <span class="meta-value">{{ analysis.segments_count || 0 }}</span>
                    </div>
                  </div>
                </div>

                <!-- Настройки субтитров -->
                <div v-if="analysis.subtitle_lines_count || analysis.subtitle_font_size || analysis.subtitle_font_color" class="subtitle-settings-display mt-3">
                  <h6 class="mb-3">
                    <Settings :size="20" class="me-2" />
                    Настройки субтитров
                  </h6>
                  
                  <div class="settings-grid">
                    <div class="setting-item" v-if="analysis.subtitle_lines_count">
                      <div class="setting-icon">
                        <AlignLeft :size="16" />
                      </div>
                      <div class="setting-content">
                        <span class="setting-label">Строк одновременно</span>
                        <span class="setting-value">±{{ analysis.subtitle_lines_count }} {{ getLinesText(analysis.subtitle_lines_count) }}</span>
                      </div>
                    </div>
                    
                    <div class="setting-item" v-if="analysis.subtitle_font_size">
                      <div class="setting-icon">
                        <Type :size="16" />
                      </div>
                      <div class="setting-content">
                        <span class="setting-label">Размер шрифта</span>
                        <span class="setting-value">{{ analysis.subtitle_font_size }}px</span>
                      </div>
                    </div>
                    
                    <div class="setting-item" v-if="analysis.subtitle_font_color">
                      <div class="setting-icon">
                        <Palette :size="16" />
                      </div>
                      <div class="setting-content">
                        <span class="setting-label">Цвет шрифта</span>
                        <div class="color-display">
                          <div 
                            class="color-preview" 
                            :style="{ backgroundColor: analysis.subtitle_font_color }"
                          ></div>
                          <span class="color-value">{{ analysis.subtitle_font_color }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="setting-item" v-if="analysis.subtitle_background_color && !analysis.subtitle_background_transparent">
                      <div class="setting-icon">
                        <Square :size="16" />
                      </div>
                      <div class="setting-content">
                        <span class="setting-label">Цвет фона</span>
                        <div class="color-display">
                          <div 
                            class="color-preview" 
                            :style="{ backgroundColor: analysis.subtitle_background_color }"
                          ></div>
                          <span class="color-value">{{ analysis.subtitle_background_color }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="setting-item" v-if="analysis.subtitle_background_transparent">
                      <div class="setting-icon">
                        <Eye :size="16" />
                      </div>
                      <div class="setting-content">
                        <span class="setting-label">Фон</span>
                        <span class="setting-value transparent-badge">Прозрачный</span>
                      </div>
                    </div>
                    
                    <div class="setting-item" v-if="analysis.subtitle_alignment">
                      <div class="setting-icon">
                        <AlignCenter :size="16" />
                      </div>
                      <div class="setting-content">
                        <span class="setting-label">Позиция</span>
                        <span class="setting-value">{{ getAlignmentLabel(analysis.subtitle_alignment) }}</span>
                      </div>
                    </div>
                    
                    <div class="setting-item" v-if="analysis.subtitle_margin_vertical !== undefined && analysis.subtitle_margin_vertical !== null">
                      <div class="setting-icon">
                        <MoveVertical :size="16" />
                      </div>
                      <div class="setting-content">
                        <span class="setting-label">Отступ по вертикали</span>
                        <span class="setting-value">{{ analysis.subtitle_margin_vertical }}px</span>
                      </div>
                    </div>
                    
                    <div class="setting-item" v-if="analysis.subtitle_margin_horizontal !== undefined && analysis.subtitle_margin_horizontal !== null">
                      <div class="setting-icon">
                        <MoveHorizontal :size="16" />
                      </div>
                      <div class="setting-content">
                        <span class="setting-label">Отступ по горизонтали</span>
                        <span class="setting-value">{{ analysis.subtitle_margin_horizontal > 0 ? '+' : '' }}{{ analysis.subtitle_margin_horizontal }}px</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Настройки озвучки -->
                <div class="subtitle-settings-display mt-3 mb-4" v-if="analysis.tts_enabled !== undefined">
                  <h6 class="mb-3">
                    <Volume2 :size="20" class="me-2" />
                    Настройки озвучки
                  </h6>
                  <div class="settings-grid">
                    <div class="setting-item">
                      <div class="setting-icon">
                        <Volume2 :size="16" />
                      </div>
                      <div class="setting-content">
                        <span class="setting-label">Озвучка</span>
                        <span class="setting-value">{{ analysis.tts_enabled ? 'Включена' : 'Выключена' }}</span>
                      </div>
                    </div>
                    <div class="setting-item" v-if="analysis.tts_enabled">
                      <div class="setting-icon">
                        <Type :size="16" />
                      </div>
                      <div class="setting-content">
                        <span class="setting-label">Язык</span>
                        <span class="setting-value">{{ analysis.tts_language === 'ru' ? 'Русский' : (analysis.tts_language === 'fr' ? 'Французский' : analysis.tts_language) }}</span>
                      </div>
                    </div>
                    <div class="setting-item" v-if="analysis.tts_enabled">
                      <div class="setting-icon">
                        <Type :size="16" />
                      </div>
                      <div class="setting-content">
                        <span class="setting-label">Громкость</span>
                        <span class="setting-value">{{ Math.round((analysis.tts_volume ?? 0) * 100) }}%</span>
                      </div>
                    </div>
                    <div class="setting-item" v-if="analysis.tts_enabled && analysis.tts_voice_model">
                      <div class="setting-icon">
                        <Type :size="16" />
                      </div>
                      <div class="setting-content">
                        <span class="setting-label">Модель голоса</span>
                        <span class="setting-value">{{ analysis.tts_voice_model }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="analysis.status === 'completed'" class="downloads-card">
                  <div class="download-actions">
                    <button v-if="analysis.output_video" @click="downloadFile(analysis.id, 'video')" class="download-btn download-video" :disabled="downloading.video">
                      <div class="download-icon"><Video :size="20" /></div>
                      <div class="download-info">
                        <span class="download-title">Видео с субтитрами</span>
                        <span class="download-subtitle">Обработанное видео</span>
                      </div>
                      <div v-if="downloading.video" class="download-spinner"><Loader :size="16" class="spinner" /></div>
                    </button>
                    <button v-if="analysis.subtitles_file" @click="downloadFile(analysis.id, 'subtitles')" class="download-btn download-subtitles" :disabled="downloading.subtitles">
                      <div class="download-icon"><FileText :size="20" /></div>
                      <div class="download-info">
                        <span class="download-title">Файл субтитров</span>
                        <span class="download-subtitle">Формат SRT</span>
                      </div>
                      <div v-if="downloading.subtitles" class="download-spinner"><Loader :size="16" class="spinner" /></div>
                    </button>
                    <button v-if="analysis.audio_file" @click="downloadFile(analysis.id, 'audio')" class="download-btn download-audio" :disabled="downloading.audio">
                      <div class="download-icon"><Volume2 :size="20" /></div>
                      <div class="download-info">
                        <span class="download-title">Аудио файл</span>
                        <span class="download-subtitle">Извлеченный звук</span>
                      </div>
                      <div v-if="downloading.audio" class="download-spinner"><Loader :size="16" class="spinner" /></div>
                    </button>
                  </div>
                </div>

                <div class="error-card mt-3" v-if="analysis.error_message">
                  <div class="error-message">
                    <pre>{{ analysis.error_message }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Секция субтитров -->
      <div class="subtitles-section">
        <div class="section-header">
          <div class="section-title">
            <FileText :size="24" />
            <h2>Сегменты субтитров</h2>
            <span class="segments-count">({{ analysis.subtitle_segments?.length || 0 }})</span>
          </div>
        </div>
        
        <div class="subtitles-content">
          <!-- Состояние обработки -->
          <div v-if="analysis.status === 'processing'" class="processing-state">
            <div class="d-flex flex-column align-items-center justify-content-center py-5">
              <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Обработка...</span>
              </div>
              <h4 class="text-muted mb-2">Обработка видео в процессе...</h4>
              <p class="text-muted">Пожалуйста, подождите. Анализ может занять несколько минут.</p>
            </div>
          </div>
          
          <!-- Пустое состояние -->
          <div v-else-if="!analysis.subtitle_segments?.length" class="empty-state">
            <FileText :size="64" class="empty-icon" />
            <h3>Нет сегментов субтитров</h3>
            <p>Субтитры не были сгенерированы для этого анализа</p>
          </div>
          
          <!-- Список сегментов -->
          <div v-else class="segments-container">
            <div class="segments-grid">
              <div 
                class="segment-card" 
                v-for="segment in analysis.subtitle_segments" 
                :key="segment.segment_number"
              >
                <div class="segment-header">
                  <span class="segment-number">#{{ segment.segment_number }}</span>
                  <span class="segment-time">
                    <Clock :size="14" />
                    {{ segment.start_time }} - {{ segment.end_time }}
                  </span>
                </div>
                
                <div class="segment-content">
                  <div class="text-section russian">
                    <div class="text-label">
                      <span class="flag">🇷🇺</span>
                      <span>Русский</span>
                    </div>
                    <div class="text-content">{{ segment.russian_text }}</div>
                  </div>
                  
                  <div class="text-section french">
                    <div class="text-label">
                      <span class="flag">🇫🇷</span>
                      <span>Французский</span>
                    </div>
                    <div class="text-content">{{ segment.french_text }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Состояние загрузки -->
  <div v-else-if="loading" class="loading-state">
    <div class="d-flex flex-column align-items-center justify-content-center py-5">
      <div class="spinner-border text-primary mb-3" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="text-muted">Загружаем анализ...</p>
    </div>
  </div>

  <!-- Состояние ошибки -->
  <div v-else class="error-state">
    <div class="text-center py-5">
      <AlertTriangle :size="64" class="error-icon mb-4" />
      <h3 class="text-muted mb-3">Анализ не найден</h3>
      <p class="text-muted mb-4">Возможно, анализ был удален или у вас нет доступа к нему</p>
      <router-link to="/video-analysis/analyses" class="btn btn-primary">
        <ArrowLeft :size="16" />
        <span>Вернуться к списку</span>
      </router-link>
    </div>
  </div>

  <!-- Модальное окно подтверждения удаления -->
  <ConfirmDialog
    :show="showDeleteModal"
    title="Удаление анализа"
    message="Вы уверены, что хотите удалить этот анализ? Это действие нельзя отменить."
    confirm-text="Удалить"
    cancel-text="Отмена"
    variant="danger"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
    @close="cancelDelete"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { videoAnalysisAPI } from './js/video-analysis.js'
import { useToast } from 'vue-toastification'
import Cookies from 'js-cookie'
import { apiClient } from '@/js/api/manager.js'
import { 
  Video, ArrowLeft, Trash2, Clock, CheckCircle, AlertTriangle, 
  Info, Calendar, Play, FileText, Download, Volume2, Hourglass, 
  Loader, Settings, AlignLeft, Type, Palette, Square, Eye, Edit3, Save, X,
  AlignCenter, MoveVertical, MoveHorizontal, RefreshCw
} from 'lucide-vue-next'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const analysis = ref(null)
const originalVideoRef = ref(null)
const outputVideoRef = ref(null)
const originalVideoBlobUrl = ref('')
const outputVideoBlobUrl = ref('')
const loading = ref(true)
const isOriginalVideoPlaying = ref(false)
const isOutputVideoPlaying = ref(false)
const downloading = ref({
  video: false,
  subtitles: false,
  audio: false
})
const showDeleteModal = ref(false)
const isEditing = ref(false)
const editingData = ref({
  title: '',
  description: ''
})
const isUpdating = ref(false)
const isCancelling = ref(false)
let timer = null

function statusClass(status) {
  switch (status) {
    case 'completed': return 'bg-success'
    case 'processing': return 'bg-warning'
    case 'failed': return 'bg-danger'
    case 'pending': return 'bg-secondary'
    default: return 'bg-light text-dark'
  }
}

function formatDate(iso) {
  if (!iso) return '-'
  try { 
    return new Date(iso).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch { 
    return iso 
  }
}

async function downloadFile(id, type) {
  try {
    console.log('Начинаем скачивание файла:', { id, type })
    
    // Проверяем токен перед скачиванием
    if (!apiClient.isTokenValid()) {
      toast.error('Токен авторизации отсутствует или истек. Пожалуйста, войдите в систему заново.')
      router.push('/start')
      return
    }
    
    downloading.value[type] = true
    
    const result = await videoAnalysisAPI.downloadFile(id, type)
    console.log('Результат скачивания:', result)
    
    if (result.success && result.data) {
      // Создаем blob URL для скачивания
      const blob = new Blob([result.data])
      const url = window.URL.createObjectURL(blob)
      
      // Создаем временную ссылку для скачивания
      const link = document.createElement('a')
      link.href = url
      
      // Определяем имя файла в зависимости от типа
      let filename = `video_analysis_${id}`
      switch (type) {
        case 'video':
          filename += '_with_subtitles.mp4'
          break
        case 'subtitles':
          filename += '_subtitles.srt'
          break
        case 'audio':
          filename += '_audio.mp3'
          break
        default:
          filename += `_${type}`
      }
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Освобождаем память
      window.URL.revokeObjectURL(url)
      
      toast.success('Файл успешно скачан')
    } else {
      toast.error('Ошибка при скачивании файла')
    }
  } catch (error) {
    console.error('Ошибка скачивания:', error)
    toast.error('Ошибка при скачивании файла')
  } finally {
    downloading.value[type] = false
  }
}

function getMediaUrl(relativePath) {
  if (!relativePath) return null
  // Если уже абсолютный URL — возвращаем как есть
  if (/^https?:\/\//i.test(relativePath)) {
    return relativePath
  }
  const base = apiClient.baseUrl?.replace(/\/$/, '') || ''
  // Если путь начинается с '/', считаем его абсолютным относительно API (например, '/media/...')
  if (relativePath.startsWith('/')) {
    return `${base}${relativePath}`
  }
  // Иначе это относительный путь внутри MEDIA_ROOT
  const cleaned = relativePath.replace(/^media\//, '')
  return `${base}/media/${cleaned}`
}

function isMp4(path) {
  if (!path) return false
  return path.toLowerCase().endsWith('.mp4')
}

function getStatusIcon(status) {
  const icons = {
    'pending': Hourglass,
    'processing': Loader,
    'completed': CheckCircle,
    'failed': AlertTriangle,
    'cancelled': AlertTriangle
  }
  return icons[status] || Clock
}

function getAnalysisIconClass(status) {
  const classes = {
    'pending': 'icon-secondary',
    'processing': 'icon-warning',
    'completed': 'icon-success',
    'failed': 'icon-danger',
    'cancelled': 'icon-info'
  }
  return classes[status] || 'icon-secondary'
}

function getLinesText(count) {
  if (count === 1) return 'строка'
  if (count >= 2 && count <= 4) return 'строки'
  return 'строк'
}

function getAlignmentLabel(alignment) {
  const alignmentLabels = {
    '1': 'Слева снизу',
    '2': 'По центру снизу',
    '3': 'Справа снизу',
    '4': 'Сверху слева',
    '5': 'По центру слева',
    '6': 'Сверху по центру',
    '7': 'Сверху справа',
    '8': 'По центру',
    '9': 'Справа по центру'
  }
  return alignmentLabels[alignment] || alignment
}

async function load() {
  try {
    loading.value = true
    const result = await videoAnalysisAPI.get(route.params.id)
    analysis.value = result.data
    // После получения анализа пробуем заранее скачать видео как blob
    await Promise.all([
      prefetchOriginalVideo(),
      prefetchOutputVideo()
    ])
  } catch {
    toast.error('Ошибка загрузки анализа')
    router.push('/video-analysis/analyses')
  } finally {
    loading.value = false
  }
}

function showDeleteConfirm() {
  showDeleteModal.value = true
}

async function confirmDelete() {
  try {
    await videoAnalysisAPI.remove(analysis.value.id)
    toast.success('Анализ удалён')
    router.push('/video-analysis/analyses')
  } catch {
    toast.error('Ошибка удаления')
  } finally {
    showDeleteModal.value = false
  }
}

function cancelDelete() {
  showDeleteModal.value = false
}

function startEditing() {
  isEditing.value = true
  editingData.value = {
    title: analysis.value.title || '',
    description: analysis.value.description || ''
  }
}

function cancelEditing() {
  isEditing.value = false
  editingData.value = {
    title: '',
    description: ''
  }
}

async function saveChanges() {
  if (!editingData.value.title.trim()) {
    toast.error('Название не может быть пустым')
    return
  }

  try {
    isUpdating.value = true
    const result = await videoAnalysisAPI.update(analysis.value.id, {
      title: editingData.value.title.trim(),
      description: editingData.value.description.trim()
    })
    
    // Обновляем локальные данные
    analysis.value.title = editingData.value.title.trim()
    analysis.value.description = editingData.value.description.trim()
    
    isEditing.value = false
    toast.success('Анализ успешно обновлен')
  } catch (error) {
    console.error('Ошибка обновления анализа:', error)
    toast.error('Ошибка при обновлении анализа')
  } finally {
    isUpdating.value = false
  }
}

async function cancelAnalysis() {
  try {
    isCancelling.value = true
    const result = await videoAnalysisAPI.cancel(analysis.value.id)
    
    // Обновляем данные анализа
    analysis.value.status = 'cancelled'
    analysis.value.error_message = 'Анализ отменен пользователем'
    
    toast.success('Анализ успешно отменен')
  } catch (error) {
    console.error('Ошибка отмены анализа:', error)
    toast.error('Ошибка при отмене анализа')
  } finally {
    isCancelling.value = false
  }
}

onMounted(async () => {
  // Проверяем токен перед загрузкой
  const token = Cookies.get('token')
  console.log('Токен при загрузке компонента:', token ? 'есть' : 'отсутствует')
  if (token) {
    console.log('Длина токена:', token.length)
  }
  
  await load()
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  revokeOriginalBlob()
  revokeOutputBlob()
})

// Обновляем медиатеги при смене источника, чтобы гарантировать preload
watch(() => analysis.value?.original_video, () => {
  if (originalVideoRef.value) {
    try { originalVideoRef.value.load() } catch (e) { console.debug('originalVideoRef load error', e) }
  }
  prefetchOriginalVideo()
})

watch(() => analysis.value?.output_video, () => {
  if (outputVideoRef.value) {
    try { outputVideoRef.value.load() } catch (e) { console.debug('outputVideoRef load error', e) }
  }
  prefetchOutputVideo()
})

function revokeOriginalBlob() {
  if (originalVideoBlobUrl.value) {
    try { URL.revokeObjectURL(originalVideoBlobUrl.value) } catch (e) { console.debug('revokeObjectURL error', e) }
    originalVideoBlobUrl.value = ''
  }
}

function revokeOutputBlob() {
  if (outputVideoBlobUrl.value) {
    try { URL.revokeObjectURL(outputVideoBlobUrl.value) } catch (e) { console.debug('revokeObjectURL error', e) }
    outputVideoBlobUrl.value = ''
  }
}

async function prefetchOriginalVideo() {
  try {
    revokeOriginalBlob()
    const src = analysis.value?.original_video ? getMediaUrl(analysis.value.original_video) : ''
    if (!src) return
    // Скачиваем целиком как Blob и подставляем blob-URL
    const res = await fetch(src, { cache: 'reload' })
    if (!res.ok) return
    const blob = await res.blob()
    originalVideoBlobUrl.value = URL.createObjectURL(blob)
    if (originalVideoRef.value) {
      originalVideoRef.value.src = originalVideoBlobUrl.value
      try { originalVideoRef.value.load() } catch (e) { console.debug('originalVideoRef load after blob error', e) }
    }
  } catch (e) {
    console.debug('prefetchOriginalVideo error', e)
  }
}

async function prefetchOutputVideo() {
  try {
    revokeOutputBlob()
    const src = analysis.value?.output_video ? getMediaUrl(analysis.value.output_video) : ''
    if (!src) return
    // Скачиваем целиком как Blob и подставляем blob-URL
    const res = await fetch(src, { cache: 'reload' })
    if (!res.ok) return
    const blob = await res.blob()
    outputVideoBlobUrl.value = URL.createObjectURL(blob)
    if (outputVideoRef.value) {
      outputVideoRef.value.src = outputVideoBlobUrl.value
      try { outputVideoRef.value.load() } catch (e) { console.debug('outputVideoRef load after blob error', e) }
    }
  } catch (e) {
    console.debug('prefetchOutputVideo error', e)
  }
}

// Функции для синхронизации воспроизведения видео
function onOriginalVideoPlay() {
  // Останавливаем обработанное видео, если оно воспроизводится
  if (outputVideoRef.value && !outputVideoRef.value.paused) {
    console.debug('Останавливаем обработанное видео при воспроизведении исходного')
    outputVideoRef.value.pause()
    isOutputVideoPlaying.value = false
  }
  isOriginalVideoPlaying.value = true
}

function onOutputVideoPlay() {
  // Останавливаем исходное видео, если оно воспроизводится
  if (originalVideoRef.value && !originalVideoRef.value.paused) {
    console.debug('Останавливаем исходное видео при воспроизведении обработанного')
    originalVideoRef.value.pause()
    isOriginalVideoPlaying.value = false
  }
  isOutputVideoPlaying.value = true
}

function onOriginalVideoPause() {
  isOriginalVideoPlaying.value = false
}

function onOutputVideoPause() {
  isOutputVideoPlaying.value = false
}
</script>

<style scoped lang="scss">
.analysis-detail-page {
  padding: 2rem;
  min-height: 100vh;
  background: var(--bs-gray-100);
}

// Заголовок страницы
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  
  .header-content {
    flex: 1;
  }
  
  .header-actions {
    display: flex;
    gap: 0.75rem;
    margin-left: 2rem;
  }
}

// Хлебные крошки
.breadcrumb-nav {
  margin-bottom: 1rem;
  
  .breadcrumb {
    background: transparent;
    padding: 0;
    margin: 0;
    
    .breadcrumb-item {
      font-size: 0.875rem;
      
      .breadcrumb-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--bs-secondary-color);
        text-decoration: none;
        transition: color 0.2s ease;
        
        &:hover {
          color: var(--bs-primary);
        }
      }
      
      &.active {
        color: var(--bs-heading-color);
        font-weight: 600;
      }
    }
  }
}

// Секция заголовка анализа
.analysis-title-section {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  
  .analysis-icon-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }
  
  .analysis-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    &.icon-primary {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    }
    
    &.icon-warning {
      background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
    }
    
    &.icon-success {
      background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
    }
    
    &.icon-danger {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    }
    
    &.icon-info {
      background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%);
    }
    
    &.icon-secondary {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    }
  }
  
  .btn-edit-under-icon {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    border: none;
    color: white;
    padding: 0.375rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 0.75rem;
    box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
      color: white;
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
    }
    
    svg {
      align-self: center;
    }
  }
  
  .analysis-title {
    flex: 1;
    
    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--bs-heading-color);
      margin: 0 0 0.5rem 0;
    }
    
    
    .analysis-meta-badges {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      
      .badge {
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 6px;
        
        &.time-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
      }
    }
    
    .analysis-description {
      color: var(--bs-secondary-color);
      margin: 0;
      font-size: 1rem;
      line-height: 1.5;
    }
    
    // Форма редактирования
    .editing-form {
      background: var(--bs-gray-50);
      border: 1px solid var(--bs-border-color);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      
      .form-group {
        margin-bottom: 1rem;
        
        &:last-of-type {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          font-weight: 600;
          color: var(--bs-heading-color);
          margin-bottom: 0.5rem;
          display: block;
          font-size: 0.875rem;
        }
        
        .form-control {
          border: 1px solid var(--bs-border-color);
          border-radius: 8px;
          padding: 0.75rem;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          
          &:focus {
            border-color: var(--bs-primary);
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
            outline: none;
          }
          
          &::placeholder {
            color: var(--bs-secondary-color);
          }
        }
        
        textarea.form-control {
          resize: vertical;
          min-height: 80px;
        }
      }
      
      .editing-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        
        .btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-weight: 600;
          border-radius: 8px;
          transition: all 0.2s ease;
          
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          svg {
            align-self: center;
          }
        }
        
        .btn-success {
          background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
          border: none;
          color: white;
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #1e7e34 0%, #155724 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
          }
        }
        
        .btn-secondary {
          background: var(--bs-gray-100);
          border: 1px solid var(--bs-border-color);
          color: var(--bs-secondary-color);
          
          &:hover:not(:disabled) {
            background: var(--bs-gray-200);
            border-color: var(--bs-gray-300);
            transform: translateY(-1px);
          }
        }
      }
    }
  }
}

// Кнопки в заголовке
.header-actions {
  .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    font-weight: 600;
    border-radius: 8px;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
  }
  
  .btn-back-to-list {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    border: none;
    color: white;
    font-weight: 600;
    border-radius: 10px;
    padding: 0.875rem 1.5rem;
    transition: all 0.2s ease;
    text-decoration: none;
    
    &:hover {
      background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
      color: white;
      text-decoration: none;
    }
    
    &:active {
      transform: translateY(0);
    }
    
    svg { flex-shrink: 0; margin: 0; align-self: center; }
    
    span {
      white-space: nowrap;
    }
  }

  .btn-cancel-analysis {
    background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
    border: none;
    color: white;
    font-weight: 600;
    border-radius: 10px;
    padding: 0.875rem 1.5rem;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #e0a800 0%, #d39e00 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
      color: white;
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    svg { flex-shrink: 0; margin: 0; align-self: center; }
    
    .spinner {
      animation: spin 1s linear infinite;
    }

    span {
      white-space: nowrap;
    }
  }

  .btn-delete-analysis {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    border: none;
    color: white;
    font-weight: 600;
    border-radius: 10px;
    padding: 0.875rem 1.5rem;
    transition: all 0.2s ease;

    &:hover {
      background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
      color: white;
    }

    &:active {
      transform: translateY(0);
    }

    svg { flex-shrink: 0; margin: 0; align-self: center; }

    span {
      white-space: nowrap;
    }
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}

// Основной контент
.analysis-content {
  .info-section {
    margin-bottom: 2rem;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    
    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }
  }
}

// Карточки информации
.info-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: var(--bs-light);
    border-bottom: 1px solid var(--bs-border-color);
    
    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--bs-heading-color);
      margin: 0;
    }
    
    &.error-header {
      background: var(--bs-danger);
      color: white;
      
      h3 {
        color: white;
      }
    }
  }
  
  .card-body {
    padding: 1rem 1.25rem;
  }
}

// Сетка метаданных
.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--bs-gray-100);
    border-radius: 10px;
    
    .meta-icon { color: var(--bs-secondary-color); display: flex; align-items: center; }
    
    .meta-content {
      display: flex;
      flex-direction: column;
      
      .meta-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--bs-secondary-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.25rem;
      }
      
      .meta-value {
        font-weight: 600;
        color: var(--bs-heading-color);
      }
    }
  }
}

// Карточка загрузок
.downloads-card {
  .download-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    
    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  }
  
  .download-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: var(--bs-gray-100);
    border-radius: 10px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
    
    &:hover:not(:disabled) {
      background: var(--bs-primary);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      text-decoration: none;
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .download-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: white; color: var(--bs-primary); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); svg { align-self: center; } }
    
    .download-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      
      .download-title {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      .download-subtitle {
        font-size: 0.875rem;
        color: var(--bs-secondary-color);
      }
    }
    
    .download-spinner {
      margin-left: auto;
      
      .spinner {
        animation: spin 1s linear infinite;
        color: var(--bs-primary);
      }
    }
    
    &:hover:not(:disabled) .download-icon {
      background: white;
      color: var(--bs-primary);
    }
    
    &:hover:not(:disabled) .download-subtitle {
      color: rgba(255, 255, 255, 0.8);
    }
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
}

// Проигрыватель видео
.video-player-card {
  .video-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  }
  .video-wrapper {
    background: var(--bs-gray-100);
    border-radius: 10px;
    padding: 1rem;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    
    &.video-playing {
      background: rgba(13, 110, 253, 0.1);
      border-color: var(--bs-primary);
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
    
    .video-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .playing-indicator {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: var(--bs-primary);
        font-size: 0.875rem;
        font-weight: 500;
        background: rgba(13, 110, 253, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        
        svg {
          animation: pulse 2s infinite;
        }
      }
    }
    .video-player {
      width: 100%;
      height: auto;
      border-radius: 8px;
      background: black;
      max-height: 400px;
      object-fit: contain;
      
      // Улучшаем работу с перелистыванием
      &::-webkit-media-controls-timeline {
        cursor: pointer;
      }
      
      &::-webkit-media-controls-current-time-display,
      &::-webkit-media-controls-time-remaining-display {
        font-size: 12px;
      }
      
      // Для лучшей работы на мобильных устройствах
      @media (max-width: 768px) {
        max-height: 300px;
      }
    }
    .unsupported-note {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--bs-warning);
      font-weight: 500;
    }
  }
  .video-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    background: var(--bs-gray-100);
    border-radius: 10px;
    .placeholder-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--bs-secondary-color);
      font-weight: 500;
    }
  }
}

// Карточка ошибок
.error-card {
  .error-message {
    pre {
      background: var(--bs-gray-100);
      border: 1px solid var(--bs-border-color);
      border-radius: 8px;
      padding: 1rem;
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 0.875rem;
      color: var(--bs-danger);
    }
  }
}

// Отображение настроек субтитров
.subtitle-settings-display {
  background: var(--bs-gray-50);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid var(--bs-border-color);
  
  h6 {
    display: flex;
    align-items: center;
    color: var(--bs-heading-color);
    font-weight: 600;
    margin-bottom: 1rem;
    font-size: 1rem;
  }
  
  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .setting-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: white;
    border-radius: 8px;
    border: 1px solid var(--bs-border-color);
    transition: all 0.2s ease;
    
    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }
    
    .setting-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    
    .setting-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      
      .setting-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--bs-secondary-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.25rem;
      }
      
      .setting-value {
        font-weight: 600;
        color: var(--bs-heading-color);
        font-size: 0.875rem;
        
        &.transparent-badge {
          background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }
    }
    
    .color-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      .color-preview {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 2px solid var(--bs-border-color);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
      }
      
      .color-value {
        font-family: 'Courier New', monospace;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--bs-heading-color);
        background: var(--bs-gray-100);
        padding: 0.125rem 0.375rem;
        border-radius: 4px;
        border: 1px solid var(--bs-border-color);
      }
    }
  }
}

// Секция субтитров
.subtitles-section {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  
  .section-header {
    padding: 1.5rem;
    background: var(--bs-light);
    border-bottom: 1px solid var(--bs-border-color);
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      
      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--bs-heading-color);
        margin: 0;
      }
      
      .segments-count {
        color: var(--bs-secondary-color);
        font-size: 1rem;
        font-weight: 500;
      }
    }
  }
  
  .subtitles-content {
    padding: 1.5rem;
  }
}

// Состояния загрузки и пустого списка
.loading-state,
.processing-state,
.empty-state,
.error-state {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  padding: 3rem 2rem;
  text-align: center;
  
  .empty-icon,
  .error-icon {
    color: var(--bs-gray-400);
    margin-bottom: 1rem;
  }
  
  h3,
  h4 {
    color: var(--bs-heading-color);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--bs-secondary-color);
    margin-bottom: 1.5rem;
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    font-weight: 600;
    border-radius: 8px;
  }
}

// Контейнер сегментов
.segments-container {
  .segments-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 600px;
    overflow-y: auto;
    padding-right: 0.5rem;
    
    // Стилизация скроллбара
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: var(--bs-gray-200);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: var(--bs-gray-400);
      border-radius: 4px;
      
      &:hover {
        background: var(--bs-gray-500);
      }
    }
  }
}

// Карточка сегмента
.segment-card {
  background: var(--bs-gray-100);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bs-gray-200);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .segment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--bs-border-color);
    
    .segment-number {
      font-weight: 700;
      color: var(--bs-primary);
      font-size: 0.875rem;
    }
    
    .segment-time {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--bs-secondary-color);
      font-weight: 500;
    }
  }
  
  .segment-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
}

// Секция текста
.text-section {
  .text-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    
    .flag {
      font-size: 1rem;
    }
  }
  
  .text-content {
    background: white;
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--bs-heading-color);
    border: 1px solid var(--bs-border-color);
  }
  
  &.russian {
    .text-label {
      color: var(--bs-success);
    }
    
    .text-content {
      border-left: 3px solid var(--bs-success);
    }
  }
  
  &.french {
    .text-label {
      color: var(--bs-info);
    }
    
    .text-content {
      border-left: 3px solid var(--bs-info);
    }
  }
}

// Адаптивность
@media (max-width: 768px) {
  .analysis-detail-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    
    .header-actions {
      margin-left: 0;
      width: 100%;
      justify-content: flex-end;
    }
  }
  
  .analysis-title-section {
    .analysis-title h1 {
      font-size: 1.5rem;
    }
    
    .analysis-icon-container {
      gap: 0.5rem;
    }
    
    .btn-edit-under-icon {
      width: 28px;
      height: 28px;
      padding: 0.25rem;
      box-shadow: 0 2px 4px rgba(0, 123, 255, 0.4);
      
      &:hover {
        box-shadow: 0 3px 8px rgba(0, 123, 255, 0.5);
      }
    }
    
    .editing-form {
      padding: 1rem;
      
      .editing-actions {
        flex-direction: column;
        gap: 0.5rem;
        
        .btn {
          width: 100%;
          justify-content: center;
        }
      }
    }
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .meta-grid {
    grid-template-columns: 1fr;
  }
  
  .download-actions {
    grid-template-columns: 1fr !important;
    
    .download-btn {
      .download-info {
        .download-title {
          font-size: 0.875rem;
        }
        
        .download-subtitle {
          font-size: 0.75rem;
        }
      }
    }
  }
}

@media (max-width: 576px) {
  .analysis-meta-badges {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 0.5rem !important;
  }
  
  .segment-content {
    grid-template-columns: 1fr !important;
  }
  
  .download-btn {
    flex-direction: column;
    text-align: left;
    
    .download-icon {
      margin-bottom: 0.5rem;
    }
  }
}
</style>
