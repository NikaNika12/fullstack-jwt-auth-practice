const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({email})
        if (candidate) {
            //throw new Error(`Пользователь с почтовым адресом ${email} уже существует`)
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4(); // v34fa-asfasf-142saf-sa-asf

        const user = await UserModel.create({email, password: hashPassword, activationLink})
        await mailService.sendActivationMail(email, /*activationLink)*/ `${process.env.API_URL}/api/activate/${activationLink}`) //отправляем письмо для активации

        const userDto = new UserDto(user); // id, email, isActivated payload for token 
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})
        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        const user = await UserModel.findOne({email}) //ищем пользователя в БД с указанной почтой
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден')
        }
        const isPassEquals = await bcrypt.compare(password, user.password);//введенный пароль сравниваем с захешированным паролем в БД
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }
        const userDto = new UserDto(user);//из модели убирает все ненужное
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);//удалить токен из БД
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);//валидация токена
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {//проверка валидация и поиск в БД прошли успешно
            throw ApiError.UnauthorizedError();//значит пользователь не авторизован
        }
        const user = await UserModel.findById(userData.id);//находим пользователя по id
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});//генерируем пару токенов

        await tokenService.saveToken(userDto.id, tokens.refreshToken);//рефреш токен сохраняем в БД
        return {...tokens, user: userDto}
    }

    async getAllUsers() {
        const users = await UserModel.find();//возвращает все записи из БД
        return users;
    }
}

module.exports = new UserService();
