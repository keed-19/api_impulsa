import { NextFunction, Request, Response } from 'express';
import {sign, verify} from 'jsonwebtoken';

class UserMiddleware {

    public veryfy = async(_req: Request, res: Response, next: NextFunction) =>{
        // Obtenemos el token del header del request
        const token = _req.header('auth-token')
        // Validamos si no hay token
        if(!token) return res.status(401).json({error: 'Acceso denegado'})
        try {
            // Verificamos el token usando la dependencia de jwt y el método .verify
            const verified = verify(token, 'YXBpTG9naW5Qcm95ZWN0MDU=')
            // si el token es correcto nos devolvera los datos que pusimos en el token
            // _req.user = verified
            if(verified){
                next();
            } else {
                res.json('Acceso denegado')
            }
        } catch (error){
            res.status(400).json({error: 'Token no valido, acceso denegado'})
        }
    }
}

export default new UserMiddleware();