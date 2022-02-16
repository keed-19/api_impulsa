import { Router } from 'express';
import UserController from '../controllers/UserController';
import UserMiddleware from '../middlewares/middleware'


const UserRoute: Router = Router();

UserRoute.get('/', UserController.index);

UserRoute.post('/users', UserController.register);

UserRoute.post('/login', UserController.login);

//implementacion del middleware
UserRoute.post('/veryfic', UserMiddleware.veryfy)

//verificando el codigo de sms
UserRoute.post('/verificar', UserController.ComprobarCod)

export default UserRoute;