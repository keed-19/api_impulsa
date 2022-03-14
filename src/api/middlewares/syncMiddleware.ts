import { NextFunction, Request, Response } from 'express';

class SyncMiddleware {

    public veryfyCredential = async(_req: Request, res: Response, next: NextFunction) =>{
        // Obtenemos el token del header del request
        const IMPULSA_API_KEY = _req.header('IMPULSA_API_KEY');
        const IMPULSA_API_SECRET = _req.header('IMPULSA_API_SECRET');
        try {
            // Validamos si no hay token
            if(!IMPULSA_API_KEY && !IMPULSA_API_SECRET) {
                return res.status(401).json({error: 'Se necesitan las credenciales'});
            } else if(IMPULSA_API_KEY === process.env.IMPULSA_API_KEY && IMPULSA_API_SECRET===process.env.IMPULSA_API_SECRET) {
                try {
                    next();
                } catch (error) {
                    res.send(error);
                }
            } else {
                return res.send('Las credenciales no son correctas');
            }
        } catch (error){
            res.status(400).json(error);
        }
    }
}

export default new SyncMiddleware();