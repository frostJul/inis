// Переменные для отслеживания состояния
let draggedElement = null;
let isStickyDrag = false; // Режим "следующий за пальцем"
let initialPosition = null;
let touchStartTime = 0;
let activeTouches = new Set(); // Для отслеживания пальцев на экране
let initialDistance = 0; // Для отслеживания дистанции при масштабировании
let initialWidth = 0; // Начальная ширина элемента
let initialHeight = 0; // Начальная высота элемента

// Минимальный и максимальный размер элемента
const MIN_SIZE = 20;
const MAX_SIZE = 300;

// Функция начала сенсорного перетаскивания
function onTouchStart(event) {
    event.preventDefault(); // Чтобы предотвратить стандартное приближение экрана

    activeTouches.add(event.changedTouches[0].identifier); // Добавляем палец
    if (activeTouches.size > 1) {
        resetDrag(); // Если второй палец касается экрана, отменяем перетаскивание
        return;
    }

    const touch = event.changedTouches[0];

    const target = event.target.closest(".target");
    if (target) {
        draggedElement = target;
        const rect = draggedElement.getBoundingClientRect();
        initialPosition = { top: rect.top, left: rect.left }; // Сохраняем начальную позицию
        draggedElement.offsetX = touch.clientX - rect.left;
        draggedElement.offsetY = touch.clientY - rect.top;
        initialWidth = rect.width;
        initialHeight = rect.height;

        // Для определения одиночного нажатия
        const now = Date.now();
        if (now - touchStartTime < 300) {
            toggleStickyDrag();
        }
        touchStartTime = now;
    }

    // Инициализация расстояния для масштабирования, если два пальца
    if (event.touches.length === 2) {
        initialDistance = getDistance(event.touches[0], event.touches[1]);
    }
}

// Функция перемещения элемента (для обычного и "приклеенного" режима)
function onTouchMove(event) {
    if (!draggedElement) return;

    const touch = event.changedTouches[0];

    draggedElement.style.left = `${touch.clientX - draggedElement.offsetX}px`;
    draggedElement.style.top = `${touch.clientY - draggedElement.offsetY}px`;

    // Масштабирование с двумя пальцами
    if (event.touches.length === 2) {
        const newDistance = getDistance(event.touches[0], event.touches[1]);

        // Масштабируем пропорционально
        const scaleFactor = newDistance / initialDistance;
        const newWidth = Math.max(MIN_SIZE, Math.min(initialWidth * scaleFactor, MAX_SIZE));
        const newHeight = Math.max(MIN_SIZE, Math.min(initialHeight * scaleFactor, MAX_SIZE));

        draggedElement.style.width = `${newWidth}px`;
        draggedElement.style.height = `${newHeight}px`;
    }
}

// Завершение сенсорного перетаскивания
function onTouchEnd(event) {
    activeTouches.delete(event.changedTouches[0].identifier); // Убираем палец
    if (!isStickyDrag) {
        draggedElement = null;
    }
}

// Включение/выключение "приклеенного" режима
function toggleStickyDrag() {
    if (draggedElement) {
        if (isStickyDrag) {
            disableStickyDrag();
        } else {
            enableStickyDrag();
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

// Функция для создания элемента изменения размера
function createResizeHandle(element) {
    const handle = document.createElement("div");
    handle.style.position = "absolute";
    handle.style.width = "20px";
    handle.style.height = "20px";
    handle.style.backgroundColor = "black";
    handle.style.top = "0";
    handle.style.right = "0";
    handle.style.cursor = "se-resize"; // Курсор для изменения размера
    element.appendChild(handle);

    handle.addEventListener("touchstart", (event) => {
        event.preventDefault();
        const startTouch = event.changedTouches[0];
        const initialWidth = element.offsetWidth;
        const initialHeight = element.offsetHeight;
        const initialX = startTouch.clientX;
        const initialY = startTouch.clientY;

        function onResizeMove(event) {
            const moveTouch = event.changedTouches[0];
            const deltaX = moveTouch.clientX - initialX;
            const deltaY = moveTouch.clientY - initialY;

            const newWidth = Math.max(MIN_SIZE, Math.min(initialWidth + deltaX, MAX_SIZE));
            const newHeight = Math.max(MIN_SIZE, Math.min(initialHeight + deltaY, MAX_SIZE));

            element.style.width = `${newWidth}px`;
            element.style.height = `${newHeight}px`;
        }

        function onResizeEnd() {
            document.removeEventListener("touchmove", onResizeMove);
            document.removeEventListener("touchend", onResizeEnd);
        }

        document.addEventListener("touchmove", onResizeMove);
        document.addEventListener("touchend", onResizeEnd);
    });
}

// Добавляем элементы и функционал
function createTargetElement(x, y) {
    const divElement = document.createElement("div");
    divElement.classList.add("target");
    divElement.style.position = "absolute";
    divElement.style.top = `${y}px`;
    divElement.style.left = `${x}px`;
    divElement.style.width = "100px";
    divElement.style.height = "100px";
    divElement.style.backgroundColor = "red";
    document.body.appendChild(divElement);

    createResizeHandle(divElement);
}

// Создаем примеры элементов
createTargetElement(100, 100);
createTargetElement(300, 300);
createTargetElement(500, 500);

// Добавляем слушатели событий
document.addEventListener("touchstart", onTouchStart);
document.addEventListener("touchmove", onTouchMove);
document.addEventListener("touchend", onTouchEnd);
document.addEventListener("touchcancel", (event) => {
    for (const touch of event.changedTouches) {
        activeTouches.delete(touch.identifier);
    }
});
