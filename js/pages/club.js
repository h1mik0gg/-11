// Страница детальной информации о кружке

import { storage } from '../utils/storage.js';
import { generateMessageText, copyToClipboard } from '../utils/messenger.js';
import { showToast } from '../utils/helpers.js';

let currentClub = null;

function initClubPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const clubId = urlParams.get('id');

    if (!clubId) {
        window.location.href = 'catalog.html';
        return;
    }

    // Читаем данные из скрытых элементов
    const clubData = document.querySelector(`#clubs-data [data-club-id="${clubId}"]`);
    if (!clubData) {
        window.location.href = 'catalog.html';
        return;
    }

    // Преобразуем data-атрибуты в объект
    currentClub = {
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

    renderClub();
    initActions();
}

function renderClub() {
    // Breadcrumbs
    const breadcrumbs = document.getElementById('breadcrumbs');
    if (breadcrumbs) {
        breadcrumbs.innerHTML = `
            <ol>
                <li><a href="index.html">Главная</a></li>
                <li><a href="catalog.html">Каталог</a></li>
                <li><a href="catalog.html?category=${currentClub.category}">${getCategoryLabel(currentClub.category)}</a></li>
                <li>${currentClub.title}</li>
            </ol>
        `;
    }

    // Hero
    const hero = document.getElementById('club-hero');
    const heroContent = document.querySelector('.club-hero-content');
    if (hero && heroContent) {
        const backgroundImage = currentClub.images && currentClub.images.length > 0 
            ? currentClub.images[0] 
            : '';
        if (backgroundImage) {
            hero.style.backgroundImage = `url('${backgroundImage}')`;
            // Создаем стиль для псевдоэлемента ::after
            const style = document.createElement('style');
            style.textContent = `
                #club-hero::after {
                    background-image: url('${backgroundImage}') !important;
                }
            `;
            document.head.appendChild(style);
        }
        heroContent.innerHTML = `<h1 style="color: white; font-size: 32px; margin-bottom: 16px;">${currentClub.title}</h1>`;
    }

    // Контент
    const content = document.getElementById('club-content');
    if (!content) return;

    const scheduleText = currentClub.schedule.map(s => 
        `${s.day}, ${s.timeFrom}-${s.timeTo}`
    ).join('<br>');

    const user = storage.getUser();
    const isFavorite = user && user.loggedIn && storage.isFavorite(currentClub.id);

    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr; gap: 24px;">
            <!-- Ключевые параметры -->
            <div class="card">
                <h2 style="margin-bottom: 16px;">Ключевые параметры</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    <div>
                        <div class="text-sm" style="color: var(--text-primary);">Возраст</div>
                        <div style="font-weight: 500; color: var(--text-primary);">${currentClub.ageMin}-${currentClub.ageMax} лет</div>
                        ${currentClub.classMin ? `<div class="text-sm" style="margin-top: 4px; color: var(--text-primary);">${currentClub.classMin}-${currentClub.classMax} класс</div>` : ''}
                    </div>
                    <div>
                        <div class="text-sm" style="color: var(--text-primary);">Расписание</div>
                        <div style="font-weight: 500; color: var(--text-primary);">${scheduleText}</div>
                    </div>
                    <div>
                        <div class="text-sm" style="color: var(--text-primary);">Место</div>
                        <div style="font-weight: 500; color: var(--text-primary);">${currentClub.location.room}</div>
                        ${currentClub.location.address ? `<div class="text-sm" style="margin-top: 4px; color: var(--text-primary);">${currentClub.location.address}</div>` : ''}
                    </div>
                    <div>
                        <div class="text-sm" style="color: var(--text-primary);">Стоимость</div>
                        <div style="font-weight: 500; color: var(--text-primary);">
                            ${currentClub.priceType === 'free' 
                                ? '<span class="badge badge-success">Бесплатно</span>'
                                : `${currentClub.priceValue} ₽ ${currentClub.pricePeriod || ''}`
                            }
                        </div>
                    </div>
                    ${currentClub.seatsLeft !== undefined ? `
                        <div>
                            <div class="text-sm" style="color: var(--text-primary);">Места</div>
                            <div style="font-weight: 500;">
                                ${currentClub.seatsLeft > 0 
                                    ? `<span class="badge badge-accent">Осталось ${currentClub.seatsLeft} из ${currentClub.seatsTotal}</span>`
                                    : '<span class="badge badge-error">Группа набрана</span>'
                                }
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Описание -->
            <div class="card">
                <h2 style="margin-bottom: 16px;">О кружке</h2>
                <p style="line-height: 1.6; margin-bottom: 16px; color: var(--text-primary);">${currentClub.description}</p>
                
                ${currentClub.tags.length > 0 ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px;">
                        ${currentClub.tags.map(tag => `<span class="badge badge-accent">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>

            <!-- Руководитель -->
            <div class="card">
                <h2 style="margin-bottom: 16px;">Руководитель</h2>
                <div>
                    <div style="font-weight: 500; font-size: 18px; margin-bottom: 4px; color: var(--text-primary);">${currentClub.teacherName}</div>
                    <div style="color: var(--text-primary);">${currentClub.teacherRole}</div>
                </div>
            </div>

            <!-- CTA блоки -->
            <div class="card" style="display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="btn btn-primary" id="apply-btn" style="flex: 1; min-width: 200px;">
                    ${currentClub.seatsLeft === 0 ? 'В лист ожидания' : 'Записаться'}
                </button>
                <button class="btn btn-secondary" id="message-btn" style="flex: 1; min-width: 200px; background-color: rgba(255, 122, 0, 0.15); border-color: rgba(255, 122, 0, 0.3);">
                    Написать
                </button>
                ${user && user.loggedIn ? `
                    <button class="btn btn-ghost" id="favorite-btn" style="min-width: 44px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                ` : ''}
            </div>
        </div>
    `;

    // Sticky CTA для мобильных
    const stickyBar = document.getElementById('sticky-cta-bar');
    // Sticky CTA панель скрыта на всех устройствах
    // if (stickyBar && window.innerWidth < 768) {
    //     stickyBar.style.display = 'flex';
    // }
}

function initActions() {
    // Записаться
    const applyBtn = document.getElementById('apply-btn');
    const mobileApplyBtn = document.getElementById('mobile-apply-btn');
    const handleApply = () => {
        window.location.href = `checkout.html?clubId=${currentClub.id}`;
    };
    if (applyBtn) applyBtn.addEventListener('click', handleApply);
    if (mobileApplyBtn) mobileApplyBtn.addEventListener('click', handleApply);

    // Написать
    const messageBtn = document.getElementById('message-btn');
    const mobileMessageBtn = document.getElementById('mobile-message-btn');
    const handleMessage = () => {
        openShareModal();
    };
    if (messageBtn) messageBtn.addEventListener('click', handleMessage);
    if (mobileMessageBtn) mobileMessageBtn.addEventListener('click', handleMessage);

    // Избранное
    const favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', () => {
            const user = storage.getUser();
            if (!user || !user.loggedIn) {
                window.location.href = 'index.html?auth=login';
                return;
            }

            if (storage.isFavorite(currentClub.id)) {
                storage.removeFavorite(currentClub.id);
                showToast('Удалено из избранного', 'info');
            } else {
                storage.addFavorite(currentClub.id);
                showToast('Добавлено в избранное', 'success');
            }
            renderClub();
        });
    }
}

function openShareModal() {
    const modal = document.getElementById('share-modal');
    const options = document.getElementById('share-options');
    if (!modal || !options) return;

    // Создаём временную заявку для генерации текста
    const tempRequest = {
        id: 'TEMP',
        phone: 'телефон',
        email: 'email',
        childName: 'имя ребёнка',
    };

    const messageText = generateMessageText(tempRequest, currentClub);

    options.innerHTML = `
        <div style="display: grid; gap: 12px;">
            <p class="text-muted" style="margin-bottom: 8px;">
                Скопируйте текст и отправьте его в Telegram бот школы.
            </p>
            <button class="btn btn-primary" onclick="shareAction('copy')">
                📋 Скопировать текст для Telegram бота
            </button>
        </div>
    `;

    modal.style.display = 'flex';
    window.shareAction = (action) => handleShareAction(action, messageText);
}

function closeShareModal() {
    const modal = document.getElementById('share-modal');
    if (modal) modal.style.display = 'none';
}

async function handleShareAction(action, messageText) {
    if (action === 'copy') {
        copyToClipboard(messageText).then(() => {
            showToast('Текст скопирован. Отправьте его в Telegram бот школы', 'success');
            closeShareModal();
        });
    }
}

function getCategoryLabel(category) {
    const labels = {
        'спорт': 'Спорт',
        'творчество': 'Творчество',
        'наука': 'Наука',
        'IT': 'IT',
        'языки': 'Языки',
        'музыка': 'Музыка',
        'другое': 'Другое',
    };
    return labels[category] || category;
}

// Глобальные функции для onclick
window.closeShareModal = closeShareModal;

// Инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClubPage);
} else {
    initClubPage();
}

