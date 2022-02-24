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


/**
    * funcionalidades de Impulsa, con su respectivo controlador
    * en desarrollo
*/
//TODOs: Rutas para las acciones de impulsa en desarrollo

//obteniendo los PDF
UserRoute.get('/viewFile/:id', ImpulsaController.ViewFile);

//guardar los archivos pdf en la carpeta uploads y guardando la factura en la base de datos
UserRoute.post('/uploadfile/:phoneNumber', Upload.single('myFile'), ImpulsaController.Savefiles);

//guardando clientes desde impulsa
UserRoute.post('/saveclient', ImpulsaController.SaveClient);

//eliminando clientes
UserRoute.post('/deleteclient/:phoneNumber', ImpulsaController.DeleteClient);

//actualizar cliente

export default UserRoute;