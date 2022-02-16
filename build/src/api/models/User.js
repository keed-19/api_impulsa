"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModel = void 0;
const mongoose_1 = require("mongoose");
const shema = new mongoose_1.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    clientId: { type: String, required: true }
});
const UsersModel = (0, mongoose_1.model)('Users', shema);
exports.UsersModel = UsersModel;
