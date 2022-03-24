/** Imports models and pluggins */
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Twilio } from 'twilio';
import { ClientsModel } from '../models/Client';
import { InsurancePoliciesModel } from '../models/InsurancePolicy';
import { RegisterRequestModel } from '../models/RegisterRequest';
import { UsersModel } from '../models/User';
import fs from 'fs';
import { ExternalPolicyClinetModel } from '../models/ExternalPolicyClinet';
import { InsuranceModel } from '../models/Insurance';

/** Variable for verification code */
let cadena = '';
let cadenaReenvio = '';
let CodeValidator = '';
let birthdayTransform = '';

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
      res.status(400).json({ message: 'Usuario no encontrado', status: 400 });
    } else if (user && user.tokenTotp === code) {
      // verificando si ya es cliente de impulsa
      const fullName = `${user.firstName} ${user.middleName} ${user.lastName}`;
      const isClientExist = await ClientsModel.findOne({fullName: fullName});
      if(isClientExist) {
        const saveUser = new UsersModel({
          username: user.phoneNumber,
          password: user.password,
          email: user.email,
          clientId: isClientExist._id
        });

        await saveUser.save();
        await user.remove();
        res.status(200).json({
          isClientExist,
          status: 200
        });
      } else {
        // instantiating the models
        const client = new ClientsModel({
          fullName: fullName,
          incorporationOrBirthDate: user.birthday,
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
          res.status(203).json({
            message: 'Ocurrio un error: ' + error,
            status: 203
          });
        }
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
    res.set('Access-Control-Allow-Origin', '*');
    const _id = _req.params._id as Object;

    try {
      const updateRequest = await RegisterRequestModel.findOne(_id);
      ramdomReenvio(updateRequest?.phoneNumber as Number);

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
    res.set('Access-Control-Allow-Origin', '*');
    const Id = _req.params.externalId;
    const _id = _req.params.id as Object;
    const externalId = parseInt(Id);
    // console.log(externalId);
    try {
      const isClientExist = await ClientsModel.findOne({ externalId: externalId });
      if (isClientExist) {
        const phone = isClientExist?.phoneNumber as String;
        // const id = isClientExist?._id;
        ramdomReenvioClinet(phone);

        const updateClient = { verificationCode: cadenaReenvio };
        await ClientsModel.findByIdAndUpdate(_id, updateClient);
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
    } catch (error) {
      res.status(400).json({
        message: 'Ocuerrio un error. ' + error,
        status: 400
      });
    }
  }

  // reenvio confirmacion de restablecer contra
  public ReenvioConfirmacionResPass = async (_req:Request, res:Response) => {
    res.set('Access-Control-Allow-Origin', '*');
    const phoneNumber = _req.params.phoneNumber;

    try {
      const updateRequest = await ClientsModel.findOne({phoneNumber: phoneNumber});
      ramdomReenvio(updateRequest?.phoneNumber as unknown as Number);

      const update = { verificationCode: cadenaReenvio };
      await ClientsModel.findByIdAndUpdate(updateRequest?._id, update);
      // const updateRequestNow = await RegisterRequestModel.findOne(_id);
      res.status(200).json({
        message: 'El código se reenvió con éxito',
        status: 200
      });
    } catch (error) {
      res.status(203).json({
        message: 'Ocurrio un error: ' + error,
        status: 203
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
      // si ya es cleinte de impulsa, entonces le vamos a dar acceso a hacer el registro de manera correcta
      // comparamos los datos enviados, con los del cliente que ya esta registrado
      const fullName = `${_req.body.firstName} ${_req.body.middleName} ${_req.body.lastName}`;
      const fechaN = isTelefonoExist.incorporationOrBirthDate;
      fecha(fechaN);

      if (isTelefonoExist.fullName === fullName && birthdayTransform===_req.body.birthday) {
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
      } else {
        return res.status(208).json({
          message: 'Los datos del cliente no coinciden con los del nuevo registro',
          status: 208
        });
      }
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
      // var token = sign(user, process.env.TOKEN_SECRET as string, { expiresIn: 300 })
      // creating  token
      // const token = sign({
      //   data: user
      // }, 'hola');

      const payload = { 
        email: user.email, 
        userId: user._id
      };

      const token:String = await jwt.sign(payload,  process.env.TOKEN_SECRET || '', { expiresIn: '7d' });
      // await console.log (verify(token,secret))

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
        name: searchclient?.fullName,
        external_id: searchclient?.externalId,
        id: searchclient?._id,
        phoneNumber: user.username
      });
    } else {
      return res.status(200).json({
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
        // let mostrarArray:Array<any> = [];
        const mostrarPolizas:Array<any> = [];

        const ClientProp = await ClientsModel.findOne({ externalId: externalIdPropio });
        const policyProp = await InsurancePoliciesModel.find({ externalIdClient: ClientProp?.externalId });
        policyProp.forEach(item => {
          policyMe.push(
            {
              _id: item._id,
              alias: item.alias,
              policyType: item.policyType,
              status: item.status
            }
          );
        });

        const misPolizas = {
          _id: ClientProp?._id,
          Nombre: ClientProp?.fullName,
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
        const uniqueArray = policyRatings.filter((thing, index) => {
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
        }
        // console.log(mostrarPolizas)
        // console.log(mostrarPolizas.length);
        const mostrarPolizasexter:Array<any> = [];
        let validador:Array<any> = [];
        for (let j = 0; j < mostrarPolizas.length; j++) {
          // console.log(mostrarPolizas[j])
          const id = mostrarPolizas[j].id;
          const IdClientSee = mostrarPolizas[j].IdClient;
          const externalIdClient = mostrarPolizas[j].externalIdClient;
          const idp = _id as String;
          if (idp === IdClientSee) {
            const policyExternalClient = await ExternalPolicyClinetModel.findOne({ _id: id });
            const ExternalClient = await ClientsModel.findOne({ externalId: externalIdClient });
            validador.push(policyExternalClient);
            const mostrar = [{
              _id: ExternalClient?.externalId,
              Nombre: ExternalClient?.fullName,
              polizas: [policyExternalClient]
            }];
            mostrarPolizasexter.push(mostrar);
            // console.log(policyExternalClient)
          } else {
            console.log('este no: ', mostrarPolizas[j]);
          }
        }
        // console.log(uniqueArrayExter)

        const respuestaGeneral = [[misPolizas], mostrarPolizasexter];
        const plano = respuestaGeneral.reduce((acc: any, el: any) => acc.concat(el), []);
        const plano2 = plano.reduce((acc: any, el: any) => acc.concat(el), []);
        // res.send(plano2);

        const newUsers = (resp: any) => {
          const usersFiltered = resp.reduce((acc: any, user: any) => {
            // let policyExtracted = {} as any;

            const userRepeated = acc.filter((propsUser: { _id: number }) => propsUser._id === user._id);

            if (userRepeated.length === 0) {
              acc.push(user);
            } else {
              const indexRepeated = acc.findIndex((element: any) => element._id === user._id);

              const policyExtracted = user.polizas;
              for (const i in policyExtracted) {
                acc[indexRepeated].polizas.push(policyExtracted[i]);
              }
            }
            return acc;
          }, []);
          return usersFiltered;
        };
        // const valorar = JSON.parse(mostrarPolizasexter);
        // console.log(newUsers(plano2))
        const valpoliceMy = await isObjEmpty(policyMe as object);
        const valpoliceExt = await isObjEmpty(validador as object);
        const verRespuesta = newUsers(plano2);
        if(valpoliceMy === true && valpoliceExt === true) {
          res.status(200).json([misPolizas]);
        } else {
          res.status(200).json(verRespuesta);
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
    } else {
      try {
        const isPolicyExternalExist = await ExternalPolicyClinetModel.findOne({ _id: id });
        const _id = isPolicyExternalExist?.externalIdPolicy;
        const isPolicyExistOrigin = await InsurancePoliciesModel.findOne({ _id: _id });
        if (isPolicyExistOrigin) {
          const name = isPolicyExistOrigin?.fileUrl;

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
        } else {
          res.status(400).json({
            message: 'No se encuentra la póliza',
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
  }

  // actualizar alias de poliza personal
  public UpdateAlias = async (_req : Request, res : Response) => {
    res.set('Access-Control-Allow-Origin', '*');
    const _id = _req.body.id;
    const update = {
      alias: _req.body.alias
    };
    try {
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
    } catch (error) {
      res.status(400).json({
        message: 'Ocurrio un error: ' + error,
        status: 400
      });
    }
  }

  // listo
  public PolicyNumberSendSMS = async (_req:Request, res:Response) => {
    const policyNumber = _req.params.policyNumber;
    const NumberPolice = parseInt(policyNumber);
    const _id = _req.params.clientId as Object;
    try {
      const isPolicyExist = await InsurancePoliciesModel.findOne({ policyNumber: NumberPolice });

      if (isPolicyExist) {
        const client = await ClientsModel.findOne({ externalId: isPolicyExist.externalIdClient });

        if (client) {
          sendSMSClientPolicy(client.phoneNumber);
          const update = { verificationCode: CodeValidator };
          const clienteActualizado = await ClientsModel.findByIdAndUpdate(_id, update);

          if (clienteActualizado) {
            const clientExternalId = client.externalId;
            const phoneNumber = client.phoneNumber;

            res.status(200).json({
              clientExternalId,
              phoneNumber,
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
    } catch (error) {
      res.status(400).json({
        message: 'Ocurrio un error: ' + error,
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
    try {
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
    } catch (error) {
      res.status(400).json({
        message: 'Ocurrio un error: ' + error,
        status: 400
      });
    }
  }

  public ViewPoliciesExternal = async (_req:Request, res:Response) => {
    /** frond end acces origin */
    res.set('Access-Control-Allow-Origin', '*');
    const externalIdClient = _req.params.externalIdClient;// para ver las polizas del usuario externo

    try {
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
    } catch (error) {
      res.status(400).json({
        message: 'Ocurrio un error',
        status: 400
      });
    }
  }

  // seleccionar las polizas que el cliente decea ver
  public selectPolicy = async (_req:Request, res:Response) => {
    // eslint-disable-next-line no-var
    var policyViewSelect:Array<any> = [];

    const IdClient = _req.body.idClient;
    const Idpoliza = _req.body.data;
    try {
      const fromRoles = Array.from(Idpoliza);

      const arrayLenght = fromRoles.length;
      // console.log(arrayLenght);
      // eslint-disable-next-line no-var
      for (var i = 0; i < arrayLenght; i++) {
        const _id = fromRoles[i];
        const valores = await InsurancePoliciesModel.find({ _id: _id });
        valores.forEach(item => {
          policyViewSelect.push(
            {
              id: JSON.stringify(item._id),
              alias: item.alias,
              policyType: item.policyType,
              externalIdClient: item.externalIdClient
            }
          );
          // console.log(policyViewSelect)
        });
      }

      const arrayLenghtSave = await policyViewSelect.length;
      // eslint-disable-next-line no-var
      for (var j = 0; j < arrayLenghtSave; j++) {
        const externalId = policyViewSelect[j].id;
        const externalIdPolicy = externalId.slice(1, -1);
        const alias = policyViewSelect[j].alias;
        const policyType = policyViewSelect[j].policyType;
        const externalIdClient = policyViewSelect[j].externalIdClient;
        const save = { IdClient, externalIdPolicy, alias, policyType, externalIdClient };
        // console.log(save);
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
    } catch (error) {
      res.status(400).json({
        message: 'Ocurrio un error: ' + error,
        status: 400
      });
    }
  }

  // ver informacion de una poliza
  public seePolicyInformation = async (_req: Request, res: Response) => {
    res.set('Access-Control-Allow-Origin', '*');

    const _id = _req.params.id;
    try {
      const isPolicyExist = await InsurancePoliciesModel.findOne({ _id: _id });
      if (isPolicyExist) {
        const externalIdClient = isPolicyExist?.externalIdClient;
        const isClientExist = await ClientsModel.findOne({ externalId: externalIdClient });
        //buscando la aseguradora para mostrar los datos
        const insurance = parseInt(isPolicyExist?.insuranceId);
        const isInsuranceExist = await InsuranceModel.findOne({ externalId: insurance });
        // console.log(isInsuranceExist);
        const cleintedetail = {
          fullName: isClientExist?.fullName
        };
        const policyDetail = {
          _id: isPolicyExist?._id,
          name: isInsuranceExist?.name,//nombre de la aseguradora
          iconCode: isInsuranceExist?.iconCode,//logo de la  aseguradora
          phoneNumber: isInsuranceExist?.phoneNumber,//numero de telefono de la  aseguradora
          alias: isPolicyExist?.alias,
          status: isPolicyExist?.status,
          policyType: isPolicyExist?.policyType,
          policyNumber: isPolicyExist?.policyNumber,
          effectiveDate: isPolicyExist?.effectiveDate,
          expirationDate: isPolicyExist?.expirationDate
        };
        res.status(200).json({
          data: policyDetail,
          client: cleintedetail,
          status: 200
        });
      } else {
        const isPolicyExternalExist = await ExternalPolicyClinetModel.findOne({ _id: _id });
        const externalIdPolicy = isPolicyExternalExist?.externalIdPolicy;

        if (isPolicyExternalExist) {
          const isPolicyExist = await InsurancePoliciesModel.findOne({ _id: externalIdPolicy });

          //buscando los detalles de aseguradora de la poliza
          const insurance = isPolicyExist?.insuranceId;
          const isInsuranceExist = await InsuranceModel.findOne({ externalId: insurance });
          // console.log(isInsuranceExist);

          const externalIdClient = isPolicyExist?.externalIdClient;
          const isClientExist = await ClientsModel.findOne({ externalId: externalIdClient });
          const cleintedetail = {
            fullName: isClientExist?.fullName
          };

          const policyDetail = {
            _id: isPolicyExist?._id,
            name: isInsuranceExist?.name,
            phoneNumber: isInsuranceExist?.phoneNumber,
            alias: isPolicyExternalExist?.alias,
            status: isPolicyExist?.status,
            policyType: isPolicyExist?.policyType,
            policyNumber: isPolicyExist?.policyNumber,
            effectiveDate: isPolicyExist?.effectiveDate,
            expirationDate: isPolicyExist?.expirationDate
          };

          res.status(200).json({
            data: policyDetail,
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
    } catch (error) {
      res.status(400).send({
        message: 'Ocurrio un error: ' + error,
        status: 400
      });
    }
  }

  // restablecer contraseña
  public restorePassSendSMS = async (_req: Request, res: Response) => {
    res.set('Access-Control-Allow-Origin', '*');
    const phoneNumber = _req.params.phoneNumber;
    const isUserExist = await UsersModel.findOne({username: phoneNumber});
    if (isUserExist){
      ramdom(phoneNumber as unknown as Number);
      const code = parseInt(cadena);
      const update = { verificationCode: code };
      try {
        await ClientsModel.findByIdAndUpdate(isUserExist.clientId, update);
        res.status(200).json({
          data: phoneNumber,
          message: 'El código se envio de manera exitosa',
          status: 200
        });
      } catch (error) {
        res.status(400).json({
          message: 'Ocuerrio un error',
          status: 400
        });
      }
    } else {
      res.status(203).json({
        message: 'No se encuentra el número de teléfono',
        status: 203
      });
    }
  }

  // comprobar cod de restablecer contra
  public restorePassComCod = async (_req:Request, res:Response) => {
    res.set('Access-Control-Allow-Origin', '*');
    const phoneNumber = _req.body.phoneNumber;
    const code = parseInt(_req.body.code);
    try {
      /** Search RegisterRequest with id parameter */
      const user = await ClientsModel.findOne({ phoneNumber: phoneNumber });
      if (user?.verificationCode === code) {
        res.status(200).json({
          data: user._id,
          message: 'El código es correcto',
          status: 200
        });
      } else {
        res.status(203).json({
          message: 'Verifica tu código',
          status: 203
        });
      }
    } catch (error) {
      res.status(400).json({
        message: 'Ocurrio un error: ' + error,
        status: 400
      });
    }
  }

  public restorePass = async (_req: Request, res:Response) => {
    res.set('Access-Control-Allow-Origin', '*');
    const _id = _req.body.id as Object;
    const password = _req.body.password;
    try {
      const isUserExist = await ClientsModel.findById(_id);
      if(isUserExist){
        // buscando el usuario del cliente para actualizar la contraseña
        const search = isUserExist.phoneNumber;
        const isClientExist = await UsersModel.findOne({username: search});
        const _idUser = isClientExist?._id;
        const update = {
          password: password
        };
        await UsersModel.findByIdAndUpdate(_idUser, update);
        res.status(200).json({
          message: 'Contraseña reestablecida exitosamente',
          status: 200
        });
      } else {
        res.status(203).json({
          message: 'No se encuentra el usuario',
          status: 203
        });
      }
      
    } catch (error) {
     res.status(203).json({
       message: 'Ocuerrio un error: ' + error,
       status: 203
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
    from: '+18169346014',
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
    from: '+18169346014',
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
    from: '+18169346014',
    to: `+52${phone}`
  }).then(message => console.log(message.sid));
  return (cadenaReenvio);
}

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
    from: '+18169346014',
    to: `+52${phone}`
  }).then(message => console.log(message.sid));
  return (CodeValidator);
}

function isObjEmpty (obj:Object) {
  for (const prop in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(prop)) return false;
  }

  return true;
}

function fecha (birthday:Date) {
  var dd = birthday.getDate()+1;
  var mm = birthday.getMonth()+1; //hoy es 0!
  var yyyy = birthday.getFullYear();
  if(dd<10) {
     dd=(0+dd)
  }
  if(mm<10) {
     mm=(0+mm)
  }
  birthdayTransform = yyyy+'-'+mm+'-'+dd;
  return (birthdayTransform);
}

export default new UserController();
