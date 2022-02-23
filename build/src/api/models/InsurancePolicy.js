"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsurancePoliciesModel = void 0;
const mongoose_1 = require("mongoose");
const shema = new mongoose_1.Schema({
    insurerName: { type: String, required: true },
    policyNumber: { type: Number, required: true },
    policyType: { type: String, required: true },
    effectiveDate: { type: Date, required: true },
    expirationDate: { type: Date, required: true },
    status: { type: String, required: true },
    fileUrl: { type: Object, required: true },
    clientId: { type: String, required: true },
});
const InsurancePoliciesModel = (0, mongoose_1.model)('InsurancePolicies', shema);
exports.InsurancePoliciesModel = InsurancePoliciesModel;
