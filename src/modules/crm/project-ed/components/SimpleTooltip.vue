<template>
    <Teleport to="body">
        <Transition name="tooltip">
            <div 
                v-if="visible && targetElement"
                ref="tooltipRef"
                class="simple-tooltip"
                :style="tooltipStyle"
                @mouseenter="$emit('mouseenter')"
                @mouseleave="$emit('mouseleave')"
            >
                <div class="tooltip-arrow" :style="arrowStyle"></div>
                <div class="tooltip-content">
                    <slot />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    targetElement: {
        type: [HTMLElement, null],
        default: null
    },
    placement: {
        type: String,
        default: 'top' // top, bottom, left, right
    },
    offset: {
        type: Number,
        default: 8 // Отступ от элемента
    }
})

defineEmits(['mouseenter', 'mouseleave'])

const tooltipRef = ref(null)
const tooltipDimensions = ref({ width: 0, height: 0 })
let resizeObserver = null

// Отслеживаем изменения видимости для получения размеров тултипа
watch(() => props.visible, async (newVal) => {
    if (newVal) {
        await nextTick()
        if (tooltipRef.value) {
            const rect = tooltipRef.value.getBoundingClientRect()
            tooltipDimensions.value = {
                width: rect.width,
                height: rect.height
            }
            // Подписываемся на изменения размеров контента тултипа
            if (typeof ResizeObserver !== 'undefined') {
                if (resizeObserver) {
                    try { resizeObserver.disconnect() } catch(_) {}
                }
                resizeObserver = new ResizeObserver((entries) => {
                    const entry = entries[0]
                    if (!entry) return
                    const cr = entry.contentRect
                    tooltipDimensions.value = { width: cr.width, height: cr.height }
                })
                resizeObserver.observe(tooltipRef.value)
            }
        }
    }
})

onBeforeUnmount(() => {
    if (resizeObserver) {
        try { resizeObserver.disconnect() } catch (_) {}
        resizeObserver = null
    }
})

const tooltipStyle = computed(() => {
    if (!props.targetElement || !props.visible) {
        return { display: 'none' }
    }

    const targetRect = props.targetElement.getBoundingClientRect()
    const tooltipWidth = tooltipDimensions.value.width || 250 // Дефолтная ширина
    const tooltipHeight = tooltipDimensions.value.height || 0 // Не используем большую высоту по умолчанию
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    
    let position = { left: 0, top: 0 }
    let actualPlacement = props.placement
    
    // Вычисляем позицию для размещения сверху
    const calculateTopPosition = () => {
        return {
            left: targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2),
            top: targetRect.top - tooltipHeight - props.offset
        }
    }
    
    // Вычисляем позицию для размещения снизу
    const calculateBottomPosition = () => {
        return {
            left: targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2),
            top: targetRect.bottom + Math.max(4, props.offset)
        }
    }
    
    // Если высота еще не измерена (первый рендер), сначала ставим снизу — ближе к таргету
    if (!tooltipHeight) {
        position = calculateBottomPosition()
        actualPlacement = 'bottom'
    } else {
        // Пробуем разместить сверху (приоритетное размещение)
        position = calculateTopPosition()
        
        // Проверяем, помещается ли тултип сверху
        if (position.top < 10) {
            // Если не помещается сверху, размещаем снизу
            position = calculateBottomPosition()
            actualPlacement = 'bottom'
            
            // Проверяем, не выходит ли за нижнюю границу экрана
            if (position.top + tooltipHeight > windowHeight - 10) {
                // Если и снизу не помещается, все равно показываем сверху, но прижимаем к верху экрана
                position = calculateTopPosition()
                position.top = Math.max(10, position.top)
                actualPlacement = 'top'
            }
        }
    }
    
    // Корректируем горизонтальную позицию, чтобы не выходить за границы экрана
    const minLeft = 10
    const maxLeft = windowWidth - tooltipWidth - 10
    
    if (position.left < minLeft) {
        position.left = minLeft
    } else if (position.left > maxLeft) {
        position.left = maxLeft
    }
    
    return {
        position: 'fixed',
        left: `${position.left}px`,
        top: `${position.top}px`,
        minWidth: '200px',
        maxWidth: '280px',
        maxHeight: '220px',
        zIndex: 9999,
        '--placement': actualPlacement
    }
})

const arrowStyle = computed(() => {
    if (!props.targetElement || !props.visible) {
        return {}
    }
    
    const targetRect = props.targetElement.getBoundingClientRect()
    const tooltipLeft = parseFloat(tooltipStyle.value.left || 0)
    const placement = tooltipStyle.value['--placement'] || 'top'
    
    // Вычисляем позицию стрелки относительно тултипа
    const arrowOffset = (targetRect.left + targetRect.width / 2) - tooltipLeft
    
    return {
        left: `${arrowOffset}px`,
        transform: 'translateX(-50%)',
        ...(placement === 'bottom' ? {
            top: '-6px',
            borderTop: 'none',
            borderBottom: '6px solid #dee2e6'
        } : {
            bottom: '-6px',
            borderBottom: 'none',
            borderTop: '6px solid #dee2e6'
        })
    }
})
</script>

<style scoped lang="scss">
.simple-tooltip {
    background: var(--color-primary-background);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    position: relative;
    pointer-events: auto;
    overflow: hidden;
}

.tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid var(--color-border);
    
    &::after {
        content: '';
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
    }
    
    // Стрелка для позиции сверху
    &:not([style*="border-bottom"]) {
        &::after {
            bottom: 1px;
            border-top: 5px solid var(--color-primary-background);
        }
    }
    
    // Стрелка для позиции снизу
    &[style*="border-bottom"] {
        &::after {
            top: 1px;
            border-bottom: 5px solid var(--color-primary-background);
        }
    }
}

.tooltip-content {
    padding: 0.75rem;
    line-height: 1.4;
    color: var(--color-primary-text);
}

// Анимации
.tooltip-enter-active,
.tooltip-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-enter-from {
    opacity: 0;
    transform: translateY(4px);
}

.tooltip-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

.tooltip-enter-to,
.tooltip-leave-from {
    opacity: 1;
    transform: translateY(0);
}
</style>