"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRequestModel = void 0;
const mongoose_1 = require("mongoose");
const mongoose_delete_1 = __importDefault(require("mongoose-delete"));
const shema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    middleName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    birthday: { type: Date, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    tokenTotp: { type: String, required: true }
}, { timestamps: true });
shema.plugin(mongoose_delete_1.default, { deletedAt: true, overrideMethods: 'all', indexFields: ['deletedAt'] });
const RegisterRequestModel = (0, mongoose_1.model)('RegisterRequest', shema);
exports.RegisterRequestModel = RegisterRequestModel;
