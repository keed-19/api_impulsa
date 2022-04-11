import { Schema, model } from 'mongoose';
import mongoose_delete from 'mongoose-delete';

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
  iconCode: { type: String, required: false },
  colorCode: { type: String, required: false },
  instructions: { type: [], required: false },
},
{timestamps: true});

shema.plugin(mongoose_delete, { deletedAt : true, overrideMethods: 'all', indexFields: ['deletedAt'] });

const InsuranceModel = model<Insurance>('Insurance', shema);

export { InsuranceModel };
