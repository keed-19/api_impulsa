"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsurancePoliciesModel = void 0;
const mongoose_1 = require("mongoose");
// eslint-disable-next-line camelcase
const mongoose_delete_1 = __importDefault(require("mongoose-delete"));
const shema = new mongoose_1.Schema({
    insuranceId: { type: String, required: true },
    policyNumber: { type: String, unique: true, required: true },
    policyType: { type: String, required: true },
    alias: { type: String, required: true },
    effectiveDate: { type: Date, required: true },
    expirationDate: { type: Date, required: true },
    status: { type: String, required: true },
    fileUrl: { type: Object, required: true },
    externalId: { type: String, required: true },
    externalIdClient: { type: String, required: true },
    updatedAt: { type: Date, required: false }
}, { timestamps: true });
shema.plugin(mongoose_delete_1.default, { deletedAt: true, overrideMethods: 'all', indexFields: ['deletedAt'] });
const InsurancePoliciesModel = (0, mongoose_1.model)('InsurancePolicies', shema);
exports.InsurancePoliciesModel = InsurancePoliciesModel;
