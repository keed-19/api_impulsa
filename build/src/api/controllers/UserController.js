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
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const twilio_1 = require("twilio");
const Client_1 = require("../models/Client");
const RegisterRequest_1 = require("../models/RegisterRequest");
const User_1 = require("../models/User");
let cadena = '';
class UserController {
    constructor() {
        this.ComprobarCod = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const _id = _req.body.id;
            const code = _req.body.Code;
            const user = yield RegisterRequest_1.RegisterRequestModel.findOne({ _id });
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
            }
            else if (user && user.tokenTotp === code) {
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
                    //almacenando los datos y devolviendo respuesta
                    const savedClient = yield client.save();
                    const savedUser = yield saveuser.save();
                    yield user.remove();
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
        this.register = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const isTelefonoExist = yield Client_1.ClientsModel.findOne({ phoneNumber: _req.body.phoneNumber });
            if (isTelefonoExist) {
                return res.status(208).json({
                    error: 'El numero telefonico ya esta registrado',
                    status: 208
                });
            }
            else {
                ramdom(_req.body.phoneNumber);
                //instancia del modelo en espera
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
                    //almacenando los datos y devolviendo respuesta
                    const savedUser = yield user.save();
                    // ramdom(JSON.stringify(savedUser._id));
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
        this.login = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const pass = _req.body.password;
            const numuser = _req.body.phoneNumber;
            // Validaciond e existencia
            const user = yield User_1.UsersModel.findOne({ username: numuser });
            if (!user) {
                return res.status(404).json({
                    error: 'Usuario no encontrado',
                    status: 404
                });
            }
            else if (user.password === pass) {
                const searchclient = yield Client_1.ClientsModel.findOne({ phoneNumber: numuser });
                // Creando token
                const token = (0, jsonwebtoken_1.sign)({
                    user
                }, process.env.TOKEN_SECRET);
                //creando el mensage de bienvenida
                const accountSid = process.env.TWILIO_ACCOUNT_SID;
                const authToken = process.env.TWILIO_AUTH_TOKEN;
                const client = new twilio_1.Twilio(accountSid, authToken);
                yield client.messages
                    .create({
                    body: `Hola ${searchclient === null || searchclient === void 0 ? void 0 : searchclient.firstName}, Impulsa te da la bienvenida, gracias por usar nuestra APP`,
                    from: '+19378602978',
                    to: `+52${user.username}`
                })
                    .then(message => console.log(message.sid));
                yield res.status(200).json({
                    status: 200,
                    data: { token },
                    message: 'Bienvenido'
                });
            }
            else {
                return res.status(203).json({
                    error: 'Constraseña invalida',
                    status: 203
                });
            }
        });
    }
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
function ramdom(phone) {
    let val1 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    let val2 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    let val3 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    let val4 = Math.floor(Math.random() * (1 - 9 + 1) + 9);
    cadena = `${val1}${val2}${val3}${val4}`;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = new twilio_1.Twilio(accountSid, authToken);
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
