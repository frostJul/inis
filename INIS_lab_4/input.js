// Переменные для отслеживания состояния
let draggedElement = null;
let isStickyDrag = false;
let initialPosition = null;
let isTouchDragging = false;
let lastTouchTime = 0; // Время последнего касания
let touchDelay = 300; // Максимальное время для распознавания двойного касания (в миллисекундах)

// Функция для обработки начала обычного перетаскивания (мышь или сенсор)
function onStart(event) {
    const isTouch = event.type === "touchstart";
    const point = isTouch ? event.touches[0] : event;

    if (isStickyDrag) return; // Игнорируем, если активен "приклеенный" режим

    if (event.target.classList.contains("target")) {
        draggedElement = event.target;
        const rect = draggedElement.getBoundingClientRect();
        initialPosition = { top: rect.top, left: rect.left }; // Сохраняем исходную позицию
        draggedElement.offsetX = point.clientX - rect.left;
        draggedElement.offsetY = point.clientY - rect.top;
        isTouchDragging = isTouch;
        event.preventDefault();
    }
}

// Функция для обработки перемещения (мышь или сенсор)
function onMove(event) {
    const isTouch = event.type === "touchmove";
    const point = isTouch ? event.touches[0] : event;

    if (draggedElement) {
        draggedElement.style.left = `${point.clientX - draggedElement.offsetX}px`;
        draggedElement.style.top = `${point.clientY - draggedElement.offsetY}px`;
        event.preventDefault();
    } else if (isStickyDrag && draggedElement) {
        draggedElement.style.left = `${point.clientX}px`;
        draggedElement.style.top = `${point.clientY}px`;
    }
}

// Функция для обработки завершения обычного перетаскивания (мышь или сенсор)
function onEnd(event) {
    if (!isStickyDrag) {
        draggedElement = null;
        isTouchDragging = false;
    }
}

// Функция для обработки двойного касания (включение "приклеенного" режима)
function onDoubleTap(event) {
    if (event.target.classList.contains("target")) {
        const currentTime = new Date().getTime();
        if (currentTime - lastTouchTime <= touchDelay) {
            // Обрабатываем двойное касание
            if (!isStickyDrag) {
                draggedElement = event.target;
                draggedElement.style.backgroundColor = "blue"; // Меняем цвет
                isStickyDrag = true;
            } else {
                // Отключение "приклеенного" режима
                draggedElement.style.backgroundColor = "red"; // Возвращаем цвет
                draggedElement = null;
                isStickyDrag = false;
            }
        }
        lastTouchTime = currentTime;
    }
}

// Функция для обработки нажатия клавиши Esc или второго касания
function onKeyDownOrSecondTouch(event) {
    const isSecondTouch = event.type === "touchstart" && event.touches.length > 1;
    const isEscapeKey = event.key === "Escape";

    if (isSecondTouch || isEscapeKey) {
        if (draggedElement) {
            // Возврат элемента на исходную позицию
            draggedElement.style.left = `${initialPosition.left}px`;
            draggedElement.style.top = `${initialPosition.top}px`;
            draggedElement.style.backgroundColor = "red"; // Возвращаем цвет
            draggedElement = null;
            isStickyDrag = false;
            isTouchDragging = false;
        }
    }
}

// Добавляем слушатели событий для мыши
document.addEventListener("mousedown", onStart);
document.addEventListener("mousemove", onMove);
document.addEventListener("mouseup", onEnd);
document.addEventListener("dblclick", onDoubleTap);
document.addEventListener("keydown", onKeyDownOrSecondTouch);

// Добавляем слушатели событий для сенсорного экрана
document.addEventListener("touchstart", onStart);
document.addEventListener("touchmove", onMove);
document.addEventListener("touchend", onEnd);
document.addEventListener("touchstart", onDoubleTap);
