// Утилиты для работы с localStorage

const STORAGE_KEYS = {
    USER: 'school11_user',
    FAVORITES: 'school11_favorites',
    REQUESTS: 'school11_requests',
    ORDERS: 'school11_orders',
};

export const storage = {
    // Пользователь
    getUser() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.USER);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },

    setUser(user) {
        try {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            return true;
        } catch {
            return false;
        }
    },

    clearUser() {
        localStorage.removeItem(STORAGE_KEYS.USER);
    },

    // Избранное
    getFavorites() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    addFavorite(clubId) {
        const favorites = this.getFavorites();
        if (!favorites.includes(clubId)) {
            favorites.push(clubId);
            localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        }
    },

    removeFavorite(clubId) {
        const favorites = this.getFavorites();
        const filtered = favorites.filter(id => id !== clubId);
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
    },

    isFavorite(clubId) {
        return this.getFavorites().includes(clubId);
    },

    // Заявки
    getRequests() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    addRequest(request) {
        const requests = this.getRequests();
        requests.push(request);
        localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
        return request;
    },

    // Заказы
    getOrders() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    addOrder(order) {
        const orders = this.getOrders();
        orders.push(order);
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        return order;
    },

    // Очистка всех данных
    clearAll() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },
};

