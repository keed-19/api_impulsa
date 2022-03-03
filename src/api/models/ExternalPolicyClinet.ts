import { Schema, model } from 'mongoose';

// create an interface representing a document in MongoDB
interface ExternalPolicyClinet {
    IdClient : String;
    externalIdClient : Number;//cliente dueño de la poliza-> se puede ver las polizas de este cliente con su externalId
    externalIdPolicy : Number;//poliza a la que se estara editando su alias
    alias : String;//alias q vera reflejado el cliente que no es dueño de la poliza
    
}

const shema = new Schema<ExternalPolicyClinet>({
    IdClient: { type: String, required: true },
    externalIdClient: { type: Number, required: true },
    externalIdPolicy: { type: Number, required: false },
    alias: { type: String, required: false }
});

const ExternalPolicyClinetModel = model<ExternalPolicyClinet>('ExternalPolicyClinet', shema);

export { ExternalPolicyClinetModel };