"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalPolicyClinetModel = void 0;
const mongoose_1 = require("mongoose");
const shema = new mongoose_1.Schema({
    IdClient: { type: String, required: true },
    externalIdClient: { type: String, required: false },
    externalIdPolicy: { type: String, required: false },
    alias: { type: String, required: false },
    policyType: { type: String, required: false },
    status: { type: String, required: false }
});
const ExternalPolicyClinetModel = (0, mongoose_1.model)('ExternalPolicyClient', shema);
exports.ExternalPolicyClinetModel = ExternalPolicyClinetModel;
