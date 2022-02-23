"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const multer_1 = __importDefault(require("multer"));
const mime_types_1 = __importDefault(require("mime-types"));
class UserMiddleware {
    constructor() {
        this.veryfy = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            // Obtenemos el token del header del request
            const token = _req.header('auth-token');
            // Validamos si no hay token
            if (!token)
                return res.status(401).json({ error: 'Acceso denegado' });
            try {
                // Verificamos el token usando la dependencia de jwt y el método .verify
                const verified = (0, jsonwebtoken_1.verify)(token, process.env.TOKEN_SECRET);
                // si el token es correcto nos devolvera los datos que pusimos en el token
                // _req.user = verified
                if (verified) {
                    res.json({
                        status: 200,
                        messaje: 'Usuario correcto'
                    });
                }
            }
            catch (error) {
                res.status(400).json({ error: 'Token no valido, acceso denegado' });
            }
        });
        this.saveFile = (_req, res, next) => {
            var storage = multer_1.default.diskStorage({
                destination: function (req, file, cb) {
                    cb(null, 'src/uploads');
                },
                filename: function (req, file, cb) {
                    cb(null, file.fieldname + '-' + Date.now() + "." + mime_types_1.default.extension(file.mimetype));
                }
            });
            var upload = (0, multer_1.default)({ storage: storage });
            next();
            return upload;
        };
    }
}
exports.default = new UserMiddleware();
