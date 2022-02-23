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
const RegisterRequest_1 = require("../models/RegisterRequest");
const User_1 = require("../models/User");
const InsurancePolicy_1 = require("../models/InsurancePolicy");
const fs_1 = __importDefault(require("fs"));
/** Variable for verification code */
let cadena = '';
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
                const saveuser = new User_1.UsersModel({
                    username: user.phoneNumber,
                    password: user.password,
                    email: user.email,
                    clientId: user._id
                });
                try {
                    //save models with data of RegisterRequestModel
                    const savedClient = yield client.save();
                    const savedUser = yield saveuser.save();
                    //delete RegisterRequestModel 
                    yield user.remove();
                    //send request
                    res.status(200).json({
                        savedClient,
                        savedUser,
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
                res.status(203).json({ messaje: 'Verifica tu código' });
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
                    error: 'El numero telefonico ya esta registrado',
                    status: 208
                });
            }
            else {
                //send verification code to number phone of the user
                ramdom(_req.body.phoneNumber);
                //instantiating the model for save data
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
                    //save data
                    const savedUser = yield user.save();
                    //send request exit
                    res.status(200).json({
                        message: 'usuario registrado',
                        status: 200,
                        data: savedUser._id
                    });
                }
                catch (error) {
                    res.status(404).json({
                        error,
                        status: 404
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
                return res.status(404).json({
                    error: 'Usuario no encontrado',
                    status: 404
                });
            }
            else if (user.password === pass) {
                //search user in model clients
                const searchclient = yield Client_1.ClientsModel.findOne({ phoneNumber: numuser });
                // creating  token
                const token = (0, jsonwebtoken_1.sign)({
                    user
                }, process.env.TOKEN_SECRET);
                //creating message Twilio
                const accountSid = process.env.TWILIO_ACCOUNT_SID;
                const authToken = process.env.TWILIO_AUTH_TOKEN;
                const client = new twilio_1.Twilio(accountSid, authToken);
                //sent SMS of twilio
                yield client.messages
                    .create({
                    body: `Hola ${searchclient === null || searchclient === void 0 ? void 0 : searchclient.firstName}, Impulsa te da la bienvenida, gracias por usar nuestra APP`,
                    from: '+19378602978',
                    to: `+52${user.username}`
                })
                    .then(message => console.log(message.sid));
                //send request
                yield res.status(200).json({
                    status: 200,
                    data: { token },
                    name: searchclient === null || searchclient === void 0 ? void 0 : searchclient.firstName,
                    id: searchclient === null || searchclient === void 0 ? void 0 : searchclient._id,
                    phoneNumber: user.username
                });
            }
            else {
                return res.status(203).json({
                    error: 'Constraseña invalida',
                    status: 203
                });
            }
        });
        //probando la subida de archivos pdf
        this.Savefiles = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            res.set('Access-Control-Allow-Origin', '*');
            // let file = _req.files;
            // var file:Array<any> = _req.files as any
            // var urlFile:Array<any>=[] 
            // console.log(urlFile)
            // file.forEach(item=>{ 
            // urlFile.push(
            // {
            //     "url":item.path,
            // });
            // });
            // console.log(urlFile)
            var file = _req.file;
            if (!file) {
                const error = new Error('Please upload a file');
                return error;
            }
            else {
                /** search Number phone in the data base */
                const isUserExist = yield User_1.UsersModel.findOne({ username: _req.params.phoneNumber });
                if (isUserExist) {
                    //instantiating the model for save data
                    const user = new InsurancePolicy_1.InsurancePoliciesModel({
                        insurerName: _req.body.insurerName,
                        policyNumber: _req.body.policyNumber,
                        policyType: _req.body.policyType,
                        effectiveDate: Date.now(),
                        expirationDate: Date.now(),
                        status: _req.body.status,
                        fileUrl: file.path,
                        clientId: isUserExist.clientId
                    });
                    try {
                        //save data
                        const savedUser = yield user.save();
                        //send request exit
                        res.status(200).json({
                            message: 'Poliza registrada',
                            file
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
                    fs_1.default.unlinkSync(`${(_a = _req.file) === null || _a === void 0 ? void 0 : _a.path}`);
                    res.status(400).json({
                        message: 'Usuario no encontrado',
                        status: 400,
                    });
                }
            }
        });
        //ver pdf de un cliente
        this.ViewFile = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            var _clientId = _req.params.id;
            const isUserExist = yield InsurancePolicy_1.InsurancePoliciesModel.find({ clientId: _clientId });
            if (!isUserExist) {
                res.json({
                    message: 'Aún no tiene Polizas',
                    isUserExist
                });
            }
            else if (isUserExist) {
                // const url = isUserExist;
                res.status(200).json({
                    isUserExist
                });
            }
            else {
                res.json({
                    mensaje: 'ocurrio un error'
                });
            }
        });
    }
    /**
        * Function to get users from database
    */
    index(_, res) {
        RegisterRequest_1.RegisterRequestModel.find({}, (err, users) => {
            res.set('Access-Control-Allow-Origin', '*');
            if (err)
                return res.status(500).send({ message: `Error al hacer la petición: ${err}` });
            if (!users)
                return res.status(404).send({ message: `Aún no existen usuarios en la base de datos` });
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
    //generating 4 random numbers
    let val1 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    let val2 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    let val3 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    let val4 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    //save code in variable to save with user data
    cadena = `${val1}${val2}${val3}${val4}`;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    //token twilio
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    // instantiating twilio
    const client = new twilio_1.Twilio(accountSid, authToken);
    //send code verification
    client.messages
        .create({
        body: `Tu código de verificación es: ${cadena}`,
        from: '+19378602978',
        to: `+52${phone}`
    })
        .then(message => console.log(message.sid));
    return (cadena);
}
exports.default = new UserController();
