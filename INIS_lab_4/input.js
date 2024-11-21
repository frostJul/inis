// Переменные для отслеживания состояния
let draggedElement = null;
let isStickyDrag = false;
let initialPosition = null;
let touchStartTime = 0;
let activeTouches = new Set(); // Для отслеживания количества пальцев на экране
const MIN_SIZE = 30; // Минимальный размер элемента

// Функция начала обычного сенсорного перетаскивания
function onTouchStart(event) {
    activeTouches.add(event.changedTouches[0].identifier); // Добавляем палец
    if (activeTouches.size > 1) {
        resetDrag(); // Если второй палец касается экрана, отменяем перетаскивание
        return;
    }

    const touch = event.changedTouches[0];
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
            if (now - touchStartTime < 300) {
                enableStickyDrag();
            }
            touchStartTime = now;
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
}

// Завершение сенсорного перетаскивания
function onTouchEnd(event) {
    activeTouches.delete(event.changedTouches[0].identifier); // Убираем палец
    if (!isStickyDrag) {
        draggedElement = null;
    } else {
        // Проверка на быстрое касание (выключение режима)
        const touch = event.changedTouches[0];
        const rect = draggedElement.getBoundingClientRect();
        if (
            Math.abs(touch.clientX - rect.left - rect.width / 2) < 5 &&
            Math.abs(touch.clientY - rect.top - rect.height / 2) < 5
        ) {
            disableStickyDrag();
        }
    }
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
function onResize(event) {
    const target = event.target.closest(".target");
    if (target) {
        const rect = target.getBoundingClientRect();
        const newWidth = Math.max(MIN_SIZE, rect.width + event.deltaX);
        const newHeight = Math.max(MIN_SIZE, rect.height + event.deltaY);
        target.style.width = `${newWidth}px`;
        target.style.height = `${newHeight}px`;
    }
}

// Обработчик события мыши для изменения размера
function onMouseWheel(event) {
    event.preventDefault();
    onResize(event);
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
