import { Schema, model, connect } from 'mongoose';

// create an interface representing a document in MongoDB

interface RegisterRequest {
    firstName       :       String,
    middleName      :       String,
    lastName        :       String,
    phoneNumber     :       Number,
    birthday        :       Date,
    email           :       String,
    password        :       String,
    tokenTotp       :       String;
}

const shema = new Schema<RegisterRequest>({
    firstName       :       {type:String, required:true},
    middleName      :       {type:String, required:true},
    lastName        :       {type:String, required:true},
    phoneNumber     :       {type:Number, required:true},
    birthday        :       {type:Date, required:true},
    email           :       {type:String, required:true},
    password        :       {type:String, required:true},
    tokenTotp       :       {type:String, required:true},
})

const RegisterRequestModel = model<RegisterRequest>('RegisterRequest',shema);

export { RegisterRequestModel };