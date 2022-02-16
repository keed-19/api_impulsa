"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
/** Import Routes */
const UserRoute_1 = __importDefault(require("./api/routes/UserRoute"));
/** Initializations */
const app = (0, express_1.default)();
require("./config/database");
/** Settings */
app.set('port', process.env.PORT);
/** Middlewares */
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
/** Routes */
app.use('/api', UserRoute_1.default);
/** Starting Server */
app.listen(app.get('port'), () => {
    console.log(`Server listening on port ${app.get('port')}`);
});