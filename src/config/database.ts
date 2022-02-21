import moongose from 'mongoose';

/** Database connection string on file .env */
const conection: string = process.env.DB_URI as string;

/** Starting database */
moongose.connect(conection)
    /** if database is connecting */
    .then( () => console.log('Successfully connected to mongodb') )
    /** if database is not connect */
    .catch( err => console.error('Could not connect to mongodb', err) );