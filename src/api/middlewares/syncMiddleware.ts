import { Request, Response } from 'express';
import {sign, verify} from 'jsonwebtoken';
import multer from "multer";
import mimeTypes from 'mime-types';
import { NetworkContext } from 'twilio/lib/rest/supersim/v1/network';

class SyncMiddleware {

    public veryfyCredential = async(_req: Request, res: Response) =>{
        // Obtenemos el token del header del request
        const IMPULSA_API_KEY = _req.header('IMPULSA_API_KEY');
        const IMPULSA_API_SECRET = _req.header('IMPULSA_API_SECRET');
        // Validamos si no hay token
        if(!IMPULSA_API_KEY && !IMPULSA_API_SECRET) {
            return res.status(401).json({error: 'Se necesitan las credenciales'});
        } else if(IMPULSA_API_KEY === process.env.IMPULSA_API_KEY && IMPULSA_API_SECRET===process.env.IMPULSA_API_SECRET) {
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
    }
}

export default new SyncMiddleware();