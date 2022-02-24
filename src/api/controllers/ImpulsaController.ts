/** Imports models and pluggins */
import { Request, Response } from 'express';
import { UsersModel } from '../models/User';
import { InsurancePoliciesModel } from '../models/InsurancePolicy';
import fs from 'fs';
import { ClientsModel } from '../models/Client';

/** My class of user controller */
class ImpulsaController {

    //probando la subida de archivos pdf
    public Savefiles = async(_req: Request, res : Response)=>{

        res.set('Access-Control-Allow-Origin', '*');
        // let file = _req.files;
        // var file:Array<any> = _req.files as any

        // var urlFile:Array<any>=[] 

        // console.log(urlFile)

        // file.forEach(item=>{ 
        // urlFile.push(
        // {
        //     "url":item.path,
        // });
        // });

        // console.log(urlFile)
        var file = _req.file;
        

        if (!file) {
            const error = new Error('Please upload a file');
            return error;
        }else if(file.mimetype === 'application/pdf'){
            /** search Number phone in the data base */
            const isUserExist = await UsersModel.findOne({ username: _req.params.phoneNumber });

            if (isUserExist) {
                //instantiating the model for save data
                const user = new InsurancePoliciesModel({
                    insurerName: _req.body.insurerName,
                    policyNumber: _req.body.policyNumber,
                    policyType: _req.body.policyType,
                    effectiveDate: Date.now(),
                    expirationDate: Date.now(),
                    status: _req.body.status,
                    fileUrl: file.path,
                    clientId:isUserExist.clientId
                });

                try {

                    //save data
                    const savedUser = await user.save();

                    //send request exit
                    res.status(200).json({
                        message: 'Poliza registrada',
                        file
                    });
                } catch (error) {
                    res.status(404).json({
                        error,
                        status: 404
                    });
                }
            }else{
                fs.unlinkSync(`${_req.file?.path}`);
                res.status(400).json({
                    message: 'Usuario no encontrado',
                    status: 400,
                });
            }
        }else{
            fs.unlinkSync(`${_req.file?.path}`);
            res.status(400).json({
                message: 'no es un archivo pdf',
                status: 400,
            });
        }
    }

    //ver pdf de un cliente

    public ViewFile = async(_req : Request, res : Response)=>{
        res.set('Access-Control-Allow-Origin', '*');

        var _clientId = _req.params.id;

        const isUserExist = await InsurancePoliciesModel.find({clientId: _clientId});

        if(!isUserExist){
            res.json({
                message : 'No estas asociado a ninguna poliza aún'
            })
        }else if(isUserExist){
            // const url = isUserExist;
            const validator = isObjEmpty(isUserExist as object);

            if(validator===true){
                return res.status(400).json({
                    message : 'Aún no tiene Polizas'
                })
            }
            res.status(200).json({
                isUserExist
            })
        }else{
            res.json({
                mensaje : 'ocurrio un error'
            })
        }
    }

    //visualizar pdf
    public ViewPDF = async(_req : Request, res : Response)=>{
        res.set('Access-Control-Allow-Origin', '*');

        var name = _req.params.name;
        var file = fs.createReadStream(`${name}`);
        var stat = fs.statSync(`${name}`);
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
        file.pipe(res);
    }

    //guardar cliente
    public SaveClient = async(_req : Request, res : Response)=>{
        res.set('Access-Control-Allow-Origin', '*');
        //TODOs:: falta validar los imputs que son necesarios como el external id

        const isTelefonoExist = await ClientsModel.findOne({ phoneNumber: _req.body.phoneNumber });

        if (isTelefonoExist) {
            return res.status(208).json({
                    error: 'El numero telefonico ya se encuentra registrado en la base de datos',
                    status: 208
                });
        }else{

            //instantiating the model for save data
            const client = new ClientsModel({
                firstName: _req.body.firstName,
                middleName: _req.body.middleName,
                lastName: _req.body.lastName,
                birthday: _req.body.birthday,
                phoneNumber: _req.body.phoneNumber,
                externalId: _req.body.externalId,
            });

            try {

                //save data
                await client.save();

                //send request exit
                res.status(200).json({
                    message: 'cliente registrado',
                    status: 200,
                });
            } catch (error) {
                res.status(404).json({
                    error,
                    status: 404
                });
            }
        }
    }

    //eliminar cliente
    public DeleteClient = async(_req : Request, res : Response)=>{
        res.set('Access-Control-Allow-Origin', '*');
        let phoneNumber  =   _req.params.phoneNumber;

        const isTelefonoExist = await ClientsModel.findOne({ phoneNumber: phoneNumber });

        if(!isTelefonoExist){
            return res.status(500).json({ message: 'El cliente no se encuentra en la base de datos' });
        }else{
            isTelefonoExist.remove();
            res.status(200).json({ message: 'El cliente se elimino correctamente' });
        }
    }

    //actualizar cliente
    public UpdateClient = async(_req : Request, res : Response)=>{
        res.set('Access-Control-Allow-Origin', '*');
        let phoneNumber  =   _req.params.phoneNumber;

        const isTelefonoExist = await ClientsModel.findOne({ phoneNumber: phoneNumber });

        if(!isTelefonoExist){
            return res.status(500).json({ message: 'El cliente no se encuentra en la base de datos' });
        }else{
            isTelefonoExist.remove();
            res.status(200).json({ message: 'El cliente se elimino correctamente' });
        }
    }
}

function isObjEmpty(obj:Object) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) return false;
    }
  
    return true;
  }

export default new ImpulsaController();