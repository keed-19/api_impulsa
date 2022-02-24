import { Router } from 'express';
import ImpulsaController from '../controllers/ImpulsaController';
import UserController from '../controllers/UserController';
import UserMiddleware from '../middlewares/middleware';
import { Upload } from '../services/saveFile';


const UserRoute: Router = Router();
/**
    // UserRoute.get('/', UserController.index);
 */
// UserRoute.get('/',function(req,res){
//     res.sendFile(__dirname + '/index.html');
    
// });

UserRoute.post('/users', UserController.register);

UserRoute.post('/login', UserController.login);

//implementacion del middleware
UserRoute.post('/veryfic', UserMiddleware.veryfy);

//verificando el codigo de sms
UserRoute.post('/verificar', UserController.ComprobarCod);


//TODOs: Rutas para las acciones de impulsa en desarrollo
//guardar los archivos pdf en la carpeta uploads y guardando la factura en la base de datos
UserRoute.post('/uploadfile/:phoneNumber', Upload.single('myFile'), ImpulsaController.Savefiles);

//guardando 

//obteniendo los PDF
UserRoute.get('/viewFile/:id', ImpulsaController.ViewFile);


export default UserRoute;