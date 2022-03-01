/** Imports models and pluggins */
import { Request, Response } from 'express';
import {sign} from 'jsonwebtoken';
import { Twilio } from "twilio";
import { ClientsModel } from '../models/Client';
import { InsurancePoliciesModel } from '../models/InsurancePolicy';
import { RegisterRequestModel } from '../models/RegisterRequest';
import { UsersModel } from '../models/User';
import fs from 'fs';

/** Variable for verification code */
let cadena='';
let cadenaReenvio='';

/** My class of user controller */
class UserController {
    
    /** 
        * Function to get users from database 
    */
    public index(_: Request, res: Response) {
        RegisterRequestModel.find({}, (err, users) => {
            res.set('Access-Control-Allow-Origin', '*');
            if(err) return res.status(500).send({ message: `Error al hacer la petición: ${err}`});
            if(!users) return res.status(404).send({ message: `Aún no existen usuarios en la base de datos`});
    
            res.status(200).json({users:users});
        })
    }

    /** 
        * Function to post id user and verific code of RegisterRequestModel 
        * This function accept two parameters
        * The parameter id is type string
        * The parameter Code is type string 
    */
    public ComprobarCod = async(_req:Request ,res:Response)=>{
        /** frond end acces origin */
        res.set('Access-Control-Allow-Origin', '*');
        const _id = _req.body.id;
        const code = _req.body.Code;

        /** Search RegisterRequest with id parameter */
        const user = await RegisterRequestModel.findOne({_id});
        if(!user){
            res.status(404).json({message:'Usuario no encontrado'});
        }else if(user && user.tokenTotp===code){

            // instantiating the models
            const client = new ClientsModel({
                firstName       :    user.firstName,
                middleName      :    user.middleName,
                lastName        :    user.lastName,
                birthday        :    user.birthday,
                phoneNumber     :    user.phoneNumber
            });
    
            try {
                //save models with data of RegisterRequestModel
                const savedClient = await client.save();

                if (savedClient){
                    const saveuser = new UsersModel({
                        username       :     user.phoneNumber,
                        password       :     user.password,
                        email          :     user.email,
                        clientId       :     savedClient._id
                    });

                    await saveuser.save();
                }

                //delete RegisterRequestModel 
                await user.remove();

                //send request
                res.status(200).json({
                    savedClient,
                    status: 200
                });

            } catch (error) {
                res.status(404).json({
                    error,
                    status: 404,
                });
            }

        }else{
            res.status(203).json({message:'Verifica tu código',status: 203});
        }
    }

    //reenvio de codigo de verificacion
    public ReenvioConfirmacion = async(_req:Request, res:Response)=>{
        let _id = _req.params._id as Object;

        const updateRequest = await RegisterRequestModel.findOne(_id);
        
        try {
            
            ramdomReenvio(updateRequest?.phoneNumber as Number);
            console.log(cadenaReenvio);

            let update = {tokenTotp : cadenaReenvio}
            
            await RegisterRequestModel.updateOne(_id, update)
            // const updateRequestNow = await RegisterRequestModel.findOne(_id);
            res.status(200).json({
                message : 'El código se reenvió con éxito',
                status : 200
            });
            
        } catch (error) {
            
        }
    }

    /** 
        * Function to create RegisterRequestModel on database and save verific code SMS
        * This function accepts the personal data of the users 
    */
    public register = async(_req: Request, res: Response) =>{
        res.set('Access-Control-Allow-Origin', '*');
        /** search Number phone in the data base */
        const isTelefonoExist = await ClientsModel.findOne({ phoneNumber: _req.body.phoneNumber });

        if (isTelefonoExist) {
            return res.status(208).json({
                    message: 'El número de teléfono ya está registrado',
                    status: 208
                });
        }else{
            //send verification code to number phone of the user
            ramdom(_req.body.phoneNumber as Number);

            //instantiating the model for save data
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

                //save data
                const savedUser = await user.save();

                //send request exit
                res.status(200).json({
                    message: 'usuario registrado',
                    status: 200,
                    data: savedUser._id
                });
            } catch (error) {
                res.status(400).json({
                    message : error,
                    status: 400
                });
            }
        }
    }

   /**
    * function to login of the application
    * @param {String} _req this parameter receives two values the phone number and the password 
    * @param {Json} res is response function in json format
    * @returns {Json}
    */
    public login = async(_req: Request, res: Response) =>{
        res.set('Access-Control-Allow-Origin', '*');
        const pass = _req.body.password;
        const numuser = _req.body.phoneNumber;
        
        // search user
        const user = await UsersModel.findOne({username: numuser});
        if(!user) {
            return res.status(203).send({
                message: 'Credenciales incorrectas',
                status: 203
            });
        }else if(user.password === pass){

            //search user in model clients
            const searchclient = await ClientsModel.findOne({phoneNumber : numuser});
            
            // creating  token
            const token = sign({
                user
            }, process.env.TOKEN_SECRET as string);

            //creating message Twilio
            // const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
            // const authToken = process.env.TWILIO_AUTH_TOKEN as string;

            // const client = new Twilio(accountSid, authToken);

            //sent SMS of twilio
            // await client.messages
            // .create({
            //     body: `Hola ${searchclient?.firstName}, Impulsa te da la bienvenida, gracias por usar nuestra APP`,
            //     from: '+19378602978',
            //     to: `+52${user.username}`
            // })
            // .then(message => console.log(message.sid));
            
            //send request
            await res.status(200).json({
                status:200,
                data: { token },
                name: searchclient?.firstName,
                id: searchclient?.externalId,
                phoneNumber : user.username
            })
            
        }else{
        
            return res.status(203).json({
                message: 'Credenciales incorrectas',
                status: 203
            })
        } 
    }

    //ver polizas de un cliente
    public ViewPolicies = async(_req : Request, res : Response)=>{
        res.set('Access-Control-Allow-Origin', '*');

        var _id = _req.params.id;

        const error : any=[];

        const isPoliceExist = await InsurancePoliciesModel.find({externalId:_id});

        if(!isPoliceExist){
            res.json({
                message : 'No estas asociado a ninguna poliza aún'
            })
        }else if(isPoliceExist){
            // const url = isUserExist;
            const validator = isObjEmpty(isPoliceExist as object);

            if(validator===true){
                return res.status(400).json({
                    error
                })
            }
            res.status(200).json(isPoliceExist)
        }else{
            res.json({
                mensaje : 'ocurrio un error'
            })
        }
    }

    //ver pdf de un cliente
    public ViewPDF = async(_req : Request, res : Response)=>{
        res.set('Access-Control-Allow-Origin', '*');

        var name = _req.params.name as String;
        var data =fs.readFileSync('src/uploads/'+name);

        try {
            res.setHeader('Content-Type', 'application/pdf');
            // res.contentType("application/pdf");
            res.send(data);
        } catch (error) {
            res.status(404).send('No se encuentra la poliza: '+error);
        }
    }
}

/**
 * function to generate a number code with for digits and send message SMS
 * @param {Number} phone Number phone User to send verification code
 * @returns {String} this value is the code verification
 */
function ramdom(phone:Number){
    //generating 4 random numbers
    let val1 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    let val2 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    let val3 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    let val4 = Math.floor(Math.random() * (1 - 9 + 1) + 9);

    //save code in variable to save with user data
    cadena=`${val1}${val2}${val3}${val4}`;

    const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
        //token twilio
        const authToken = process.env.TWILIO_AUTH_TOKEN as string;

        // instantiating twilio
        const client = new Twilio(accountSid, authToken);

        //send code verification
        client.messages
        .create({
            body: `Tu código de verificación es: ${cadena}`,
            from: '+19378602978',
            to: `+52${phone}`
        })
        .then(message => console.log(message.sid));
    
    return(cadena);
}

function ramdomReenvio(phone:Number){
    //generating 4 random numbers
    let val1 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    let val2 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    let val3 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    let val4 = Math.floor(Math.random() * (1 - 9 + 1) + 9);

    //save code in variable to save with user data
    cadenaReenvio=`${val1}${val2}${val3}${val4}`;

    const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
        //token twilio
        const authToken = process.env.TWILIO_AUTH_TOKEN as string;

        // instantiating twilio
        const client = new Twilio(accountSid, authToken);

        //send code verification
        client.messages
        .create({
            body: `Tu código de verificación es: ${cadenaReenvio}`,
            from: '+19378602978',
            to: `+52${phone}`
        })
        .then(message => console.log(message.sid));
    
    return(cadenaReenvio);
}

function isObjEmpty(obj:Object) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) return false;
    }
  
    return true;
  }

export default new UserController();