// Получаем сохраненные данные футболки из localStorage
const selectedShirt = JSON.parse(localStorage.getItem('selectedShirt'));

// Элементы, куда будем вставлять информацию
const shirtImageContainer = document.getElementById('shirt-image');
const shirtName = document.getElementById('shirt-name');
const shirtPrice = document.getElementById('shirt-price');
const shirtDescription = document.getElementById('shirt-description');
const colorOptionsContainer = document.getElementById('color-options');

// Устанавливаем начальные значения
shirtName.textContent = selectedShirt.name;
shirtPrice.textContent = selectedShirt.price;
shirtDescription.textContent = selectedShirt.description;

// Установка начального изображения (лицевая сторона, первый цвет)
let currentSide = 'front';
let currentColor = Object.keys(selectedShirt.colors)[0];
updateShirtImage();

// Функция для обновления изображения футболки
function updateShirtImage() {
    shirtImageContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = selectedShirt.colors[currentColor][currentSide];
    img.alt = `${selectedShirt.name} - ${currentColor} - ${currentSide}`;
    shirtImageContainer.appendChild(img);
}

// Добавляем кнопки для выбора стороны (Front/Back)
document.getElementById('front-side').addEventListener('click', () => {
    currentSide = 'front';
    updateShirtImage();
});

document.getElementById('back-side').addEventListener('click', () => {
    currentSide = 'back';
    updateShirtImage();
});

// Генерация кнопок для цветов
Object.keys(selectedShirt.colors).forEach(color => {
    const colorButton = document.createElement('button');
    colorButton.className = 'color-button';
    colorButton.textContent = color.charAt(0).toUpperCase() + color.slice(1); // Название цвета
    colorButton.style.borderColor = 'black';
    colorButton.style.color = 'black';
    colorButton.style.backgroundColor = color === 'white' ? 'white' : color; // Белая кнопка без заливки

    colorButton.addEventListener('click', () => {
        currentColor = color;
        updateShirtImage();
    });

    colorOptionsContainer.appendChild(colorButton);
});
