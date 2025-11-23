// Хранилище пользователей
const userStorage = {
    load: function() {
        const stored = localStorage.getItem('users');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                return [];
            }
        }
        
        // Моки
        return [
            {id: 1, firstName: 'Иван', lastName: 'Иванов', age: 25, email: 'ivan@example.com', avatar: null},
            {id: 2, firstName: 'Мария', lastName: 'Петрова', age: 17, email: 'maria@example.com', avatar: null},
            {id: 3, firstName: 'Алексей', lastName: 'Сидоров', age: 30, email: 'alexey@example.com', avatar: null},
            {id: 4, firstName: 'Елена', lastName: 'Козлова', age: 22, email: 'elena@example.com', avatar: null},
            {id: 5, firstName: 'Дмитрий', lastName: 'Морозов', age: 19, email: 'dmitry@example.com', avatar: null},
            {id: 6, firstName: 'Анна', lastName: 'Волкова', age: 28, email: 'anna@example.com', avatar: null},
            {id: 7, firstName: 'Сергей', lastName: 'Новиков', age: 35, email: 'sergey@example.com', avatar: null},
            {id: 8, firstName: 'Ольга', lastName: 'Смирнова', age: 24, email: 'olga@example.com', avatar: null},
            {id: 9, firstName: 'Андрей', lastName: 'Кузнецов', age: 21, email: 'andrey@example.com', avatar: null},
            {id: 10, firstName: 'Татьяна', lastName: 'Попова', age: 29, email: 'tatyana@example.com', avatar: null},
            {id: 11, firstName: 'Михаил', lastName: 'Лебедев', age: 31, email: 'mikhail@example.com', avatar: null},
            {id: 12, firstName: 'Наталья', lastName: 'Козлова', age: 26, email: 'natalya@example.com', avatar: null},
            {id: 13, firstName: 'Денис', lastName: 'Медведев', age: 23, email: 'denis@example.com', avatar: null},
            {id: 14, firstName: 'Екатерина', lastName: 'Васильева', age: 27, email: 'ekaterina@example.com', avatar: null},
            {id: 15, firstName: 'Роман', lastName: 'Петров', age: 32, email: 'roman@example.com', avatar: null},
            {id: 16, firstName: 'Ирина', lastName: 'Соколова', age: 20, email: 'irina@example.com', avatar: null},
            {id: 17, firstName: 'Владимир', lastName: 'Макаров', age: 33, email: 'vladimir@example.com', avatar: null},
            {id: 18, firstName: 'Александра', lastName: 'Андреева', age: 22, email: 'alexandra@example.com', avatar: null}
        ];
    },
    
    save: function(users) {
        try {
            const serializedData = JSON.stringify(users);
            localStorage.setItem('users', serializedData);
        } catch (error) {
            if (error instanceof QuotaExceededError) {
                console.warn('Превышено ограничение localStorage, очищаем данные');
                // Очищаем аватары
                const usersWithoutLargeAvatars = users.map(user => ({
                    ...user,
                    avatar: user.avatar && user.avatar.length > 1000 ? null : user.avatar
                }));
                localStorage.setItem('users', JSON.stringify(usersWithoutLargeAvatars));
            } else {
                console.error('Ошибка при сохранении данных:', error);
            }
        }
    },
    
    updateAvatar: function(userId, avatarUrl) {
        const users = this.load();
        const user = users.find(user => user.id === userId);
        if (user) {
            user.avatar = avatarUrl;
            this.save(users);
        }
    }
};

// Фильтрация и сортировка
const userFilters = {
    byAge: function(users, minAge) {
        if (!minAge) return users;
        return users.filter(user => user.age >= minAge);
    },
    
    bySort: function(users, sortBy) {
        if (!sortBy) return users;
        
        return [...users].sort((a, b) => {
            if (sortBy === 'name') {
                const nameA = `${a.firstName} ${a.lastName}`;
                const nameB = `${b.firstName} ${b.lastName}`;
                return nameA.localeCompare(nameB);
            } else if (sortBy === 'age') {
                return a.age - b.age;
            }
            return 0;
        });
    }
};

// Обработка загрузки изображений
function processImage(file) {
    return new Promise((resolve, reject) => {
        // Проверяем размер файла
        if (file.size > 800 * 1024) {
            reject(new Error('Файл слишком большой. Максимальный размер 800KB'));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = () => reject(new Error('Ошибка чтения файла'));
        reader.readAsDataURL(file);
    });
}

// Обработчик загрузки фото
function addUploadHandler(element, userId) {
    const uploadBtn = element.querySelector('.upload-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => handleUploadClick(userId));
    }
}

// Заглушка изображений
function getPlaceholderAvatar(width, height, text = 'Нет фото') {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <rect width="100%" height="100%" fill="#e0e0e0"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
                  font-family="sans-serif" font-size="${Math.max(8, Math.floor(width / 8))}" fill="#666">
                ${text}
            </text>
        </svg>
    `.trim();
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Карточка пользователя
function createUserCard(user) {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.innerHTML = `
        <div class="user-avatar-container">
            <img src="${user.avatar || getPlaceholderAvatar(300, 200, 'Нет фото')}" 
                alt="Фото ${user.firstName} ${user.lastName}" 
                class="user-avatar" 
                data-user-id="${user.id}">
        </div>
        <div class="user-info">
            <div class="user-name">${user.firstName} ${user.lastName}</div>
            <div class="user-details">Возраст: ${user.age}</div>
            <div class="user-details">Email: ${user.email}</div>
            <div class="user-actions">
                <button class="upload-btn" data-user-id="${user.id}">Загрузить фото</button>
            </div>
        </div>
    `;

    addUploadHandler(card, user.id);
    return card;
}

// Отображение строки таблицы пользователей
function createUserRow(user) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="user-table__avatar">
            <img src="${user.avatar || getPlaceholderAvatar(60, 60, 'Нет фото')}" 
                alt="Фото ${user.firstName} ${user.lastName}" 
                style="width: 100%; height: 100%; object-fit: cover;">
        </td>
        <td>${user.firstName} ${user.lastName}</td>
        <td>${user.age}</td>
        <td>${user.email}</td>
        <td class="user-table__actions">
            <button class="upload-btn" data-user-id="${user.id}">Загрузить фото</button>
        </td>
    `;
    
    addUploadHandler(row, user.id);
    return row;
}

// Обработка клика по кнопке загрузки
function handleUploadClick(userId) {
    const fileInput = document.getElementById('file-input');
    fileInput.onchange = (event) => handleFileSelect(event, userId);
    fileInput.click();
}

// Обработка выбора файла
async function handleFileSelect(event, userId) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
        event.target.value = '';
        return;
    }

    try {
        const imageUrl = await processImage(file);
        userStorage.updateAvatar(userId, imageUrl);
        
        // Обновляем изображение на странице
        const allImages = document.querySelectorAll(`[data-user-id="${userId}"]`);
        allImages.forEach(img => {
            if (img.tagName === 'IMG') {
                img.src = imageUrl;
            }
        });
    } catch (error) {
        console.error('Ошибка загрузки изображения:', error);
        alert(error.message || 'Ошибка при загрузке изображения');
    } finally {
        event.target.value = '';
    }
}

// Функция пагинации
function paginate(users, currentPage, itemsPerPage) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return users.slice(startIndex, endIndex);
}

// Отображение пагинации
function renderPagination(totalItems, currentPage, itemsPerPage, onPageChange) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Кнопка "Назад"
    const prevBtn = document.createElement('button');
    prevBtn.className = `pagination__btn ${currentPage === 1 ? 'pagination__btn--disabled' : ''}`;
    prevBtn.textContent = 'Назад';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    });
    paginationContainer.appendChild(prevBtn);
    
    // Кнопки страниц
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination__btn ${i === currentPage ? 'pagination__btn--active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => onPageChange(i));
        paginationContainer.appendChild(pageBtn);
    }
    
    // Кнопка "Вперед"
    const nextBtn = document.createElement('button');
    nextBtn.className = `pagination__btn ${currentPage === totalPages ? 'pagination__btn--disabled' : ''}`;
    nextBtn.textContent = 'Вперед';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    });
    paginationContainer.appendChild(nextBtn);
}

// Переменные для пагинации
let currentPage = 1;
let currentUsers = [];
let currentViewMode = 'cards';

// Основная функция рендера
function renderUsers() {
    const input = document.getElementById('age-filter');
    let minAge = parseInt(input.value) || 0;
    
    // Проверяем и корректируем значение
    if (minAge < 0) {
        minAge = 0;
        input.value = '0';
    } else if (minAge > 110) {
        minAge = 110;
        input.value = '110';
    }
    
    const sortBy = document.getElementById('sort-select').value;
    currentViewMode = document.getElementById('view-mode').value;
    
    let users = userStorage.load();
    users = userFilters.byAge(users, minAge);
    users = userFilters.bySort(users, sortBy);
    
    // Сохраняем отфильтрованных пользователей для пагинации
    currentUsers = users;
    
    // Определяем количество элементов на странице
    const itemsPerPage = currentViewMode === 'table' ? 12 : 6;
    
    // Проверяем, не выходит ли текущая страница за пределы
    const totalPages = Math.ceil(users.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    } else if (totalPages === 0) {
        currentPage = 1;
    }
    
    // Получаем пользователей для текущей страницы
    const usersToShow = paginate(users, currentPage, itemsPerPage);
    
    const container = document.getElementById('users-container');
    container.innerHTML = '';
    
    if (currentViewMode === 'table') {
        container.className = 'users-container users-container--table';
        const table = document.createElement('table');
        table.className = 'user-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Фото</th>
                    <th>Имя</th>
                    <th>Возраст</th>
                    <th>Email</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        usersToShow.forEach(user => {
            const row = createUserRow(user);
            tbody.appendChild(row);
        });
        
        container.appendChild(table);
    } else {
        container.className = 'users-container users-container--cards';
        usersToShow.forEach(user => {
            const card = createUserCard(user);
            container.appendChild(card);
        });
    }
    
    // Отображаем пагинацию
    renderPagination(users.length, currentPage, itemsPerPage, (page) => {
        currentPage = page;
        renderUsers();
    });
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Отображаем пользователей при загрузке
    renderUsers();
    
    // Обработчики событий
    document.getElementById('apply-filters')
        .addEventListener('click', () => {
            currentPage = 1;
            renderUsers();
        });
    
    document.getElementById('sort-select')
        .addEventListener('change', () => {
            currentPage = 1;
            renderUsers();
        });
    
    document.getElementById('view-mode')
        .addEventListener('change', () => {
            currentPage = 1;
            renderUsers();
        });
    
    // Валидация ввода возраста
    document.getElementById('age-filter').addEventListener('input', function() {
        let value = parseInt(this.value) || 0;
        if (value < 0) {
            value = 0;
        } else if (value > 110) {
            value = 110;
        }
        this.value = value;
    });
});