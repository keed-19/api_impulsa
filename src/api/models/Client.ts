import { Schema, model } from 'mongoose';

// create an interface representing a document in MongoDB
interface Clients {
    fullName : String;
    phoneNumber : String;
    incorporationOrBirthDate : Date;
    externalId : Number;
    verificationCode : Number;// token de verificacion para las polizas externas
}

const shema = new Schema<Clients>({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  incorporationOrBirthDate: { type: Date, required: true },
  externalId: { type: Number, required: false },
  verificationCode: { type: Number, required: false }
});

const ClientsModel = model<Clients>('Clients', shema);

export { ClientsModel };
