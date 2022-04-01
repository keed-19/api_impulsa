"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalPolicyClinetModel = void 0;
const mongoose_1 = require("mongoose");
const mongoose_delete_1 = __importDefault(require("mongoose-delete"));
const shema = new mongoose_1.Schema({
    IdClient: { type: String, required: true },
    externalIdClient: { type: String, required: false },
    externalIdPolicy: { type: String, required: false },
    alias: { type: String, required: false },
    policyType: { type: String, required: false }
}, { timestamps: true });
shema.plugin(mongoose_delete_1.default, { deletedAt: true, overrideMethods: 'all', indexFields: ['deletedAt'] });
const ExternalPolicyClinetModel = (0, mongoose_1.model)('ExternalPolicyClient', shema);
exports.ExternalPolicyClinetModel = ExternalPolicyClinetModel;
