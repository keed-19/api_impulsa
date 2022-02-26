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
 * CRUD DE POLIZAS
*/

//obteniendo los PDF
UserRoute.get('/viewFile/:id', ImpulsaController.ViewFile);

//vizualisar un pdf en web
UserRoute.get('/viewPDF/:name', ImpulsaController.ViewPDF);

//guardar los archivos pdf en la carpeta uploads y guardando la factura en la base de datos
UserRoute.post('/uploadfile/:phoneNumber', Upload.single('myFile'), ImpulsaController.Savefiles);

//descargar pdf
// UserRoute.get('/download/:name', ImpulsaController.DownloadPDF);

//eliminar pdf con el numero de poliza
UserRoute.delete('/deletePolicy/:policyNumber', ImpulsaController.DeletePDF);

//actualizar polizas
UserRoute.put('/updatePoliza/:policeId', ImpulsaController.UpdatePoliza);



/**
 * CRUD DE CLIENTES
*/

//visualizar PDF's
UserRoute.get('/clients', ImpulsaController.ViewClients);

//vizualisar cliente por numero de telefono

UserRoute.get('/client/:phoneNumber', ImpulsaController.ViewClient);

//guardando clientes desde impulsa
UserRoute.post('/saveclient', ImpulsaController.SaveClient);

//eliminando clientes
UserRoute.delete('/deleteclient/:phoneNumber', ImpulsaController.DeleteClient);

//actualizar cliente
UserRoute.put('/updateClient/:clientId', ImpulsaController.UpdateClient);

export default UserRoute;