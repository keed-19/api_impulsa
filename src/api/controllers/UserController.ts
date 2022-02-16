import { Request, Response } from 'express';
import {sign} from 'jsonwebtoken';
import { Twilio } from "twilio";
import { ClientsModel } from '../models/Client';
import { RegisterRequestModel } from '../models/RegisterRequest';
import { UsersModel } from '../models/User';


let cadena='';
class UserController {
    
    public index(_: Request, res: Response) {
        RegisterRequestModel.find({}, (err, users) => {
            if(err) return res.status(500).send({ message: `Error al hacer la petición: ${err}`})
            if(!users) return res.status(404).send({ message: `Aún no existen usuarios en la base de datos`})
    
            res.json({users:users})
        })
    }

    public ComprobarCod = async(_req:Request ,res:Response)=>{
        const _id = _req.body.id;
        const code = _req.body.Code;

        const user = await RegisterRequestModel.findById({_id})
        if(!user){
            
            res.json({
                message:'Usuario no encontrado',
            })
        }else if(user && user.tokenTotp===code){
            const client = new ClientsModel({
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                birthday: user.birthday,
                phoneNumber: user.phoneNumber
            });

            const saveuser = new UsersModel({
                username: user.phoneNumber,
                password: user.password,
                email: user.email,
                clientId: user._id
            });
    
            try {
                //almacenando los datos y devolviendo respuesta
                const savedClient = await client.save();
                const savedUser = await saveuser.save();

                await user.remove();

                res.status(200).json({
                    savedClient,
                    savedUser,
                    status: 200
                });

            } catch (error) {
                res.status(400).json({
                    error,
                    status: 400
                });
            }

        }else{
            res.json({messaje:'Verifica tu código'});
        }
    }

    public register = async(_req: Request, res: Response) =>{
        const isTelefonoExist = await ClientsModel.findOne({ phoneNumber: _req.body.phoneNumber });
        if (isTelefonoExist) {
            return res.status(400).json({
                    error: 'El numero telefonico ya esta registrado',
                    status: 208
                });
        }else{
            ramdom(_req.body.phoneNumber as Number);

            //instancia del modelo en espera
            const user = new RegisterRequestModel({
                firstName: _req.body.firstName,
                middleName: _req.body.middleName,
                lastName: _req.body.lastName,
                birthday: _req.body.birthday,
                phoneNumber: _req.body.phoneNumber,
                password: _req.body.password,
                email: _req.body.email,
                tokenTotp:cadena
            });

            try {

                //almacenando los datos y devolviendo respuesta
                const savedUser = await user.save();
                // ramdom(JSON.stringify(savedUser._id));

                res.json({
                    message: 'usuario registrado',
                    status: 200,
                    data: savedUser._id
                });
            } catch (error) {
                res.status(400).json({
                    error,
                    status: 400
                });
            }
        }
    }

    public login = async(_req: Request, res: Response) =>{
        const pass = _req.body.password;
        const numuser = _req.body.phoneNumber;
        
        // Validaciond e existencia
        const user = await RegisterRequestModel.findOne({phoneNumber: numuser})
        if(!user) {
            return res.status(400).json({
            error: 'Usuario no encontrado',
            status: 204
            })
        }else if(user.password === pass){
            
            // Creando token
            const token = sign({
                user
            }, process.env.TOKEN_SECRET as string);

            //creando el mensage de bienvenida
            const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
            const authToken = process.env.TWILIO_AUTH_TOKEN as string;

            const client = new Twilio(accountSid, authToken);

            await client.messages
            .create({
                body: `Hola ${user.firstName}, Impulsa te da la bienvenida, gracias por usar nuestra APP`,
                from: '+19378602978',
                to: `+52${user.phoneNumber}`
            })
            .then(message => console.log(message.sid));
            
            await res.send({
                status:200,
                data: { token },
                message: 'Bienvenido'
            })
            
        }else{
        
            return res.status(400).json({
                error: 'Constraseña invalida',
                status: 203
            })
        } 
    }

}

function ramdom(phone:Number){
    let val1 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    let val2 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    let val3 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    let val4 = Math.floor(Math.random() * (1 - 9 + 1) + 9);

    cadena=`${val1}${val2}${val3}${val4}`;

    const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
        const authToken = process.env.TWILIO_AUTH_TOKEN as string;

        const client = new Twilio(accountSid, authToken);

        client.messages
        .create({
            body: `Código de verificación: ${cadena}`,
            from: '+19378602978',
            to: `+52${phone}`
        })
        .then(message => console.log(message.sid));
    
    return(cadena);
}

export default new UserController();