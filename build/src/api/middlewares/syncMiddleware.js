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
        this.veryfyCredential = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            // Obtenemos el token del header del request
            const IMPULSA_API_KEY = _req.header('IMPULSA_API_KEY');
            const IMPULSA_API_SECRET = _req.header('IMPULSA_API_SECRET');
            // Validamos si no hay token
            if (!IMPULSA_API_KEY && !IMPULSA_API_SECRET) {
                return res.status(401).json({ error: 'Se necesitan las credenciales' });
            }
            else if (IMPULSA_API_KEY === process.env.IMPULSA_API_KEY && IMPULSA_API_SECRET === process.env.IMPULSA_API_SECRET) {
                res.send('Credenciales corectas');
            }
            // try {
            //     // Verificamos el token usando la dependencia de jwt y el método .verify
            //     const verified = verify(token, process.env.TOKEN_SECRET as string)
            //     // si el token es correcto nos devolvera los datos que pusimos en el token
            //     // _req.user = verified
            //     if(verified){
            //         res.json({
            //             status:200,
            //             messaje:'Usuario correcto'
            //         })
            //     }
            // } catch (error){
            //     res.status(400).json({error: 'Token no valido, acceso denegado'})
            // }
        });
    }
}
exports.default = new SyncMiddleware();
