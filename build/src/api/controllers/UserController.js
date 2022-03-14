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
const ExternalPolicyClinet_1 = require("../models/ExternalPolicyClinet");
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
            res.set('Access-Control-Allow-Origin', '*');
            const _id = _req.params._id;
            try {
                const updateRequest = yield RegisterRequest_1.RegisterRequestModel.findOne(_id);
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
        // reenvio de codigo a cliente externo
        this.ReenvioConfirmacionClientExternal = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const Id = _req.params.externalId;
            const _id = _req.params.id;
            const externalId = parseInt(Id);
            // console.log(externalId);
            try {
                const isClientExist = yield Client_1.ClientsModel.findOne({ externalId: externalId });
                if (isClientExist) {
                    const phone = isClientExist === null || isClientExist === void 0 ? void 0 : isClientExist.phoneNumber;
                    // const id = isClientExist?._id;
                    ramdomReenvioClinet(phone);
                    const updateClient = { verificationCode: cadenaReenvio };
                    yield Client_1.ClientsModel.findByIdAndUpdate(_id, updateClient);
                    // const updateRequestNow = await RegisterRequestModel.findOne(_id);
                    res.status(200).json({
                        message: 'El código se reenvió con éxito',
                        status: 200
                    });
                }
                else {
                    res.status(400).json({
                        message: 'No se encuentra el cliente',
                        status: 400
                    });
                }
            }
            catch (error) {
                res.status(400).json({
                    message: 'Ocuerrio un error. ' + error,
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
        // este funciona bien pero aun falta .ver polizas de un cliente
        this.ViewPolicies = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const _id = _req.params.id;
            try {
                const isClientExist = yield Client_1.ClientsModel.findById(_id);
                // buscar polizas propias
                const externalIdPropio = isClientExist === null || isClientExist === void 0 ? void 0 : isClientExist.externalId;
                const polizasPropias = yield InsurancePolicy_1.InsurancePoliciesModel.find({ externalIdClient: externalIdPropio });
                const id = _id;
                // buscar polizas asociadas
                const polizasExternas = yield ExternalPolicyClinet_1.ExternalPolicyClinetModel.find({ IdClient: id });
                // console.log(polizasExternas);
                if (!isClientExist) {
                    res.status(400).json({
                        message: 'No eres cliente de impulsa',
                        status: 400
                    });
                }
                else if (isClientExist && polizasPropias && polizasExternas) {
                    // mapear las polizas asociadas para mandarlas en la respuesta
                    const policyRatings = [];
                    const policyMe = [];
                    // let mostrarArray:Array<any> = [];
                    const mostrarPolizas = [];
                    const ClientProp = yield Client_1.ClientsModel.findOne({ externalId: externalIdPropio });
                    const policyProp = yield InsurancePolicy_1.InsurancePoliciesModel.find({ externalIdClient: ClientProp === null || ClientProp === void 0 ? void 0 : ClientProp.externalId });
                    policyProp.forEach(item => {
                        policyMe.push({
                            _id: item._id,
                            alias: item.alias,
                            policyType: item.policyType,
                            status: item.status
                        });
                    });
                    const misPolizas = {
                        _id: ClientProp === null || ClientProp === void 0 ? void 0 : ClientProp._id,
                        Nombre: ClientProp === null || ClientProp === void 0 ? void 0 : ClientProp.firstName,
                        polizas: policyMe
                    };
                    polizasExternas.forEach(item => {
                        policyRatings.push({
                            externalIdClient: item.externalIdClient,
                            IdClient: item.IdClient
                        });
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
                        const policyExternalClient = yield ExternalPolicyClinet_1.ExternalPolicyClinetModel.find({ externalIdClient: externalIdClient });
                        // provando la rspuesta para validar
                        policyExternalClient.forEach(item => {
                            mostrarPolizas.push({
                                id: item._id,
                                externalIdClient: item.externalIdClient,
                                IdClient: item.IdClient
                            });
                        });
                    }
                    // console.log(mostrarPolizas)
                    console.log(mostrarPolizas.length);
                    const mostrarPolizasexter = [];
                    for (let j = 0; j < mostrarPolizas.length; j++) {
                        // console.log(mostrarPolizas[j])
                        const id = mostrarPolizas[j].id;
                        const IdClientSee = mostrarPolizas[j].IdClient;
                        const externalIdClient = mostrarPolizas[j].externalIdClient;
                        const idp = _id;
                        if (idp === IdClientSee) {
                            const policyExternalClient = yield ExternalPolicyClinet_1.ExternalPolicyClinetModel.findOne({ _id: id });
                            const ExternalClient = yield Client_1.ClientsModel.findOne({ externalId: externalIdClient });
                            const mostrar = [{
                                    _id: ExternalClient === null || ExternalClient === void 0 ? void 0 : ExternalClient.externalId,
                                    Nombre: ExternalClient === null || ExternalClient === void 0 ? void 0 : ExternalClient.firstName,
                                    polizas: [policyExternalClient]
                                }];
                            mostrarPolizasexter.push(mostrar);
                            // console.log(policyExternalClient)
                        }
                        else {
                            console.log('este no: ', mostrarPolizas[j]);
                        }
                    }
                    // console.log(uniqueArrayExter)
                    const respuestaGeneral = [[misPolizas], mostrarPolizasexter];
                    const plano = respuestaGeneral.reduce((acc, el) => acc.concat(el), []);
                    const plano2 = plano.reduce((acc, el) => acc.concat(el), []);
                    // res.send(plano2);
                    const newUsers = (resp) => {
                        const usersFiltered = resp.reduce((acc, user) => {
                            // let policyExtracted = {} as any;
                            const userRepeated = acc.filter((propsUser) => propsUser._id === user._id);
                            if (userRepeated.length === 0) {
                                acc.push(user);
                            }
                            else {
                                const indexRepeated = acc.findIndex((element) => element._id === user._id);
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
                    };
                    // console.log(newUsers(plano2))
                    const verRespuesta = newUsers(plano2);
                    res.json(verRespuesta);
                }
                else {
                    res.status(400).json({
                        message: 'Ocurrio un error',
                        status: 400
                    });
                }
            }
            catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error: ' + error,
                    status: 400
                });
            }
        });
        // ver pdf de un cliente
        this.ViewPDF = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const id = _req.params.id;
            const isPolicyExist = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ _id: id });
            if (isPolicyExist) {
                const name = isPolicyExist === null || isPolicyExist === void 0 ? void 0 : isPolicyExist.fileUrl;
                try {
                    const data = fs_1.default.readFileSync('src/uploads/' + name);
                    res.setHeader('Content-Type', 'application/pdf');
                    // res.contentType("application/pdf");
                    res.send(data);
                }
                catch (error) {
                    res.status(400).send({
                        message: 'No se ecuentra la póliza: ' + error,
                        status: 400
                    });
                }
            }
            else {
                try {
                    const isPolicyExternalExist = yield ExternalPolicyClinet_1.ExternalPolicyClinetModel.findOne({ _id: id });
                    const _id = isPolicyExternalExist === null || isPolicyExternalExist === void 0 ? void 0 : isPolicyExternalExist.externalIdPolicy;
                    const isPolicyExistOrigin = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ _id: _id });
                    if (isPolicyExistOrigin) {
                        const name = isPolicyExistOrigin === null || isPolicyExistOrigin === void 0 ? void 0 : isPolicyExistOrigin.fileUrl;
                        try {
                            const data = fs_1.default.readFileSync('src/uploads/' + name);
                            res.setHeader('Content-Type', 'application/pdf');
                            // res.contentType("application/pdf");
                            res.send(data);
                        }
                        catch (error) {
                            res.status(400).send({
                                message: 'No se ecuentra la póliza: ' + error,
                                status: 400
                            });
                        }
                    }
                    else {
                        res.status(400).json({
                            message: 'No se encuentra la póliza',
                            status: 400
                        });
                    }
                }
                catch (error) {
                    res.status(400).json({
                        message: 'Ocurrio un error: ' + error,
                        status: 400
                    });
                }
            }
        });
        // actualizar alias de poliza personal
        this.UpdateAlias = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const _id = _req.body.id;
            const update = {
                alias: _req.body.alias
            };
            try {
                const isPolicyMeExist = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ _id: _id });
                const isPolicyExternalExist = yield ExternalPolicyClinet_1.ExternalPolicyClinetModel.findOne({ _id: _id });
                if (isPolicyMeExist && !isPolicyExternalExist) {
                    const Id = isPolicyMeExist._id;
                    try {
                        yield InsurancePolicy_1.InsurancePoliciesModel.findByIdAndUpdate(Id, update);
                        res.status(200).json({
                            message: 'Actualización correcta',
                            status: 200
                        });
                    }
                    catch (error) {
                        res.send(error);
                    }
                }
                else if (!isPolicyMeExist && isPolicyExternalExist) {
                    const Id = isPolicyExternalExist._id;
                    try {
                        yield ExternalPolicyClinet_1.ExternalPolicyClinetModel.findByIdAndUpdate(Id, update);
                        res.status(200).json({
                            message: 'Actualización correcta',
                            status: 200
                        });
                    }
                    catch (error) {
                        res.send(error);
                    }
                }
                else {
                    res.status(400).json({
                        message: 'No estas asociado a ninguna póliza',
                        status: 400
                    });
                }
            }
            catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error: ' + error,
                    status: 400
                });
            }
        });
        // listo
        this.PolicyNumberSendSMS = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const policyNumber = _req.params.policyNumber;
            const NumberPolice = parseInt(policyNumber);
            const _id = _req.params.clientId;
            try {
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
            }
            catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error: ' + error,
                    status: 400
                });
            }
        });
        // verificacion de codigo
        this.VerifyClient = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            /** frond end acces origin */
            res.set('Access-Control-Allow-Origin', '*');
            const _id = _req.body.id; // id del cliente que quiere ver polizas externas
            const code = parseInt(_req.body.code);
            try {
                /** Search RegisterRequest with id parameter */
                const user = yield Client_1.ClientsModel.findById({ _id: _id });
                if ((user === null || user === void 0 ? void 0 : user.verificationCode) === code) {
                    res.status(200).json({
                        message: 'Las pólizas se sincronizaron de manera correcta',
                        status: 200
                    });
                }
                else {
                    res.status(203).json({
                        message: 'Verifica tu código',
                        status: 203
                    });
                }
            }
            catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error: ' + error,
                    status: 400
                });
            }
        });
        this.ViewPoliciesExternal = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            /** frond end acces origin */
            res.set('Access-Control-Allow-Origin', '*');
            const externalIdClient = _req.params.externalIdClient; // para ver las polizas del usuario externo
            try {
                /** Search RegisterRequest with id parameter */
                const policyExternal = yield InsurancePolicy_1.InsurancePoliciesModel.find({ externalIdClient: externalIdClient });
                if (!policyExternal) {
                    res.status(404).json({ message: 'No se encuantran resultados' });
                }
                else if (policyExternal) {
                    res.status(200).json({
                        data: policyExternal,
                        status: 200
                    });
                }
                else {
                    res.status(203).json({
                        message: 'Verifica tu código',
                        status: 203
                    });
                }
            }
            catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error',
                    status: 400
                });
            }
        });
        // seleccionar las polizas que el cliente decea ver
        this.selectPolicy = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line no-var
            var policyViewSelect = [];
            const IdClient = _req.body.idClient;
            const Idpoliza = _req.body.data;
            try {
                const fromRoles = Array.from(Idpoliza);
                console.log(fromRoles);
                const arrayLenght = fromRoles.length;
                // console.log(arrayLenght);
                // eslint-disable-next-line no-var
                for (var i = 0; i < arrayLenght; i++) {
                    const _id = fromRoles[i];
                    const valores = yield InsurancePolicy_1.InsurancePoliciesModel.find({ _id: _id });
                    valores.forEach(item => {
                        policyViewSelect.push({
                            id: JSON.stringify(item._id),
                            alias: item.alias,
                            policyType: item.policyType,
                            externalIdClient: item.externalIdClient
                        });
                        // console.log(policyViewSelect)
                    });
                }
                const arrayLenghtSave = yield policyViewSelect.length;
                // eslint-disable-next-line no-var
                for (var j = 0; j < arrayLenghtSave; j++) {
                    const externalId = policyViewSelect[j].id;
                    const externalIdPolicy = externalId.slice(1, -1);
                    const alias = policyViewSelect[j].alias;
                    const policyType = policyViewSelect[j].policyType;
                    const externalIdClient = policyViewSelect[j].externalIdClient;
                    const save = { IdClient, externalIdPolicy, alias, policyType, externalIdClient };
                    // console.log(save);
                    const savePolicy = new ExternalPolicyClinet_1.ExternalPolicyClinetModel(save);
                    try {
                        yield savePolicy.save();
                    }
                    catch (error) {
                        return res.json(error);
                    }
                }
                res.status(200).json({
                    message: 'Todo salio bien',
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
        // ver informacion de una poliza
        this.seePolicyInformation = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const _id = _req.params.id;
            try {
                const isPolicyExist = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ _id: _id });
                if (isPolicyExist) {
                    const externalIdClient = isPolicyExist === null || isPolicyExist === void 0 ? void 0 : isPolicyExist.externalIdClient;
                    const isClientExist = yield Client_1.ClientsModel.findOne({ externalId: externalIdClient });
                    const cleintedetail = {
                        firstName: isClientExist === null || isClientExist === void 0 ? void 0 : isClientExist.firstName,
                        middleName: isClientExist === null || isClientExist === void 0 ? void 0 : isClientExist.middleName,
                        lastName: isClientExist === null || isClientExist === void 0 ? void 0 : isClientExist.lastName
                    };
                    res.status(200).json({
                        data: isPolicyExist,
                        client: cleintedetail,
                        status: 200
                    });
                }
                else {
                    const isPolicyExternalExist = yield ExternalPolicyClinet_1.ExternalPolicyClinetModel.findOne({ _id: _id });
                    const externalIdPolicy = isPolicyExternalExist === null || isPolicyExternalExist === void 0 ? void 0 : isPolicyExternalExist.externalIdPolicy;
                    if (isPolicyExternalExist) {
                        const isPolicyExist = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ _id: externalIdPolicy });
                        const externalIdClient = isPolicyExist === null || isPolicyExist === void 0 ? void 0 : isPolicyExist.externalIdClient;
                        const isClientExist = yield Client_1.ClientsModel.findOne({ externalId: externalIdClient });
                        const cleintedetail = {
                            firstName: isClientExist === null || isClientExist === void 0 ? void 0 : isClientExist.firstName,
                            middleName: isClientExist === null || isClientExist === void 0 ? void 0 : isClientExist.middleName,
                            lastName: isClientExist === null || isClientExist === void 0 ? void 0 : isClientExist.lastName
                        };
                        const policyDetail = {
                            _id: isPolicyExist === null || isPolicyExist === void 0 ? void 0 : isPolicyExist._id,
                            alias: isPolicyExternalExist === null || isPolicyExternalExist === void 0 ? void 0 : isPolicyExternalExist.alias,
                            status: isPolicyExist === null || isPolicyExist === void 0 ? void 0 : isPolicyExist.status,
                            policyType: isPolicyExist === null || isPolicyExist === void 0 ? void 0 : isPolicyExist.policyType,
                            policyNumber: isPolicyExist === null || isPolicyExist === void 0 ? void 0 : isPolicyExist.policyNumber,
                            effectiveDate: isPolicyExist === null || isPolicyExist === void 0 ? void 0 : isPolicyExist.effectiveDate,
                            expirationDate: isPolicyExist === null || isPolicyExist === void 0 ? void 0 : isPolicyExist.expirationDate,
                        };
                        res.status(200).json({
                            data: policyDetail,
                            client: cleintedetail,
                            status: 200
                        });
                    }
                    else {
                        res.status(400).json({
                            message: 'No se encuentra la póliza',
                            status: 400
                        });
                    }
                }
            }
            catch (error) {
                res.status(400).send({
                    message: 'Ocurrio un error: ' + error,
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
function ramdomReenvioClinet(phone) {
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
// function isObjEmpty (obj:Object) {
//   for (const prop in obj) {
//     // eslint-disable-next-line no-prototype-builtins
//     if (obj.hasOwnProperty(prop)) return false;
//   }
//   return true;
// }
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
