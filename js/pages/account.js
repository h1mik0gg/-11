// Страница личного кабинета

import { storage } from '../utils/storage.js';
import { formatDate, showToast } from '../utils/helpers.js';
import { generateMessageText, copyToClipboard } from '../utils/messenger.js';

let currentTab = 'profile';

// Функция для получения данных кружка из DOM
function getClubFromDOM(clubId) {
    const clubData = document.querySelector(`#clubs-data [data-club-id="${clubId}"]`);
    if (!clubData) return null;

    return {
        id: clubData.dataset.clubId,
        title: clubData.dataset.title,
        type: clubData.dataset.type,
        category: clubData.dataset.category,
        ageMin: parseInt(clubData.dataset.ageMin) || 0,
        ageMax: parseInt(clubData.dataset.ageMax) || 0,
        classMin: parseInt(clubData.dataset.classMin) || 0,
        classMax: parseInt(clubData.dataset.classMax) || 0,
        shortDescription: clubData.dataset.shortDesc,
        description: clubData.dataset.desc,
        teacherName: clubData.dataset.teacherName,
        teacherRole: clubData.dataset.teacherRole,
        schedule: JSON.parse(clubData.dataset.schedule || '[]'),
        location: {
            room: clubData.dataset.room,
            address: clubData.dataset.address
        },
        priceType: clubData.dataset.priceType,
        priceValue: clubData.dataset.priceValue ? parseInt(clubData.dataset.priceValue) : null,
        pricePeriod: clubData.dataset.pricePeriod || '',
        tags: JSON.parse(clubData.dataset.tags || '[]'),
        images: clubData.dataset.image ? [clubData.dataset.image] : [],
        seatsTotal: parseInt(clubData.dataset.seatsTotal) || 0,
        seatsLeft: parseInt(clubData.dataset.seatsLeft) || 0
    };
}

function initAccountPage() {
    const user = storage.getUser();
    
    if (!user || !user.loggedIn) {
        document.getElementById('auth-required').style.display = 'block';
        return;
    }

    document.getElementById('account-content').style.display = 'block';

    // Загрузка профиля
    loadProfile(user);

    // Табы
    document.querySelectorAll('.account-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    // Форма профиля
    document.getElementById('profile-form').addEventListener('submit', handleProfileSave);

    // Проверка параметра tab из URL
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
        switchTab(tab);
    }

    // Загрузка данных
    loadRequests();
    loadOrders();
    loadFavorites();
}

function loadProfile(user) {
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-phone').value = user.phone || '';
    document.getElementById('profile-email').value = user.email || '';
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.account-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.account-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
}

function handleProfileSave(e) {
    e.preventDefault();
    
    const user = storage.getUser();
    if (!user) return;

    const name = document.getElementById('profile-name').value.trim();
    const phone = document.getElementById('profile-phone').value.trim();
    const email = document.getElementById('profile-email').value.trim();

    if (!name || name.length < 2) {
        showToast('Введите корректное ФИО', 'error');
        return;
    }

    const updatedUser = {
        ...user,
        name,
        phone,
        email,
    };

    storage.setUser(updatedUser);
    showToast('Профиль сохранён', 'success');
}

function loadRequests() {
    const requests = storage.getRequests();
    const container = document.getElementById('requests-container');

    if (requests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-title">Пока нет заявок</div>
                <p class="empty-state-text">Ваши заявки на запись в кружки будут отображаться здесь</p>
                <a href="catalog.html" class="btn btn-primary">Перейти в каталог</a>
            </div>
        `;
        return;
    }

    container.innerHTML = requests.map(request => `
        <div class="card request-card status-${request.status.toLowerCase().replace(/\s/g, '-')}" style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <div>
                    <h3 style="margin-bottom: 4px;">${request.clubTitle || 'Кружок'}</h3>
                    <span class="badge ${getStatusBadgeClass(request.status)}">${request.status}</span>
                </div>
                <div style="text-align: right;">
                    <div class="text-sm text-muted">№${request.id}</div>
                    <div class="text-sm text-muted">${formatDate(request.createdAt)}</div>
                </div>
            </div>
            <div style="display: grid; gap: 8px; font-size: 14px;">
                <div><strong>Ребёнок:</strong> ${request.childName || '-'} ${request.childClass ? `(${request.childClass} класс)` : ''}</div>
                <div><strong>Контакты:</strong> ${request.phone}, ${request.email}</div>
                ${request.comment ? `<div><strong>Комментарий:</strong> ${request.comment}</div>` : ''}
            </div>
            <div style="margin-top: 16px; display: flex; gap: 8px;">
                <button class="btn btn-secondary" onclick="sendRequestMessage('${request.id}')" style="font-size: 12px; padding: 6px 12px;">
                    Отправить сообщение
                </button>
                <button class="btn btn-ghost" onclick="copyRequestText('${request.id}')" style="font-size: 12px; padding: 6px 12px;">
                    Скопировать текст
                </button>
            </div>
        </div>
    `).join('');
}

function loadOrders() {
    const orders = storage.getOrders();
    const container = document.getElementById('orders-container');

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <div class="empty-state-title">Пока нет заказов</div>
                <p class="empty-state-text">Ваши заказы товаров будут отображаться здесь</p>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="card request-card status-${order.status.toLowerCase().replace(/\s/g, '-')}" style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <div>
                    <h3 style="margin-bottom: 4px;">Заказ товаров</h3>
                    <span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span>
                </div>
                <div style="text-align: right;">
                    <div class="text-sm text-muted">№${order.id}</div>
                    <div class="text-sm text-muted">${formatDate(order.createdAt)}</div>
                </div>
            </div>
            <div style="display: grid; gap: 8px; font-size: 14px;">
                <div><strong>Товаров:</strong> ${order.items.length}</div>
                <div><strong>Контакты:</strong> ${order.phone}, ${order.email}</div>
                ${order.comment ? `<div><strong>Комментарий:</strong> ${order.comment}</div>` : ''}
            </div>
        </div>
    `).join('');
}

async function loadFavorites() {
    const favorites = storage.getFavorites();
    const container = document.getElementById('favorites-container');

    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❤️</div>
                <div class="empty-state-title">Избранное пустое</div>
                <p class="empty-state-text">Сохраните кружки, чтобы вернуться к ним позже</p>
                <a href="catalog.html" class="btn btn-primary">Перейти в каталог</a>
            </div>
        `;
        return;
    }

    // Получаем все кружки из DOM
    const allClubsData = Array.from(document.querySelectorAll('#clubs-data > div'));
    const favoriteClubs = allClubsData
        .filter(el => favorites.includes(el.dataset.clubId))
        .map(el => getClubFromDOM(el.dataset.clubId))
        .filter(c => c !== null);

    if (favoriteClubs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❤️</div>
                <div class="empty-state-title">Избранное пустое</div>
                <p class="empty-state-text">Сохраните кружки, чтобы вернуться к ним позже</p>
                <a href="catalog.html" class="btn btn-primary">Перейти в каталог</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="clubs-grid">
            ${favoriteClubs.map(club => `
                <div class="card card-hover" onclick="window.location.href='club.html?id=${club.id}'">
                    <div style="aspect-ratio: 16/9; background: var(--bg-primary); border-radius: var(--radius-card); margin-bottom: 16px; overflow: hidden;">
                        ${club.images && club.images.length > 0 
                            ? `<img src="${club.images[0]}" alt="${club.title}" style="width: 100%; height: 100%; object-fit: cover;">`
                            : '<div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 48px;">🎯</div>'
                        }
                    </div>
                    <h3 style="margin-bottom: 8px;">${club.title}</h3>
                    <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${club.shortDescription}
                    </p>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${club.priceType === 'free' 
                            ? '<span class="badge badge-success">Бесплатно</span>'
                            : '<span class="badge badge-warning">Платно</span>'
                        }
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function getStatusBadgeClass(status) {
    const statusMap = {
        'Создана': 'badge-accent',
        'Создан': 'badge-accent',
        'Подготовлено к отправке': 'badge-warning',
        'Отправлено пользователем': 'badge-success',
    };
    return statusMap[status] || 'badge-accent';
}

function sendRequestMessage(requestId) {
    const requests = storage.getRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request || !request.clubId) return;

    const club = getClubFromDOM(request.clubId);
    if (!club) return;

    // Копируем текст заявки для отправки в Telegram
    const text = generateMessageText(request, club);
    copyToClipboard(text).then(() => {
        showToast('Текст заявки скопирован. Отправьте его в Telegram бот школы', 'success');
    });
}

function copyRequestText(requestId) {
    const requests = storage.getRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request || !request.clubId) return;

    const club = getClubFromDOM(request.clubId);
    if (!club) return;

    const text = generateMessageText(request, club);
    copyToClipboard(text).then(() => {
        showToast('Текст скопирован', 'success');
    });
}

window.sendRequestMessage = sendRequestMessage;
window.copyRequestText = copyRequestText;

// Инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccountPage);
} else {
    initAccountPage();
}

