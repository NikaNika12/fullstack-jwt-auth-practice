module.exports = class ApiError extends Error {
    status;
    errors;

    constructor(status, message, errors = []) { ///*ошибок нет по\тому по умолчанию ставим пустым*/ параметры конструктора
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static UnauthorizedError() { //статик функции без создания экземпляра класса нет ошибок
        return new ApiError(401, 'Пользователь не авторизован')
    }

    static BadRequest(message, errors = []) { //есть ошибки
        return new ApiError(400, message, errors);
    }
}
