import { Schema, model } from 'mongoose';

// create an interface representing a document in MongoDB
interface ExternalPolicyClient {
    IdClient : String;
    externalIdClient : Number;//cliente dueño de la poliza-> se puede ver las polizas de este cliente con su externalId
    externalIdPolicy : String;//poliza a la que se estara editando su alias
    alias : String;//alias q vera reflejado el cliente que no es dueño de la poliza
    policyType: String;
    
}

const shema = new Schema<ExternalPolicyClient>({
    IdClient: { type: String, required: true },
    externalIdClient: { type: Number, required: false },
    externalIdPolicy: { type: String, required: false },
    alias: { type: String, required: false },
    policyType: { type: String, required: false }
});

const ExternalPolicyClinetModel = model<ExternalPolicyClient>('ExternalPolicyClient', shema);

export { ExternalPolicyClinetModel };