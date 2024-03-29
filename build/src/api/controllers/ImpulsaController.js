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
const Insurance_1 = require("../models/Insurance");
const fs_1 = __importDefault(require("fs"));
const Client_1 = require("../models/Client");
const User_1 = require("../models/User");
const axios_1 = __importDefault(require("axios"));
const NotificatiosPush_1 = require("../models/NotificatiosPush");
const const_1 = require("../constants/const");
const ExternalPolicyClinet_1 = require("../models/ExternalPolicyClinet");
const database_1 = require("../../config/database");
const mongodb_1 = require("mongodb");
const moment_1 = __importDefault(require("moment"));
// import { GridFsStorage } from 'multer-gridfs-storage';
const mongoClient = new mongodb_1.MongoClient(database_1.conection);
/** My class of Impulsa controller */
class ImpulsaController {
    constructor() {
        // ver pdf de un cliente
        this.ViewPolicies = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const externalId = _req.params.externalId;
            try {
                const isPoliceExist = yield InsurancePolicy_1.InsurancePoliciesModel.find({ externalIdClient: externalId });
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
            }
            catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error: ' + error,
                    status: 400
                });
            }
        });
        // TODOs: falta validar que siga todo correcto desde el front
        this.ViewPDF = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const externalId = _req.params.externalId;
            try {
                const isPolicyExist = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ externalId: externalId });
                if (isPolicyExist) {
                    const name = isPolicyExist === null || isPolicyExist === void 0 ? void 0 : isPolicyExist.fileUrl;
                    try {
                        // const database:any = conection;
                        // console.log(name as string);
                        yield mongoClient.connect();
                        const database = mongoClient.db();
                        const bucket = new mongodb_1.GridFSBucket(database, {
                            bucketName: 'insurancePolicies'
                        });
                        const downloadStream = bucket.openDownloadStreamByName(name);
                        downloadStream.on('data', function (data) {
                            // res.setHeader('Content-Type', 'application/pdf');
                            return res.status(200).write(data);
                        });
                        downloadStream.on('error', function (err) {
                            return res.status(404).send({ message: 'No se puede obtener la póliza!' + err });
                        });
                        downloadStream.on('end', () => {
                            return res.end();
                        });
                    }
                    catch (error) {
                        return res.status(400).send({
                            message: 'Ocurrio un error inesperado: ' + error
                        });
                    }
                }
                else {
                    return res.status(400).send({
                        message: 'No se ecuentra la póliza'
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
        this.ViewPolicyDetail = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const externalId = _req.params.externalId;
            try {
                const isPolicyExist = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ externalId: externalId }, { _id: 0, __v: 0 });
                if (isPolicyExist) {
                    res.status(200).json({
                        data: isPolicyExist,
                        status: 200
                    });
                }
                else {
                    res.status(400).json({
                        message: 'No se encuentra la póliza',
                        status: 200
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
        this.SavePolice = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const file = _req.file;
            // var oMyBlob = new Blob(file as undefined, {type : 'application/pdf'});
            console.log(file);
            const status = _req.body.status;
            const numUse = const_1.Status[status];
            try {
                if (!file) {
                    const error = new Error('Please upload a file');
                    res.status(400).json({
                        message: 'Se nececesita el archivo PDF: ' + error,
                        status: 400
                    });
                }
                else if (numUse === undefined) {
                    res.status(400).json({
                        message: 'El status es invalido',
                        status: 400
                    });
                }
                else if (file.mimetype === 'application/pdf') {
                    /** search Number phone in the data base */
                    const isUserExist = yield Client_1.ClientsModel.findOne({ externalId: _req.params.externalIdClient });
                    if (isUserExist) {
                        const isPolicyExist = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ externalId: _req.body.externalId });
                        if (isPolicyExist) {
                            return res.status(400).json({
                                error: 'El externalId ya se encuentra registrado en la base de datos',
                                status: 400
                            });
                        }
                        else {
                            const isNumberPolicyExist = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ policyNumber: _req.body.policyNumber });
                            if (isNumberPolicyExist) {
                                res.status(400).json({
                                    message: 'El número de la poliza debe ser único',
                                    status: 400
                                });
                            }
                            else {
                                // creando el alias del modelo
                                const tipe = _req.body.policyType.toUpperCase();
                                const number = _req.body.policyNumber;
                                // asignando la aseguradora a la poliza
                                const insuranceId = _req.body.insuranceId;
                                const isInsuranceExist = yield Insurance_1.InsuranceModel.findOne({ externalId: insuranceId });
                                if (isInsuranceExist) {
                                    try {
                                        const aseguradora = isInsuranceExist === null || isInsuranceExist === void 0 ? void 0 : isInsuranceExist.name;
                                        // construyendo el alias momentario
                                        const alias = `${aseguradora}-${tipe}-${number}`;
                                        // instantiating the model for save data
                                        const user = new InsurancePolicy_1.InsurancePoliciesModel({
                                            insuranceId: insuranceId,
                                            policyNumber: number,
                                            policyType: tipe,
                                            alias: alias,
                                            effectiveDate: _req.body.effectiveDate,
                                            expirationDate: _req.body.expirationDate,
                                            status: numUse,
                                            fileUrl: `${file.filename}`,
                                            externalId: _req.body.externalId,
                                            externalIdClient: _req.params.externalIdClient
                                        });
                                        // save data
                                        yield user.save();
                                        yield user.updateOne({});
                                        // send request exit
                                        res.status(200).json({
                                            message: 'Poliza registrada',
                                            UserPolicy: [
                                                `InsurerName : ${user.insuranceId}`,
                                                `PolicyNumber : ${user.policyNumber}`,
                                                `alias : ${user.alias}`,
                                                `PolicyType : ${user.policyType}`,
                                                `EffectiveDate : ${user.effectiveDate}`,
                                                `ExpirationDate : ${user.expirationDate}`,
                                                `Status : ${user.status}`,
                                                `FileName : ${user.fileUrl}`,
                                                `externalId : ${user.externalId}`
                                            ]
                                        });
                                        // UploadFile().uploadFiles.single('file')
                                    }
                                    catch (error) {
                                        res.status(404).json({
                                            error,
                                            status: 404
                                        });
                                    }
                                }
                                else {
                                    res.status(400).json({
                                        message: 'No se encuentra la aseguradora',
                                        status: 400
                                    });
                                }
                            }
                        }
                    }
                    else {
                        // fs.unlinkSync(`${_req.file?.path}`);
                        res.status(400).json({
                            message: 'Cliente no encontrado',
                            status: 400
                        });
                    }
                }
                else {
                    const name = file.filename;
                    let noPDF = [];
                    yield mongoClient.connect();
                    const database = yield mongoClient.db();
                    const buscar = yield database.collection('insurancePolicies.files').findOne({ filename: name });
                    const binarios = yield database.collection('insurancePolicies.chunks').find({ files_id: buscar === null || buscar === void 0 ? void 0 : buscar._id });
                    yield binarios.forEach(item => {
                        noPDF.push({
                            _id: item._id
                        });
                    });
                    for (let x = 0; x < noPDF.length; x++) {
                        const id = noPDF[x]._id;
                        yield database.collection('insurancePolicies.chunks').findOneAndDelete({ _id: id });
                    }
                    yield database.collection('insurancePolicies.files').findOneAndDelete({ filename: name });
                    noPDF = [];
                    res.status(400).json({
                        message: 'no es un archivo pdf: ',
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
        // vizualisar clientes
        this.ViewClients = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            try {
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
            }
            catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error: ' + error,
                    status: 400
                });
            }
        });
        // visaualizar cliente por telefono
        this.ViewClient = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const externalId = _req.params.externalId;
            try {
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
            }
            catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error: ' + error,
                    status: 400
                });
            }
        });
        // guardar cliente
        this.SaveClient = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const removeAccents = (str) => {
                return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            };
            const phoneNumber = _req.body.phoneNumber;
            const fullNameFI = _req.body.fullName;
            const fullNameCA = fullNameFI.toUpperCase();
            const fullName = removeAccents(fullNameCA);
            const birthday = _req.body.incorporationOrBirthDate;
            const phone = phoneNumber.replace(/\s+/g, '');
            try {
                if (_req.body.phoneNumber === null) {
                    return res.status(208).json({
                        error: 'El número telefónico es requerido',
                        status: 208
                    });
                }
                else if (_req.body.externalId === null) {
                    return res.status(208).json({
                        error: 'El exterlId es requerido',
                        status: 208
                    });
                }
                else {
                    const isfullNameExist = yield Client_1.ClientsModel.findOne({ fullName: fullName });
                    const isEzternalIDExist = yield Client_1.ClientsModel.findOne({ externalId: _req.body.externalId });
                    if (isfullNameExist) {
                        const validarBirthday = yield Client_1.ClientsModel.findOne({ _id: isfullNameExist._id, incorporationOrBirthDate: birthday });
                        const _id = isfullNameExist._id;
                        if (validarBirthday) {
                            const update = {
                                externalId: _req.body.externalId
                            };
                            yield Client_1.ClientsModel.findByIdAndUpdate(_id, update);
                            const actualizacion = yield Client_1.ClientsModel.findById(_id);
                            res.status(200).json({
                                message: 'Cliente registrado',
                                Client: actualizacion
                            });
                        }
                        else {
                            return res.status(208).json({
                                error: 'El cliente existe en la BD, pero sus datos no coinsiden',
                                status: 208
                            });
                        }
                    }
                    else if (isEzternalIDExist) {
                        return res.status(208).json({
                            error: 'El ExternalId ya se encuentra registrado en la base de datos y es un campo requerido',
                            status: 208
                        });
                    }
                    else {
                        // instantiating the model for save data
                        const client = new Client_1.ClientsModel({
                            fullName: fullName,
                            incorporationOrBirthDate: birthday,
                            phoneNumber: phone,
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
                }
            }
            catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error: ' + error,
                    status: 400
                });
            }
        });
        // eliminar cliente
        this.DeleteClient = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const externalId = _req.params.externalId;
            try {
                const isTelefonoExist = yield Client_1.ClientsModel.findOne({ externalId: externalId });
                if (!isTelefonoExist) {
                    return res.status(400).json({
                        message: 'El cliente no se encuentra en la base de datos',
                        status: 400
                    });
                }
                else {
                    yield isTelefonoExist.delete();
                    const User = yield User_1.UsersModel.findOne({ clientId: isTelefonoExist._id });
                    yield (User === null || User === void 0 ? void 0 : User.delete());
                    res.status(200).json({
                        message: 'El cliente se elimino correctamente',
                        status: 200
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
        // eliminar poliza
        this.DeletePolice = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const externalId = _req.params.externalId;
            try {
                const isPolicyExist = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ externalId: externalId });
                if (!isPolicyExist) {
                    return res.status(400).json({
                        message: 'La póliza no se encuentra en la base de datos',
                        status: 400
                    });
                }
                else {
                    yield fs_1.default.unlinkSync('src/uploads/' + isPolicyExist.fileUrl);
                    yield isPolicyExist.delete();
                    res.status(200).json({
                        message: 'La poliza se elimino correctamente',
                        status: 200
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
        // actualizar cliente
        this.UpdateClient = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const _id = _req.params.externalId;
            const update = _req.body;
            try {
                if (_req.body.externalId != null) {
                    res.status(400).json({
                        message: 'El externalId no se puede editar',
                        status: 400
                    });
                }
                else {
                    const mostrar = yield Client_1.ClientsModel.findOne({ externalId: _id });
                    if (mostrar) {
                        const idclient = mostrar._id;
                        const isExistPhoneNumber = yield Client_1.ClientsModel.findOne({ phoneNumber: update.phoneNumber });
                        if (isExistPhoneNumber) {
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
                            message: 'No se encontró el cliente en la base de datos',
                            status: 400
                        });
                    }
                }
            }
            catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error: ' + error,
                    status: 400
                });
            }
        });
        // actualizar poliza
        this.UpdatePoliza = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            res.set('Access-Control-Allow-Origin', '*');
            const file = _req.file;
            const externalId = _req.params.externalId;
            const update = _req.body;
            const status = _req.body.status;
            const numUse = const_1.Status[status];
            const UpdateStatus = { status: numUse };
            try {
                const data = {
                    fileUrl: file === null || file === void 0 ? void 0 : file.filename
                };
                if (_req.body.externalId != null) {
                    res.status(400).json({
                        message: 'El externalId no se puede editar',
                        status: 400
                    });
                }
                else if (numUse === undefined) {
                    res.status(400).json({
                        message: 'El status es invalido',
                        status: 400
                    });
                }
                else {
                    if (!file) {
                        const isPolicyExist = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ externalId: externalId });
                        if (isPolicyExist) {
                            const _id = isPolicyExist._id;
                            yield InsurancePolicy_1.InsurancePoliciesModel.findByIdAndUpdate(_id, update);
                            if (status !== undefined) {
                                yield InsurancePolicy_1.InsurancePoliciesModel.findByIdAndUpdate(_id, UpdateStatus);
                                const idPolicy = JSON.stringify(_id);
                                const idActualizar = idPolicy.slice(1, -1);
                                const policyActualizar = yield ExternalPolicyClinet_1.ExternalPolicyClinetModel.findOne({ externalIdPolicy: idActualizar });
                                yield ExternalPolicyClinet_1.ExternalPolicyClinetModel.findByIdAndUpdate(policyActualizar === null || policyActualizar === void 0 ? void 0 : policyActualizar._id, UpdateStatus);
                            }
                            try {
                                // await InsurancePoliciesModel.findByIdAndUpdate(_id, data);
                                const updatePoliceNow = yield InsurancePolicy_1.InsurancePoliciesModel.findById(_id);
                                res.status(200).send({ message: 'poliza actualizada', updatePoliceNow });
                            }
                            catch (error) {
                                fs_1.default.unlinkSync(`${(_a = _req.file) === null || _a === void 0 ? void 0 : _a.path}`);
                                return res.status(400).send({
                                    message: `Error al actualizar la poliza: ${error}`,
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
                    else if (file.mimetype === 'application/pdf' || status !== undefined) {
                        const isPolicyExist = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ externalId: externalId });
                        if (isPolicyExist) {
                            const _id = isPolicyExist._id;
                            yield InsurancePolicy_1.InsurancePoliciesModel.findByIdAndUpdate(_id, update);
                            try {
                                yield InsurancePolicy_1.InsurancePoliciesModel.findByIdAndUpdate(_id, data);
                                if (status !== undefined) {
                                    yield InsurancePolicy_1.InsurancePoliciesModel.findByIdAndUpdate(_id, UpdateStatus);
                                    const idPolicy = JSON.stringify(_id);
                                    const idActualizar = idPolicy.slice(1, -1);
                                    const policyActualizar = yield ExternalPolicyClinet_1.ExternalPolicyClinetModel.findOne({ externalIdPolicy: idActualizar });
                                    yield ExternalPolicyClinet_1.ExternalPolicyClinetModel.findByIdAndUpdate(policyActualizar === null || policyActualizar === void 0 ? void 0 : policyActualizar._id, UpdateStatus);
                                }
                                const updatePoliceNow = yield InsurancePolicy_1.InsurancePoliciesModel.findById(_id);
                                res.status(200).send({ message: 'poliza actualizada', updatePoliceNow });
                            }
                            catch (error) {
                                fs_1.default.unlinkSync(`${(_b = _req.file) === null || _b === void 0 ? void 0 : _b.path}`);
                                return res.status(400).send({
                                    message: `Error al actualizar l apoliza: ${error}`,
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
                    else {
                        fs_1.default.unlinkSync(`${(_c = _req.file) === null || _c === void 0 ? void 0 : _c.path}`);
                        res.status(400).json({
                            message: 'No se cargo ningún archivo o no es un PDF',
                            status: 400
                        });
                    }
                }
            }
            catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error: ' + error,
                    status: 400
                });
            }
        });
        /**
         * crud de aseguradoras
        */
        // guardar poliza
        this.SaveInsurance = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const phoneNumber = _req.body.phoneNumber;
            let valuesMax = 0;
            try {
                if (_req.body.phoneNumber === null) {
                    return res.status(400).json({
                        error: 'El número telefónico es requerido',
                        status: 400
                    });
                }
                else if (_req.body.externalId === null) {
                    return res.status(400).json({
                        error: 'El exterlId es requerido',
                        status: 400
                    });
                }
                else if (_req.body.name === null) {
                    return res.status(400).json({
                        error: 'El nombre es requerido',
                        status: 400
                    });
                }
                else {
                    try {
                        // const phone = phoneNumber.replace(/\s+/g, '');
                        // const isTelefonoExist = await InsuranceModel.findOne({ phoneNumber: phone });
                        const isExternalIDExist = yield Insurance_1.InsuranceModel.findOne({ externalId: _req.body.externalId });
                        const valueOrderMax = yield Insurance_1.InsuranceModel.find().sort({ order: -1 }).limit(1);
                        valueOrderMax.forEach(item => {
                            valuesMax = item.order;
                        });
                        const name = _req.body.name.toUpperCase();
                        if (isExternalIDExist) {
                            return res.status(208).json({
                                error: 'El ExternalId ya se encuentra registrado en la base de datos y es un campo requerido',
                                status: 208
                            });
                        }
                        else {
                            // instantiating the model for save data
                            const insurance = new Insurance_1.InsuranceModel({
                                externalId: _req.body.externalId,
                                name: name,
                                phoneNumber: phoneNumber,
                                order: valuesMax + 1
                            });
                            try {
                                // save data
                                yield insurance.save();
                                // send request exit
                                res.status(200).json({
                                    message: 'Aseguradora registrada',
                                    Insurance: insurance,
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
                    }
                    catch (error) {
                        return res.status(400).json({
                            error: 'Ocurrio un error: ' + error,
                            status: 400
                        });
                    }
                }
            }
            catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error: ' + error,
                    status: 400
                });
            }
        });
        // ver las aseguradoras
        this.ViewInsurances = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            try {
                const insurances = [];
                const resultsCorrect = [];
                const isInsuranceExist = yield Insurance_1.InsuranceModel.find({}).sort({ order: 1 });
                isInsuranceExist.forEach(item => {
                    insurances.push({
                        _id: item._id,
                        numbers: item.phoneNumber
                    });
                });
                if (!isInsuranceExist) {
                    res.json({
                        message: 'No hay aseguradoras registradas'
                    });
                }
                else if (isInsuranceExist) {
                    for (let x = 0; x < insurances.length; x++) {
                        const id = insurances[x]._id;
                        const numeros = insurances[x].numbers;
                        const searchInsurance = yield Insurance_1.InsuranceModel.findById(id);
                        const resultado = numeros.find((value) => value.type === 'GENERAL');
                        resultsCorrect.push({
                            _id: searchInsurance === null || searchInsurance === void 0 ? void 0 : searchInsurance._id,
                            phoneNumber: resultado === null || resultado === void 0 ? void 0 : resultado.number,
                            name: searchInsurance === null || searchInsurance === void 0 ? void 0 : searchInsurance.name,
                            externalId: searchInsurance === null || searchInsurance === void 0 ? void 0 : searchInsurance.externalId,
                            iconCode: searchInsurance === null || searchInsurance === void 0 ? void 0 : searchInsurance.iconCode,
                            colorCode: searchInsurance === null || searchInsurance === void 0 ? void 0 : searchInsurance.colorCode,
                            order: searchInsurance === null || searchInsurance === void 0 ? void 0 : searchInsurance.order
                        });
                    }
                    res.status(200).json(resultsCorrect);
                }
                else {
                    res.json({
                        mensaje: 'ocurrio un error'
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
        // ver aseguradora con el externalId
        this.ViewInsurance = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const externalId = _req.params.externalId;
            try {
                const isClientExist = yield Insurance_1.InsuranceModel.findOne({ externalId: externalId });
                if (!isClientExist) {
                    res.status(400).json({
                        message: 'No existe la aseguradora',
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
            }
            catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error: ' + error,
                    status: 400
                });
            }
        });
        // eliminar aseguradora
        this.DeleteInsurance = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const externalId = _req.params.externalId;
            try {
                const isInsuranceExist = yield Insurance_1.InsuranceModel.findOne({ externalId: externalId });
                if (!isInsuranceExist) {
                    return res.status(400).json({
                        message: 'La aseguradora no se encuentra en la base de datos',
                        status: 400
                    });
                }
                else {
                    yield isInsuranceExist.delete();
                    res.status(200).json({
                        message: 'La aseguradora se elimino correctamente',
                        status: 200
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
        // actualizar aseguradora
        this.UpdateInsurance = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const _id = _req.params.externalId;
            const update = _req.body;
            try {
                if (_req.body.externalId != null) {
                    res.status(400).json({
                        message: 'El externalId no se puede editar',
                        status: 400
                    });
                }
                else {
                    const mostrar = yield Insurance_1.InsuranceModel.findOne({ externalId: _id });
                    if (mostrar) {
                        const idInsurance = mostrar._id;
                        const isExistPhoneNumber = yield Insurance_1.InsuranceModel.findOne({ phoneNumber: update.phoneNumber });
                        if (isExistPhoneNumber) {
                            res.status(400).json({
                                message: 'El número de teléfono ya esta registrado en la base de datos',
                                status: 400
                            });
                        }
                        else {
                            yield Insurance_1.InsuranceModel.findByIdAndUpdate(idInsurance, update);
                            const UpdatedInsurance = yield Insurance_1.InsuranceModel.findOne({ _id: idInsurance });
                            res.status(200).json({
                                message: 'Aseguradora actualizada',
                                UpdatedInsurance,
                                status: 200
                            });
                        }
                    }
                    else {
                        return res.status(400).json({
                            message: 'No se encontró la aseguradora en la base de datos',
                            status: 400
                        });
                    }
                }
            }
            catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error: ' + error,
                    status: 400
                });
            }
        });
        // notificaciones push
        this.sendPush = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const notification = _req.body.notification;
            const externalId = _req.params.externalId;
            try {
                const client = yield Client_1.ClientsModel.findOne({ externalId: externalId });
                if (client) {
                    const _id = JSON.stringify(client === null || client === void 0 ? void 0 : client._id);
                    const search = _id.slice(1, -1);
                    const user = yield User_1.UsersModel.findOne({ clientId: search });
                    const firebaseToken = user === null || user === void 0 ? void 0 : user.firebaseToken;
                    if (firebaseToken !== undefined) {
                        console.log(search);
                        // token omar: cOqymngbRTyswgSRVOgwQu:APA91bFZYKtqTPNZESfxau0jnI1PS8klEybOhcif2FxON20xuEgGnFitw0uh5OrGa-Ae3LxUWoWtWuQzV67uHKlNVbvIXl-Sh7NOhMpNPT-HLt2BiyVV7Pg7kp9ohaxN0q6dn1HSmFrL
                        const data = {
                            to: `${firebaseToken}`,
                            notification: {
                                sound: 'default',
                                vibration: true,
                                body: `${notification}`,
                                title: 'Impulsa To Go',
                                content_available: true,
                                priority: 'high'
                            },
                            android: {
                                notification: {
                                    sound: 'default',
                                    vibration: true
                                }
                            },
                            apns: {
                                payload: {
                                    sound: 'default'
                                }
                            }
                        };
                        const instance = yield axios_1.default.create({
                            baseURL: 'https://fcm.googleapis.com/',
                            timeout: 1000,
                            headers: {
                                Authorization: process.env.KEY_FIREBASE || '',
                                'Content-Type': 'application/json'
                            }
                        });
                        const notificationPush = new NotificatiosPush_1.NotificationPushModel({
                            type: 'APP',
                            title: 'Impulsa To Go',
                            notification: notification,
                            externalIdClient: externalId
                        });
                        yield notificationPush.save();
                        instance.post('fcm/send', data)
                            .then(function (response) {
                            res.status(200).json({
                                message: `La notificación se ha enviado de manera correcta: ${response.data}`,
                                status: 200
                            });
                        })
                            .catch(function (error) {
                            res.status(400).json({
                                message: 'Ocurrio un error: ' + error,
                                status: 400
                            });
                        });
                    }
                    else {
                        res.status(400).json({
                            message: 'El cliente no tiene el token de firebase',
                            status: 400
                        });
                    }
                }
                else {
                    res.status(400).json({
                        message: 'No se encuentra el Cliente',
                        status: 400
                    });
                }
            }
            catch (error) {
                res.send({ 'Ocurrio un error ': error });
            }
        });
        // busqueda por fecha
        this.SearchDate = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            let { startDate, endDate } = _req.query;
            endDate += 'T21:59:59.999+00:00';
            const polizasClient = [];
            try {
                if (!(0, moment_1.default)(startDate).isValid || !(0, moment_1.default)(endDate).isValid) {
                    throw new Error('Invalid dates');
                }
                // buscando el cliente
                const clients = yield Client_1.ClientsModel.find({ createdAt: { $gte: startDate, $lte: endDate } });
                for (const client of clients) {
                    const id = client.externalId;
                    const [polizasPropias, polizasExternas] = yield Promise.all([
                        InsurancePolicy_1.InsurancePoliciesModel.find({ externalIdClient: id }, { _id: 0, __v: 0, deleted: 0 }),
                        ExternalPolicyClinet_1.ExternalPolicyClinetModel.find({ IdClient: client._id }, { _id: 0, __v: 0, deleted: 0 })
                    ]);
                    const polizasP = {
                        clientName: client.fullName,
                        ownPolicies: polizasPropias,
                        externalPolicies: polizasExternas
                    };
                    // eslint-disable-next-line no-unused-vars
                    polizasClient.push(polizasP);
                }
                res.status(200).json({
                    data: polizasClient
                });
            }
            catch (error) {
                res.status(400).json({
                    message: 'Los parametros opcionales "endDate" y/o "startDate" estan malformados'
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
