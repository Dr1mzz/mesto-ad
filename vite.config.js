// Импортируем функцию defineConfig из Vite для типизированной настройки конфигурации
import { defineConfig } from 'vite';

// Экспортируем конфигурацию сборщика Vite
export default defineConfig({
    // Настройки dev-сервера для разработки
    server: {
        // open: true - автоматически открывает браузер при запуске dev-сервера (npm run dev)
        // Браузер откроется на адресе, где запущен сервер (обычно http://localhost:5173)
        open: true
    }
});

