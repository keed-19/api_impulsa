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
        // visualizar pdf
        this.ViewPDF = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            const externalId = _req.params.externalId;
            try {
                const isPolicyExist = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ externalId: externalId });
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
        // guardar poliza
        this.SavePolice = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            res.set('Access-Control-Allow-Origin', '*');
            const file = _req.file;
            try {
                if (!file) {
                    const error = new Error('Please upload a file');
                    return error;
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
                                const isInsuranceExist = yield Insurance_1.InsuranceModel.findOne({ insuranceId: insuranceId });
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
                                            status: _req.body.status,
                                            fileUrl: file.filename,
                                            externalId: _req.body.externalId,
                                            externalIdClient: _req.params.externalIdClient
                                        });
                                        // save data
                                        yield user.save();
                                        // send request exit
                                        res.status(200).json({
                                            message: 'Poliza registrada',
                                            UserPolicy: [
                                                `InsurerName : ${user.insuranceId}`,
                                                `PolicyNumber : ${user.policyNumber}`,
                                                `PolicyType : ${user.policyType}`,
                                                `EffectiveDate : ${user.effectiveDate}`,
                                                `ExpirationDate : ${user.expirationDate}`,
                                                `Status : ${user.status}`,
                                                `FileName : ${user.fileUrl}`,
                                                `externalId : ${user.externalId}`
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
                                    res.status(400).json({
                                        message: 'No se encuentra la aseguradora',
                                        status: 400
                                    });
                                }
                            }
                        }
                    }
                    else {
                        fs_1.default.unlinkSync(`${(_a = _req.file) === null || _a === void 0 ? void 0 : _a.path}`);
                        res.status(400).json({
                            message: 'Cliente no encontrado',
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
            const phoneNumber = _req.body.phoneNumber;
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
                    const isTelefonoExist = yield Client_1.ClientsModel.findOne({ phoneNumber: phone });
                    const isEzternalIDExist = yield Client_1.ClientsModel.findOne({ externalId: _req.body.externalId });
                    if (isTelefonoExist) {
                        return res.status(208).json({
                            error: 'El numero telefonico ya se encuentra registrado en la base de datos',
                            status: 208
                        });
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
                            fullName: _req.body.fullName,
                            incorporationOrBirthDate: _req.body.incorporationOrBirthDate,
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
                    isTelefonoExist.remove();
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
                    yield isPolicyExist.remove();
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
            var _c, _d;
            res.set('Access-Control-Allow-Origin', '*');
            const file = _req.file;
            const externalId = _req.params.externalId;
            const update = _req.body;
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
                else {
                    if (!file) {
                        // const error = new Error('Se necesita el archivo para realizar la actualización');
                        return res.status(400).json({
                            message: 'Se necesita el archivo PDF para poder realizar la actualización',
                            status: 400
                        });
                    }
                    else if (file.mimetype === 'application/pdf') {
                        const isPolicyExist = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ externalId: externalId });
                        if (isPolicyExist) {
                            const _id = isPolicyExist._id;
                            yield InsurancePolicy_1.InsurancePoliciesModel.findByIdAndUpdate(_id, update);
                            try {
                                yield InsurancePolicy_1.InsurancePoliciesModel.findByIdAndUpdate(_id, data);
                                const updatePoliceNow = yield InsurancePolicy_1.InsurancePoliciesModel.findById(_id);
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
                            res.status(400).json({
                                message: 'No se encuentra la póliza',
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
                        const phone = phoneNumber.replace(/\s+/g, '');
                        const isTelefonoExist = yield Insurance_1.InsuranceModel.findOne({ phoneNumber: phone });
                        const isExternalIDExist = yield Insurance_1.InsuranceModel.findOne({ externalId: _req.body.externalId });
                        const name = _req.body.name.toUpperCase();
                        if (isTelefonoExist) {
                            return res.status(208).json({
                                error: 'El numero telefonico ya se encuentra registrado en la base de datos',
                                status: 208
                            });
                        }
                        else if (isExternalIDExist) {
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
                                phoneNumber: phone
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
                const isInsuranceExist = yield Insurance_1.InsuranceModel.find({});
                if (!isInsuranceExist) {
                    res.json({
                        message: 'No hay aseguradoras registradas'
                    });
                }
                else if (isInsuranceExist) {
                    res.status(200).json(isInsuranceExist);
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
                    yield isInsuranceExist.remove();
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
