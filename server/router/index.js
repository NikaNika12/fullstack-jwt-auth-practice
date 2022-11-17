const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const {body} = require('express-validator'); //валидация тела запроса
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/registration',
    body('email').isEmail(), //валидация емейл
    body('password').isLength({min: 3, max: 32}), //валидация по длине пароля
    userController.registration
);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/users', authMiddleware, userController.getUsers);

module.exports = router
