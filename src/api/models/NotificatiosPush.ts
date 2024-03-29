import { Schema, model } from 'mongoose';
// eslint-disable-next-line camelcase
import mongoose_delete from 'mongoose-delete';

// create an interface representing a document in MongoDB
interface NotificationPush {
    type : String;
    title : String;
    notification : String;
    externalIdClient : String;// token de verificacion para las polizas externas
}

const shema = new Schema<NotificationPush>({
  type: { type: String, required: true },
  title: { type: String, required: true },
  notification: { type: String, required: true },
  externalIdClient: { type: Number, required: true }
},
{ timestamps: true });

shema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all', indexFields: ['deletedAt'] });

const NotificationPushModel = model<NotificationPush>('NotificationPush', shema);

export { NotificationPushModel };
