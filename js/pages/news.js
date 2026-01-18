// Страница новостей

import { shareViaWebAPI, copyToClipboard } from '../utils/messenger.js';
import { showToast } from '../utils/helpers.js';

let currentFilter = 'all';

// Данные новостей для модалки
const newsData = {
    '1': {
        title: 'Открыт набор в кружок робототехники',
        type: 'набор открыт',
        content: 'Приглашаем учащихся 5-11 классов в кружок робототехники. Начало занятий с 1 октября. Запись открыта до 25 сентября.',
        image: 'access/images/Открыт набор в кружок робототехники.png',
        createdAt: '2025-09-15'
    },
    '2': {
        title: 'Школьный турнир по шахматам',
        type: 'событие',
        content: '25 октября состоится школьный турнир по шахматам. Регистрация до 20 октября. Приглашаем всех желающих принять участие.',
        image: 'access/images/Школьный турнир по шахматам.png',
        createdAt: '2025-10-08'
    },
    '3': {
        title: 'Важная информация о расписании',
        type: 'объявление',
        content: 'Обратите внимание: с 1 октября изменено расписание занятий в некоторых кружках. Пожалуйста, проверьте актуальное расписание на странице кружка.',
        image: 'access/images/Важная информация о расписании.png',
        createdAt: '2025-09-22'
    },
    '4': {
        title: 'Открыт набор в кружок программирования',
        type: 'набор открыт',
        content: 'Приглашаем учащихся 6-11 классов в новый кружок программирования! Изучаем Python, JavaScript и C++. Начало занятий с 15 октября. Запись открыта до 10 октября. Количество мест ограничено.',
        image: 'access/images/Открыт набор в кружок программирования.png',
        createdAt: '2025-10-12'
    },
    '5': {
        title: 'Выставка работ кружка рисования',
        type: 'событие',
        content: '30 октября в актовом зале школы состоится выставка творческих работ учащихся кружка рисования. Приглашаем всех желающих посетить выставку с 14:00 до 17:00. Вход свободный.',
        image: 'access/images/Выставка работ кружка рисования.png',
        createdAt: '2025-10-20'
    },
    '6': {
        title: 'Обновление информации о кружках',
        type: 'объявление',
        content: 'Обновлена информация о расписании и стоимости занятий в кружках баскетбола, рисования и программирования. Теперь все занятия доступны для записи через личный кабинет на сайте.',
        image: 'access/images/Обновление информации о кружках.png',
        createdAt: '2025-11-05'
    }
};

function initNewsPage() {
    // Новости уже встроены в HTML, работаем с DOM
    renderNews();

    // Фильтры
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderNews();
        });
    });

    // Проверка hash для открытия конкретной новости
    const hash = window.location.hash.slice(1);
    if (hash) {
        setTimeout(() => {
            const element = document.getElementById(`news-${hash}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 500);
    }
}

function renderNews() {
    const container = document.getElementById('news-container');
    if (!container) return;

    const newsItems = Array.from(container.children);
    let visibleCount = 0;

    newsItems.forEach(item => {
        const newsType = item.dataset.type || '';
        const visible = currentFilter === 'all' || newsType === currentFilter;
        
        item.style.display = visible ? 'block' : 'none';
        if (visible) visibleCount++;
    });

    if (visibleCount === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = '<p class="text-muted">Новостей не найдено</p>';
        container.appendChild(emptyState);
    } else {
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) emptyState.remove();
    }
}

function openNewsDetail(newsId) {
    const news = newsData[newsId];
    if (!news) return;

    // Можно открыть модалку или перейти на отдельную страницу
    // Для простоты показываем в модалке
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal" style="max-width: 700px;">
            <div class="modal-header">
                <h2 class="modal-title">${news.title}</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                ${news.image ? `
                    <div style="background: var(--bg-primary); border-radius: var(--radius-card) var(--radius-card) 0 0; margin-top: -24px; margin-left: -24px; margin-right: -24px; margin-bottom: 16px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        <img src="${news.image}" alt="${news.title}" style="width: 100%; height: auto; display: block; object-fit: contain;">
                    </div>
                ` : ''}
                <span class="badge badge-accent" style="margin-bottom: 16px;">${news.type}</span>
                <p style="line-height: 1.6; margin-bottom: 16px; white-space: pre-wrap;">${news.content}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border);">
                    <span class="text-muted text-sm">${new Date(news.createdAt).toLocaleDateString('ru-RU')}</span>
                    <button class="btn btn-secondary" onclick="shareNews('${news.id}'); this.closest('.modal-overlay').remove();">
                        Поделиться
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

async function shareNews(newsId) {
    const news = newsData[newsId];
    if (!news) return;

    const shareData = {
        title: news.title,
        text: news.content,
        url: window.location.href + `#${news.id}`,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (error) {
            if (error.name !== 'AbortError') {
                copyToClipboard(`${news.title}\n\n${news.content}\n\n${shareData.url}`).then(() => {
                    showToast('Текст скопирован', 'success');
                });
            }
        }
    } else {
        copyToClipboard(`${news.title}\n\n${news.content}\n\n${shareData.url}`).then(() => {
            showToast('Текст скопирован', 'success');
        });
    }
}

window.openNewsDetail = openNewsDetail;
window.shareNews = shareNews;

// Инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewsPage);
} else {
    initNewsPage();
}

