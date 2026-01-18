// Страница главная

import { storage } from '../utils/storage.js';

const categories = [
    { label: 'Спорт', value: 'спорт', image: 'access/images/Спорт.svg' },
    { label: 'Творчество', value: 'творчество', image: 'access/images/Творчество.svg' },
    { label: 'Наука', value: 'наука', image: 'access/images/Наука.svg' },
    { label: 'IT', value: 'IT', image: 'access/images/Творчество.svg' },
    { label: 'Языки', value: 'языки', image: 'access/images/Языки.svg' },
    { label: 'Музыка', value: 'музыка', image: 'access/images/Музыка.svg' },
];

async function initHomePage() {
    // Поиск
    const searchInput = document.getElementById('home-search');
    const searchBtn = document.getElementById('home-search-btn');
    if (searchInput && searchBtn) {
        const handleSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
            } else {
                window.location.href = 'catalog.html';
            }
        };
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }

    // Категории
    const categoriesGrid = document.getElementById('categories-grid');
    if (categoriesGrid) {
        categoriesGrid.innerHTML = categories.map(cat => `
            <a href="catalog.html?category=${cat.value}" class="category-card card card-hover" style="text-align: center; padding: 24px; text-decoration: none;">
                <div style="margin-bottom: 12px; display: flex; align-items: center; justify-content: center; height: 64px;">
                    <img src="${cat.image}" alt="${cat.label}" style="max-width: 64px; max-height: 64px; object-fit: contain;">
                </div>
                <div class="category-label" style="font-weight: 500; color: var(--text-primary);">${cat.label}</div>
            </a>
        `).join('');
    }

    // Топ кружки и новости теперь встроены в HTML, JS только для интерактивности
}

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomePage);
} else {
    initHomePage();
}

