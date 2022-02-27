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
var path = require('path');
/** My class of Impulsa controller */
class ImpulsaController {
    constructor() {
        //ver pdf de un cliente
        this.ViewFile = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            var _clientId = _req.params.id;
            const isUserExist = yield InsurancePolicy_1.InsurancePoliciesModel.find({ clientId: _clientId });
            if (!isUserExist) {
                res.json({
                    message: 'No estas asociado a ninguna poliza aún'
                });
            }
            else if (isUserExist) {
                // const url = isUserExist;
                const validator = isObjEmpty(isUserExist);
                if (validator === true) {
                    return res.status(400).json({
                        message: 'Aún no tiene Polizas'
                    });
                }
                res.status(200).json(isUserExist);
            }
            else {
                res.json({
                    mensaje: 'ocurrio un error'
                });
            }
        });
        //visualizar pdf
        this.ViewPDF = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            var name = _req.params.name;
            var data = fs_1.default.readFileSync('src/uploads/' + name);
            res.setHeader('Content-Type', 'application/pdf');
            // res.contentType("application/pdf");
            res.send(data);
        });
        // public DownloadPDF = async(_req : Request, res : Response)=>{
        //     res.set('Access-Control-Allow-Origin', '*');
        //     var name = _req.params.name;
        //     // var file = fs.createReadStream(`${name}`);
        //     // var stat = fs.statSync(`../../uploads/${name}`);
        //     // res.setHeader('Content-Length', stat.size);
        //     // res.setHeader('Content-Type', 'application/pdf');
        //     // res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
        //     // file.pipe(res);
        //     // var data =fs.readFileSync('src\\uploads\\'+name);
        //     var file = path.join('src\\uploads\\'+name);    
        //     res.download(file, function (err) {
        //         if (err) {
        //             console.log("Error");
        //             console.log(err);
        //             res.json(err)
        //         } else {
        //             console.log("Success")
        //             res.json("success")
        //         }    
        //     });
        // }
        //probando la subida de archivos pdf
        //guardar polizas
        this.Savefiles = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            res.set('Access-Control-Allow-Origin', '*');
            var file = _req.file;
            if (!file) {
                const error = new Error('Please upload a file');
                return error;
            }
            else if (file.mimetype === 'application/pdf') {
                /** search Number phone in the data base */
                const isUserExist = yield Client_1.ClientsModel.findOne({ phoneNumber: _req.params.phoneNumber });
                if (isUserExist) {
                    //instantiating the model for save data
                    const user = new InsurancePolicy_1.InsurancePoliciesModel({
                        insurerName: _req.body.insurerName,
                        policyNumber: _req.body.policyNumber,
                        policyType: _req.body.policyType,
                        effectiveDate: _req.body.effectiveDate,
                        expirationDate: _req.body.expirationDate,
                        status: _req.body.status,
                        fileUrl: file.filename,
                        clientId: isUserExist._id
                    });
                    try {
                        //save data
                        yield user.save();
                        //send request exit
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
                        status: 400,
                    });
                }
            }
            else {
                fs_1.default.unlinkSync(`${(_b = _req.file) === null || _b === void 0 ? void 0 : _b.path}`);
                res.status(400).json({
                    message: 'no es un archivo pdf',
                    status: 400,
                });
            }
        });
        //vizualisar clientes
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
        //visaualizar cliente por telefono
        this.ViewClient = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            var phone = _req.params.phoneNumber;
            const isClientExist = yield Client_1.ClientsModel.findOne({ phoneNumber: phone });
            if (!isClientExist) {
                res.json({
                    message: 'No existe el cliente'
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
        //guardar cliente
        this.SaveClient = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            //TODOs:: falta validar los imputs que son necesarios como el external id
            const isTelefonoExist = yield Client_1.ClientsModel.findOne({ phoneNumber: _req.body.phoneNumber });
            if (isTelefonoExist) {
                return res.status(208).json({
                    error: 'El numero telefonico ya se encuentra registrado en la base de datos',
                    status: 208
                });
            }
            else {
                //instantiating the model for save data
                const client = new Client_1.ClientsModel({
                    firstName: _req.body.firstName,
                    middleName: _req.body.middleName,
                    lastName: _req.body.lastName,
                    birthday: _req.body.birthday,
                    phoneNumber: _req.body.phoneNumber,
                    externalId: _req.body.externalId,
                });
                try {
                    //save data
                    yield client.save();
                    //send request exit
                    res.status(200).json({
                        message: 'cliente registrado',
                        Client: client,
                        status: 200,
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
        //eliminar cliente
        this.DeleteClient = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            let phoneNumber = _req.params.phoneNumber;
            const isTelefonoExist = yield Client_1.ClientsModel.findOne({ phoneNumber: phoneNumber });
            if (!isTelefonoExist) {
                return res.status(500).json({ message: 'El cliente no se encuentra en la base de datos' });
            }
            else {
                isTelefonoExist.remove();
                res.status(200).json({ message: 'El cliente se elimino correctamente' });
            }
        });
        //eliminar poliza
        this.DeletePDF = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            let policyNumber = _req.params.policyNumber;
            const isPolicyExist = yield InsurancePolicy_1.InsurancePoliciesModel.findOne({ policyNumber: policyNumber });
            if (!isPolicyExist) {
                return res.status(500).json({ message: 'El numero de poliza no se encuentra en la base de datos' });
            }
            else {
                isPolicyExist.remove();
                res.status(200).json({ message: 'La poliza se elimino correctamente' });
            }
        });
        //actualizar cliente
        this.UpdateClient = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            let _id = _req.params.clientId;
            let update = _req.body;
            // const isTelefonoExist = await ClientsModel.findOne({ phoneNumber: phoneNumber });
            const updateClient = yield Client_1.ClientsModel.findByIdAndUpdate(_id, update);
            if (!updateClient) {
                return res.status(400).send({ message: `Error al actualizar el usuario` });
            }
            else {
                // updateClient.update(update);
                res.status(200).send({ message: 'Cliente actualizado' });
            }
        });
        //actualizar poliza
        this.UpdatePoliza = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set('Access-Control-Allow-Origin', '*');
            let _id = _req.params.policeId;
            let update = _req.body;
            // const isTelefonoExist = await ClientsModel.findOne({ phoneNumber: phoneNumber });
            const updatePolice = yield InsurancePolicy_1.InsurancePoliciesModel.findByIdAndUpdate(_id, update);
            if (!updatePolice) {
                return res.status(400).send({ message: `Error al actualizar l apoliza` });
            }
            else {
                // updateClient.update(update);
                res.status(200).send({ message: 'poliza actualizada' });
            }
        });
    }
}
function isObjEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
exports.default = new ImpulsaController();
