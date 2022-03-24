"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsuranceModel = void 0;
const mongoose_1 = require("mongoose");
const shema = new mongoose_1.Schema({
    externalId: { type: Number, required: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    iconCode: { type: String, required: true },
    colorCode: { type: String, required: true },
    instructions: { type: [], required: true },
});
const InsuranceModel = (0, mongoose_1.model)('Insurance', shema);
exports.InsuranceModel = InsuranceModel;
