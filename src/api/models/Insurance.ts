import { Schema, model } from 'mongoose';
// eslint-disable-next-line camelcase
import mongoose_delete from 'mongoose-delete';

// create an interface representing a document in MongoDB
interface Insurance {
    externalId : Number;
    name : String;
    phoneNumber : Array<[]>;
    iconCode : String;
    colorCode : String;
    order : Number;
}

const shema = new Schema<Insurance>({
  externalId: { type: Number, required: true },
  name: { type: String, required: true },
  phoneNumber: { type: [], required: true },
  iconCode: { type: String, required: false },
  colorCode: { type: String, required: false },
  order: { type: Number, required: true }
},
{ timestamps: true });

shema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all', indexFields: ['deletedAt'] });

const InsuranceModel = model<Insurance>('Insurance', shema);

export { InsuranceModel };
