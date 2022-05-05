"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsuranceModel = void 0;
const mongoose_1 = require("mongoose");
// eslint-disable-next-line camelcase
const mongoose_delete_1 = __importDefault(require("mongoose-delete"));
const shema = new mongoose_1.Schema({
    externalId: { type: Number, required: true },
    name: { type: String, required: true },
    phoneNumber: { type: [], required: true },
    iconCode: { type: String, required: false },
    colorCode: { type: String, required: false },
    order: { type: Number, required: true }
}, { timestamps: true });
shema.plugin(mongoose_delete_1.default, { deletedAt: true, overrideMethods: 'all', indexFields: ['deletedAt'] });
const InsuranceModel = (0, mongoose_1.model)('Insurance', shema);
exports.InsuranceModel = InsuranceModel;
