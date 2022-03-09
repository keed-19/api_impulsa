/** Imports models and pluggins */
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { Twilio } from 'twilio';
import { ClientsModel } from '../models/Client';
import { InsurancePoliciesModel } from '../models/InsurancePolicy';
import { RegisterRequestModel } from '../models/RegisterRequest';
import { UsersModel } from '../models/User';
import fs from 'fs';
import { ExternalPolicyClinetModel } from '../models/ExternalPolicyClinet';

/** Variable for verification code */
let cadena = '';
let cadenaReenvio = '';
let CodeValidator = '';

/** My class of user controller */
class UserController {
  /** Function to get users from database */
  public index (_: Request, res: Response) {
    RegisterRequestModel.find({}, (err, users) => {
      res.set('Access-Control-Allow-Origin', '*');
      if (err) return res.status(500).send({ message: `Error al hacer la petición: ${err}` });
      if (!users) return res.status(404).send({ message: 'Aún no existen usuarios en la base de datos' });

      res.status(200).json({ users: users });
    });
  }

  /**
      * Function to post id user and verific code of RegisterRequestModel
      * This function accept two parameters
      * The parameter id is type string
      * The parameter Code is type string
  */
  public ComprobarCod = async (_req:Request, res:Response) => {
    /** frond end acces origin */
    res.set('Access-Control-Allow-Origin', '*');
    const _id = _req.body.id;
    const code = _req.body.Code;

    /** Search RegisterRequest with id parameter */
    const user = await RegisterRequestModel.findOne({ _id });
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
    } else if (user && user.tokenTotp === code) {
      // instantiating the models
      const client = new ClientsModel({
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        birthday: user.birthday,
        phoneNumber: user.phoneNumber
      });

      try {
        // save models with data of RegisterRequestModel
        const savedClient = await client.save();

        if (savedClient) {
          const saveuser = new UsersModel({
            username: user.phoneNumber,
            password: user.password,
            email: user.email,
            clientId: savedClient._id
          });

          await saveuser.save();
        }
        // delete RegisterRequestModel
        await user.remove();
        // send request
        res.status(200).json({
          savedClient,
          status: 200
        });
      } catch (error) {
        res.status(404).json({
          error,
          status: 404
        });
      }
    } else {
      res.status(203).json({
        message: 'Verifica tu código',
        status: 203
      });
    }
  }

  // reenvio de codigo de verificacion
  public ReenvioConfirmacion = async (_req:Request, res:Response) => {
    const _id = _req.params._id as Object;

    try {
      const updateRequest = await RegisterRequestModel.findOne(_id);
      ramdomReenvio(updateRequest?.phoneNumber as Number);
      console.log(cadenaReenvio);

      const update = { tokenTotp: cadenaReenvio };
      await RegisterRequestModel.updateOne(_id, update);
      // const updateRequestNow = await RegisterRequestModel.findOne(_id);
      res.status(200).json({
        message: 'El código se reenvió con éxito',
        status: 200
      });
    } catch (error) {
      res.status(400).json({
        message: 'Ocurrio un error: ' + error,
        status: 400
      });
    }
  }

  //reenvio de codigo a cliente externo
  public ReenvioConfirmacionClientExternal = async (_req:Request, res:Response) => {
    const Id = _req.params.externalId;
    const externalId = parseInt(Id);
    console.log(externalId);
    const isClientExist = await ClientsModel.findOne({ externalId: externalId });
    if (isClientExist){
      const phone = isClientExist?.phoneNumber as String;
      const id = isClientExist?._id;
      ramdomReenvioClinet(phone);

      const updateClient = { verificationCode: cadenaReenvio };
      await ClientsModel.findByIdAndUpdate(id, updateClient);
      // const updateRequestNow = await RegisterRequestModel.findOne(_id);
      res.status(200).json({
        message: 'El código se reenvió con éxito',
        status: 200
      });
    } else {
      res.status(400).json({
        message: 'No se encuentra el cliente',
        status: 400
      });
    }
  }

  /**
    * Function to create RegisterRequestModel on database and save verific code SMS
    * This function accepts the personal data of the users
  */
  public register = async (_req: Request, res: Response) => {
    res.set('Access-Control-Allow-Origin', '*');
    /** search Number phone in the data base */
    const isTelefonoExist = await ClientsModel.findOne({ phoneNumber: _req.body.phoneNumber });

    if (isTelefonoExist) {
      return res.status(208).json({
        message: 'El número de teléfono ya está registrado',
        status: 208
      });
    } else {
      // send verification code to number phone of the user
      ramdom(_req.body.phoneNumber as Number);

      // instantiating the model for save data
      const user = new RegisterRequestModel({
        firstName: _req.body.firstName,
        middleName: _req.body.middleName,
        lastName: _req.body.lastName,
        birthday: _req.body.birthday,
        phoneNumber: _req.body.phoneNumber,
        password: _req.body.password,
        email: _req.body.email,
        tokenTotp: cadena
      });

      try {
        // save data
        const savedUser = await user.save();

        // send request exit
        res.status(200).json({
          message: 'usuario registrado',
          status: 200,
          data: savedUser._id
        });
      } catch (error) {
        res.status(400).json({
          message: error,
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
  public login = async (_req: Request, res: Response) => {
    res.set('Access-Control-Allow-Origin', '*');
    const pass = _req.body.password;
    const numuser = _req.body.phoneNumber;
    // search user
    const user = await UsersModel.findOne({ username: numuser });
    if (!user) {
      return res.status(203).send({
        message: 'Credenciales incorrectas',
        status: 203
      });
    } else if (user.password === pass) {
      // search user in model clients
      const searchclient = await ClientsModel.findOne({ phoneNumber: numuser });
      // creating  token
      const token = sign({
        user
      }, process.env.TOKEN_SECRET as string);

      // // creating message Twilio
      // const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
      // const authToken = process.env.TWILIO_AUTH_TOKEN as string;

      // const client = new Twilio(accountSid, authToken);

      // // sent SMS of twilio
      // await client.messages
      // .create({
      //     body: `Hola ${searchclient?.firstName}, Impulsa te da la bienvenida, gracias por usar nuestra APP`,
      //     from: '+19378602978',
      //     to: `+52${user.username}`
      // })
      // .then(message => console.log(message.sid));

      // send request
      await res.status(200).json({
        status: 200,
        data: { token },
        name: searchclient?.firstName,
        external_id: searchclient?.externalId,
        id: searchclient?._id,
        phoneNumber: user.username
      });
    } else {
      return res.status(203).json({
        message: 'Credenciales incorrectas',
        status: 203
      });
    }
  }

  // ver polizas de un cliente
  public ViewPolicies = async (_req : Request, res : Response) => {
    res.set('Access-Control-Allow-Origin', '*');

    const _id = _req.params.id as Object;

    try {
      const isClientExist = await ClientsModel.findById(_id);

      //buscar polizas propias
      const externalIdPropio = isClientExist?.externalId;
      const polizasPropias = await InsurancePoliciesModel.find({externalIdClient: externalIdPropio});
      const id = _id as String;
      //buscar polizas asociadas
      const polizasExternas = await ExternalPolicyClinetModel.find({IdClient: id});
      
      if(!isClientExist) {
        res.status(400).json({
          message: 'No eres cliente de impulsa',
          status: 400
        });
      } else if(isClientExist && polizasPropias && polizasExternas) {
        //mapear las polizas asociadas para mandarlas en la respuesta
        var policyRatings:Array<any>=[];
        var policyMe:Array<any>=[];
        var mostrar:Array<any>=[];
        var mostrarPolizas:Array<any>=[];

        const ClientProp = await ClientsModel.findOne({externalId: externalIdPropio});
        const policyProp = await InsurancePoliciesModel.find({externalIdClient: ClientProp?.externalId});
        policyProp.forEach(item=>{ 
          policyMe.push(
            {
              id: item.externalId,
              Alias: item.alias,
              Tipo: item.policyType
            }
          );
        });

        const misPolizas = {
          id: ClientProp?.externalId,
          Nombre: ClientProp?.firstName,
          polizas: policyMe
        }

        polizasExternas.forEach(item=>{ 
          policyRatings.push(
            {
              externalIdClient: item.externalIdClient
            }
          );
        });
        const arrayLenght = policyRatings.length;
        for (var i=0; i<arrayLenght;i++) {
          const search = policyRatings[i].externalIdClient;
          // console.log(search)
          const valores = await InsurancePoliciesModel.find({externalIdClient: search});
          const valoresClientes = await ClientsModel.find({externalId: search});
          valores.forEach(item=>{ 
            mostrarPolizas.push(
              {
                id: item.externalId,
                Alias: item.alias,
                Tipo: item.policyType
              }
            );
          });

          valoresClientes.forEach(item=>{ 
            mostrar.push(
              {
                id: item.externalId,
                Nombre: item.firstName,
                polizas: mostrarPolizas
              }
            );
          });
        }
        // console.log(mostrar);
        // console.log(arrayLenght)
        // console.log(mostrar)
        if (misPolizas.id===undefined && arrayLenght==0) {
          await res.status(400).json({
            message: 'No tienes pólizas ni estas asociado a otras pólizas',
            status: 400
          });
        } else if(misPolizas.id===undefined) {
          await res.status(200).json([mostrar]);
        } else if(arrayLenght==0) {
          await res.status(200).json([[misPolizas]]);
        } else if(ClientProp != undefined) {
          await res.status(200).json([[misPolizas],mostrar]);
        }

      } else {
        res.status(400).json({
          message: 'Ocurrio un error',
          status: 400
        });
      }
    } catch (error) {
      res.status(400).json({
        message: 'Ocurrio un error: ' + error,
        status: 400
      });
    }
  }

  // ver pdf de un cliente
  public ViewPDF = async (_req : Request, res : Response) => {
    res.set('Access-Control-Allow-Origin', '*');

    const externalId = _req.params.externalId;

    const isPolicyExist = await InsurancePoliciesModel.findOne({ externalId: externalId});
    if (isPolicyExist) {

      const name = isPolicyExist?.fileUrl;

      try {
        const data = fs.readFileSync('src/uploads/' + name);
  
        res.setHeader('Content-Type', 'application/pdf');
        // res.contentType("application/pdf");
        res.send(data);
      } catch (error) {
        res.status(400).send({
          message: 'No se ecuentra la póliza: ' + error,
          status: 400
        });
      }
    }
  }

  // actualizar alias de poliza personal
  public UpdateAlias = async (_req : Request, res : Response) => {
    res.set('Access-Control-Allow-Origin', '*');
      const externalId = _req.body.externalId;
      const externalIdClient = _req.body.externalIdClient;
      const update = {
        alias: _req.body.alias
      }

      const isPolicyExist = await InsurancePoliciesModel.findOne({ externalId: externalId });

      if (isPolicyExist) {
        const Id = isPolicyExist.externalIdClient;
        if (Id == externalIdClient) {
          const _id = isPolicyExist._id;
          try {
            await InsurancePoliciesModel.findByIdAndUpdate(_id,update);
            res.status(200).json({
              message: 'Actualización del alias correcto',
              status: 200
            })
          } catch (error) {
            return res.status(400).json(error);
          }
        } else {
          res.status(400).json({
            message: 'No se encontro la póliza',
            id: Id,
            status: 400
          });
        }
      } else {
        res.status(400).json({
          message: 'No estas asociado a ninguna póliza',
          status: 400
        })
      }
  } 

  //todo: provando el endpoint para devolver las polizas asociadas de un cliente a otro
  //listo
  public PolicyNumberSendSMS = async (_req:Request, res:Response) => {
    const policyNumber = _req.params.policyNumber;
    const NumberPolice = parseInt(policyNumber);
    const _id = _req.params.clientId as Object;

    const isPolicyExist = await InsurancePoliciesModel.findOne({ policyNumber: NumberPolice});
    
    if (isPolicyExist) {
      const client = await ClientsModel.findOne({ externalId: isPolicyExist.externalIdClient });
      
      if (client) {
        sendSMSClientPolicy(client.phoneNumber);
        const update = { verificationCode: CodeValidator };
        const clienteActualizado = await ClientsModel.findByIdAndUpdate(_id, update);

        if (clienteActualizado) {
          const clientExternalId = client.externalId;

          res.status(200).json({
            clientExternalId,
            status: 200
          });
        } else {
          res.status(400).json({
            message: 'Ocurrio un error',
            status: 400
          });
        }
      }
    } else {
      res.status(400).json({
        message: 'Póliza no encontrada',
        status: 400
      });
    }
  }

  // verificacion de codigo
  //todo: pendiente por generar el modelo de relacion de la polizas externas con el aias
  public VerifyClient = async (_req:Request, res:Response) => {
    /** frond end acces origin */
    res.set('Access-Control-Allow-Origin', '*');
    const _id = _req.body.id as Object;//id del cliente que quiere ver polizas externas
    const externalIdClient = _req.body.externalIdClient;//para ver las polizas del usuario externo
    const code = _req.body.code as Number;

    /** Search RegisterRequest with id parameter */
    const user = await ClientsModel.findById({ _id: _id });
    if (!user) {
      res.status(404).json({ message: 'No se encuantra el usuario' });
    } else if (user.verificationCode == code) {

      const isPoliceExist = await InsurancePoliciesModel.findOne({ externalIdClient: externalIdClient });
      // const external = isPoliceExist?.externalIdClient;

      res.status(200).json({
        data: isPoliceExist,
        status: 200
      });
      // instantiating the models

      // const externalClient = new ExternalPolicyClinetModel({
      //   IdClient: user._id,
      //   externalIdClient: external
      // });

      // try {
      //   // save models with data of RegisterRequestModel
      //   const savedClient = await externalClient.save();
      //   const Policies = await InsurancePoliciesModel.find({ externalIdClient: externalIdClient });

      //   if (savedClient) {
      //     res.status(200).json({
      //       externalIdClient: external,
      //       status: 200
      //     });
      //   }
      // } catch (error) {
      //   res.status(400).json({
      //     error,
      //     status: 400
      //   });
      // }
    } else {
      res.status(203).json({
        message: 'Verifica tu código',
        status: 203
      });
    }
  }

  //seleccionar las polizas que el cliente decea ver
  public selectPolicy = async (_req:Request, res:Response) => {
    //ejemplo de peticion desde la movil
    // const arregloPeticion = _req.body.data;
    // console.log(arregloPeticion);
    
    const IdClient = _req.body.IdClient;
    const Idpoliza = _req.body.data;

    // console.log(IdClient,Idpoliza);
    // const valoresEnviados = ["6226333ef66c1c0fe0cc6dfd", "62263463b920af7b1ec9b5f3"];

    // let sliceRoles = valoresEnviados.length;
    var policyViewSelect:Array<any>=[]
    let fromRoles = Array.from(Idpoliza);

    const arrayLenght = fromRoles.length;
    for (var i=0; i<arrayLenght;i++) {
      const _id = fromRoles[i] as Object;
      // const idp = {id: _id as String}
      // console.log(idp)
      const valores = await InsurancePoliciesModel.find({_id: _id});
      // console.log(valores);
      // // valores?._id;
      
      // // const valoresClientes = await ClientsModel.find({externalId: search});
      valores.forEach(item=>{ 
        policyViewSelect.push(
          {
            id: JSON.stringify(item._id),
            alias: item.alias
          }
        );
      });
    }

    const arrayLenghtSave = await policyViewSelect.length;
    for (var i=0; i<arrayLenghtSave;i++) {
      const externalId = policyViewSelect[i].id;
      const externalIdPolicy = externalId.slice(1, -1);
      const alias = policyViewSelect[i].alias;
      const save = {IdClient,externalIdPolicy,alias}
      const savePolicy = new ExternalPolicyClinetModel(save);
      try {
        await savePolicy.save();
      } catch (error) {
        return res.json(error)
      }
      // console.log({save});
    }

    res.status(200).json({
      message: 'Todo salio bien',
      status: 200
    });
    
    
    // // esto y funciona
    // var policyRatings:Array<any>=[
    //   {"id": "6226333ef66c1c0fe0cc6dfd"},
    //   {"id": "62263463b920af7b1ec9b5f3"},
    // ];

    // const arrayLenght = policyRatings.length;
    // for (var i=0; i<arrayLenght;i++) {
    //   const _id = policyRatings[i].id;
    //   // console.log(search)
    //   const valores = await InsurancePoliciesModel.find({_id: _id});
    //   // valores?._id;
      
    //   // const valoresClientes = await ClientsModel.find({externalId: search});
    //   valores.forEach(item=>{ 
    //     policyViewSelect.push(
    //       {
    //         id: JSON.stringify(item._id),
    //         alias: item.alias
    //       }
    //     );
    //   });
    // }

    // const arrayLenghtSave = await policyViewSelect.length;
    // for (var i=0; i<arrayLenghtSave;i++) {
    //   const externalId = policyViewSelect[i].id;
    //   const externalIdPolicy = externalId.slice(1, -1);
    //   const alias = policyViewSelect[i].alias;
    //   const save = {IdClient,externalIdPolicy,alias}
    //   const savePolicy = new ExternalPolicyClinetModel(save);
    //   try {
    //     await savePolicy.save();
    //   } catch (error) {
    //     return res.json(error)
    //   }
    //   // console.log({save});
    // }
    // res.json(policyViewSelect);
  }

  // devolviendo las polizas de un cliente externo
  public ViewPoliciesExternal = async (_req : Request, res : Response) => {
    res.set('Access-Control-Allow-Origin', '*');

    const externalIdClient = _req.params.externalIdClient;

    const isPoliceExist = await InsurancePoliciesModel.find({ externalIdClient: externalIdClient });

    if (!isPoliceExist) {
      res.status(400).json({
        message: 'No estas asociado a ninguna poliza aún',
        status: 400
      });
    } else if (isPoliceExist) {
      // const url = isUserExist;
      const validator = isObjEmpty(isPoliceExist as object);

      if (validator === true) {
        return res.status(400).json({
          data: [],
          status: 400 
        });
      }
      res.status(200).json(isPoliceExist);
    } else {
      res.status(400).json({
        mensaje: 'ocurrio un error',
        status: 400
      });
    }
  }
  
}

/**
 * function to generate a number code with for digits and send message SMS
 * @param {Number} phone Number phone User to send verification code
 * @returns {String} this value is the code verification
 */
function ramdom (phone:Number) {
  // generating 4 random numbers
  const val1 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
  const val2 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
  const val3 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
  const val4 = Math.floor(Math.random() * (1 - 9 + 1) + 9);

  // save code in variable to save with user data
  cadena = `${val1}${val2}${val3}${val4}`;

  const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
  // token twilio
  const authToken = process.env.TWILIO_AUTH_TOKEN as string;

  // instantiating twilio
  const client = new Twilio(accountSid, authToken);

  // send code verification
  client.messages.create({
    body: `Tu código de verificación es: ${cadena}`,
    from: '+19378602978',
    to: `+52${phone}`
  }).then((message: { sid: any; }) => console.log(message.sid));

  return (cadena);
}

function ramdomReenvio (phone:Number) {
  // generating 4 random numbers
  const val1 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
  const val2 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
  const val3 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
  const val4 = Math.floor(Math.random() * (1 - 9 + 1) + 9);

  // save code in variable to save with user data
  cadenaReenvio = `${val1}${val2}${val3}${val4}`;

  const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
  // token twilio
  const authToken = process.env.TWILIO_AUTH_TOKEN as string;

  // instantiating twilio
  const client = new Twilio(accountSid, authToken);

  // send code verification
  client.messages.create({
    body: `Tu código de verificación es: ${cadenaReenvio}`,
    from: '+19378602978',
    to: `+52${phone}`
  }).then(message => console.log(message.sid));
  return (cadenaReenvio);
}

function ramdomReenvioClinet (phone:String) {
  // generating 4 random numbers
  const val1 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
  const val2 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
  const val3 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
  const val4 = Math.floor(Math.random() * (1 - 9 + 1) + 9);

  // save code in variable to save with user data
  cadenaReenvio = `${val1}${val2}${val3}${val4}`;

  const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
  // token twilio
  const authToken = process.env.TWILIO_AUTH_TOKEN as string;

  // instantiating twilio
  const client = new Twilio(accountSid, authToken);

  // send code verification
  client.messages.create({
    body: `Tu código de verificación es: ${cadenaReenvio}`,
    from: '+19378602978',
    to: `+52${phone}`
  }).then(message => console.log(message.sid));
  return (cadenaReenvio);
}

function isObjEmpty (obj:Object) {
  for (const prop in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(prop)) return false;
  }
  return true;
}

function sendSMSClientPolicy(phone: String) {
  // generating 4 random numbers
  const val1 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
  const val2 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
  const val3 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
  const val4 = Math.floor(Math.random() * (1 - 9 + 1) + 9);

  // save code in variable to save with user data
  CodeValidator = `${val1}${val2}${val3}${val4}`;

  const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
  // token twilio
  const authToken = process.env.TWILIO_AUTH_TOKEN as string;

  // instantiating twilio
  const client = new Twilio(accountSid, authToken);

  // send code verification
  client.messages.create({
    body: `Tu código de verificación para compartir tus pólizas es: ${CodeValidator}`,
    from: '+19378602978',
    to: `+52${phone}`
  }).then(message => console.log(message.sid));
  return (CodeValidator);
}
export default new UserController();

