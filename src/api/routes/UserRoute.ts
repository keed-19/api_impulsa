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
UserRoute.get('/codigoR/:id', UserController.ReenvioConfirmacion);

// reenvio a cliente externo
UserRoute.get('/forwardcode/:externalId', UserController.ReenvioConfirmacionClientExternal);

// lista de polizas para un cliente
UserRoute.get('/app/policies/:id', UserController.ViewPolicies);

// vizualisar un pdf en especifico
UserRoute.get('/app/policie/:externalId', UserController.ViewPDF);

// Editar el alias de una poliza
UserRoute.put('/app/updateAlias', UserController.UpdateAlias);

//todo: provando nueva funcionalidad
UserRoute.get('/app/externalClient/:clientId/:policyNumber', UserController.PolicyNumberSendSMS);

//comprobando el codigo 
UserRoute.post('/app/verificar', UserController.VerifyClient);

// visualizando las polizas externas
UserRoute.get('/app/policies/external/:externalIdClient', UserController.ViewPoliciesExternal);

/**
 * CRUD DE POLIZAS
*/

// obteniendo los PDF de un cliente
UserRoute.get('/sync/policies/:externalId', ImpulsaController.ViewPolicies);

// vizualisar un pdf en especifico
UserRoute.get('/sync/policie/:externalId', ImpulsaController.ViewPDF);

// guardar los archivos pdf en la carpeta uploads y guardando la factura en la base de datos
UserRoute.post('/sync/policies/client/:externalIdClient', Upload.single('myFile'), ImpulsaController.SavePolice);

// eliminar pdf con el numero de poliza
UserRoute.delete('/sync/policies/:externalId', ImpulsaController.DeletePolice);

// actualizar polizas
UserRoute.put('/sync/policies/:externalId', Upload.single('myFile'), ImpulsaController.UpdatePoliza);

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

/**
 * FUNCIONALIDADES IMPULSA
 * CRUD DE ASEGURADORAS
*/

//guardar aseguradora
UserRoute.post('/sync/insurances', ImpulsaController.SaveInsurance);

//ver aseguradoras
UserRoute.get('/sync/insurances', ImpulsaController.ViewInsurances);

//ver aseguradora
UserRoute.get('/sync/insurances/:externalId', ImpulsaController.ViewInsurance);

//eliminar aseguradora
UserRoute.delete('/sync/delete/insurances/:externalId', ImpulsaController.DeleteInsurance);

// actualizar aseguradora
UserRoute.put('/sync/update/insurances/:externalId', ImpulsaController.UpdateInsurance);


export default UserRoute;