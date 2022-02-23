"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
/** Database connection string on file .env */
const conection = process.env.DB_URI;
/** Starting database */
mongoose_1.default.connect(conection)
    /** if database is connecting */
    .then(() => console.log('Successfully connected to mongodb'))
    /** if database is not connect */
    .catch(err => console.error('Could not connect to mongodb', err));
