import { Schema, model } from 'mongoose';
// eslint-disable-next-line camelcase
import mongoose_delete from 'mongoose-delete';

// create an interface representing a document in MongoDB

interface InsurancePolicies {
    insuranceId: string; // externalId de la aseguradora
    policyNumber : String; // Numero de poliza
    policyType : String; // Tipo de poliza
    alias : String;
    effectiveDate : Date; // Fecha de inicio de vigencia
    expirationDate : Date; // Fecha fin de vigencia
    status : String; // Estatus
    fileUrl : Object; // Ruta del PDF
    file: Buffer;
    contentType: String;
    externalId : String; // Id del usuario al que pertenece la poliza
    externalIdClient : String; // Id del usuario al que pertenece la poliza
    updatedAt: Date;
}

const shema = new Schema<InsurancePolicies>({
  insuranceId: { type: String, required: true },
  policyNumber: { type: String, unique: true, required: true },
  policyType: { type: String, required: true },
  alias: { type: String, required: true },
  effectiveDate: { type: Date, required: true },
  expirationDate: { type: Date, required: true },
  status: { type: String, required: true },
  fileUrl: { type: Object, required: true },
  externalId: { type: String, required: true },
  externalIdClient: { type: String, required: true },
  updatedAt: { type: Date, required: false }
},
{ timestamps: true });

shema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all', indexFields: ['deletedAt'] });

const InsurancePoliciesModel = model<InsurancePolicies>('InsurancePolicies', shema);

export { InsurancePoliciesModel };
