import { Router } from 'express';
import ImpulsaController from '../controllers/ImpulsaController';
import UserController from '../controllers/UserController';
import UserMiddleware from '../middlewares/middleware';
import { Upload } from '../services/saveFile';
const UserRoute: Router = Router();

UserRoute.post('/users', UserController.register);

UserRoute.post('/login', UserController.login);

// implementacion del middleware
UserRoute.post('/veryfic', UserMiddleware.veryfy);

// verificando el codigo de sms
UserRoute.post('/verificar', UserController.ComprobarCod);

// reenviar codigo de verificacion
UserRoute.get('/codigoR/:phoneNumber', UserController.ReenvioConfirmacion);

// lista de polizas para un cliente
UserRoute.get('/app/policies/:id', UserController.ViewPolicies);

// vizualisar un pdf en especifico
UserRoute.get('/app/policie/:name', UserController.ViewPDF);

//todo: provando nueva funcionalidad
UserRoute.get('/app/externalClient/:policyNumber', UserController.PolicyNumberSendSMS);

/**
 * CRUD DE POLIZAS
*/

// obteniendo los PDF de un cliente
UserRoute.get('/sync/policies/:externalId', ImpulsaController.ViewPolicies);

// vizualisar un pdf en especifico
UserRoute.get('/sync/policie/:name', ImpulsaController.ViewPDF);

// guardar los archivos pdf en la carpeta uploads y guardando la factura en la base de datos
UserRoute.post('/sync/policies', Upload.single('myFile'), ImpulsaController.SavePolice);

// eliminar pdf con el numero de poliza
UserRoute.delete('/sync/policies/:policyNumber', ImpulsaController.DeletePolice);

// actualizar polizas
UserRoute.put('/sync/policies/:policeId', Upload.single('myFile'), ImpulsaController.UpdatePoliza);

/**
 * FUNCIONALIDADES IMPULSA
 * CRUD DE CLIENTES
*/

// visualizar Clientes
UserRoute.get('/sync/clients', ImpulsaController.ViewClients);

// vizualisar cliente por numero de telefono

UserRoute.get('/sync/clients/:externalId', ImpulsaController.ViewClient);

// guardando clientes desde impulsa
UserRoute.post('/sync/clients', ImpulsaController.SaveClient);

// eliminando clientes
UserRoute.delete('/sync/clients/:externalId', ImpulsaController.DeleteClient);

// actualizar cliente
UserRoute.put('/sync/clients/:externalId', ImpulsaController.UpdateClient);

export default UserRoute;