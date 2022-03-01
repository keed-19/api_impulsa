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
//implementacion del middleware
UserRoute.post('/veryfic', middleware_1.default.veryfy);
//verificando el codigo de sms
UserRoute.post('/verificar', UserController_1.default.ComprobarCod);
//reenviar codigo de verificacion
UserRoute.get('/codigoR/:phoneNumber', UserController_1.default.ReenvioConfirmacion);
//lista de polizas para un cliente
UserRoute.get('/app/policies/:id', UserController_1.default.ViewPolicies);
//vizualisar un pdf en especifico
UserRoute.get('/app/policie/:name', UserController_1.default.ViewPDF);
/**
 * CRUD DE POLIZAS
*/
//obteniendo los PDF de un cliente
UserRoute.get('/sync/policies/:externalId', ImpulsaController_1.default.ViewPolicies);
//vizualisar un pdf en especifico
UserRoute.get('/sync/policie/:name', ImpulsaController_1.default.ViewPDF);
//guardar los archivos pdf en la carpeta uploads y guardando la factura en la base de datos
UserRoute.post('/sync/policies', saveFile_1.Upload.single('myFile'), ImpulsaController_1.default.SavePolice);
//eliminar pdf con el numero de poliza
UserRoute.delete('/sync/policies/:policyNumber', ImpulsaController_1.default.DeletePolice);
//actualizar polizas
UserRoute.put('/sync/policies/:policeId', saveFile_1.Upload.single('myFile'), ImpulsaController_1.default.UpdatePoliza);
/**
 * FUNCIONALIDADES IMPULSA
 * CRUD DE CLIENTES
*/
//visualizar Clientes
UserRoute.get('/sync/clients', ImpulsaController_1.default.ViewClients);
//vizualisar cliente por numero de telefono
UserRoute.get('/sync/clients/:externalId', ImpulsaController_1.default.ViewClient);
//guardando clientes desde impulsa
UserRoute.post('/sync/clients', ImpulsaController_1.default.SaveClient);
//eliminando clientes
UserRoute.delete('/sync/clients/:externalId', ImpulsaController_1.default.DeleteClient);
//actualizar cliente
UserRoute.put('/sync/clients/:clientId', ImpulsaController_1.default.UpdateClient);
exports.default = UserRoute;
