"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModel = void 0;
const mongoose_1 = require("mongoose");
const mongoose_delete_1 = __importDefault(require("mongoose-delete"));
const shema = new mongoose_1.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    clientId: { type: String, required: true }
}, { timestamps: true });
shema.plugin(mongoose_delete_1.default, { deletedAt: true, overrideMethods: 'all', indexFields: ['deletedAt'] });
const UsersModel = (0, mongoose_1.model)('Users', shema);
exports.UsersModel = UsersModel;
