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
const User_1 = require("../models/User");
const InsurancePolicy_1 = require("../models/InsurancePolicy");
const fs_1 = __importDefault(require("fs"));
/** My class of user controller */
class ImpulsaController {
    constructor() {
        //probando la subida de archivos pdf
        this.Savefiles = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
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
            else if (file.mimetype === 'application/pdf') {
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
            else {
                fs_1.default.unlinkSync(`${(_b = _req.file) === null || _b === void 0 ? void 0 : _b.path}`);
                res.status(400).json({
                    message: 'no es un archivo pdf',
                    status: 400,
                });
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
}
exports.default = new ImpulsaController();
