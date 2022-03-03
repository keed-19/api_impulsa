"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsModel = void 0;
const mongoose_1 = require("mongoose");
const shema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    middleName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    birthday: { type: Date, required: true },
    externalId: { type: Number, required: false },
    verificationCode: { type: Number, required: false }
});
const ClientsModel = (0, mongoose_1.model)('Clients', shema);
exports.ClientsModel = ClientsModel;
