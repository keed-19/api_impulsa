/** Imports models and pluggins */
import { Request, Response } from 'express';
import { UsersModel } from '../models/User';
import { InsurancePoliciesModel } from '../models/InsurancePolicy';
import fs from 'fs';

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
        var _clientId = _req.params.id;

        const isUserExist = await InsurancePoliciesModel.find({clientId: _clientId});

        if(!isUserExist){
            res.json({
                message : 'Aún no tiene Polizas',
                isUserExist
            })
        }else if(isUserExist){
            // const url = isUserExist;
            res.status(200).json({
                isUserExist
            })
        }else{
            res.json({
                mensaje : 'ocurrio un error'
            })
        }
    }

}

export default new ImpulsaController();