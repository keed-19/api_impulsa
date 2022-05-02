import moongose from 'mongoose';

/** Database connection string on file .env */
const conection = process.env.DB_URI || '';

/** Starting database */
moongose.connect(conection)
    /** if database is connecting */
    .then( () => console.log('Successfully connected to mongodb') )
    /** if database is not connect */
    .catch( err => console.error('Could not connect to mongodb', err) );

export {conection}