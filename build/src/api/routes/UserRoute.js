"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ImpulsaController_1 = __importDefault(require("../controllers/ImpulsaController"));
const UserController_1 = __importDefault(require("../controllers/UserController"));
const middleware_1 = __importDefault(require("../middlewares/middleware"));
const syncMiddleware_1 = __importDefault(require("../middlewares/syncMiddleware"));
const upload_1 = require("../middlewares/upload");
const UserRoute = (0, express_1.Router)();
UserRoute.post('/users', UserController_1.default.register);
UserRoute.post('/login', UserController_1.default.login);
// implementacion del middleware
UserRoute.post('/veryfic', middleware_1.default.veryfy);
// verificando el codigo de sms
UserRoute.post('/verificar', UserController_1.default.ComprobarCod);
// reenviar codigo de verificacion
UserRoute.get('/codigoR/:id', UserController_1.default.ReenvioConfirmacion);
// reenvioo de cod, pass
UserRoute.get('/reenvio/:phoneNumber', UserController_1.default.ReenvioConfirmacionResPass);
// reenvio a cliente externo
UserRoute.get('/forwardcode/:externalId/:id', UserController_1.default.ReenvioConfirmacionClientExternal);
// lista de polizas para un cliente
UserRoute.get('/app/policies/:id', UserController_1.default.ViewPolicies);
// ver poliza inf
UserRoute.get('/app/policyDetail/:id', UserController_1.default.seePolicyInformation);
// seleccionar polizas a ver
UserRoute.post('/app/selectPolicy', UserController_1.default.selectPolicy);
// vizualisar un pdf en especifico
UserRoute.get('/app/policie/:id', UserController_1.default.ViewPDF);
// este endpoint ya valida el token de maneracorrecta
// UserRoute.get('/app/policie/:id', [middleware.veryfy, UserController.ViewPDF]);
// Editar el alias de una poliza
UserRoute.put('/app/updateAlias', UserController_1.default.UpdateAlias);
// enviar codigo de seguridad a cliente externo
UserRoute.get('/app/externalClient/:clientId/:policyNumber', UserController_1.default.PolicyNumberSendSMS);
// comprobando el codigo
UserRoute.post('/app/verificar', UserController_1.default.VerifyClient);
// probando la validacion de ver las polizas pero si ta hay asociada alguna esa no se vera en la res
UserRoute.get('/app/policies/external/:id/:externalIdClient', UserController_1.default.ViewPoliciesExternal);
// restablecer contraseña
UserRoute.get('/app/restorepassSMS/:phoneNumber/:token', UserController_1.default.restorePassSendSMS);
// COMPROVAR COD
UserRoute.post('/app/restorepassVerify', UserController_1.default.restorePassComCod);
// restablecer contraseña
UserRoute.put('/app/restorepass', UserController_1.default.restorePass);
// lista de aseguradoras
UserRoute.get('/app/viewInsurances', ImpulsaController_1.default.ViewInsurances);
// ver notificaciones push
UserRoute.get('/app/notifications/:externalId', UserController_1.default.ViewNotificationsPush);
UserRoute.get('/app/sendNotifications', UserController_1.default.SendNotificationPushClient);
UserRoute.get('/app/privacyPolicies', UserController_1.default.ViewPrivacyPolitics);
/**
 * CRUD DE POLIZAS
*/
// obteniendo los PDF de un cliente
UserRoute.get('/sync/policies/:externalId', [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.ViewPolicies]);
// vizualisar un pdf en especifico
UserRoute.get('/sync/policie/:externalId', [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.ViewPDF]);
// vizualisar un pdf en especifico
UserRoute.get('/sync/policieDetail/:externalId', [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.ViewPolicyDetail]);
// guardar los archivos pdf en la carpeta uploads y guardando la factura en la base de datos
// UserRoute.post('/sync/policies/client/:externalIdClient', Upload.single('myFile'), ImpulsaController.SavePolice);
// UserRoute.post('/sync/policies/client/:externalIdClient', [syncMiddleware.veryfyCredential, uploadFiles.single('file'), ImpulsaController.SavePolice]);
UserRoute.post('/sync/policies/client/:externalIdClient', [syncMiddleware_1.default.veryfyCredential, upload_1.uploadFiles.single('myFile'), ImpulsaController_1.default.SavePolice]);
// eliminar pdf con el numero de poliza
UserRoute.delete('/sync/policies/:externalId', [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.DeletePolice]);
// actualizar polizas
UserRoute.put('/sync/policies/:externalId', upload_1.uploadFiles.single('myFile'), [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.UpdatePoliza]);
/**
 * FUNCIONALIDADES IMPULSA
 * CRUD DE CLIENTES
*/
// visualizar Clientes
// UserRoute.get('/sync/clients', syncMiddleware.veryfyCredential, ImpulsaController.ViewClients);
// UserRoute.get('/sync/clients', ImpulsaController.ViewClients);
UserRoute.get('/sync/clients', [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.ViewClients]);
// busqueda por rango de fechas
UserRoute.get('/sync/clients/policies', [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.SearchDate]);
// vizualisar cliente por numero de telefono
UserRoute.get('/sync/clients/:externalId', [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.ViewClient]);
// guardando clientes desde impulsa
UserRoute.post('/sync/clients', [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.SaveClient]);
// eliminando clientes
UserRoute.delete('/sync/clients/:externalId', [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.DeleteClient]);
// actualizar cliente
UserRoute.put('/sync/clients/:externalId', [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.UpdateClient]);
/**
 * FUNCIONALIDADES IMPULSA
 * CRUD DE ASEGURADORAS
*/
// guardar aseguradora
UserRoute.post('/sync/insurances', [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.SaveInsurance]);
// ver aseguradoras
UserRoute.get('/sync/insurances', [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.ViewInsurances]);
// ver aseguradora
UserRoute.get('/sync/insurances/:externalId', [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.ViewInsurance]);
// eliminar aseguradora
UserRoute.delete('/sync/delete/insurances/:externalId', [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.DeleteInsurance]);
// actualizar aseguradora
UserRoute.put('/sync/update/insurances/:externalId', [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.UpdateInsurance]);
// enviar notificaciones PUSH a un cliente por su externalId
UserRoute.post('/sync/push/:externalId', [syncMiddleware_1.default.veryfyCredential, ImpulsaController_1.default.sendPush]);
exports.default = UserRoute;
