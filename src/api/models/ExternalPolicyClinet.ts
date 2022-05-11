import { Schema, model } from 'mongoose';
// eslint-disable-next-line camelcase
import mongoose_delete from 'mongoose-delete';

// create an interface representing a document in MongoDB
interface ExternalPolicyClient {
    IdClient : String;
    externalIdClient : String;// cliente dueño de la poliza-> se puede ver las polizas de este cliente con su externalId
    externalIdPolicy : String;// poliza a la que se estara editando su alias
    alias : String;// alias q vera reflejado el cliente que no es dueño de la poliza
    policyType: String;
    status: String;
}

const shema = new Schema<ExternalPolicyClient>({
  IdClient: { type: String, required: true },
  externalIdClient: { type: String, required: false },
  externalIdPolicy: { type: String, required: false },
  alias: { type: String, required: false },
  policyType: { type: String, required: false },
  status: { type: String, required: false }
},
{ timestamps: true });

shema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all', indexFields: ['deletedAt'] });

const ExternalPolicyClinetModel = model<ExternalPolicyClient>('ExternalPolicyClient', shema);

export { ExternalPolicyClinetModel };
