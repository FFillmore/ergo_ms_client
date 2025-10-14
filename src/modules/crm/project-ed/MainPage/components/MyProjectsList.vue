<template>
    <div class="my-projects-list">
        <div v-if="filteredProjects.length === 0" class="text-center py-4">
            <p class="text-muted">У вас пока нет проектов</p>
            <router-link to="/project-ed/create" class="btn btn-primary">
                Создать первый проект
            </router-link>
        </div>

        <div v-else class="position-relative">
            <button
                v-if="showNavigationButtons"
                class="btn btn-info text-white shadow-sm nav-btn left"
                type="button"
                @click="scrollLeft"
                aria-label="Прокрутить влево"
            >
                <ChevronLeft :size="20" class="d-block mx-auto" />
            </button>
            <div
                ref="scrollContainer"
                class="cards-scroll-container"
            >
                <div
                    v-for="project in filteredProjects"
                    :key="project.id"
                    class="project-card card"
                    :style="cardHeight ? { height: cardHeight + 'px' } : null"
                    role="button"
                    @click="onRowClick(project)"
                >
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <h6 class="mb-0 text-truncate">{{ project.shortName }}</h6>
                        </div>
                        <div class="full-name small">
                            {{ project.name }}
                        </div>
                        <div class="text-muted small mb-3 text-truncate d-inline-flex align-items-center gap-1 role-line">
                            <User :size="14" />
                            <span>{{ project.role || '—' }}</span>
                        </div>
                        <div class="mt-auto d-flex align-items-center justify-content-between text-muted small">
                            <span class="text-truncate">{{ formatCreated(project) }}</span>
                            <span class="badge text-wrap ms-2" :class="getStatusClass(project.status)">{{ getStatusLabel(project.status) }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <button
                v-if="showNavigationButtons"
                class="btn btn-info text-white shadow-sm nav-btn right"
                type="button"
                @click="scrollRight"
                aria-label="Прокрутить вправо"
            >
                <ChevronRight :size="20" class="d-block mx-auto" />
            </button>
        </div>

        
    </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, User } from 'lucide-vue-next'
import { slugify as translitSlugify } from 'transliteration'
import { getRelativeTime } from '@/modules/crm/project-ed/components/steps/js/timeUtils.js'

// Входные данные - проекты передаются из родительского компонента
const props = defineProps({
    projects: {
        type: Array,
        default: () => [],
    },
})

const filters = ref({ shortName: '', role: '', status: '' })

// Используем переданные проекты
const filteredProjects = computed(() => {
    const name = filters.value.shortName.toLowerCase()
    const role = filters.value.role
    const status = filters.value.status

    return props.projects.filter(p => {
        const byName = !name || p.shortName.toLowerCase().includes(name)
        const byRole = !role || p.role === role
        const byStatus = !status || p.status === status
        return byName && byRole && byStatus
    })
})

const router = useRouter()
const scrollContainer = ref(null)
const cardHeight = ref(null)
const showNavigationButtons = ref(true)

const scrollByAmount = 320

const scrollLeft = () => {
    if (scrollContainer.value) {
        scrollContainer.value.scrollBy({ left: -scrollByAmount, behavior: 'smooth' })
    }
}

const scrollRight = () => {
    if (scrollContainer.value) {
        scrollContainer.value.scrollBy({ left: scrollByAmount, behavior: 'smooth' })
    }
}

const formatCreated = (project) => {
    const created = project?.createdAt || project?.created_at || project?.created || project?.createdDate
    return created ? getRelativeTime(created) : ''
}

// Функции для работы со статусами (работаем с русскими названиями, которые приходят из MainPage.vue)
const getStatusLabel = (status) => {
    // Статус уже приходит в русском формате из MainPage.vue, просто возвращаем его
    return status || ''
}

const getStatusClass = (status) => {
    // Маппинг русских названий статусов на Bootstrap классы
    const map = {
        'Черновик': 'bg-secondary',
        'На утверждении': 'bg-warning',
        'Отклонен': 'bg-danger',
        'В работе': 'bg-primary',
        'Завершен': 'bg-success'
    }
    const result = map[status] || 'bg-secondary'
    return result
}

// Блокируем ручную прокрутку (колесо мыши/тач) — оставляем только кнопки
let wheelHandler = null
let touchMoveHandler = null

onMounted(() => {
    if (!scrollContainer.value) return
    wheelHandler = (e) => {
        // Блокируем только горизонтальную прокрутку, разрешаем вертикальную
        if (e.deltaX !== 0) {
            e.preventDefault()
        }
        // Если это горизонтальная прокрутка (Shift + колесо мыши), блокируем
        if (e.shiftKey && e.deltaY !== 0) {
            e.preventDefault()
        }
    }
    touchMoveHandler = (e) => {
        e.preventDefault()
    }
    scrollContainer.value.addEventListener('wheel', wheelHandler, { passive: false })
    scrollContainer.value.addEventListener('touchmove', touchMoveHandler, { passive: false })

    nextTick(async () => {
        adjustNamesToFit()
        await nextTick()
        syncUniformHeights()
        setTimeout(() => syncUniformHeights(), 250)
    })
    window.addEventListener('load', syncUniformHeights)
    window.addEventListener('resize', onResizeDebounced)
})

onBeforeUnmount(() => {
    if (!scrollContainer.value) return
    if (wheelHandler) {
        scrollContainer.value.removeEventListener('wheel', wheelHandler)
        wheelHandler = null
    }
    if (touchMoveHandler) {
        scrollContainer.value.removeEventListener('touchmove', touchMoveHandler)
        touchMoveHandler = null
    }
    window.removeEventListener('resize', onResizeDebounced)
    window.removeEventListener('load', syncUniformHeights)
})

const onRowClick = (project) => {
    const slug = translitSlugify(project.name || project.shortName || 'project').toLowerCase()
    router.push({ name: 'ProjectEdProjectDetail', params: { slug } })
}

// Подгон шрифта у полного названия, если контент не помещается в фиксированную высоту карточки
const adjustNamesToFit = () => {
    if (!scrollContainer.value) return
    const cards = scrollContainer.value.querySelectorAll('.project-card')
    cards.forEach((card) => {
        const body = card.querySelector('.card-body')
        const nameEl = card.querySelector('.full-name')
        if (!body || !nameEl) return
        nameEl.classList.remove('shrink', 'shrink-2')
        if (body.scrollHeight > body.clientHeight) {
            nameEl.classList.add('shrink')
        }
        if (body.scrollHeight > body.clientHeight) {
            nameEl.classList.add('shrink-2')
        }
    })
}

let resizeTimer = null
const onResizeDebounced = () => {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
        adjustNamesToFit()
        nextTick(() => syncUniformHeights())
    }, 150)
}

// Если список проектов меняется (фильтры/данные), пересчитать подгон
watch(filteredProjects, async () => {
    await nextTick()
    adjustNamesToFit()
    await nextTick()
    syncUniformHeights()
    await nextTick()
    checkNavigationButtons()
})

// Выравнивание высоты всех карточек по максимальной естественной
const syncUniformHeights = () => {
    if (!scrollContainer.value) return
    const cards = Array.from(scrollContainer.value.querySelectorAll('.project-card'))
    if (cards.length === 0) return
    // Сначала убираем выставленную высоту, чтобы измерить естественную
    cards.forEach((c) => (c.style.height = ''))
    // Ждём один кадр для стабильной раскладки перед измерением
    requestAnimationFrame(() => {
        const naturalHeights = cards.map((c) => c.offsetHeight)
        const maxHeight = Math.max(...naturalHeights)
        cardHeight.value = maxHeight
        
        // Проверяем, нужны ли кнопки навигации
        checkNavigationButtons()
    })
}

// Проверка необходимости показа кнопок навигации
const checkNavigationButtons = () => {
    if (!scrollContainer.value) return
    
    const container = scrollContainer.value
    const containerWidth = container.clientWidth
    const scrollWidth = container.scrollWidth
    
    // Показываем кнопки только если есть горизонтальная прокрутка
    showNavigationButtons.value = scrollWidth > containerWidth
}
</script>

<style scoped lang="scss">
.my-projects-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.cards-scroll-container {
    display: flex;
    gap: 1rem;
    overflow-x: auto; // нужен для программного скролла
    padding: .25rem;
    scroll-behavior: smooth;
    scrollbar-width: none; // скрыть в Firefox
}

.cards-scroll-container::-webkit-scrollbar {
    width: 0;
    height: 0; // скрыть в WebKit/Chromium
}
.cards-scroll-container::-webkit-scrollbar-thumb {
    background: transparent;
}

.project-card {
    min-width: 280px;
    max-width: 320px;
    border-radius: .75rem;
    cursor: pointer;
    transition: transform .15s ease, box-shadow .15s ease;
    overflow: hidden; // скрываем переполнение
}
.project-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);
}

.nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    opacity: .40;
}
.nav-btn.left { left: 0; }
.nav-btn.right { right: 0; }

.project-card .card-body {
    height: 100%; // растягиваем содержимое по высоте карточки
    min-height: 100%;
}

.full-name {
    color: var(--color-secondary-text);
    white-space: normal;
    overflow: hidden; // чтобы контент не вылезал из карточки
    text-overflow: ellipsis;
    display: -webkit-box; // многострочное обрезание
    -webkit-line-clamp: 6; // разумный максимум строк по умолчанию
    line-clamp: 6;
    -webkit-box-orient: vertical;
    flex: 1 1 auto; // занимает доступную высоту между заголовком и нижней частью
    min-height: 0; // позволяет блоку сжиматься в пределах flex-контейнера
    font-size: .72rem;
}

.role-line {
    margin-top: .25rem;
}

// Ужатие шрифта, если карточка не помещает контент по высоте
.full-name.shrink {
    font-size: .64rem;
}
.full-name.shrink-2 {
    font-size: .58rem;
}
</style>


