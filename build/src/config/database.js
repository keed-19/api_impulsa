"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const conection = process.env.DB_URI;
mongoose_1.default.connect(conection)
    .then(() => console.log('Successfully connected to mongodb'))
    .catch(err => console.error('Could not connect to mongodb', err));
