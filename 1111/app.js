// Функция для генерации HTML карточек для маек
function generateShirtProducts(shirts) {
    const productContainer = document.getElementById('products'); // Контейнер для карточек

    shirts.forEach(shirt => {
        // Создаем карточку товара
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        // Добавляем изображение передней стороны футболки (по умолчанию если нет изображения)
        const img = document.createElement('img');
        const defaultColor = Object.keys(shirt.colors)[0]; // Берем первый доступный цвет
        img.src = shirt.colors[defaultColor]?.front || shirt.default.front;
        img.alt = shirt.name;

        // Добавляем название футболки
        const name = document.createElement('h3');
        name.textContent = shirt.name || 'Unnamed T-Shirt';

        // Добавляем описание футболки
        const description = document.createElement('p');
        description.textContent = shirt.description || 'No description available.';

        // Добавляем цену футболки
        const price = document.createElement('p');
        price.textContent = `Price: ${shirt.price}`;

        // Кнопка Quick View
        const quickViewButton = document.createElement('button');
        quickViewButton.textContent = 'Quick View';
        quickViewButton.addEventListener('click', () => showQuickView(shirt));

        // Кнопка See Page (пока без функционала)
        const seePageButton = document.createElement('button');
        seePageButton.textContent = 'See Page';

        // Добавляем элементы в карточку товара
        productCard.appendChild(img);
        productCard.appendChild(name);
        productCard.appendChild(description);
        productCard.appendChild(price);
        productCard.appendChild(quickViewButton);
        productCard.appendChild(seePageButton);

        // Добавляем карточку товара в контейнер
        productContainer.appendChild(productCard);
    });
}

// Функция для показа Quick View
function showQuickView(shirt) {
    const quickViewSection = document.getElementById('quick-view');
    const quickViewContent = document.getElementById('quick-view-content');
    quickViewContent.innerHTML = ''; // Очищаем предыдущее содержимое

    const img = document.createElement('img');
    const defaultColor = Object.keys(shirt.colors)[0]; // Первый цвет
    img.src = shirt.colors[defaultColor]?.front || shirt.default.front;
    img.alt = shirt.name;

    const name = document.createElement('h3');
    name.textContent = shirt.name;

    const description = document.createElement('p');
    description.textContent = shirt.description;

    const price = document.createElement('p');
    price.textContent = `Price: ${shirt.price}`;

    // Добавляем элементы в Quick View
    quickViewContent.appendChild(img);
    quickViewContent.appendChild(name);
    quickViewContent.appendChild(description);
    quickViewContent.appendChild(price);

    // Показываем секцию Quick View
    quickViewSection.style.display = 'block';
}

// Закрытие Quick View
document.getElementById('close-quick-view').addEventListener('click', function() {
    document.getElementById('quick-view').style.display = 'none';
});

// Вызываем функцию для генерации продуктов при загрузке страницы
generateShirtProducts(shirts);
