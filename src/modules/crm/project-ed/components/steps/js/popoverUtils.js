/**
 * Утилиты для создания и управления универсальными popover'ами
 */

/**
 * Инициализирует popover для отображения контента при наведении на элемент
 * @param {HTMLElement} element - DOM элемент, для которого создается popover
 * @param {string|HTMLElement} content - Контент для отображения в popover (строка или HTML элемент)
 * @param {Object} options - Дополнительные опции для настройки popover
 * @param {string} options.className - CSS класс для popover (по умолчанию 'custom-popover')
 * @param {string} options.position - Позиция popover относительно элемента ('top', 'bottom', 'left', 'right', 'auto')
 * @param {number} options.offset - Отступ от элемента в пикселях (по умолчанию 8)
 * @param {boolean} options.showArrow - Показывать ли стрелку (по умолчанию true)
 * @param {number} options.maxWidth - Максимальная ширина popover в пикселях (по умолчанию 300)
 * @returns {HTMLElement|null} - Созданный popover элемент или null
 */
export function initializePopover(element, content, options = {}) {
    if (!element || !content) {
        return null;
    }

    const {
        className = 'custom-popover',
        position = 'top',
        offset = 8,
        showArrow = true,
        maxWidth = 300
    } = options;

    // Создаем popover элемент
    const popover = document.createElement('div');
    popover.className = className;
    popover.style.maxWidth = maxWidth + 'px';
    
    // Формируем HTML содержимое
    let popoverContent = '';
    if (showArrow) {
        popoverContent += '<div class="custom-popover-arrow"></div>';
    }
    popoverContent += '<div class="custom-popover-content"></div>';
    
    popover.innerHTML = popoverContent;
    
    // Добавляем контент
    const contentElement = popover.querySelector('.custom-popover-content');
    if (typeof content === 'string') {
        contentElement.innerHTML = content;
    } else if (content instanceof HTMLElement) {
        contentElement.appendChild(content);
    }
    
    document.body.appendChild(popover);

    // Функция позиционирования popover
    const positionPopover = () => {
        const rect = element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        let popoverLeft, popoverTop;
        
        switch (position) {
            case 'top':
                popoverLeft = rect.left + scrollX + (rect.width / 2) - (popover.offsetWidth / 2);
                popoverTop = rect.top + scrollY - popover.offsetHeight - offset;
                break;
            case 'bottom':
                popoverLeft = rect.left + scrollX + (rect.width / 2) - (popover.offsetWidth / 2);
                popoverTop = rect.bottom + scrollY + offset;
                break;
            case 'left':
                popoverLeft = rect.left + scrollX - popover.offsetWidth - offset;
                popoverTop = rect.top + scrollY + (rect.height / 2) - (popover.offsetHeight / 2);
                break;
            case 'right':
                popoverLeft = rect.right + scrollX + offset;
                popoverTop = rect.top + scrollY + (rect.height / 2) - (popover.offsetHeight / 2);
                break;
            case 'auto':
            default:
                // Автоматическое позиционирование — выбираем сторону с большим свободным пространством
                const spaceAbove = rect.top;
                const spaceBelow = window.innerHeight - rect.bottom;

                if (spaceAbove >= popover.offsetHeight + offset) {
                    // Помещается сверху
                    popoverLeft = rect.left + scrollX + (rect.width / 2) - (popover.offsetWidth / 2);
                    popoverTop = rect.top + scrollY - popover.offsetHeight - offset;
                } else if (spaceBelow >= popover.offsetHeight + offset) {
                    // Помещается снизу
                    popoverLeft = rect.left + scrollX + (rect.width / 2) - (popover.offsetWidth / 2);
                    popoverTop = rect.bottom + scrollY + offset;
                } else if (spaceAbove >= spaceBelow) {
                    // Не помещается полностью — выбираем сторону с большим пространством (верх)
                    popoverLeft = rect.left + scrollX + (rect.width / 2) - (popover.offsetWidth / 2);
                    popoverTop = rect.top + scrollY - popover.offsetHeight - offset;
                } else {
                    // или низ
                    popoverLeft = rect.left + scrollX + (rect.width / 2) - (popover.offsetWidth / 2);
                    popoverTop = rect.bottom + scrollY + offset;
                }
                break;
        }
        
        // Убеждаемся, что popover не выходит за границы видимой области с учетом скролла
        const minLeft = scrollX + 10;
        const maxLeft = scrollX + window.innerWidth - popover.offsetWidth - 10;
        const minTop = scrollY + 10;
        const maxTop = scrollY + window.innerHeight - popover.offsetHeight - 10;

        popoverLeft = Math.max(minLeft, Math.min(popoverLeft, maxLeft));
        popoverTop = Math.max(minTop, Math.min(popoverTop, maxTop));
        
        popover.style.left = popoverLeft + 'px';
        popover.style.top = popoverTop + 'px';
    };

    // Показываем popover при наведении
    const showPopover = () => {
        popover.style.display = 'block';
        positionPopover();
    };

    // Скрываем popover
    const hidePopover = () => {
        popover.style.display = 'none';
    };

    // Обработка изменения размера окна и скролла
    const handleResize = () => {
        if (popover.style.display === 'block') {
            positionPopover();
        }
    };

    // Добавляем обработчики событий
    element.addEventListener('mouseenter', showPopover);
    element.addEventListener('mouseleave', hidePopover);
    popover.addEventListener('mouseleave', hidePopover);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    // Сохраняем обработчики и опции для очистки
    popover._eventHandlers = {
        elementMouseEnter: showPopover,
        elementMouseLeave: hidePopover,
        popoverMouseLeave: hidePopover,
        handleResize: handleResize
    };
    
    popover._options = options;
    popover._targetElement = element;

    return popover;
}

/**
 * Очищает popover и удаляет все обработчики событий
 * @param {HTMLElement} popover - Popover элемент для очистки
 */
export function cleanupPopover(popover) {
    if (!popover) {
        return;
    }

    // Удаляем обработчики событий
    if (popover._eventHandlers) {
        const handlers = popover._eventHandlers;
        const element = popover._targetElement;
        
        if (element) {
            element.removeEventListener('mouseenter', handlers.elementMouseEnter);
            element.removeEventListener('mouseleave', handlers.elementMouseLeave);
        }
        
        popover.removeEventListener('mouseleave', handlers.popoverMouseLeave);
        window.removeEventListener('resize', handlers.handleResize);
        window.removeEventListener('scroll', handlers.handleResize);
    }

    // Удаляем элемент из DOM
    if (popover.parentNode) {
        popover.parentNode.removeChild(popover);
    }
}

/**
 * Создает и возвращает функцию для обновления содержимого popover'а
 * @param {HTMLElement} popover - Popover элемент
 * @returns {Function} - Функция для обновления содержимого
 */
export function createPopoverContentUpdater(popover) {
    return (newContent) => {
        if (popover && popover.querySelector('.custom-popover-content')) {
            const contentElement = popover.querySelector('.custom-popover-content');
            if (typeof newContent === 'string') {
                contentElement.innerHTML = newContent;
            } else if (newContent instanceof HTMLElement) {
                contentElement.innerHTML = '';
                contentElement.appendChild(newContent);
            }
        }
    };
}

/**
 * Специализированная функция для создания popover с датой (для обратной совместимости)
 * @param {HTMLElement} element - DOM элемент, для которого создается popover
 * @param {string} fullDateTime - Полная дата и время для отображения в popover
 * @returns {HTMLElement|null} - Созданный popover элемент или null
 */
export function initializeDatePopover(element, fullDateTime) {
    return initializePopover(element, fullDateTime, {
        className: 'custom-popover',
        position: 'top',
        offset: 8,
        showArrow: true,
        maxWidth: 300
    });
}

/**
 * Специализированная функция для очистки date popover (для обратной совместимости)
 * @param {HTMLElement} popover - Popover элемент для очистки
 */
export function cleanupDatePopover(popover) {
    cleanupPopover(popover);
}
