import { Router } from 'express';
import ImpulsaController from '../controllers/ImpulsaController';
import UserController from '../controllers/UserController';
import UserMiddleware from '../middlewares/middleware';
import syncMiddleware from '../middlewares/syncMiddleware';
import { uploadFiles } from '../middlewares/upload';
const UserRoute: Router = Router();

UserRoute.post('/users', UserController.register);

UserRoute.post('/login', UserController.login);

// implementacion del middleware
UserRoute.post('/veryfic', UserMiddleware.veryfy);

// verificando el codigo de sms
UserRoute.post('/verificar', UserController.ComprobarCod);

// reenviar codigo de verificacion
UserRoute.get('/codigoR/:id', UserController.ReenvioConfirmacion);

// reenvioo de cod, pass
UserRoute.get('/reenvio/:phoneNumber', UserController.ReenvioConfirmacionResPass);

// reenvio a cliente externo
UserRoute.get('/forwardcode/:externalId/:id', UserController.ReenvioConfirmacionClientExternal);

// lista de polizas para un cliente
UserRoute.get('/app/policies/:id', UserController.ViewPolicies);

// ver poliza inf
UserRoute.get('/app/policyDetail/:id', UserController.seePolicyInformation);

// seleccionar polizas a ver
UserRoute.post('/app/selectPolicy', UserController.selectPolicy);

// vizualisar un pdf en especifico
UserRoute.get('/app/policie/:id', UserController.ViewPDF);

// este endpoint ya valida el token de maneracorrecta
// UserRoute.get('/app/policie/:id', [middleware.veryfy, UserController.ViewPDF]);

// Editar el alias de una poliza
UserRoute.put('/app/updateAlias', UserController.UpdateAlias);

// enviar codigo de seguridad a cliente externo
UserRoute.get('/app/externalClient/:clientId/:policyNumber', UserController.PolicyNumberSendSMS);

// comprobando el codigo
UserRoute.post('/app/verificar', UserController.VerifyClient);

// probando la validacion de ver las polizas pero si ta hay asociada alguna esa no se vera en la res
UserRoute.get('/app/policies/external/:id/:externalIdClient', UserController.ViewPoliciesExternal);

// restablecer contraseña
UserRoute.get('/app/restorepassSMS/:phoneNumber/:token', UserController.restorePassSendSMS);

// COMPROVAR COD
UserRoute.post('/app/restorepassVerify', UserController.restorePassComCod);

// restablecer contraseña
UserRoute.put('/app/restorepass', UserController.restorePass);

// lista de aseguradoras
UserRoute.get('/app/viewInsurances', ImpulsaController.ViewInsurances);

// ver notificaciones push
UserRoute.get('/app/notifications/:externalId', UserController.ViewNotificationsPush);

UserRoute.get('/app/sendNotifications', UserController.SendNotificationPushClient);

UserRoute.get('/app/privacyPolicies', UserController.ViewPrivacyPolitics);

/**
 * CRUD DE POLIZAS
*/

// obteniendo los PDF de un cliente
UserRoute.get('/sync/policies/:externalId', [syncMiddleware.veryfyCredential, ImpulsaController.ViewPolicies]);

// vizualisar un pdf en especifico
UserRoute.get('/sync/policie/:externalId', [syncMiddleware.veryfyCredential, ImpulsaController.ViewPDF]);

// vizualisar un pdf en especifico
UserRoute.get('/sync/policieDetail/:externalId', [syncMiddleware.veryfyCredential, ImpulsaController.ViewPolicyDetail]);

// guardar los archivos pdf en la carpeta uploads y guardando la factura en la base de datos
// UserRoute.post('/sync/policies/client/:externalIdClient', Upload.single('myFile'), ImpulsaController.SavePolice);
// UserRoute.post('/sync/policies/client/:externalIdClient', [syncMiddleware.veryfyCredential, uploadFiles.single('file'), ImpulsaController.SavePolice]);
UserRoute.post('/sync/policies/client/:externalIdClient', [syncMiddleware.veryfyCredential, uploadFiles.single('myFile'), ImpulsaController.SavePolice]);

// eliminar pdf con el numero de poliza
UserRoute.delete('/sync/policies/:externalId', [syncMiddleware.veryfyCredential, ImpulsaController.DeletePolice]);

// actualizar polizas
UserRoute.put('/sync/policies/:externalId', uploadFiles.single('myFile'), [syncMiddleware.veryfyCredential, ImpulsaController.UpdatePoliza]);

/**
 * FUNCIONALIDADES IMPULSA
 * CRUD DE CLIENTES
*/

// visualizar Clientes
// UserRoute.get('/sync/clients', syncMiddleware.veryfyCredential, ImpulsaController.ViewClients);
// UserRoute.get('/sync/clients', ImpulsaController.ViewClients);
UserRoute.get('/sync/clients', [syncMiddleware.veryfyCredential, ImpulsaController.ViewClients]);

// vizualisar cliente por numero de telefono

UserRoute.get('/sync/clients/:externalId', [syncMiddleware.veryfyCredential, ImpulsaController.ViewClient]);

// guardando clientes desde impulsa
UserRoute.post('/sync/clients', [syncMiddleware.veryfyCredential, ImpulsaController.SaveClient]);

// eliminando clientes
UserRoute.delete('/sync/clients/:externalId', [syncMiddleware.veryfyCredential, ImpulsaController.DeleteClient]);

// actualizar cliente
UserRoute.put('/sync/clients/:externalId', [syncMiddleware.veryfyCredential, ImpulsaController.UpdateClient]);

/**
 * FUNCIONALIDADES IMPULSA
 * CRUD DE ASEGURADORAS
*/

// guardar aseguradora
UserRoute.post('/sync/insurances', [syncMiddleware.veryfyCredential, ImpulsaController.SaveInsurance]);

// ver aseguradoras
UserRoute.get('/sync/insurances', [syncMiddleware.veryfyCredential, ImpulsaController.ViewInsurances]);

// ver aseguradora
UserRoute.get('/sync/insurances/:externalId', [syncMiddleware.veryfyCredential, ImpulsaController.ViewInsurance]);

// eliminar aseguradora
UserRoute.delete('/sync/delete/insurances/:externalId', [syncMiddleware.veryfyCredential, ImpulsaController.DeleteInsurance]);

// actualizar aseguradora
UserRoute.put('/sync/update/insurances/:externalId', [syncMiddleware.veryfyCredential, ImpulsaController.UpdateInsurance]);

// enviar notificaciones PUSH a un cliente por su externalId
UserRoute.post('/sync/push/:externalId', [syncMiddleware.veryfyCredential, ImpulsaController.sendPush]);

export default UserRoute;
