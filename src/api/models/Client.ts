import { Schema, model, connect } from 'mongoose';

// create an interface representing a document in MongoDB

interface Clients {
    firstName   :    String; 
    middleName  :    String;
    lastName    :    String;
    phoneNumber :    String;
    birthday    :    String;
    externalId  :    Number;
}

const shema = new Schema<Clients>({
    firstName       :       {type:String, required:true},
    middleName      :       {type:String, required:true},
    lastName        :       {type:String, required:true},
    phoneNumber     :       {type:String, required:true},
    birthday        :       {type:String, required:true},
    externalId      :       {type:Number, required:false},
})

const ClientsModel = model<Clients>('Clients',shema);

export { ClientsModel };