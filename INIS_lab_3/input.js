// Переменные для отслеживания состояния
let draggedElement = null;
let isStickyDrag = false;
let initialPosition = null;

// Функция для обработки начала обычного перетаскивания
function onMouseDown(event) {
    if (isStickyDrag) return; // Игнорируем, если активен "приклеенный" режим
    if (event.target.classList.contains("target")) {
        draggedElement = event.target;
        const rect = draggedElement.getBoundingClientRect();
        initialPosition = { top: rect.top, left: rect.left }; // Сохраняем исходную позицию
        draggedElement.offsetX = event.clientX - rect.left;
        draggedElement.offsetY = event.clientY - rect.top;
    }
}

// Функция для обработки перемещения
function onMouseMove(event) {
    if (draggedElement) {
        draggedElement.style.left = `${event.clientX - draggedElement.offsetX}px`;
        draggedElement.style.top = `${event.clientY - draggedElement.offsetY}px`;
    } else if (isStickyDrag && draggedElement) {
        // Для "приклеенного" режима
        draggedElement.style.left = `${event.clientX}px`;
        draggedElement.style.top = `${event.clientY}px`;
    }
}

// Функция для обработки завершения обычного перетаскивания
function onMouseUp() {
    if (!isStickyDrag) {
        draggedElement = null;
    }
}

// Функция для обработки двойного клика (включение "приклеенного" режима)
function onDoubleClick(event) {
    if (event.target.classList.contains("target")) {
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
}

// Функция для обработки нажатия клавиши Esc
function onKeyDown(event) {
    if (event.key === "Escape") {
        if (draggedElement) {
            // Возврат элемента на исходную позицию
            draggedElement.style.left = `${initialPosition.left}px`;
            draggedElement.style.top = `${initialPosition.top}px`;
            draggedElement.style.backgroundColor = "red"; // Возвращаем цвет
            draggedElement = null;
            isStickyDrag = false;
        }
    }
}

// Добавляем слушатели событий
document.addEventListener("mousedown", onMouseDown);
document.addEventListener("mousemove", onMouseMove);
document.addEventListener("mouseup", onMouseUp);
document.addEventListener("dblclick", onDoubleClick);
document.addEventListener("keydown", onKeyDown);
