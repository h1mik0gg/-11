// Страница каталога

import { storage } from '../utils/storage.js';

function initCatalogPage() {
    // Кружки уже встроены в HTML, работаем с DOM
    updateResultsCount();

    // Поиск
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        // Получаем параметр из URL
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        if (searchQuery) {
            searchInput.value = searchQuery;
            applyFilters();
        }

        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }

    // Фильтры
    const filtersBtn = document.getElementById('filters-btn');
    const filtersPanel = document.getElementById('filters-panel');
    if (filtersBtn && filtersPanel) {
        filtersBtn.addEventListener('click', () => {
            filtersPanel.style.display = filtersPanel.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Применение фильтров
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }

    // Сброс фильтров
    const resetFiltersBtn = document.getElementById('reset-filters');
    const resetAllBtn = document.getElementById('reset-all-filters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', resetFilters);
    }

    // Сортировка
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', applySorting);
    }

    // Получаем параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        const filterCategory = document.getElementById('filter-category');
        if (filterCategory) {
            filterCategory.value = category;
            applyFilters();
        }
    }
}

function applyFilters() {
    const searchQuery = document.getElementById('search-input')?.value.toLowerCase() || '';
    const type = document.getElementById('filter-type')?.value || '';
    const category = document.getElementById('filter-category')?.value || '';
    const price = document.getElementById('filter-price')?.value || '';
    const seatsOnly = document.getElementById('filter-seats')?.checked || false;

    const container = document.getElementById('clubs-container');
    const emptyState = document.getElementById('empty-state');
    if (!container) return;

    const clubs = Array.from(container.children);
    let visibleCount = 0;

    clubs.forEach(club => {
        let visible = true;
        const clubTitle = club.querySelector('h3')?.textContent.toLowerCase() || '';
        const clubType = club.dataset.type || '';
        const clubCategory = club.dataset.category || '';
        const clubPrice = club.dataset.price || '';
        const clubSeats = parseInt(club.dataset.seats) || 0;

        // Поиск
        if (searchQuery && !clubTitle.includes(searchQuery)) {
            visible = false;
        }

        // Тип
        if (type && clubType !== type) {
            visible = false;
        }

        // Категория
        if (category && clubCategory !== category) {
            visible = false;
        }

        // Цена
        if (price === 'free' && clubPrice !== 'free') {
            visible = false;
        }
        if (price === 'paid' && clubPrice !== 'paid') {
            visible = false;
        }

        // Места
        if (seatsOnly && clubSeats === 0) {
            visible = false;
        }

        club.style.display = visible ? 'block' : 'none';
        if (visible) visibleCount++;
    });

    // Показываем/скрываем пустое состояние
    if (visibleCount === 0) {
        container.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
    } else {
        container.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
    }

    updateResultsCount(visibleCount);
    applySorting();
}

function applySorting() {
    const sortValue = document.getElementById('sort-select')?.value || 'popular';
    const container = document.getElementById('clubs-container');
    if (!container) return;

    const clubs = Array.from(container.children).filter(c => c.style.display !== 'none');
    
    clubs.sort((a, b) => {
        switch (sortValue) {
            case 'alphabet':
                const titleA = a.querySelector('h3')?.textContent || '';
                const titleB = b.querySelector('h3')?.textContent || '';
                return titleA.localeCompare(titleB);
            case 'popular':
            default:
                const seatsA = parseInt(a.dataset.seats) || 0;
                const seatsB = parseInt(b.dataset.seats) || 0;
                return seatsA - seatsB;
        }
    });

    // Переставляем элементы в DOM
    clubs.forEach(club => container.appendChild(club));
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    const container = document.getElementById('clubs-container');
    if (!resultsCount || !container) return;
    
    if (count === undefined) {
        const visible = Array.from(container.children).filter(c => c.style.display !== 'none').length;
        count = visible;
    }
    
    resultsCount.textContent = `Найдено: ${count}`;
}

function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-price').value = '';
    document.getElementById('filter-seats').checked = false;
    document.getElementById('sort-select').value = 'popular';
    
    // Очищаем URL параметры
    window.history.replaceState({}, '', 'catalog.html');
    
    applyFilters();
}

function toggleFavorite(clubId) {
    const favorites = storage.getFavorites();
    if (favorites.includes(clubId)) {
        storage.removeFavorite(clubId);
    } else {
        storage.addFavorite(clubId);
    }
    // Обновление иконки избранного происходит через CSS или можно обновить вручную
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Делаем функции глобальными для onclick
window.toggleFavorite = toggleFavorite;

// Инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCatalogPage);
} else {
    initCatalogPage();
}

