import moongose from 'mongoose';

const conection: string = process.env.DB_URI as string;

moongose.connect(conection)
    .then( () => console.log('Successfully connected to mongodb') )
    
    .catch( err => console.error('Could not connect to mongodb', err) );