"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPushModel = void 0;
const mongoose_1 = require("mongoose");
// eslint-disable-next-line camelcase
const mongoose_delete_1 = __importDefault(require("mongoose-delete"));
const shema = new mongoose_1.Schema({
    type: { type: String, required: true },
    title: { type: String, required: true },
    notification: { type: String, required: true },
    externalIdClient: { type: Number, required: true }
}, { timestamps: true });
shema.plugin(mongoose_delete_1.default, { deletedAt: true, overrideMethods: 'all', indexFields: ['deletedAt'] });
const NotificationPushModel = (0, mongoose_1.model)('NotificationPush', shema);
exports.NotificationPushModel = NotificationPushModel;
