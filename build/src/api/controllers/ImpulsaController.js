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
const InsurancePolicy_1 = require("../models/InsurancePolicy");
const fs_1 = __importDefault(require("fs"));
const Client_1 = require("../models/Client");
/** My class of Impulsa controller */
class ImpulsaController {
    constructor() {
        // ver pdf de un cliente
        this.ViewPolicies = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const externalId = _req.params.externalId;
            const isPoliceExist = yield InsurancePolicy_1.InsurancePoliciesModel.find({ externalId: externalId });
            if (!isPoliceExist) {
                res.json({
                    message: 'No hay polizas para este cliente',
                    status: 400
                });
            }
            else if (isPoliceExist) {
                // const url = isUserExist;
                const validator = isObjEmpty(isPoliceExist);
                if (validator === true) {
                    return res.status(400).json({
                        message: 'Aún no tiene Polizas',
                        status: 400
                    });
                }
                res.status(200).json({
                    isPoliceExist,
                    status: 200
                });
            }
            else {
                res.json({
                    mensaje: 'ocurrio un error'
                });
            }
        });
        // visualizar pdf
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
        // guardar poliza
        this.SavePolice = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            res.set('Access-Control-Allow-Origin', '*');
            const file = _req.file;
            if (!file) {
                const error = new Error('Please upload a file');
                return error;
            }
            else if (file.mimetype === 'application/pdf') {
                /** search Number phone in the data base */
                const isUserExist = yield Client_1.ClientsModel.findOne({ externalId: _req.params.externalId });
                if (isUserExist) {
                    // creando el alias del modelo
                    const tipe = _req.body.policyType;
                    const number = _req.body.policyNumber;
                    const extraida = tipe.substring(0, 3);
                    const alias = `${extraida}-${number}`;
                    // instantiating the model for save data
                    const user = new InsurancePolicy_1.InsurancePoliciesModel({
                        insurerName: _req.body.insurerName,
                        policyNumber: number,
                        policyType: tipe,
                        alias: alias,
                        effectiveDate: _req.body.effectiveDate,
                        expirationDate: _req.body.expirationDate,
                        status: _req.body.status,
                        fileUrl: file.filename,
                        externalId: _req.body.externalId
                    });
                    try {
                        // save data
                        yield user.save();
                        // send request exit
                        res.status(200).json({
                            message: 'Poliza registrada',
                            UserPolicy: [
                                `InsurerName : ${user.insurerName}`,
                                `PolicyNumber : ${user.policyNumber}`,
                                `PolicyType : ${user.policyType}`,
                                `EffectiveDate : ${user.effectiveDate}`,
                                `ExpirationDate : ${user.expirationDate}`,
                                `Status : ${user.status}`,
                                `FileName : ${user.fileUrl}`
                            ]
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
                        status: 400
                    });
                }
            }
            else {
                fs_1.default.unlinkSync(`${(_b = _req.file) === null || _b === void 0 ? void 0 : _b.path}`);
                res.status(400).json({
                    message: 'no es un archivo pdf',
                    status: 400
                });
            }
        });
        // vizualisar clientes
        this.ViewClients = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            // var phone = _req.params.phoneNumber;
            const isClientExist = yield Client_1.ClientsModel.find({});
            if (!isClientExist) {
                res.json({
                    message: 'No hay clientes registrados'
                });
            }
            else if (isClientExist) {
                res.status(200).json(isClientExist);
            }
            else {
                res.json({
                    mensaje: 'ocurrio un error'
                });
            }
        });
        // visaualizar cliente por telefono
        this.ViewClient = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const externalId = _req.params.externalId;
            const isClientExist = yield Client_1.ClientsModel.findOne({ externalId: externalId });
            if (!isClientExist) {
                res.status(400).json({
                    message: 'No existe el cliente',
                    status: 400
                });
            }
            else if (isClientExist) {
                res.status(200).json({
                    isClientExist,
                    status: 200
                });
            }
            else {
                res.status(404).json({
                    mensaje: 'ocurrio un error',
                    status: 404
                });
            }
        });
        // guardar cliente
        this.SaveClient = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            // TODOs:: falta validar los imputs que son necesarios como el external id
            const isTelefonoExist = yield Client_1.ClientsModel.findOne({ phoneNumber: _req.body.phoneNumber });
            const isEzternalIDExist = yield Client_1.ClientsModel.findOne({ externalId: _req.body.externalId });
            if (isTelefonoExist) {
                return res.status(208).json({
                    error: 'El numero telefonico ya se encuentra registrado en la base de datos',
                    status: 208
                });
            }
            else if (isEzternalIDExist) {
                return res.status(208).json({
                    error: 'El ExternalId ya se encuentra registrado en la base de datos',
                    status: 208
                });
            }
            else {
                // instantiating the model for save data
                const client = new Client_1.ClientsModel({
                    firstName: _req.body.firstName,
                    middleName: _req.body.middleName,
                    lastName: _req.body.lastName,
                    birthday: _req.body.birthday,
                    phoneNumber: _req.body.phoneNumber,
                    externalId: _req.body.externalId
                });
                try {
                    // save data
                    yield client.save();
                    // send request exit
                    res.status(200).json({
                        message: 'cliente registrado',
                        Client: client,
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
        });
        // eliminar cliente
        this.DeleteClient = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const externalId = _req.params.externalId;
            const isTelefonoExist = yield Client_1.ClientsModel.findOne({ externalId: externalId });
            if (!isTelefonoExist) {
                return res.status(400).json({
                    message: 'El cliente no se encuentra en la base de datos',
                    status: 400
                });
            }
            else {
                isTelefonoExist.remove();
                res.status(200).json({
                    message: 'El cliente se elimino correctamente',
                    status: 200
                });
            }
        });
        // eliminar poliza
        this.DeletePolice = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const policyNumber = _req.params.policyNumber;
            const isPolicyExist = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ policyNumber: policyNumber });
            if (!isPolicyExist) {
                return res.status(400).json({
                    message: 'El numero de poliza no se encuentra en la base de datos',
                    status: 400
                });
            }
            else {
                yield fs_1.default.unlinkSync('src/uploads/' + isPolicyExist.fileUrl);
                yield isPolicyExist.remove();
                res.status(200).json({
                    message: 'La poliza se elimino correctamente',
                    status: 200
                });
            }
        });
        // actualizar cliente
        this.UpdateClient = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const _id = _req.params.externalId;
            const update = _req.body;
            const mostrar = yield Client_1.ClientsModel.findOne({ externalId: _id });
            if (mostrar) {
                const idclient = mostrar._id;
                const isExistPhoneNumber = yield Client_1.ClientsModel.findOne({ phoneNumber: update.phoneNumber });
                const isExistExternalId = yield Client_1.ClientsModel.findOne({ externalId: update.externalId });
                if (isExistExternalId) {
                    res.status(400).json({
                        message: 'El ExternalId ya esta registrado en la base de datos',
                        status: 400
                    });
                }
                else if (isExistPhoneNumber) {
                    res.status(400).json({
                        message: 'El número de teléfono ya esta registrado en la base de datos',
                        status: 400
                    });
                }
                else {
                    yield Client_1.ClientsModel.findByIdAndUpdate(idclient, update);
                    const Updatedclient = yield Client_1.ClientsModel.findOne({ _id: idclient });
                    res.status(200).json({
                        message: 'Cliente actualizado',
                        Updatedclient,
                        status: 200
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: 'No se encontro el cliente',
                    status: 400
                });
            }
        });
        // actualizar poliza
        this.UpdatePoliza = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            var _c, _d;
            res.set('Access-Control-Allow-Origin', '*');
            const file = _req.file;
            const _id = _req.params.policeId;
            const update = _req.body;
            const data = {
                fileUrl: file === null || file === void 0 ? void 0 : file.filename
            };
            if (!file) {
                const error = new Error('Se necesita el archivo para realizar la actualización');
                return error;
            }
            else if (file.mimetype === 'application/pdf') {
                /** search Number phone in the data base */
                yield InsurancePolicy_1.InsurancePoliciesModel.findByIdAndUpdate(_id, data);
                yield InsurancePolicy_1.InsurancePoliciesModel.findByIdAndUpdate(_id, update);
                const updatePoliceNow = yield InsurancePolicy_1.InsurancePoliciesModel.findById(_id);
                try {
                    res.status(200).send({ message: 'poliza actualizada', updatePoliceNow });
                }
                catch (error) {
                    fs_1.default.unlinkSync(`${(_c = _req.file) === null || _c === void 0 ? void 0 : _c.path}`);
                    return res.status(400).send({
                        message: `Error al actualizar l apoliza: ${error}`,
                        status: 400
                    });
                }
            }
            else {
                fs_1.default.unlinkSync(`${(_d = _req.file) === null || _d === void 0 ? void 0 : _d.path}`);
                res.status(400).json({
                    message: 'No se cargo ningún archivo o no es un PDF',
                    status: 400
                });
            }
        });
    }
}
function isObjEmpty(obj) {
    for (const prop in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
exports.default = new ImpulsaController();
