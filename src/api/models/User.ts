import { Schema, model } from 'mongoose';
import mongoose_delete from 'mongoose-delete';

// create an interface representing a document in MongoDB
interface Users {
    username : String; // es el número de telefono del registro
    password : String;
    email : String;
    clientId : String;
}

const shema = new Schema<Users>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  clientId: { type: String, required: true }
},
{timestamps: true});

shema.plugin(mongoose_delete, { deletedAt : true, overrideMethods: 'all', indexFields: ['deletedAt'] });

const UsersModel = model<Users>('Users', shema);

export { UsersModel };
