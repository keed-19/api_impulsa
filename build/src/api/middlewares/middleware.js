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
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
class UserMiddleware {
    constructor() {
        this.veryfy = (_req, res, next) => __awaiter(this, void 0, void 0, function* () {
            // Obtenemos el token del header del request
            const token = _req.header('auth-token');
            // Validamos si no hay token
            if (!token)
                return res.status(401).json({ error: 'Acceso denegado' });
            try {
                // Verificamos el token usando la dependencia de jwt y el método .verify
                const verified = (0, jsonwebtoken_1.verify)(token, 'YXBpTG9naW5Qcm95ZWN0MDU=');
                // si el token es correcto nos devolvera los datos que pusimos en el token
                // _req.user = verified
                if (verified) {
                    next();
                }
                else {
                    res.json('Acceso denegado');
                }
            }
            catch (error) {
                res.status(400).json({ error: 'Token no valido, acceso denegado' });
            }
        });
    }
}
exports.default = new UserMiddleware();
