"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRequestModel = void 0;
const mongoose_1 = require("mongoose");
const shema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    middleName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    birthday: { type: Date, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    tokenTotp: { type: String, required: true }
});
const RegisterRequestModel = (0, mongoose_1.model)('RegisterRequest', shema);
exports.RegisterRequestModel = RegisterRequestModel;
