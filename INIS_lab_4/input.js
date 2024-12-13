// Данные для отслеживания состояния
const state = {
  activeElement: null,
  initialPosition: {},
  resizing: false,
  offsetX: 0,
  offsetY: 0,
  initialWidth: 0,
  initialHeight: 0,
};

// Ограничения на размеры фигуры
const MIN_SIZE = 30;
const MAX_SIZE = 300;

// Функция для сброса состояния
function resetState() {
  if (state.activeElement) {
    const element = state.activeElement;
    element.style.left = `${state.initialPosition.left}px`;
    element.style.top = `${state.initialPosition.top}px`;
    state.activeElement = null;
    state.resizing = false;
  }
}

// Обработчики для всех .target
const targets = document.querySelectorAll(".target");
targets.forEach((target) => {
  target.addEventListener("pointerdown", (event) => {
    if (state.activeElement && event.pointerType === "touch") {
      resetState();
      return;
    }

    if (event.target.classList.contains("resizer")) {
      // Начинаем изменение размера
      state.activeElement = target;
      state.resizing = true;
      state.initialWidth = target.offsetWidth;
      state.initialHeight = target.offsetHeight;
      state.offsetX = event.clientX;
      state.offsetY = event.clientY;
    } else if (event.target.classList.contains("target")) {
      // Начинаем перетаскивание или выделение
      if (!state.activeElement) {
        state.activeElement = target;
        state.initialPosition = {
          left: parseInt(target.style.left, 10),
          top: parseInt(target.style.top, 10),
        };

        if (target.style.backgroundColor === "blue") {
          target.style.backgroundColor = "red";
          state.activeElement = null;
        } else {
          target.style.backgroundColor = "blue";
          state.offsetX = event.clientX - target.getBoundingClientRect().left;
          state.offsetY = event.clientY - target.getBoundingClientRect().top;
        }
      }
    }
  });

  target.addEventListener("pointermove", (event) => {
    if (state.activeElement) {
      if (state.resizing) {
        // Изменение размера
        const deltaX = event.clientX - state.offsetX;
        const deltaY = event.clientY - state.offsetY;

        const newWidth = Math.min(
          Math.max(state.initialWidth + deltaX, MIN_SIZE),
          MAX_SIZE
        );
        const newHeight = Math.min(
          Math.max(state.initialHeight + deltaY, MIN_SIZE),
          MAX_SIZE
        );

        state.activeElement.style.width = `${newWidth}px`;
        state.activeElement.style.height = `${newHeight}px`;
      } else {
        // Перетаскивание
        const newLeft = event.clientX - state.offsetX;
        const newTop = event.clientY - state.offsetY;

        state.activeElement.style.left = `${newLeft}px`;
        state.activeElement.style.top = `${newTop}px`;
      }
    }
  });

  target.addEventListener("pointerup", () => {
    state.resizing = false;
  });

  // Добавление черного квадрата для изменения размера
  const resizer = document.createElement("div");
  resizer.className = "resizer";
  resizer.style.position = "absolute";
  resizer.style.width = "10px";
  resizer.style.height = "10px";
  resizer.style.backgroundColor = "black";
  resizer.style.top = "0";
  resizer.style.left = "0";
  resizer.style.cursor = "nwse-resize";

  target.appendChild(resizer);
});
