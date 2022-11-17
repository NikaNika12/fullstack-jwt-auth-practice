const ApiError = require('../exceptions/api-error');
const tokenService = require('../service/token-service');

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) { //если хедер не указан пользователь не зарегестрирован
            return next(ApiError.UnauthorizedError());
        }

        const accessToken = authorizationHeader.split(' ')[1];//разбиваем на Bearer и сам токен
        if (!accessToken) {
            return next(ApiError.UnauthorizedError());
        }

        const userData = tokenService.validateAccessToken(accessToken);
        if (!userData) {
            return next(ApiError.UnauthorizedError());
        }

        req.user = userData;//если все ок и токен валидный, тогда в поле юзера помещаем информацию о пользователе, которые достали из токена 
        next(); //передаем управление след мидлваре
    } catch (e) {
        return next(ApiError.UnauthorizedError());//случай когда пользователь не авторизован
    }
};
