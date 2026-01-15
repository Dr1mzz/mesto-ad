const config = {
    // baseUrl должен быть в формате: "https://mesto.nomoreparties.co/v1/cohort-XX"
    // Замените XX на номер вашей когорты (например, cohort-77)
    baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-202",
    headers: {
        // authorization должен содержать ваш токен без фигурных скобок
        // Токен выдается при регистрации на платформе Практикум
        authorization: "0459dacc-b238-4f25-90b5-35889cf22b58",
        "Content-Type": "application/json",
    },
};

const getResponseData = (res) => {
    return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
};

// Получение информации о текущем пользователе
// Выполняет GET запрос к API-серверу по адресу ${config.baseUrl}/users/me

export const getUserInfo = () => {
    return fetch(`${config.baseUrl}/users/me`, {
        // Запрос к API-серверу для получения данных текущего пользователя
        headers: config.headers, // Подставляем заголовки авторизации и Content-Type
    }).then(getResponseData); // Проверяем успешность выполнения запроса и парсим JSON
};

// Получение списка всех карточек с сервера
// Выполняет GET запрос к API-серверу по адресу ${config.baseUrl}/cards
// Возвращает Promise с массивом карточек

export const getCardList = () => {
    return fetch(`${config.baseUrl}/cards`, {
        // Запрос к API-серверу для получения списка всех карточек
        headers: config.headers, // Подставляем заголовки авторизации и Content-Type
    }).then(getResponseData); // Проверяем успешность выполнения запроса и парсим JSON
};

// Обновление информации о пользователе на сервере
// { name, about } - деструктуризация объекта с данными для обновления
// name - новое имя пользователя
// about - новое описание пользователя
// Выполняет PATCH запрос к API-серверу по адресу ${config.baseUrl}/users/me
// PATCH - метод HTTP для частичного обновления ресурса
// Возвращает Promise с обновленными данными пользователя
export const setUserInfo = ({ name, about }) => {
    return fetch(`${config.baseUrl}/users/me`, {
        method: "PATCH", // Метод HTTP для обновления данных
        headers: config.headers, // Заголовки с токеном авторизации и Content-Type
        body: JSON.stringify({
            // Преобразуем объект в JSON строку для отправки на сервер
            name, // Свойство name (сокращенная запись name: name)
            about, // Свойство about (сокращенная запись about: about)
        }),
    }).then(getResponseData); // Проверяем успешность выполнения запроса и парсим JSON
};

// Обновление аватара пользователя на сервере
// avatarUrl - URL нового аватара (ссылка на изображение)
// Выполняет PATCH запрос к API-серверу по адресу ${config.baseUrl}/users/me/avatar
// PATCH - метод HTTP для частичного обновления ресурса
// Возвращает Promise с обновленными данными пользователя
export const setUserAvatar = (avatarUrl) => {
    return fetch(`${config.baseUrl}/users/me/avatar`, {
        method: "PATCH", // Метод HTTP для обновления данных
        headers: config.headers, // Заголовки с токеном авторизации и Content-Type
        body: JSON.stringify({
            // Преобразуем объект в JSON строку для отправки на сервер
            avatar: avatarUrl, // Свойство avatar со ссылкой на новое изображение
        }),
    }).then(getResponseData); // Проверяем успешность выполнения запроса и парсим JSON
};

// Добавление новой карточки на сервер
// { name, link } - деструктуризация объекта с данными карточки
// name - название карточки
// link - ссылка на изображение карточки
// Выполняет POST запрос к API-серверу по адресу ${config.baseUrl}/cards
// POST - метод HTTP для создания нового ресурса
// Возвращает Promise с данными созданной карточки
export const addCard = ({ name, link }) => {
    return fetch(`${config.baseUrl}/cards`, {
        method: "POST", // Метод HTTP для создания нового ресурса
        headers: config.headers, // Заголовки с токеном авторизации и Content-Type
        body: JSON.stringify({
            // Преобразуем объект в JSON строку для отправки на сервер
            name, // Свойство name (сокращенная запись name: name)
            link, // Свойство link (сокращенная запись link: link)
        }),
    }).then(getResponseData); // Проверяем успешность выполнения запроса и парсим JSON
};

// Удаление карточки с сервера
// cardId - идентификатор карточки, которую нужно удалить
// Выполняет DELETE запрос к API-серверу по адресу ${config.baseUrl}/cards/${cardId}
// DELETE - метод HTTP для удаления ресурса
// Возвращает Promise с ответом сервера: { "message": "Пост удалён" }
export const deleteCardApi = (cardId) => {
    return fetch(`${config.baseUrl}/cards/${cardId}`, {
        method: "DELETE", // Метод HTTP для удаления ресурса
        headers: config.headers, // Заголовки с токеном авторизации и Content-Type
    }).then(getResponseData); // Проверяем успешность выполнения запроса и парсим JSON
};

// Изменение статуса лайка карточки (постановка или снятие лайка)
// cardId - идентификатор карточки
// isLiked - булево значение: true если лайк уже стоит (нужно снять), false если лайка нет (нужно поставить)
// Выполняет PUT или DELETE запрос к API-серверу по адресу ${config.baseUrl}/cards/likes/${cardId}
// PUT - метод HTTP для постановки лайка
// DELETE - метод HTTP для снятия лайка
// Возвращает Promise с обновленными данными карточки (включая обновленный массив likes)
export const changeLikeCardStatus = (cardId, isLiked) => {
    return fetch(`${config.baseUrl}/cards/likes/${cardId}`, {
        // Тернарный оператор: если isLiked === true, используем DELETE (снять лайк), иначе PUT (поставить лайк)
        // Тернарный оператор: условие ? значениеЕслиTrue : значениеЕслиFalse
        method: isLiked ? "DELETE" : "PUT",
        headers: config.headers, // Заголовки с токеном авторизации и Content-Type
    }).then((res) => getResponseData(res)); // Проверяем успешность выполнения запроса и парсим JSON
}; 