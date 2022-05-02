"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
/** Import Routes */
const UserRoute_1 = __importDefault(require("./api/routes/UserRoute"));
require("./config/database");
/** Initializations of node_cron */
const node_cron_1 = __importDefault(require("node-cron"));
const UserController_1 = __importDefault(require("./api/controllers/UserController"));
node_cron_1.default.schedule('0 6 * * *', function () {
    UserController_1.default.SendNotificationPushClient();
}, {
    scheduled: true,
    timezone: "America/Mexico_City"
});
/** Initializations */
const options = {
    origin: '*'
};
const app = (0, express_1.default)();
app.use((0, cors_1.default)(options));
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
