// Страница оформления заявки/заказа

import { storage } from '../utils/storage.js';
import { generateRequestId, generateOrderId, validateEmail, validatePhone, formatPhone, showToast } from '../utils/helpers.js';
import { generateMessageText } from '../utils/messenger.js';
import { sendToTelegramBot } from '../config/telegram.js';

let currentTab = 'service';
let currentClub = null;
let currentProducts = [];
let lastRequest = null;

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

function initCheckoutPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const clubId = urlParams.get('clubId');
    const tab = urlParams.get('tab');

    if (tab === 'product') {
        switchTab('product');
    }

    // Загрузка кружка если есть clubId
    if (clubId) {
        currentClub = getClubFromDOM(clubId);
        if (currentClub) {
            const titleEl = document.getElementById('selected-club-title');
            if (titleEl) {
                titleEl.textContent = `Кружок: ${currentClub.title}`;
            }
        }
    }

    // Товары убраны, так как их нет в проекте
    currentProducts = [];

    // Заполнение списка классов
    const classSelect = document.getElementById('service-child-class');
    if (classSelect) {
        for (let i = 1; i <= 11; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i} класс`;
            classSelect.appendChild(option);
        }
    }

    // Автозаполнение из профиля
    const user = storage.getUser();
    if (user && user.loggedIn) {
        if (user.name) {
            document.getElementById('service-name').value = user.name;
            document.getElementById('product-name').value = user.name;
        }
        if (user.phone) {
            document.getElementById('service-phone').value = user.phone;
            document.getElementById('product-phone').value = user.phone;
        }
        if (user.email) {
            document.getElementById('service-email').value = user.email;
            document.getElementById('product-email').value = user.email;
        }
    }

    // Маска телефона
    setupPhoneMask('service-phone');
    setupPhoneMask('product-phone');

    // Табы
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    // Формы
    document.getElementById('service-form').addEventListener('submit', handleServiceSubmit);
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);

    // Успех экран
    document.getElementById('success-account-btn')?.addEventListener('click', () => {
        window.location.href = 'account.html';
    });
    document.getElementById('success-copy-btn')?.addEventListener('click', handleSuccessCopy);
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll(`[data-tab="${tab}"]`).forEach(t => t.classList.add('active'));

    if (tab === 'service') {
        document.getElementById('service-form').style.display = 'block';
        document.getElementById('product-form').style.display = 'none';
    } else {
        document.getElementById('service-form').style.display = 'none';
        document.getElementById('product-form').style.display = 'block';
        renderProductItems();
    }
}

function renderProductItems() {
    const container = document.getElementById('product-items');
    if (!container) return;

    if (currentProducts.length === 0) {
        container.innerHTML = '<p class="text-muted">Товары не найдены</p>';
        return;
    }

    container.innerHTML = currentProducts.map(product => `
        <div style="display: flex; gap: 16px; padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-card); margin-bottom: 12px;">
            <div style="flex: 1;">
                <h4 style="margin-bottom: 4px;">${product.name}</h4>
                <p class="text-muted text-sm" style="margin-bottom: 8px;">${product.description}</p>
                <div style="font-weight: 600; color: var(--accent);">${product.price} ₽</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <input type="number" class="input" min="0" max="${product.stock || 99}" value="0" 
                       data-product-id="${product.id}" style="width: 80px;" onchange="updateProductQuantity('${product.id}', this.value)">
                <span class="text-sm text-muted">шт.</span>
            </div>
        </div>
    `).join('');
}

window.updateProductQuantity = function(productId, quantity) {
    // Обновление количества товара
};

function setupPhoneMask(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.startsWith('8')) value = '7' + value.slice(1);
        if (!value.startsWith('7')) value = '7' + value;
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length > 1) {
            e.target.value = formatPhone(value);
        } else {
            e.target.value = value;
        }
    });
}

async function handleServiceSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('service-name').value.trim();
    const phone = document.getElementById('service-phone').value.trim();
    const email = document.getElementById('service-email').value.trim();
    const childName = document.getElementById('service-child-name').value.trim();
    const childClass = document.getElementById('service-child-class').value;
    const childAge = document.getElementById('service-child-age').value;
    const comment = document.getElementById('service-comment').value.trim();
    const consent = document.getElementById('service-consent').checked;

    // Валидация
    if (!name || name.length < 2) {
        showToast('Введите корректное ФИО', 'error');
        return;
    }

    if (!validatePhone(phone)) {
        showToast('Введите корректный телефон', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showToast('Введите корректный email', 'error');
        return;
    }

    if (!childName) {
        showToast('Введите имя ребёнка', 'error');
        return;
    }

    if (!consent) {
        showToast('Необходимо согласие на обработку данных', 'error');
        return;
    }

    if (!currentClub) {
        showToast('Кружок не выбран', 'error');
        return;
    }

    // Создание заявки
    const request = {
        id: generateRequestId(),
        userId: storage.getUser()?.id,
        name,
        phone,
        email,
        clubId: currentClub.id,
        clubTitle: currentClub.title,
        childName,
        childClass: childClass || undefined,
        childAge: childAge || undefined,
        comment: comment || undefined,
        contactChannel: 'telegram',
        status: 'Создана',
        createdAt: new Date().toISOString(),
    };

    // Сохранение
    storage.addRequest(request);
    lastRequest = request;

    // Отправка в Telegram бот
    const telegramMessage = formatTelegramMessage(request, currentClub);
    await sendToTelegramBot(telegramMessage);

    // Показ экрана успеха
    showSuccessScreen(request, currentClub);
}

async function handleProductSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('product-name').value.trim();
    const phone = document.getElementById('product-phone').value.trim();
    const email = document.getElementById('product-email').value.trim();
    const comment = document.getElementById('product-comment').value.trim();
    const consent = document.getElementById('product-consent').checked;

    // Валидация
    if (!name || name.length < 2) {
        showToast('Введите корректное ФИО', 'error');
        return;
    }

    if (!validatePhone(phone)) {
        showToast('Введите корректный телефон', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showToast('Введите корректный email', 'error');
        return;
    }

    if (!consent) {
        showToast('Необходимо согласие на обработку данных', 'error');
        return;
    }

    // Сбор товаров
    const items = [];
    document.querySelectorAll('[data-product-id]').forEach(input => {
        const quantity = parseInt(input.value) || 0;
        if (quantity > 0) {
            items.push({
                productId: input.dataset.productId,
                quantity,
            });
        }
    });

    if (items.length === 0) {
        showToast('Выберите хотя бы один товар', 'error');
        return;
    }

    // Создание заказа
    const order = {
        id: generateOrderId(),
        userId: storage.getUser()?.id,
        name,
        phone,
        email,
        items,
        comment: comment || undefined,
        contactChannel: 'telegram',
        status: 'Создан',
        createdAt: new Date().toISOString(),
    };

    // Сохранение
    storage.addOrder(order);
    lastRequest = order;

    // Отправка в Telegram бот
    const telegramMessage = formatTelegramOrderMessage(order);
    await sendToTelegramBot(telegramMessage);

    // Показ экрана успеха
    showSuccessScreen(order, null, true);
}

function showSuccessScreen(request, club, isOrder = false) {
    document.getElementById('service-form').style.display = 'none';
    document.getElementById('product-form').style.display = 'none';
    document.querySelector('.tabs').style.display = 'none';

    const successScreen = document.getElementById('success-screen');
    const successMessage = document.getElementById('success-message');

    if (isOrder) {
        successMessage.textContent = `Номер заказа: ${request.id}. Заявка отправлена в Telegram бот школы. Мы свяжемся с вами в ближайшее время.`;
    } else {
        successMessage.textContent = `Номер заявки: ${request.id}. Заявка отправлена в Telegram бот школы. Мы свяжемся с вами в ближайшее время.`;
    }

    successScreen.style.display = 'block';
}

function formatTelegramMessage(request, club) {
    const lines = [
        `<b>Новая заявка на запись в кружок</b>`,
        ``,
        `<b>Номер заявки:</b> ${request.id}`,
        `<b>Кружок:</b> ${club.title}`,
        ``,
        `<b>Заявитель:</b> ${request.name}`,
        `<b>Телефон:</b> ${request.phone}`,
        `<b>Email:</b> ${request.email}`,
        ``,
        `<b>Ребёнок:</b> ${request.childName}`,
    ];

    if (request.childClass) {
        lines.push(`<b>Класс:</b> ${request.childClass}`);
    }
    if (request.childAge) {
        lines.push(`<b>Возраст:</b> ${request.childAge} лет`);
    }
    if (request.comment) {
        lines.push(``, `<b>Комментарий:</b> ${request.comment}`);
    }

    return lines.join('\n');
}

function formatTelegramOrderMessage(order) {
    const lines = [
        `<b>Новый заказ товаров</b>`,
        ``,
        `<b>Номер заказа:</b> ${order.id}`,
        `<b>Товаров в заказе:</b> ${order.items.length}`,
        ``,
        `<b>Заказчик:</b> ${order.name}`,
        `<b>Телефон:</b> ${order.phone}`,
        `<b>Email:</b> ${order.email}`,
    ];

    if (order.comment) {
        lines.push(``, `<b>Комментарий:</b> ${order.comment}`);
    }

    return lines.join('\n');
}


async function handleSuccessCopy() {
    if (!lastRequest) return;

    let text = '';
    if (lastRequest.clubId) {
        const club = getClubFromDOM(lastRequest.clubId);
        if (club) {
            text = generateMessageText(lastRequest, club);
        }
    } else {
        text = `Заказ №${lastRequest.id}\nКонтакты: ${lastRequest.phone}, ${lastRequest.email}`;
    }

    if (text) {
        copyToClipboard(text).then(() => {
            showToast('Текст скопирован', 'success');
        });
    }
}

// Инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckoutPage);
} else {
    initCheckoutPage();
}

