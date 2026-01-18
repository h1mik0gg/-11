// Компонент авторизации/регистрации

import { storage } from '../utils/storage.js';
import { validateEmail, validatePhone, showToast } from '../utils/helpers.js';

export function renderAuthModal(mode = 'login') {
    return `
        <div class="modal-overlay" id="auth-modal">
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">${mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
                    <button class="modal-close" onclick="closeAuthModal()">×</button>
                </div>
                <div class="modal-body">
                    <form id="auth-form" style="display: grid; gap: 16px;">
                        <div>
                            <label class="label label-required">Email или телефон</label>
                            <input type="text" class="input" id="auth-identifier" required>
                        </div>
                        <div>
                            <label class="label label-required">Пароль</label>
                            <input type="password" class="input" id="auth-password" required>
                            ${mode === 'register' ? '<p class="text-muted text-sm" style="margin-top: 4px;">Пароль должен быть не короче 8 символов и содержать цифру</p>' : ''}
                        </div>
                        ${mode === 'register' ? `
                            <div>
                                <label class="label label-required">Повтор пароля</label>
                                <input type="password" class="input" id="auth-password-repeat" required>
                            </div>
                            <div>
                                <label class="label label-required">ФИО</label>
                                <input type="text" class="input" id="auth-name" required>
                            </div>
                        ` : ''}
                        ${mode === 'login' ? `
                            <div style="text-align: right;">
                                <a href="#" onclick="event.preventDefault(); switchAuthMode('recover');" class="link-accent text-sm">Забыли пароль?</a>
                            </div>
                        ` : ''}
                        <div class="checkbox">
                            <input type="checkbox" id="auth-consent" required>
                            <label for="auth-consent">Я согласен(на) на обработку персональных данных</label>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            ${mode === 'login' ? 'Войти' : 'Создать аккаунт'}
                        </button>
                        <div style="text-align: center; margin-top: 16px;">
                            ${mode === 'login' 
                                ? '<span class="text-muted">Нет аккаунта? </span><a href="#" onclick="event.preventDefault(); switchAuthMode(\'register\');" class="link-accent">Зарегистрироваться</a>'
                                : '<span class="text-muted">Уже есть аккаунт? </span><a href="#" onclick="event.preventDefault(); switchAuthMode(\'login\');" class="link-accent">Войти</a>'
                            }
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

export function initAuthModal() {
    const urlParams = new URLSearchParams(window.location.search);
    const authMode = urlParams.get('auth');

    if (authMode) {
        openAuthModal(authMode);
    }
}

export function openAuthModal(mode = 'login') {
    const container = document.getElementById('auth-modal-container');
    if (!container) return;

    container.innerHTML = renderAuthModal(mode);
    const modal = document.getElementById('auth-modal');
    
    // Обработка формы
    document.getElementById('auth-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleAuthSubmit(mode);
    });

    // Закрытие по клику вне модалки
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeAuthModal();
        }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal) {
            closeAuthModal();
        }
    });
}

export function closeAuthModal() {
    const container = document.getElementById('auth-modal-container');
    if (container) {
        container.innerHTML = '';
    }
    
    // Удаляем параметр из URL
    const url = new URL(window.location.href);
    url.searchParams.delete('auth');
    window.history.replaceState({}, '', url);
}

export function switchAuthMode(mode) {
    closeAuthModal();
    setTimeout(() => {
        openAuthModal(mode);
    }, 100);
}

function handleAuthSubmit(mode) {
    const identifier = document.getElementById('auth-identifier').value.trim();
    const password = document.getElementById('auth-password').value;
    const consent = document.getElementById('auth-consent').checked;

    if (!consent) {
        showToast('Необходимо согласие на обработку данных', 'error');
        return;
    }

    if (mode === 'login') {
        handleLogin(identifier, password);
    } else if (mode === 'register') {
        const passwordRepeat = document.getElementById('auth-password-repeat').value;
        const name = document.getElementById('auth-name').value.trim();
        handleRegister(identifier, password, passwordRepeat, name);
    } else if (mode === 'recover') {
        handleRecover(identifier);
    }
}

function handleLogin(identifier, password) {
    // Проверка в localStorage
    const storedUsers = JSON.parse(localStorage.getItem('school11_users') || '[]');
    const user = storedUsers.find(u => 
        (u.email === identifier || u.phone === identifier) && u.password === password
    );

    if (user) {
        const loggedInUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            loggedIn: true,
        };
        storage.setUser(loggedInUser);
        showToast('Вход выполнен', 'success');
        closeAuthModal();
        window.location.reload();
    } else {
        showToast('Неверный email/телефон или пароль', 'error');
    }
}

function handleRegister(identifier, password, passwordRepeat, name) {
    // Валидация
    if (!name || name.length < 2) {
        showToast('Введите корректное ФИО', 'error');
        return;
    }

    if (password.length < 8 || !/\d/.test(password)) {
        showToast('Пароль должен быть не короче 8 символов и содержать цифру', 'error');
        return;
    }

    if (password !== passwordRepeat) {
        showToast('Пароли не совпадают', 'error');
        return;
    }

    const isEmail = validateEmail(identifier);
    const isPhone = validatePhone(identifier);

    if (!isEmail && !isPhone) {
        showToast('Введите корректный email или телефон', 'error');
        return;
    }

    // Проверка существующего пользователя
    const storedUsers = JSON.parse(localStorage.getItem('school11_users') || '[]');
    const exists = storedUsers.find(u => 
        u.email === identifier || u.phone === identifier
    );

    if (exists) {
        showToast('Пользователь с таким email/телефоном уже существует', 'error');
        return;
    }

    // Создание пользователя
    const newUser = {
        id: 'user_' + Date.now(),
        name,
        email: isEmail ? identifier : undefined,
        phone: isPhone ? identifier : undefined,
        password, // В реальном приложении пароль должен быть захеширован
    };

    storedUsers.push(newUser);
    localStorage.setItem('school11_users', JSON.stringify(storedUsers));

    const loggedInUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        loggedIn: true,
    };
    storage.setUser(loggedInUser);
    showToast('Регистрация успешна', 'success');
    closeAuthModal();
    window.location.reload();
}

function handleRecover(identifier) {
    // Упрощённое восстановление - просто показываем сообщение
    showToast('Обратитесь к администратору школы для восстановления пароля', 'info');
}

// Глобальные функции
window.closeAuthModal = closeAuthModal;
window.switchAuthMode = switchAuthMode;

