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
const RegisterRequest_1 = require("./api/models/RegisterRequest");
let cadena = '';
class UserController {
    constructor() {
        this.ComprobarCod = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const _id = _req.body.id;
            const code = _req.body.Code;
            const user = yield RegisterRequest_1.RegisterRequestModel.findById({ _id });
            if (!user) {
                res.json({
                    message: 'Usuario no encontrado',
                });
            }
            else if (user && user.tokenTotp === code) {
                res.json({ messaje: 'Hola' });
            }
            else {
                res.json({ messaje: 'Verifica tu código' });
            }
        });
        this.register = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const isTelefonoExist = yield RegisterRequest_1.RegisterRequestModel.findOne({ phoneNumber: _req.body.phoneNumber });
            if (isTelefonoExist) {
                return res.status(400).json({
                    error: 'El numero telefonico ya esta registrado',
                    status: 208
                });
            }
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
                res.json({
                    message: 'usuario registrado',
                    status: 200,
                    data: savedUser._id
                });
            }
            catch (error) {
                res.status(400).json({
                    error,
                    status: 400
                });
            }
        });
        this.login = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const pass = _req.body.password;
            const numuser = _req.body.phoneNumber;
            // Validaciond e existencia
            const user = yield RegisterRequest_1.RegisterRequestModel.findOne({ phoneNumber: numuser });
            if (!user) {
                return res.status(400).json({
                    error: 'Usuario no encontrado',
                    status: 204
                });
            }
            else if (user.password === pass) {
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
                    body: `Hola ${user.firstName}, Impulsa te da la bienvenida, gracias por usar nuestra APP`,
                    from: '+19378602978',
                    to: `+52${user.phoneNumber}`
                })
                    .then(message => console.log(message.sid));
                yield res.send({
                    status: 200,
                    data: { token },
                    message: 'Bienvenido'
                });
            }
            else {
                return res.status(400).json({
                    error: 'Constraseña invalida',
                    status: 203
                });
            }
        });
    }
    index(_, res) {
        RegisterRequest_1.RegisterRequestModel.find({}, (err, users) => {
            if (err)
                return res.status(500).send({ message: `Error al hacer la petición: ${err}` });
            if (!users)
                return res.status(404).send({ message: `Aún no existen usuarios en la base de datos` });
            res.json({ users: users });
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
        body: `Código de verificación: ${cadena}`,
        from: '+19378602978',
        to: `+52${phone}`
    })
        .then(message => console.log(message.sid));
    return (cadena);
}
exports.default = new UserController();
