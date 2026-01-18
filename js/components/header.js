// Компонент Header

import { storage } from '../utils/storage.js';

export function renderHeader() {
    const user = storage.getUser();
    const isLoggedIn = user && user.loggedIn;

    return `
        <header class="header">
            <div class="header-content">
                <a href="index.html" class="logo">
                    <img src="access/images/Лого.svg" alt="Школа №11" style="height: 40px; width: auto;">
                </a>
                
                <nav class="nav">
                    <a href="catalog.html">Каталог</a>
                    <a href="news.html">Новости</a>
                    <a href="contacts.html">Контакты</a>
                    ${isLoggedIn ? `<a href="account.html">Личный кабинет</a>` : ''}
                </nav>

                <div class="header-actions" style="display: flex; align-items: center; gap: 12px;">
                    ${isLoggedIn 
                        ? `
                            <a href="account.html?tab=favorites" style="padding: 8px; color: var(--text-primary);">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                            </a>
                            <span style="font-size: 14px; color: var(--text-muted);">${user.name}</span>
                            <button class="btn btn-ghost" id="logout-btn" style="padding: 8px 16px;">Выйти</button>
                        `
                        : `<button class="btn btn-primary" id="login-btn">Войти</button>`
                    }
                </div>

                <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Меню">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div class="mobile-menu" id="mobile-menu">
                <nav>
                    <a href="catalog.html">Каталог</a>
                    <a href="news.html">Новости</a>
                    <a href="contacts.html">Контакты</a>
                    ${isLoggedIn 
                        ? `<a href="account.html">Личный кабинет</a>
                           <button class="btn btn-ghost" id="mobile-logout-btn" style="width: 100%; margin-top: 8px;">Выйти</button>`
                        : `<button class="btn btn-primary" id="mobile-login-btn" style="width: 100%; margin-top: 8px;">Войти</button>`
                    }
                </nav>
            </div>
        </header>
    `;
}

export function initHeader() {
    const container = document.getElementById('header-container');
    if (container) {
        container.innerHTML = renderHeader();

        // Мобильное меню
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
            });
        }

        // Выход
        const logoutBtn = document.getElementById('logout-btn');
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
        const handleLogout = () => {
            storage.clearUser();
            window.location.reload();
        };
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);

        // Вход
        const loginBtn = document.getElementById('login-btn');
        const mobileLoginBtn = document.getElementById('mobile-login-btn');
        const handleLogin = () => {
            window.location.href = 'index.html?auth=login';
        };
        if (loginBtn) loginBtn.addEventListener('click', handleLogin);
        if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', handleLogin);
    }
}

