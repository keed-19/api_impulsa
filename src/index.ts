
import express from 'express';

/** Import Routes */
import UserRoute from './api/routes/UserRoute';

/** Initializations */
const app = express();
import './config/database';

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