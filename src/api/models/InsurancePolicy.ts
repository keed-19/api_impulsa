import { Schema, model } from 'mongoose';

// create an interface representing a document in MongoDB

interface InsurancePolicies {
    insuranceId: string; // externalId de la aseguradora
    policyNumber : Number; // Numero de poliza
    policyType : String; // Tipo de poliza
    alias : String;
    effectiveDate : Date; // Fecha de inicio de vigencia
    expirationDate : Date; // Fecha fin de vigencia
    status : String; // Estatus
    fileUrl : Object; // Ruta del PDF
    externalId : String; // Id del usuario al que pertenece la poliza
    externalIdClient : String; // Id del usuario al que pertenece la poliza
}

const shema = new Schema<InsurancePolicies>({
  insuranceId: { type: String, required: true },
  policyNumber: { type: Number, unique: true, required: true },
  policyType: { type: String, required: true },
  alias: { type: String, required: true },
  effectiveDate: { type: Date, required: true },
  expirationDate: { type: Date, required: true },
  status: { type: String, required: true },
  fileUrl: { type: Object, required: true },
  externalId: { type: String, required: true },
  externalIdClient: { type: String, required: true }
});

const InsurancePoliciesModel = model<InsurancePolicies>('InsurancePolicies', shema);

export { InsurancePoliciesModel };
