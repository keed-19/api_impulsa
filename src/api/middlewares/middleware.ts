import { NextFunction, Request, Response } from 'express';
import {sign, verify} from 'jsonwebtoken';

interface IVerified {
    _id: String;
    iat: Number;
    exp: Number;
}
class UserMiddleware {
    public veryfy = async(_req: Request, res: Response, next: NextFunction) =>{
        // Obtenemos el token del header del request
        const token = _req.header('auth-token')
        // Validamos si no hay token
        if(!token) return res.status(401).json({error: 'Acceso denegado'});
        try {
            const verified = verify(token, process.env.TOKEN_SECRET || '') as unknown as IVerified;
            // console.log(verified.exp);
            const verifiCad = (Math.floor(Date.now() / 1000) > verified.exp);
            if (verifiCad===false) {
                next();
            } else {
                res.status(400).json({
                    message: 'El token ha expirado',
                    status: 400
                });
            }
        } catch (error) {
         res.status(400).send({
             message: 'Ocurrio un error: ' + error,
             status: 400
         });   
        }
    }
}

export default new UserMiddleware();