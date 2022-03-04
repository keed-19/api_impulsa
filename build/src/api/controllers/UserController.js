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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const twilio_1 = require("twilio");
const Client_1 = require("../models/Client");
const InsurancePolicy_1 = require("../models/InsurancePolicy");
const RegisterRequest_1 = require("../models/RegisterRequest");
const User_1 = require("../models/User");
const fs_1 = __importDefault(require("fs"));
/** Variable for verification code */
let cadena = '';
let cadenaReenvio = '';
let CodeValidator = '';
/** My class of user controller */
class UserController {
    constructor() {
        /**
            * Function to post id user and verific code of RegisterRequestModel
            * This function accept two parameters
            * The parameter id is type string
            * The parameter Code is type string
        */
        this.ComprobarCod = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            /** frond end acces origin */
            res.set('Access-Control-Allow-Origin', '*');
            const _id = _req.body.id;
            const code = _req.body.Code;
            /** Search RegisterRequest with id parameter */
            const user = yield RegisterRequest_1.RegisterRequestModel.findOne({ _id });
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
            }
            else if (user && user.tokenTotp === code) {
                // instantiating the models
                const client = new Client_1.ClientsModel({
                    firstName: user.firstName,
                    middleName: user.middleName,
                    lastName: user.lastName,
                    birthday: user.birthday,
                    phoneNumber: user.phoneNumber
                });
                try {
                    // save models with data of RegisterRequestModel
                    const savedClient = yield client.save();
                    if (savedClient) {
                        const saveuser = new User_1.UsersModel({
                            username: user.phoneNumber,
                            password: user.password,
                            email: user.email,
                            clientId: savedClient._id
                        });
                        yield saveuser.save();
                    }
                    // delete RegisterRequestModel
                    yield user.remove();
                    // send request
                    res.status(200).json({
                        savedClient,
                        status: 200
                    });
                }
                catch (error) {
                    res.status(404).json({
                        error,
                        status: 404
                    });
                }
            }
            else {
                res.status(203).json({
                    message: 'Verifica tu código',
                    status: 203
                });
            }
        });
        // reenvio de codigo de verificacion
        this.ReenvioConfirmacion = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const _id = _req.params._id;
            const updateRequest = yield RegisterRequest_1.RegisterRequestModel.findOne(_id);
            try {
                ramdomReenvio(updateRequest === null || updateRequest === void 0 ? void 0 : updateRequest.phoneNumber);
                console.log(cadenaReenvio);
                const update = { tokenTotp: cadenaReenvio };
                yield RegisterRequest_1.RegisterRequestModel.updateOne(_id, update);
                // const updateRequestNow = await RegisterRequestModel.findOne(_id);
                res.status(200).json({
                    message: 'El código se reenvió con éxito',
                    status: 200
                });
            }
            catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error: ' + error,
                    status: 400
                });
            }
        });
        /**
          * Function to create RegisterRequestModel on database and save verific code SMS
          * This function accepts the personal data of the users
        */
        this.register = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            /** search Number phone in the data base */
            const isTelefonoExist = yield Client_1.ClientsModel.findOne({ phoneNumber: _req.body.phoneNumber });
            if (isTelefonoExist) {
                return res.status(208).json({
                    message: 'El número de teléfono ya está registrado',
                    status: 208
                });
            }
            else {
                // send verification code to number phone of the user
                ramdom(_req.body.phoneNumber);
                // instantiating the model for save data
                const user = new RegisterRequest_1.RegisterRequestModel({
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
                    const savedUser = yield user.save();
                    // send request exit
                    res.status(200).json({
                        message: 'usuario registrado',
                        status: 200,
                        data: savedUser._id
                    });
                }
                catch (error) {
                    res.status(400).json({
                        message: error,
                        status: 400
                    });
                }
            }
        });
        /**
        * function to login of the application
        * @param {String} _req this parameter receives two values the phone number and the password
        * @param {Json} res is response function in json format
        * @returns {Json}
        */
        this.login = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const pass = _req.body.password;
            const numuser = _req.body.phoneNumber;
            // search user
            const user = yield User_1.UsersModel.findOne({ username: numuser });
            if (!user) {
                return res.status(203).send({
                    message: 'Credenciales incorrectas',
                    status: 203
                });
            }
            else if (user.password === pass) {
                // search user in model clients
                const searchclient = yield Client_1.ClientsModel.findOne({ phoneNumber: numuser });
                // creating  token
                const token = (0, jsonwebtoken_1.sign)({
                    user
                }, process.env.TOKEN_SECRET);
                // creating message Twilio
                // const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
                // const authToken = process.env.TWILIO_AUTH_TOKEN as string;
                // const client = new Twilio(accountSid, authToken);
                // sent SMS of twilio
                // await client.messages
                // .create({
                //     body: `Hola ${searchclient?.firstName}, Impulsa te da la bienvenida, gracias por usar nuestra APP`,
                //     from: '+19378602978',
                //     to: `+52${user.username}`
                // })
                // .then(message => console.log(message.sid));
                // send request
                yield res.status(200).json({
                    status: 200,
                    data: { token },
                    name: searchclient === null || searchclient === void 0 ? void 0 : searchclient.firstName,
                    external_id: searchclient === null || searchclient === void 0 ? void 0 : searchclient.externalId,
                    id: searchclient === null || searchclient === void 0 ? void 0 : searchclient._id,
                    phoneNumber: user.username
                });
            }
            else {
                return res.status(203).json({
                    message: 'Credenciales incorrectas',
                    status: 203
                });
            }
        });
        // ver polizas de un cliente
        this.ViewPolicies = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const _id = _req.params.id;
            const isPoliceExist = yield InsurancePolicy_1.InsurancePoliciesModel.find({ externalIdClient: _id });
            if (!isPoliceExist) {
                res.status(400).json({
                    message: 'No estas asociado a ninguna poliza aún',
                    status: 400
                });
            }
            else if (isPoliceExist) {
                // const url = isUserExist;
                const validator = isObjEmpty(isPoliceExist);
                if (validator === true) {
                    return res.status(400).json({
                        data: [],
                        status: 400
                    });
                }
                res.status(200).json({
                    data: isPoliceExist,
                    status: 200
                });
            }
            else {
                res.status(400).json({
                    mensaje: 'ocurrio un error',
                    status: 400
                });
            }
        });
        // ver pdf de un cliente
        this.ViewPDF = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const name = _req.params.name;
            try {
                const data = fs_1.default.readFileSync('src/uploads/' + name);
                res.setHeader('Content-Type', 'application/pdf');
                // res.contentType("application/pdf");
                res.send(data);
            }
            catch (error) {
                res.status(400).send({
                    message: 'No se ecuentra la póliza' + error,
                    status: 400
                });
            }
        });
        //todo: provando el endpoint para devolver las polizas asociadas de un cliente a otro
        //listo
        this.PolicyNumberSendSMS = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const policyNumber = _req.params.policyNumber;
            const NumberPolice = parseInt(policyNumber);
            const _id = _req.params.clientId;
            const isPolicyExist = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ policyNumber: NumberPolice });
            if (isPolicyExist) {
                const client = yield Client_1.ClientsModel.findOne({ externalId: isPolicyExist.externalIdClient });
                if (client) {
                    sendSMSClientPolicy(client.phoneNumber);
                    const update = { verificationCode: CodeValidator };
                    const clienteActualizado = yield Client_1.ClientsModel.findByIdAndUpdate(_id, update);
                    if (clienteActualizado) {
                        const clientExternalId = client.externalId;
                        res.status(200).json({
                            clientExternalId,
                            status: 200
                        });
                    }
                    else {
                        res.status(400).json({
                            message: 'Ocurrio un error',
                            status: 400
                        });
                    }
                }
            }
            else {
                res.status(400).json({
                    message: 'Póliza no encontrada',
                    status: 400
                });
            }
        });
        // verificacion de codigo
        this.VerifyClient = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            /** frond end acces origin */
            res.set('Access-Control-Allow-Origin', '*');
            const _id = _req.body.id; //id del cliente que quiere ver polizas externas
            const externalIdClient = _req.body.externalIdClient; //para ver las polizas del usuario externo
            const code = _req.body.code;
            /** Search RegisterRequest with id parameter */
            const user = yield Client_1.ClientsModel.findById({ _id: _id });
            if (!user) {
                res.status(404).json({ message: 'No se encuantra el usuario' });
            }
            else if (user.verificationCode == code) {
                const isPoliceExist = yield InsurancePolicy_1.InsurancePoliciesModel.find({ externalIdClient: externalIdClient });
                res.status(200).json({
                    data: isPoliceExist,
                    status: 200
                });
                // instantiating the models
                // const externalClient = new ExternalPolicyClinetModel({
                //   IdClient: user._id,
                //   externalIdClient: user.externalId
                // });
                // try {
                //   // save models with data of RegisterRequestModel
                //   const savedClient = await externalClient.save();
                //   if (savedClient) {
                //     res.status(200).json({
                //       savedClient,
                //       status: 200
                //     });
                //   }
                // } catch (error) {
                //   res.status(400).json({
                //     error,
                //     status: 400
                //   });
                // }
            }
            else {
                res.status(203).json({
                    message: 'Verifica tu código',
                    status: 203
                });
            }
        });
        // devolviendo las polizas de un cliente externo
        this.ViewPoliciesExternal = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const externalIdClient = _req.params.externalIdClient;
            const isPoliceExist = yield InsurancePolicy_1.InsurancePoliciesModel.find({ externalIdClient: externalIdClient });
            if (!isPoliceExist) {
                res.status(400).json({
                    message: 'No estas asociado a ninguna poliza aún',
                    status: 400
                });
            }
            else if (isPoliceExist) {
                // const url = isUserExist;
                const validator = isObjEmpty(isPoliceExist);
                if (validator === true) {
                    return res.status(400).json({
                        data: [],
                        status: 400
                    });
                }
                res.status(200).json(isPoliceExist);
            }
            else {
                res.status(400).json({
                    mensaje: 'ocurrio un error',
                    status: 400
                });
            }
        });
    }
    /** Function to get users from database */
    index(_, res) {
        RegisterRequest_1.RegisterRequestModel.find({}, (err, users) => {
            res.set('Access-Control-Allow-Origin', '*');
            if (err)
                return res.status(500).send({ message: `Error al hacer la petición: ${err}` });
            if (!users)
                return res.status(404).send({ message: 'Aún no existen usuarios en la base de datos' });
            res.status(200).json({ users: users });
        });
    }
}
/**
 * function to generate a number code with for digits and send message SMS
 * @param {Number} phone Number phone User to send verification code
 * @returns {String} this value is the code verification
 */
function ramdom(phone) {
    // generating 4 random numbers
    const val1 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    const val2 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    const val3 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    const val4 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    // save code in variable to save with user data
    cadena = `${val1}${val2}${val3}${val4}`;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // token twilio
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    // instantiating twilio
    const client = new twilio_1.Twilio(accountSid, authToken);
    // send code verification
    client.messages.create({
        body: `Tu código de verificación es: ${cadena}`,
        from: '+19378602978',
        to: `+52${phone}`
    }).then((message) => console.log(message.sid));
    return (cadena);
}
function ramdomReenvio(phone) {
    // generating 4 random numbers
    const val1 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    const val2 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    const val3 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    const val4 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    // save code in variable to save with user data
    cadenaReenvio = `${val1}${val2}${val3}${val4}`;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // token twilio
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    // instantiating twilio
    const client = new twilio_1.Twilio(accountSid, authToken);
    // send code verification
    client.messages.create({
        body: `Tu código de verificación es: ${cadenaReenvio}`,
        from: '+19378602978',
        to: `+52${phone}`
    }).then(message => console.log(message.sid));
    return (cadenaReenvio);
}
function isObjEmpty(obj) {
    for (const prop in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
function sendSMSClientPolicy(phone) {
    // generating 4 random numbers
    const val1 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    const val2 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    const val3 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    const val4 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    // save code in variable to save with user data
    CodeValidator = `${val1}${val2}${val3}${val4}`;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // token twilio
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    // instantiating twilio
    const client = new twilio_1.Twilio(accountSid, authToken);
    // send code verification
    client.messages.create({
        body: `Tu código de verificación para compartir tus pólizas es: ${CodeValidator}`,
        from: '+19378602978',
        to: `+52${phone}`
    }).then(message => console.log(message.sid));
    return (CodeValidator);
}
exports.default = new UserController();
