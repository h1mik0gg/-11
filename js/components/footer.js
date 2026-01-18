// Компонент Footer

export function renderFooter() {
    return `
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-grid">
                    <div class="footer-section" style="text-align: center;">
                        <h3 style="text-align: center;">Контакты</h3>
                        <p>г. Оренбург, Ул. Авиационная 8/3</p>
                        <p>+7 (3532) 44-24-37</p>
                        <p>11@orenschool.ru</p>
                    </div>
                    <div class="footer-section" style="text-align: center;">
                        <h3 style="text-align: center;">Быстрые ссылки</h3>
                        <a href="catalog.html">Каталог кружков</a>
                        <a href="news.html">Новости</a>
                        <a href="contacts.html">Контакты</a>
                    </div>
                    <div class="footer-section" style="text-align: center;">
                        <h3 style="text-align: center;">Связаться с нами</h3>
                        <div style="display: flex; gap: 12px; justify-content: center; align-items: center;">
                            <a href="https://t.me/orenschool11" target="_blank" rel="noopener noreferrer" 
                               style="display: inline-flex; align-items: center; justify-content: center;">
                                <img src="access/images/тг лого.svg" alt="Telegram" style="width: 48px; height: 48px;">
                            </a>
                            <a href="https://vk.com/public215405735" target="_blank" rel="noopener noreferrer"
                               style="display: inline-flex; align-items: center; justify-content: center;">
                                <img src="access/images/вк лого.svg" alt="VK" style="width: 48px; height: 48px;">
                            </a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>
                        <a href="#privacy" style="color: rgba(0, 0, 0, .7); margin: 0 8px;">Политика конфиденциальности</a>
                        <span style="color: rgba(0, 0, 0, .7);">•</span>
                        <a href="#consent" style="color: rgba(0, 0, 0, .7); margin: 0 8px;">Согласие на обработку данных</a>
                    </p>
                    <p style="margin-top: 16px;">© 2025 Школа №11. Все права защищены.</p>
                </div>
            </div>
        </footer>
    `;
}

export function initFooter() {
    const container = document.getElementById('footer-container');
    if (container) {
        container.innerHTML = renderFooter();
    }
}

