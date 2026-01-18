// Главный файл - инициализация общих компонентов

import { initHeader } from './components/header.js';
import { initFooter } from './components/footer.js';
import { initAuthModal } from './components/auth.js';

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initFooter();
    initAuthModal();
});

