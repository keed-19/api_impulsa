"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsModel = void 0;
const mongoose_1 = require("mongoose");
const mongoose_delete_1 = __importDefault(require("mongoose-delete"));
const shema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    incorporationOrBirthDate: { type: Date, required: true },
    externalId: { type: Number, required: false },
    verificationCode: { type: Number, required: false }
}, { timestamps: true });
shema.plugin(mongoose_delete_1.default, { deletedAt: true, overrideMethods: 'all', indexFields: ['deletedAt'] });
const ClientsModel = (0, mongoose_1.model)('Clients', shema);
exports.ClientsModel = ClientsModel;
