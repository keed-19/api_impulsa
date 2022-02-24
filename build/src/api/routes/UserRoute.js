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
/**
    * funcionalidades de Impulsa, con su respectivo controlador
    * en desarrollo
*/
//TODOs: Rutas para las acciones de impulsa en desarrollo
//obteniendo los PDF
UserRoute.get('/viewFile/:id', ImpulsaController_1.default.ViewFile);
//guardar los archivos pdf en la carpeta uploads y guardando la factura en la base de datos
UserRoute.post('/uploadfile/:phoneNumber', saveFile_1.Upload.single('myFile'), ImpulsaController_1.default.Savefiles);
//guardando clientes desde impulsa
UserRoute.post('/saveclient', ImpulsaController_1.default.SaveClient);
//eliminando clientes
UserRoute.post('/deleteclient/:phoneNumber', ImpulsaController_1.default.DeleteClient);
exports.default = UserRoute;
