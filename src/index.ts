import 'dotenv/config';
import express from 'express';
import cors from 'cors';

/** Import Routes */
import UserRoute from './api/routes/UserRoute';
import './config/database';

/** Initializations of node_cron */
import node_cron from 'node-cron';
import UserController from './api/controllers/UserController';

node_cron.schedule('0 6 * * *', function() {
  UserController.SendNotificationPushClient();
}, {
  scheduled: true,
  timezone: "America/Mexico_City"
});

/** Initializations */

const options: cors.CorsOptions = {
  origin: '*'
};

const app = express();
app.use(cors(options));

/** Settings */
app.set('port', process.env.PORT);

/** Middlewares */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/** Routes */
app.use('/api', UserRoute);

/** Starting Server */
app.listen(app.get('port'), () => {
  console.log(`Server listening on port ${app.get('port')}`);
});
