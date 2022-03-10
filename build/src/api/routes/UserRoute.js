"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ImpulsaController_1 = __importDefault(require("../controllers/ImpulsaController"));
const UserController_1 = __importDefault(require("../controllers/UserController"));
const middleware_1 = __importDefault(require("../middlewares/middleware"));
const saveFile_1 = require("../services/saveFile");
const UserRoute = (0, express_1.Router)();
UserRoute.post('/users', UserController_1.default.register);
UserRoute.post('/login', UserController_1.default.login);
// implementacion del middleware
UserRoute.post('/veryfic', middleware_1.default.veryfy);
// verificando el codigo de sms
UserRoute.post('/verificar', UserController_1.default.ComprobarCod);
// reenviar codigo de verificacion
UserRoute.get('/codigoR/:id', UserController_1.default.ReenvioConfirmacion);
// reenvio a cliente externo
UserRoute.get('/forwardcode/:externalId', UserController_1.default.ReenvioConfirmacionClientExternal);
// lista de polizas para un cliente
UserRoute.get('/app/policies/:id', UserController_1.default.ViewPolicies);
// ver poliza inf
UserRoute.get('/app/policyDetail/:id', UserController_1.default.seePolicyInformation);
//seleccionar polizas a ver
UserRoute.post('/app/selectPolicy', UserController_1.default.selectPolicy);
// vizualisar un pdf en especifico
UserRoute.get('/app/policie/:id', UserController_1.default.ViewPDF);
// Editar el alias de una poliza
UserRoute.put('/app/updateAlias', UserController_1.default.UpdateAlias);
//todo: provando nueva funcionalidad
UserRoute.get('/app/externalClient/:clientId/:policyNumber', UserController_1.default.PolicyNumberSendSMS);
//comprobando el codigo 
UserRoute.post('/app/verificar', UserController_1.default.VerifyClient);
// visualizando las polizas externas
// UserRoute.get('/app/policies/external/:externalIdClient', UserController.ViewPoliciesExternal);
/**
 * CRUD DE POLIZAS
*/
// obteniendo los PDF de un cliente
UserRoute.get('/sync/policies/:externalId', ImpulsaController_1.default.ViewPolicies);
// vizualisar un pdf en especifico
UserRoute.get('/sync/policie/:externalId', ImpulsaController_1.default.ViewPDF);
// guardar los archivos pdf en la carpeta uploads y guardando la factura en la base de datos
UserRoute.post('/sync/policies/client/:externalIdClient', saveFile_1.Upload.single('myFile'), ImpulsaController_1.default.SavePolice);
// eliminar pdf con el numero de poliza
UserRoute.delete('/sync/policies/:externalId', ImpulsaController_1.default.DeletePolice);
// actualizar polizas
UserRoute.put('/sync/policies/:externalId', saveFile_1.Upload.single('myFile'), ImpulsaController_1.default.UpdatePoliza);
/**
 * FUNCIONALIDADES IMPULSA
 * CRUD DE CLIENTES
*/
// visualizar Clientes
// UserRoute.get('/sync/clients', syncMiddleware.veryfyCredential, ImpulsaController.ViewClients);
UserRoute.get('/sync/clients', ImpulsaController_1.default.ViewClients);
// vizualisar cliente por numero de telefono
UserRoute.get('/sync/clients/:externalId', ImpulsaController_1.default.ViewClient);
// guardando clientes desde impulsa
UserRoute.post('/sync/clients', ImpulsaController_1.default.SaveClient);
// eliminando clientes
UserRoute.delete('/sync/clients/:externalId', ImpulsaController_1.default.DeleteClient);
// actualizar cliente
UserRoute.put('/sync/clients/:externalId', ImpulsaController_1.default.UpdateClient);
/**
 * FUNCIONALIDADES IMPULSA
 * CRUD DE ASEGURADORAS
*/
//guardar aseguradora
UserRoute.post('/sync/insurances', ImpulsaController_1.default.SaveInsurance);
//ver aseguradoras
UserRoute.get('/sync/insurances', ImpulsaController_1.default.ViewInsurances);
//ver aseguradora
UserRoute.get('/sync/insurances/:externalId', ImpulsaController_1.default.ViewInsurance);
//eliminar aseguradora
UserRoute.delete('/sync/delete/insurances/:externalId', ImpulsaController_1.default.DeleteInsurance);
// actualizar aseguradora
UserRoute.put('/sync/update/insurances/:externalId', ImpulsaController_1.default.UpdateInsurance);
exports.default = UserRoute;
