// Страница контактов

import { showToast } from '../utils/helpers.js';
import { sendToTelegramBot } from '../config/telegram.js';

const faqData = [
    {
        question: 'Как записаться в кружок?',
        answer: 'Выберите кружок в каталоге, нажмите "Записаться" и заполните форму заявки. После отправки мы свяжемся с вами через Telegram бот школы.',
    },
    {
        question: 'Какие документы нужны для записи?',
        answer: 'Обычно требуется заявление от родителей и медицинская справка. Точный список документов уточняйте у руководителя кружка или в администрации школы.',
    },
    {
        question: 'Платные или бесплатные кружки?',
        answer: 'В школе есть как бесплатные, так и платные кружки. Информация о стоимости указана на странице каждого кружка.',
    },
    {
        question: 'Можно ли перейти в другой кружок?',
        answer: 'Да, можно. Обратитесь к администрации школы или руководителю кружка для перевода.',
    },
    {
        question: 'Что делать, если группа набрана?',
        answer: 'Вы можете оставить заявку в лист ожидания. Мы свяжемся с вами, если появится свободное место.',
    },
];

function initContactsPage() {
    // FAQ - рендерим сразу
    renderFAQ();

    // Форма обратной связи
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    }
}

function renderFAQ() {
    const container = document.getElementById('faq-container');
    if (!container) {
        console.error('FAQ container not found');
        return;
    }

    if (faqData.length === 0) {
        container.innerHTML = '<p class="text-muted">Вопросы не найдены</p>';
        return;
    }

    container.innerHTML = faqData.map((item, index) => `
        <div class="faq-item">
            <div class="faq-question" onclick="toggleFAQ(${index})">
                <span>${item.question}</span>
                <svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>
            <div class="faq-answer" id="faq-answer-${index}">
                ${item.answer}
            </div>
        </div>
    `).join('');
}

function toggleFAQ(index) {
    const answer = document.getElementById(`faq-answer-${index}`);
    const item = answer.closest('.faq-item');
    
    if (item.classList.contains('active')) {
        item.classList.remove('active');
        answer.classList.remove('active');
    } else {
        // Закрываем все остальные
        document.querySelectorAll('.faq-item').forEach(i => {
            i.classList.remove('active');
            i.querySelector('.faq-answer').classList.remove('active');
        });
        
        item.classList.add('active');
        answer.classList.add('active');
    }
}

async function handleFeedbackSubmit(e) {
    e.preventDefault();

    const topic = document.getElementById('feedback-topic').value;
    const message = document.getElementById('feedback-message').value.trim();
    const contact = document.getElementById('feedback-contact').value.trim();

    if (message.length < 10) {
        showToast('Сообщение должно содержать не менее 10 символов', 'error');
        return;
    }

    if (!contact) {
        showToast('Укажите контакт для ответа', 'error');
        return;
    }

    // Формируем сообщение для Telegram
    const telegramMessage = `<b>Обратная связь</b>\n\n<b>Тема:</b> ${topic}\n\n${message}\n\n<b>Контакт для ответа:</b> ${contact}`;

    // Отправка в Telegram бот
    const sent = await sendToTelegramBot(telegramMessage);
    if (sent) {
        showToast('Сообщение отправлено в Telegram бот школы', 'success');
    } else {
        showToast('Не удалось отправить сообщение. Попробуйте позже', 'error');
    }

    // Очистка формы
    e.target.reset();
}

window.toggleFAQ = toggleFAQ;

// Инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactsPage);
} else {
    initContactsPage();
}

