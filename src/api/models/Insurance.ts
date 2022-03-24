import { Schema, model } from 'mongoose';

// create an interface representing a document in MongoDB
interface Insurance {
    externalId : Number;
    name : String;
    phoneNumber : String;
    iconCode : String;
    colorCode : String;
    instructions : Array<[]>;
}

const shema = new Schema<Insurance>({
  externalId: { type: Number, required: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  iconCode: { type: String, required: true },
  colorCode: { type: String, required: true },
  instructions: { type: [], required: true },
});

const InsuranceModel = model<Insurance>('Insurance', shema);

export { InsuranceModel };
