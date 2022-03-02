/** Imports models and pluggins */
import { Request, Response } from 'express';
import { InsurancePoliciesModel } from '../models/InsurancePolicy';
import fs from 'fs';
import { ClientsModel } from '../models/Client';

/** My class of Impulsa controller */
class ImpulsaController {
    // ver pdf de un cliente
    public ViewPolicies = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');

      const externalId = _req.params.externalId;

      const isPoliceExist = await InsurancePoliciesModel.find({ externalId: externalId });

      if (!isPoliceExist) {
        res.json({
          message: 'No hay polizas para este cliente',
          status: 400
        });
      } else if (isPoliceExist) {
        // const url = isUserExist;
        const validator = isObjEmpty(isPoliceExist as object);

        if (validator === true) {
          return res.status(400).json({
            message: 'Aún no tiene Polizas',
            status: 400
          });
        }
        res.status(200).json({
          isPoliceExist,
          status: 200
        });
      } else {
        res.json({
          mensaje: 'ocurrio un error'
        });
      }
    }

    // visualizar pdf
    public ViewPDF = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');

      const name = _req.params.name as String;

      try {
        const data = fs.readFileSync('src/uploads/' + name);

        res.setHeader('Content-Type', 'application/pdf');
        // res.contentType("application/pdf");
        res.send(data);
      } catch (error) {
        res.status(400).send({
          message: 'No se ecuentra la póliza' + error,
          status: 400
        });
      }
    }

    // guardar poliza
    public SavePolice = async (_req: Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');
      const file = _req.file;

      if (!file) {
        const error = new Error('Please upload a file');
        return error;
      } else if (file.mimetype === 'application/pdf') {
        /** search Number phone in the data base */
        const isUserExist = await ClientsModel.findOne({ externalId: _req.params.externalId });

        if (isUserExist) {
          // creando el alias del modelo

          const tipe = _req.body.policyType;
          const number = _req.body.policyNumber;

          const extraida = tipe.substring(0, 3);

          const alias = `${extraida}-${number}`;
          // instantiating the model for save data
          const user = new InsurancePoliciesModel({
            insurerName: _req.body.insurerName,
            policyNumber: number,
            policyType: tipe,
            alias: alias,
            effectiveDate: _req.body.effectiveDate,
            expirationDate: _req.body.expirationDate,
            status: _req.body.status,
            fileUrl: file.filename,
            externalId: _req.body.externalId
          });

          try {
            // save data
            await user.save();

            // send request exit
            res.status(200).json({
              message: 'Poliza registrada',
              UserPolicy: [
                            `InsurerName : ${user.insurerName}`,
                            `PolicyNumber : ${user.policyNumber}`,
                            `PolicyType : ${user.policyType}`,
                            `EffectiveDate : ${user.effectiveDate}`,
                            `ExpirationDate : ${user.expirationDate}`,
                            `Status : ${user.status}`,
                            `FileName : ${user.fileUrl}`
              ]
            });
          } catch (error) {
            res.status(404).json({
              error,
              status: 404
            });
          }
        } else {
          fs.unlinkSync(`${_req.file?.path}`);
          res.status(400).json({
            message: 'Usuario no encontrado',
            status: 400
          });
        }
      } else {
        fs.unlinkSync(`${_req.file?.path}`);
        res.status(400).json({
          message: 'no es un archivo pdf',
          status: 400
        });
      }
    }

    // vizualisar clientes
    public ViewClients = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');

      // var phone = _req.params.phoneNumber;

      const isClientExist = await ClientsModel.find({});

      if (!isClientExist) {
        res.json({
          message: 'No hay clientes registrados'
        });
      } else if (isClientExist) {
        res.status(200).json(isClientExist);
      } else {
        res.json({
          mensaje: 'ocurrio un error'
        });
      }
    }

    // visaualizar cliente por telefono
    public ViewClient = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');

      const externalId = _req.params.externalId;

      const isClientExist = await ClientsModel.findOne({ externalId: externalId });

      if (!isClientExist) {
        res.status(400).json({
          message: 'No existe el cliente',
          status: 400
        });
      } else if (isClientExist) {
        res.status(200).json({
          isClientExist,
          status: 200
        });
      } else {
        res.status(404).json({
          mensaje: 'ocurrio un error',
          status: 404
        });
      }
    }

    // guardar cliente
    public SaveClient = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');
      // TODOs:: falta validar los imputs que son necesarios como el external id

      const isTelefonoExist = await ClientsModel.findOne({ phoneNumber: _req.body.phoneNumber });

      if (isTelefonoExist) {
        return res.status(208).json({
          error: 'El numero telefonico ya se encuentra registrado en la base de datos',
          status: 208
        });
      } else {
        // instantiating the model for save data
        const client = new ClientsModel({
          firstName: _req.body.firstName,
          middleName: _req.body.middleName,
          lastName: _req.body.lastName,
          birthday: _req.body.birthday,
          phoneNumber: _req.body.phoneNumber,
          externalId: _req.body.externalId
        });

        try {
          // save data
          await client.save();

          // send request exit
          res.status(200).json({
            message: 'cliente registrado',
            Client: client,
            status: 200
          });
        } catch (error) {
          res.status(404).json({
            error,
            status: 404
          });
        }
      }
    }

    // eliminar cliente
    public DeleteClient = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');
      const externalId = _req.params.externalId;

      const isTelefonoExist = await ClientsModel.findOne({ externalId: externalId });

      if (!isTelefonoExist) {
        return res.status(400).json({
          message: 'El cliente no se encuentra en la base de datos',
          status: 400
        });
      } else {
        isTelefonoExist.remove();
        res.status(200).json({
          message: 'El cliente se elimino correctamente',
          status: 200
        });
      }
    }

    // eliminar poliza
    public DeletePolice = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');
      const policyNumber = _req.params.policyNumber;

      const isPolicyExist = await InsurancePoliciesModel.findOne({ policyNumber: policyNumber });

      if (!isPolicyExist) {
        return res.status(400).json({
          message: 'El numero de poliza no se encuentra en la base de datos',
          status: 400
        });
      } else {
        await fs.unlinkSync('src/uploads/' + isPolicyExist.fileUrl);
        await isPolicyExist.remove();
        res.status(200).json({
          message: 'La poliza se elimino correctamente',
          status: 200
        });
      }
    }

    // actualizar cliente
    public UpdateClient = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');
      const _id = _req.params.externalId;
      const update = _req.body;

      const mostrar = await ClientsModel.findOne({ externalId: _id });

      if (mostrar) {
        const idclient = mostrar._id;

        await ClientsModel.findByIdAndUpdate(idclient, update);

        try {
          const Updatedclient = await ClientsModel.findOne({ _id: idclient });
          res.status(200).json({
            message: 'Cliente actualizado',
            Updatedclient,
            status: 200
          });
        } catch (error) {
          return res.status(400).json({
            message: 'Error al actualizar el usuario',
            status: 400,
            error
          });
        }
      } else {
        return res.status(400).json({
          message: 'No se encontro el usuario el usuario',
          status: 400
        });
      }
    }

    // actualizar poliza
    public UpdatePoliza = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');
      const file = _req.file;
      const _id = _req.params.policeId as Object;
      const update = _req.body;

      const data = {
        fileUrl: file?.filename
      };

      if (!file) {
        const error = new Error('Se necesita el archivo para realizar la actualización');
        return error;
      } else if (file.mimetype === 'application/pdf') {
        /** search Number phone in the data base */
        await InsurancePoliciesModel.findByIdAndUpdate(_id, data);
        await InsurancePoliciesModel.findByIdAndUpdate(_id, update);
        const updatePoliceNow = await InsurancePoliciesModel.findById(_id);

        try {
          res.status(200).send({ message: 'poliza actualizada', updatePoliceNow });
        } catch (error) {
          fs.unlinkSync(`${_req.file?.path}`);
          return res.status(400).send({
            message: `Error al actualizar l apoliza: ${error}`,
            status: 400
          });
        }
      } else {
        fs.unlinkSync(`${_req.file?.path}`);
        res.status(400).json({
          message: 'No se cargo ningún archivo o no es un PDF',
          status: 400
        });
      }
    }
}

function isObjEmpty (obj:Object) {
  for (const prop in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(prop)) return false;
  }

  return true;
}

export default new ImpulsaController();
