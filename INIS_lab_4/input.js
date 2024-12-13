// Глобальное состояние
const state = {
    draggedElement: null,
    isStickyDrag: false,
    initialPosition: null,
    touchStartTime: 0,
    activeTouches: new Set(),
    initialDistance: 0,
    initialSize: { width: 0, height: 0 },
};

// Константы
const MIN_SIZE = 20;
const MAX_SIZE = 300;

// Функции
function onTouchStart(event) {
    event.preventDefault();
    const touch = event.changedTouches[0];
    state.activeTouches.add(touch.identifier);

    // Обработка одного элемента
    const target = event.target.closest(".target");
    if (target) {
        startDragging(target, touch);
    }

    // Масштабирование двумя пальцами
    if (event.touches.length === 2) {
        state.initialDistance = getDistance(event.touches[0], event.touches[1]);
    }
}

function startDragging(element, touch) {
    state.draggedElement = element;
    const rect = element.getBoundingClientRect();
    state.initialPosition = { top: rect.top, left: rect.left };
    state.initialSize = { width: rect.width, height: rect.height };

    element.offsetX = touch.clientX - rect.left;
    element.offsetY = touch.clientY - rect.top;

    // Проверка на быстрое нажатие
    const now = Date.now();
    if (now - state.touchStartTime < 300) {
        toggleStickyDrag(element);
    }
    state.touchStartTime = now;
}

function onTouchMove(event) {
    if (state.draggedElement) {
        moveElement(state.draggedElement, event.changedTouches[0]);
    }

    if (event.touches.length === 2) {
        scaleElement(event.touches);
    }
}

function moveElement(element, touch) {
    element.style.left = `${touch.clientX - element.offsetX}px`;
    element.style.top = `${touch.clientY - element.offsetY}px`;
}

function scaleElement(touches) {
    const newDistance = getDistance(touches[0], touches[1]);
    const scaleFactor = newDistance / state.initialDistance;

    const newWidth = Math.max(
        MIN_SIZE,
        Math.min(state.initialSize.width * scaleFactor, MAX_SIZE)
    );
    const newHeight = Math.max(
        MIN_SIZE,
        Math.min(state.initialSize.height * scaleFactor, MAX_SIZE)
    );

    state.draggedElement.style.width = `${newWidth}px`;
    state.draggedElement.style.height = `${newHeight}px`;
}

function onTouchEnd(event) {
    state.activeTouches.delete(event.changedTouches[0].identifier);
    if (!state.isStickyDrag) {
        state.draggedElement = null;
    }
}

function toggleStickyDrag(element) {
    if (state.isStickyDrag) {
        disableStickyDrag(element);
    } else {
        enableStickyDrag(element);
    }
}

function enableStickyDrag(element) {
    state.isStickyDrag = true;
    element.style.backgroundColor = "blue";
}

function disableStickyDrag(element) {
    state.isStickyDrag = false;
    element.style.backgroundColor = "red";
}

function createResizeHandle(element) {
    const handle = document.createElement("div");
    handle.className = "resize-handle";
    element.appendChild(handle);

    handle.addEventListener("touchstart", (event) => {
        event.preventDefault();
        const touch = event.changedTouches[0];
        const { width, height } = element.getBoundingClientRect();
        const startX = touch.clientX;
        const startY = touch.clientY;

        function onResizeMove(event) {
            const deltaX = event.changedTouches[0].clientX - startX;
            const deltaY = event.changedTouches[0].clientY - startY;
            const newWidth = Math.max(MIN_SIZE, Math.min(width + deltaX, MAX_SIZE));
            const newHeight = Math.max(MIN_SIZE, Math.min(height + deltaY, MAX_SIZE));

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

function createTargetElement(x, y, color = "red") {
    const div = document.createElement("div");
    div.className = "target";
    div.style.cssText = `
        position: absolute;
        top: ${y}px;
        left: ${x}px;
        width: 100px;
        height: 100px;
        background-color: ${color};
    `;
    createResizeHandle(div);
    document.body.appendChild(div);
}

function getDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// Создаем элементы
createTargetElement(100, 100);
createTargetElement(300, 300);
createTargetElement(500, 500);

// Слушатели
document.addEventListener("touchstart", onTouchStart);
document.addEventListener("touchmove", onTouchMove);
document.addEventListener("touchend", onTouchEnd);
