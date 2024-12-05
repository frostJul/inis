// Переменные для отслеживания состояния
let draggedElement = null;
let isStickyDrag = false;
let initialPosition = null;
let touchStartTime = 0;
let activeTouches = new Set(); // Для отслеживания количества пальцев на экране
let initialDistance = 0; // Для отслеживания дистанции при масштабировании
let lastTouchTime = 0; // Для определения времени между касаниями
const MIN_SIZE = 20; // Минимальный размер элемента

// Функция начала обычного сенсорного перетаскивания
function onTouchStart(event) {
    activeTouches.add(event.changedTouches[0].identifier); // Добавляем палец
    const touch = event.changedTouches[0];

    if (activeTouches.size > 1) {
        // Масштабирование с двумя пальцами
        initialDistance = getDistance(event.touches[0], event.touches[1]);
        return;
    }

    if (isStickyDrag && draggedElement) {
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
            if (now - lastTouchTime < 300) {
                enableStickyDrag();
            }
            lastTouchTime = now;
        }
    }
}

// Функция перемещения элемента (для обычного и "приклеенного" режима)
function onTouchMove(event) {
    const touch = event.changedTouches[0];
    if (draggedElement) {
        if (isStickyDrag) {
            draggedElement.style.left = `${touch.clientX}px`;
            draggedElement.style.top = `${touch.clientY}px`;
        } else {
            draggedElement.style.left = `${touch.clientX - draggedElement.offsetX}px`;
            draggedElement.style.top = `${touch.clientY - draggedElement.offsetY}px`;
        }
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

// Завершение сенсорного перетаскивания
function onTouchEnd(event) {
    activeTouches.delete(event.changedTouches[0].identifier); // Убираем палец
    if (!isStickyDrag) {
        draggedElement = null;
    } else {
        // Проверка на быстрое касание (выключение режима) — теперь двойное касание
        const touch = event.changedTouches[0];
        const rect = draggedElement.getBoundingClientRect();
        if (
            Math.abs(touch.clientX - rect.left - rect.width / 2) < 5 &&
            Math.abs(touch.clientY - rect.top - rect.height / 2) < 5
        ) {
            disableStickyDrag();
        }
    }

    initialDistance = 0; // Сбросим начальную дистанцию для масштабирования
}

// Включение "приклеенного" режима
function enableStickyDrag() {
    if (draggedElement) {
        isStickyDrag = true;
        draggedElement.style.backgroundColor = "blue"; // Меняем цвет
    }
}

// Отключение "приклеенного" режима
function disableStickyDrag() {
    if (draggedElement) {
        isStickyDrag = false;
        draggedElement.style.backgroundColor = "red"; // Возвращаем цвет
        draggedElement = null;
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

// Изменение размера элемента
function scaleElement(element, scaleFactor) {
    const rect = element.getBoundingClientRect();
    const newWidth = Math.max(MIN_SIZE, rect.width * scaleFactor);
    const newHeight = Math.max(MIN_SIZE, rect.height * scaleFactor);
    element.style.width = `${newWidth}px`;
    element.style.height = `${newHeight}px`;
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
