"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = __importDefault(require("../controllers/UserController"));
const middleware_1 = __importDefault(require("../middlewares/middleware"));
const multer_1 = __importDefault(require("multer"));
const mime_types_1 = __importDefault(require("mime-types"));
// const sf = multer.diskStorage({
//     destination:'../files/',
//     filename:function(req,file,cb){
//         cb(null,Date.now + "." + mimeTypes.extension(file.mimetype));
//     }
// })
// const files = multer({
//     storage : sf
// });
// SET STORAGE
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime_types_1.default.extension(file.mimetype));
    }
});
var upload = (0, multer_1.default)({ storage: storage });
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
//TODOs: estas funciones ya estan listas pero hay que separar el codigo de route con el controlador.
// hay que implemetar la ñlogica del modelo de impuls
//upload.single('myFile')
//provando la ruta con middleware y controlador
UserRoute.post('/uploadfile', upload.array('myFile', 12), UserController_1.default.Savefiles);
//obteniendo los PDF
UserRoute.post('/viewFile', UserController_1.default.ViewFile);
exports.default = UserRoute;
