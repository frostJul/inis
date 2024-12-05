// Переменные для отслеживания состояния
let draggedElement = null;
let isStickyDrag = false;
let initialPosition = null;
let touchStartTime = 0;
let activeTouches = new Set(); // Для отслеживания пальцев на экране
let initialDistance = 0; // Для отслеживания дистанции при масштабировании
const MIN_SIZE = 20; // Минимальный размер элемента
const MAX_SIZE = 400; // Максимальный размер элемента

// Функция начала сенсорного перетаскивания
function onTouchStart(event) {
    event.preventDefault();  // Предотвращаем приближение экрана при двойном касании

    const touch = event.changedTouches[0];
    activeTouches.add(touch.identifier); // Добавляем палец

    // Если два пальца, инициируем масштабирование
    if (event.touches.length === 2) {
        initialDistance = getDistance(event.touches[0], event.touches[1]);
    }

    if (activeTouches.size > 1) {
        resetDrag(); // Если второй палец касается экрана, отменяем перетаскивание
        return;
    }

    if (isStickyDrag && draggedElement) {
        // "Приклеенный" элемент следует за пальцем
        draggedElement.style.left = `${touch.clientX}px`;
        draggedElement.style.top = `${touch.clientY}px`;
    } else {
        const target = event.target.closest(".target");
        if (target) {
            draggedElement = target;
            const rect = draggedElement.getBoundingClientRect();
            initialPosition = { top: rect.top, left: rect.left }; // Сохраняем начальную позицию
            draggedElement.offsetX = touch.clientX - rect.left;
            draggedElement.offsetY = touch.clientY - rect.top;

            // Для определения двойного касания
            const now = Date.now();
            if (now - touchStartTime < 300) {
                toggleStickyDrag();
            }
            touchStartTime = now;
        }
    }
}

// Функция перемещения элемента (для обычного и "приклеенного" режима)
function onTouchMove(event) {
    if (draggedElement) {
        const touch = event.changedTouches[0];

        if (isStickyDrag) {
            // Приклеенный элемент движется с пальцем
            draggedElement.style.left = `${touch.clientX}px`;
            draggedElement.style.top = `${touch.clientY}px`;
        } else {
            // Обычное перетаскивание
            draggedElement.style.left = `${touch.clientX - draggedElement.offsetX}px`;
            draggedElement.style.top = `${touch.clientY - draggedElement.offsetY}px`;

            // Масштабирование элемента при перетаскивании вверх/вниз
            const deltaY = touch.clientY - initialPosition.top;
            const scaleFactor = deltaY > 0 ? 0.9 : 1.1; // Уменьшение вниз, увеличение вверх
            scaleElement(draggedElement, scaleFactor);
        }

        // Масштабирование с двумя пальцами
        if (event.touches.length === 2) {
            const newDistance = getDistance(event.touches[0], event.touches[1]);
            if (initialDistance !== 0) {
                const scaleFactor = newDistance / initialDistance;
                scaleElement(draggedElement, scaleFactor);
            }
        }
    }
}

// Завершение сенсорного перетаскивания
function onTouchEnd(event) {
    const touch = event.changedTouches[0];
    activeTouches.delete(touch.identifier); // Убираем палец

    if (!isStickyDrag) {
        draggedElement = null;
    } else {
        // Проверка на быстрое касание (выключение режима)
        const rect = draggedElement.getBoundingClientRect();
        if (
            Math.abs(touch.clientX - rect.left - rect.width / 2) < 5 &&
            Math.abs(touch.clientY - rect.top - rect.height / 2) < 5
        ) {
            toggleStickyDrag();
        }
    }

    // Сбросим начальную дистанцию для масштабирования
    initialDistance = 0;
}

// Включение или отключение "приклеенного" режима
function toggleStickyDrag() {
    if (draggedElement) {
        isStickyDrag = !isStickyDrag;
        if (isStickyDrag) {
            draggedElement.style.backgroundColor = "blue"; // Меняем цвет
        } else {
            draggedElement.style.backgroundColor = "red"; // Возвращаем цвет
        }
    }
}

// Сброс действий (аналог клавиши Esc)
function resetDrag() {
    if (draggedElement) {
        draggedElement.style.left = `${initialPosition.left}px`;
        draggedElement.style.top = `${initialPosition.top}px`;
        draggedElement.style.backgroundColor = "red";
        draggedElement = null;
        isStickyDrag = false;
    }
}

// Изменение размера элемента с учетом минимального и максимального размера
function scaleElement(element, scaleFactor) {
    const rect = element.getBoundingClientRect();
    const newWidth = Math.max(MIN_SIZE, Math.min(MAX_SIZE, rect.width * scaleFactor));
    const newHeight = Math.max(MIN_SIZE, Math.min(MAX_SIZE, rect.height * scaleFactor));
    
    // Сохраняем пропорции, масштабируя одинаково ширину и высоту
    const aspectRatio = rect.width / rect.height;
    if (newWidth / aspectRatio >= MIN_SIZE && newWidth / aspectRatio <= MAX_SIZE) {
        element.style.width = `${newWidth}px`;
        element.style.height = `${newWidth / aspectRatio}px`;
    }
}

// Вычисление расстояния между двумя точками
function getDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// Обработчик события мыши для изменения размера
function onMouseWheel(event) {
    event.preventDefault();
    const target = event.target.closest(".target");
    if (target) {
        const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
        scaleElement(target, scaleFactor);
    }
}

// Добавляем слушатели событий
document.addEventListener("touchstart", onTouchStart);
document.addEventListener("touchmove", onTouchMove);
document.addEventListener("touchend", onTouchEnd);
document.addEventListener("wheel", onMouseWheel);

// Удаляем пальцы из активных, если touchcancel (например, из-за системных событий)
document.addEventListener("touchcancel", (event) => {
    for (const touch of event.changedTouches) {
        activeTouches.delete(touch.identifier);
    }
});
