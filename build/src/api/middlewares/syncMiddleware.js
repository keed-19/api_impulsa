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
class SyncMiddleware {
    constructor() {
        this.veryfyCredential = (_req, res, next) => __awaiter(this, void 0, void 0, function* () {
            // Obtenemos el token del header del request
            const IMPULSA_API_KEY = _req.header('IMPULSA_API_KEY');
            const IMPULSA_API_SECRET = _req.header('IMPULSA_API_SECRET');
            try {
                // Validamos si no hay token
                if (!IMPULSA_API_KEY && !IMPULSA_API_SECRET) {
                    return res.status(401).json({ error: 'Se necesitan las credenciales' });
                }
                else if (IMPULSA_API_KEY === process.env.IMPULSA_API_KEY && IMPULSA_API_SECRET === process.env.IMPULSA_API_SECRET) {
                    try {
                        next();
                    }
                    catch (error) {
                        res.send(error);
                    }
                }
                else {
                    return res.send('Las credenciales no son correctas');
                }
            }
            catch (error) {
                res.status(400).json(error);
            }
        });
    }
}
exports.default = new SyncMiddleware();
