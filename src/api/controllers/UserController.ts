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
import mimeTypes from 'mime-types';

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

  // reenvio de codigo a cliente externo
  public ReenvioConfirmacionClientExternal = async (_req:Request, res:Response) => {
    const Id = _req.params.externalId;
    const externalId = parseInt(Id);
    console.log(externalId);
    const isClientExist = await ClientsModel.findOne({ externalId: externalId });
    if (isClientExist) {
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

  // este funciona bien pero aun falta .ver polizas de un cliente
  public ViewPolicies = async (_req : Request, res : Response) => {
    res.set('Access-Control-Allow-Origin', '*');

    const _id = _req.params.id as Object;

    try {
      const isClientExist = await ClientsModel.findById(_id);

      // buscar polizas propias
      const externalIdPropio = isClientExist?.externalId;
      const polizasPropias = await InsurancePoliciesModel.find({ externalIdClient: externalIdPropio });
      const id = _id as String;
      // buscar polizas asociadas
      const polizasExternas = await ExternalPolicyClinetModel.find({ IdClient: id });
      // console.log(polizasExternas);
      if (!isClientExist) {
        res.status(400).json({
          message: 'No eres cliente de impulsa',
          status: 400
        });
      } else if (isClientExist && polizasPropias && polizasExternas) {
        // mapear las polizas asociadas para mandarlas en la respuesta
        const policyRatings:Array<any> = [];
        const policyMe:Array<any> = [];
        let mostrarArray:Array<any> = [];
        const mostrarPolizas:Array<any> = [];

        const ClientProp = await ClientsModel.findOne({ externalId: externalIdPropio });
        const policyProp = await InsurancePoliciesModel.find({ externalIdClient: ClientProp?.externalId });
        policyProp.forEach(item => {
          policyMe.push(
            {
              id: item._id,
              Alias: item.alias,
              policyType: item.policyType
            }
          );
        });

        const misPolizas = {
          id: ClientProp?._id,
          Nombre: ClientProp?.firstName,
          polizas: policyMe
        };

        polizasExternas.forEach(item => {
          policyRatings.push(
            {
              externalIdClient: item.externalIdClient,
              IdClient: item.IdClient
            }
          );
        });
        const uniqueArray = policyRatings.filter((thing,index) => {
          return index === policyRatings.findIndex(obj => {
            return JSON.stringify(obj) === JSON.stringify(thing);
          });
        });
        // guardando en un arreglo las polizas externas
        const arrayLenght = uniqueArray.length;
        // var IdClient;
        for (let i = 0; i < arrayLenght; i++) {
          const externalIdClient = polizasExternas[i].externalIdClient;
          // IdClient = polizasExternas[i].IdClient;
          const policyExternalClient = await ExternalPolicyClinetModel.find({ externalIdClient: externalIdClient });
          // provando la rspuesta para validar
          policyExternalClient.forEach(item => {
            mostrarPolizas.push(
              {
                id: item._id,
                externalIdClient: item.externalIdClient,
                IdClient: item.IdClient
              }
            );
          });

          // esta respuesta esta correcta pero sin validar
          // const mostrar = [{
          //   id: Client?.externalId,
          //   Nombre: Client?.firstName,
          //   polizas: policyExternalClient
          // }]
          // mostrarArray.push(mostrar);
        }
        // console.log(mostrarPolizas)
        console.log(mostrarPolizas.length)
        const mostrarPolizasexter:Array<any> = [];
        for (let j = 0; j < mostrarPolizas.length; j++) {
          // console.log(mostrarPolizas[j])
          const id = mostrarPolizas[j].id;
          const IdClientSee = mostrarPolizas[j].IdClient;
          const externalIdClient = mostrarPolizas[j].externalIdClient;
          const idp = _id as String;
          if (idp===IdClientSee) {
            const policyExternalClient = await ExternalPolicyClinetModel.findOne({ _id: id });
            const ExternalClient = await ClientsModel.findOne({ externalId: externalIdClient });

            const mostrar =[{
              id: ExternalClient?.externalId,
              Nombre: ExternalClient?.firstName,
              polizas: [policyExternalClient]
            }];
            mostrarPolizasexter.push(mostrar);
            // console.log(policyExternalClient)
          } else {
            console.log('este no: ', mostrarPolizas[j])
          }
        }
        // console.log(uniqueArrayExter)

        const respuestaGeneral = [[misPolizas],mostrarPolizasexter];
        // const respuestaGeneral = [[misPolizas],mostrarArray];
        const plano = respuestaGeneral.reduce((acc: any, el: any) => acc.concat(el), []);
        const plano2 = plano.reduce((acc: any, el: any) => acc.concat(el), []);
        // res.send(plano2);

        const newUsers = (resp: any) => {
          const usersFiltered = resp.reduce((acc: any, user: any) => {
            // let policyExtracted = {} as any;
        
            const userRepeated = acc.filter((propsUser: { id: number }) => propsUser.id === user.id);
        
            if (userRepeated.length === 0) {
              acc.push(user);
            } else {
              const indexRepeated = acc.findIndex((element: any) => element.id === user.id);
              console.log(`index Repetido: ${indexRepeated}`);
        
              const policyExtracted = user.polizas;
              console.log(`Polizas Extraidas de ${user.Nombre}: `, policyExtracted);
              console.log();
              for (const i in policyExtracted) {
                acc[indexRepeated].polizas.push(policyExtracted[i]);
              }
            }
            return acc;
          }, []);
          return usersFiltered;
        }
        
        // console.log(newUsers(plano2))
        const verRespuesta = newUsers(plano2);
        res.json(verRespuesta)
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

  // este funciona bien pero aun falta .ver polizas de un cliente
  // public ViewPolicies = async (_req : Request, res : Response) => {
  //   res.set('Access-Control-Allow-Origin', '*');

  //   const _id = _req.params.id as Object;

  //   try {
  //     const isClientExist = await ClientsModel.findById(_id);

  //     // buscar polizas propias
  //     const externalIdPropio = isClientExist?.externalId;
  //     const polizasPropias = await InsurancePoliciesModel.find({ externalIdClient: externalIdPropio });
  //     const id = _id as String;
  //     // buscar polizas asociadas
  //     const polizasExternas = await ExternalPolicyClinetModel.find({ IdClient: id });
  //     // console.log(polizasExternas);
  //     if (!isClientExist) {
  //       res.status(400).json({
  //         message: 'No eres cliente de impulsa',
  //         status: 400
  //       });
  //     } else if (isClientExist && polizasPropias && polizasExternas) {
  //       // mapear las polizas asociadas para mandarlas en la respuesta
  //       const policyRatings:Array<any> = [];
  //       const policyMe:Array<any> = [];
  //       // const mostrar:Array<any> = [];
  //       const mostrarPolizas:Array<any> = [];
  //       let valoresExternal = {};

  //       const ClientProp = await ClientsModel.findOne({ externalId: externalIdPropio });
  //       const policyProp = await InsurancePoliciesModel.find({ externalIdClient: ClientProp?.externalId });
  //       policyProp.forEach(item => {
  //         policyMe.push(
  //           {
  //             id: item._id,
  //             Alias: item.alias,
  //             policyType: item.policyType
  //           }
  //         );
  //       });

  //       const misPolizas = {
  //         id: ClientProp?.externalId,
  //         Nombre: ClientProp?.firstName,
  //         polizas: policyMe
  //       };

  //       // polizasExternas.forEach(item => {
  //       //   policyRatings.push(
  //       //     {
  //       //       externalIdPolicy: item.externalIdPolicy,
  //       //       policyType: item.policyType,
  //       //       externalIdClient: item.externalIdClient
  //       //     }
  //       //   );
  //       // });
  //       const arrayLenght = polizasExternas.length;
  //       console.log(polizasExternas)
  //       console.log(arrayLenght)
  //       for (let i = 0; i < arrayLenght; i++) {
  //         const externalIdPolicy = polizasExternas[i].externalIdPolicy;
  //         const alias = polizasExternas[i].alias;
  //         const policyType = polizasExternas[i].policyType;
  //         const externalIdClient = polizasExternas[i].externalIdClient;
  //         const Client = await ClientsModel.findOne({ externalId: externalIdClient });

  //         const mostrarvista = {
  //           id: Client?.externalId,
  //           Nombre: Client?.firstName,
  //           polizas: {
  //             id: externalIdPolicy,
  //             Alias: alias,
  //             policyType: policyType
  //           }
  //         }
          
  //         mostrarPolizas.push(mostrarvista)
  //         console.log(mostrarvista)
  //       }
  //       // console.log(polizasExternas.length)
  //       res.send([[misPolizas],mostrarPolizas]);
  //       // const arrayLenght = policyRatings.length;
  //       // for (let i = 0; i < arrayLenght; i++) {
  //       //   const search = policyRatings[i].externalIdPolicy;
  //       //   // console.log(search)
  //       //   const valores = await ExternalPolicyClinetModel.find({ externalIdPolicy: search });
  //       //   const externalId = await InsurancePoliciesModel.findOne({ _id: search });
  //       //   const externalIdc = await externalId?.externalIdClient;
  //       //   const cleinteencontrado = await ClientsModel.findOne({ externalId: externalIdc });
  //       //   valores.forEach(item => {
  //       //     mostrarPolizas.push(
  //       //       {
  //       //         id: item._id,
  //       //         Alias: item.alias,
  //       //         policyType: item.policyType
  //       //       }
  //       //     );
  //       //   });

  //       //   const mostrar = {
  //       //     id: cleinteencontrado?.externalId,
  //       //     Nombre: cleinteencontrado?.firstName,
  //       //     polizas: mostrarPolizas
  //       //   };
  //       //   valoresExternal = mostrar;
  //       // }
  //       // if (misPolizas.id === undefined && arrayLenght === 0) {
  //       //   await res.status(400).json({
  //       //     message: 'No tienes pólizas ni estas asociado a otras pólizas',
  //       //     status: 400
  //       //   });
  //       // } else if (misPolizas.id === undefined) {
  //       //   await res.status(200).json([[valoresExternal]]);
  //       // } else if (arrayLenght === 0) {
  //       //   await res.status(200).json([[misPolizas]]);
  //       // } else if (ClientProp !== undefined) {
  //       //   await res.status(200).json([[misPolizas], [valoresExternal]]);
  //       // }
  //     } else {
  //       res.status(400).json({
  //         message: 'Ocurrio un error',
  //         status: 400
  //       });
  //     }
  //   } catch (error) {
  //     res.status(400).json({
  //       message: 'Ocurrio un error: ' + error,
  //       status: 400
  //     });
  //   }
  // }

  // ver pdf de un cliente
  public ViewPDF = async (_req : Request, res : Response) => {
    res.set('Access-Control-Allow-Origin', '*');

    const id = _req.params.id;

    const isPolicyExist = await InsurancePoliciesModel.findOne({ _id: id });
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
    const _id = _req.body.id;
    const update = {
      alias: _req.body.alias
    };

    const isPolicyMeExist = await InsurancePoliciesModel.findOne({ _id: _id });
    const isPolicyExternalExist = await ExternalPolicyClinetModel.findOne({ _id: _id });

    if (isPolicyMeExist && !isPolicyExternalExist) {
      const Id = isPolicyMeExist._id;
      try {
        await InsurancePoliciesModel.findByIdAndUpdate(Id, update);
        res.status(200).json({
          message: 'Actualización correcta',
          status: 200
        });
      } catch (error) {
        res.send(error);
      }
    } else if (!isPolicyMeExist && isPolicyExternalExist) {
      const Id = isPolicyExternalExist._id;
      try {
        await ExternalPolicyClinetModel.findByIdAndUpdate(Id, update);
        res.status(200).json({
          message: 'Actualización correcta',
          status: 200
        });
      } catch (error) {
        res.send(error);
      }
    } else {
      res.status(400).json({
        message: 'No estas asociado a ninguna póliza',
        status: 400
      });
    }
  }

  // listo
  public PolicyNumberSendSMS = async (_req:Request, res:Response) => {
    const policyNumber = _req.params.policyNumber;
    const NumberPolice = parseInt(policyNumber);
    const _id = _req.params.clientId as Object;

    const isPolicyExist = await InsurancePoliciesModel.findOne({ policyNumber: NumberPolice });

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
  public VerifyClient = async (_req:Request, res:Response) => {
    /** frond end acces origin */
    res.set('Access-Control-Allow-Origin', '*');
    const _id = _req.body.id as Object;// id del cliente que quiere ver polizas externas
    const code = parseInt(_req.body.code);

    /** Search RegisterRequest with id parameter */
    const user = await ClientsModel.findById({ _id: _id });
    if (user?.verificationCode === code) {
      res.status(200).json({
        message: 'Las pólizas se sincronizaron de manera correcta',
        status: 200
      });
    } else {
      res.status(203).json({
        message: 'Verifica tu código',
        status: 203
      });
    }
    // if (!user) {
    //   res.status(404).json({ message: 'No se encuantra el usuario' });
    // } else {
      
    // }
  }

  public ViewPoliciesExternal = async (_req:Request, res:Response) => {
    /** frond end acces origin */
    res.set('Access-Control-Allow-Origin', '*');
    const externalIdClient = _req.params.externalIdClient;// para ver las polizas del usuario externo

    /** Search RegisterRequest with id parameter */
    const policyExternal = await InsurancePoliciesModel.find({ externalIdClient: externalIdClient });
    if (!policyExternal) {
      res.status(404).json({ message: 'No se encuantran resultados' });
    } else if (policyExternal) {
      res.status(200).json({
        data: policyExternal,
        status: 200
      });
    } else {
      res.status(203).json({
        message: 'Verifica tu código',
        status: 203
      });
    }
  }

  // seleccionar las polizas que el cliente decea ver
  public selectPolicy = async (_req:Request, res:Response) => {
    // eslint-disable-next-line no-var
    var policyViewSelect:Array<any> = [];

    const IdClient = _req.body.idClient;
    const Idpoliza = _req.body.data;
    const fromRoles = Array.from(Idpoliza);
    console.log(fromRoles);

    const arrayLenght = fromRoles.length;
    console.log(arrayLenght);
    // eslint-disable-next-line no-var
    for (var i = 0; i < arrayLenght; i++) {
      const _id = fromRoles[i];
      const valores = await InsurancePoliciesModel.find({ _id: _id });
      valores.forEach(item => {
        policyViewSelect.push(
          {
            id: JSON.stringify(item._id),
            alias: item.alias,
            policyType: item.policyType
          }
        );
        console.log(policyViewSelect)
      });
    }

    const arrayLenghtSave = await policyViewSelect.length;
    // eslint-disable-next-line no-var
    for (var j = 0; j < arrayLenghtSave; j++) {
      const externalId = policyViewSelect[j].id;
      const externalIdPolicy = externalId.slice(1, -1);
      const alias = policyViewSelect[j].alias;
      const policyType = policyViewSelect[j].policyType;
      const save = { IdClient, externalIdPolicy, alias, policyType };
      console.log(save);
      const savePolicy = new ExternalPolicyClinetModel(save);
      try {
        await savePolicy.save();
      } catch (error) {
        return res.json(error);
      }
    }

    res.status(200).json({
      message: 'Todo salio bien',
      status: 200
    });
  }

  // ver informacion de una poliza
  public seePolicyInformation = async (_req: Request, res: Response) => {
    res.set('Access-Control-Allow-Origin', '*');

    const _id = _req.params.id;

    const isPolicyExist = await InsurancePoliciesModel.findOne({ _id: _id });
    if (isPolicyExist) {
      const externalIdClient = isPolicyExist?.externalIdClient;
      const isClientExist = await ClientsModel.findOne({ externalId: externalIdClient });
      const cleintedetail = {
        firstName: isClientExist?.firstName
      };

      res.status(200).json({
        data: isPolicyExist,
        client: cleintedetail,
        status: 200
      });
    } else {
      res.status(400).json({
        message: 'No se encuentra la póliza',
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

// function isObjEmpty (obj:Object) {
//   for (const prop in obj) {
//     // eslint-disable-next-line no-prototype-builtins
//     if (obj.hasOwnProperty(prop)) return false;
//   }
//   return true;
// }

function sendSMSClientPolicy (phone: String) {
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

