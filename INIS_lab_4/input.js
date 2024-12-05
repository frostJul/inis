// Переменные для отслеживания состояния
let draggedElement = null;
let isStickyDrag = false;
let initialPosition = null;
let touchStartTime = 0;
let activeTouches = new Set(); // Для отслеживания пальцев на экране
let initialDistance = 0; // Для отслеживания дистанции при масштабировании
const MIN_SIZE = 20; // Минимальный размер элемента
const MAX_SCALE = 2; // Максимальный коэффициент увеличения
let initialWidth = 0; // Начальная ширина элемента
let initialHeight = 0; // Начальная высота элемента

// Функция начала сенсорного перетаскивания
function onTouchStart(event) {
    event.preventDefault(); // Чтобы предотвратить стандартное приближение экрана

    activeTouches.add(event.changedTouches[0].identifier); // Добавляем палец
    if (activeTouches.size > 1) {
        resetDrag(); // Если второй палец касается экрана, отменяем перетаскивание
        return;
    }

    const touch = event.changedTouches[0];

    if (isStickyDrag && draggedElement) {
        draggedElement.style.left = `${touch.clientX - draggedElement.offsetX}px`;
        draggedElement.style.top = `${touch.clientY - draggedElement.offsetY}px`;
    } else {
        const target = event.target.closest(".target");
        if (target) {
            draggedElement = target;
            const rect = draggedElement.getBoundingClientRect();
            initialPosition = { top: rect.top, left: rect.left }; // Сохраняем начальную позицию
            draggedElement.offsetX = touch.clientX - rect.left;
            draggedElement.offsetY = touch.clientY - rect.top;
            initialWidth = rect.width;
            initialHeight = rect.height;

            // Для определения двойного касания
            const now = Date.now();
            if (now - touchStartTime < 300) {
                enableStickyDrag();
            }
            touchStartTime = now;
        }
    }

    // Инициализация расстояния для масштабирования, если два пальца
    if (event.touches.length === 2) {
        initialDistance = getDistance(event.touches[0], event.touches[1]);
    }
}

// Функция перемещения элемента (для обычного и "приклеенного" режима)
function onTouchMove(event) {
    const touch = event.changedTouches[0];

    if (draggedElement) {
        if (isStickyDrag) {
            draggedElement.style.left = `${touch.clientX - draggedElement.offsetX}px`;
            draggedElement.style.top = `${touch.clientY - draggedElement.offsetY}px`;
        } else {
            draggedElement.style.left = `${touch.clientX - draggedElement.offsetX}px`;
            draggedElement.style.top = `${touch.clientY - draggedElement.offsetY}px`;
        }
    }

    // Масштабирование с двумя пальцами
    if (event.touches.length === 2) {
        const newDistance = getDistance(event.touches[0], event.touches[1]);
        const scaleFactor = newDistance / initialDistance;

        // Масштабируем пропорционально и ограничиваем максимальным коэффициентом
        const newWidth = Math.max(MIN_SIZE, Math.min(initialWidth * scaleFactor, initialWidth * MAX_SCALE));
        const newHeight = Math.max(MIN_SIZE, Math.min(initialHeight * scaleFactor, initialHeight * MAX_SCALE));

        draggedElement.style.width = `${newWidth}px`;
        draggedElement.style.height = `${newHeight}px`;
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

// Вычисление расстояния между двумя точками
function getDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// Добавляем слушатели событий
document.addEventListener("touchstart", onTouchStart);
document.addEventListener("touchmove", onTouchMove);
document.addEventListener("touchend", onTouchEnd);
document.addEventListener("touchcancel", (event) => {
    for (const touch of event.changedTouches) {
        activeTouches.delete(touch.identifier);
    }
});

// Убираем стандартное масштабирование при двойном касании
document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
});
