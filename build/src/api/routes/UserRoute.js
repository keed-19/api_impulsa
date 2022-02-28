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
/**
    // UserRoute.get('/', UserController.index);
 */
// UserRoute.get('/',function(req,res){
//     res.sendFile(__dirname + '/index.html');
// });
UserRoute.post('/users', UserController_1.default.register);
UserRoute.post('/login', UserController_1.default.login);
//implementacion del middleware
UserRoute.post('/veryfic', middleware_1.default.veryfy);
//verificando el codigo de sms
UserRoute.post('/verificar', UserController_1.default.ComprobarCod);
//reenviar codigo de verificacion
UserRoute.get('/codigoR/:phoneNumber', UserController_1.default.ReenvioConfirmacion);
/**
 * CRUD DE POLIZAS
*/
//obteniendo los PDF
UserRoute.get('/viewFile/:id', ImpulsaController_1.default.ViewFile);
//vizualisar un pdf en web
UserRoute.get('/viewPDF/:name', ImpulsaController_1.default.ViewPDF);
//guardar los archivos pdf en la carpeta uploads y guardando la factura en la base de datos
UserRoute.post('/uploadfile/:phoneNumber', saveFile_1.Upload.single('myFile'), ImpulsaController_1.default.Savefiles);
//descargar pdf
// UserRoute.get('/download/:name', ImpulsaController.DownloadPDF);
//eliminar pdf con el numero de poliza
UserRoute.delete('/deletePolicy/:policyNumber', ImpulsaController_1.default.DeletePDF);
//actualizar polizas
UserRoute.put('/updatePoliza/:policeId', ImpulsaController_1.default.UpdatePoliza);
/**
 * CRUD DE CLIENTES
*/
//visualizar PDF's
UserRoute.get('/clients', ImpulsaController_1.default.ViewClients);
//vizualisar cliente por numero de telefono
UserRoute.get('/client/:phoneNumber', ImpulsaController_1.default.ViewClient);
//guardando clientes desde impulsa
UserRoute.post('/saveclient', ImpulsaController_1.default.SaveClient);
//eliminando clientes
UserRoute.delete('/deleteclient/:phoneNumber', ImpulsaController_1.default.DeleteClient);
//actualizar cliente
UserRoute.put('/updateClient/:clientId', ImpulsaController_1.default.UpdateClient);
exports.default = UserRoute;
