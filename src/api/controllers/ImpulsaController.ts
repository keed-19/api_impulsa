/** Imports models and pluggins */
import { Request, Response } from 'express';
import { InsurancePoliciesModel } from '../models/InsurancePolicy';
import { InsuranceModel } from '../models/Insurance';
import fs from 'fs';
import { ClientsModel } from '../models/Client';
import { UsersModel } from '../models/User';
import axios from 'axios';
import { NotificationPushModel } from '../models/NotificatiosPush';
import { now } from 'mongoose';
import { Status } from '../constants/const';
import { ExternalPolicyClinetModel } from '../models/ExternalPolicyClinet';
import { conection } from '../../config/database';
import { GridFSBucket, MongoClient } from 'mongodb';

// import { GridFsStorage } from 'multer-gridfs-storage';
const mongoClient = new MongoClient(conection);

/** My class of Impulsa controller */
class ImpulsaController {
    // ver pdf de un cliente
    public ViewPolicies = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');

      const externalId = _req.params.externalId;
      try {
        const isPoliceExist = await InsurancePoliciesModel.find({ externalIdClient: externalId });

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
      } catch (error) {
        res.status(400).json({
          message: 'Ocurrio un error: ' + error,
          status: 400
        });
      }
    }

    // TODOs: falta validar que siga todo correcto desde el front
    public ViewPDF = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');

      const externalId = _req.params.externalId;
      try {
        const isPolicyExist = await InsurancePoliciesModel.findOne({ externalId: externalId });
        if (isPolicyExist) {
          const name = isPolicyExist?.fileUrl;

          try {
            // const database:any = conection;
            // console.log(name as string);

            await mongoClient.connect();
            const database = mongoClient.db();
            const bucket = new GridFSBucket(database, {
              bucketName: 'insurancePolicies'
            });
            const downloadStream = bucket.openDownloadStreamByName(name as string);
            downloadStream.on('data', function (data) {
              // res.setHeader('Content-Type', 'application/pdf');
              return res.status(200).write(data);
            });
            downloadStream.on('error', function (err) {
              return res.status(404).send({ message: 'No se puede obtener la póliza!' + err });
            });
            downloadStream.on('end', () => {
              return res.end();
            });
          } catch (error) {
            return res.status(400).send({
              message: 'Ocurrio un error inesperado: ' + error
            });
          }
        } else {
          return res.status(400).send({
            message: 'No se ecuentra la póliza'
          });
        }
      } catch (error) {
        res.status(400).json({
          message: 'Ocurrio un error: ' + error,
          status: 400
        });
      }
    }

    public ViewPolicyDetail = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');

      const externalId = _req.params.externalId;
      try {
        const isPolicyExist = await InsurancePoliciesModel.findOne({ externalId: externalId }, { _id: 0, __v: 0 });
        if (isPolicyExist) {
          res.status(200).json({
            data: isPolicyExist,
            status: 200
          });
        } else {
          res.status(400).json({
            message: 'No se encuentra la póliza',
            status: 200
          });
        }
      } catch (error) {
        res.status(400).json({
          message: 'Ocurrio un error: ' + error,
          status: 400
        });
      }
    }

    public SavePolice = async (_req: Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');
      const file = _req.file;
      // var oMyBlob = new Blob(file as undefined, {type : 'application/pdf'});
      console.log(file);
      const status = _req.body.status;
      const numUse = Status[status];
      try {
        if (!file) {
          const error = new Error('Please upload a file');
          res.status(400).json({
            message: 'Se nececesita el archivo PDF: ' + error,
            status: 400
          });
        } else if (numUse === undefined) {
          res.status(400).json({
            message: 'El status es invalido',
            status: 400
          });
        } else if (file.mimetype === 'application/pdf') {
          /** search Number phone in the data base */
          const isUserExist = await ClientsModel.findOne({ externalId: _req.params.externalIdClient });

          if (isUserExist) {
            const isPolicyExist = await InsurancePoliciesModel.findOne({ externalId: _req.body.externalId });

            if (isPolicyExist) {
              return res.status(400).json({
                error: 'El externalId ya se encuentra registrado en la base de datos',
                status: 400
              });
            } else {
              const isNumberPolicyExist = await InsurancePoliciesModel.findOne({ policyNumber: _req.body.policyNumber });

              if (isNumberPolicyExist) {
                res.status(400).json({
                  message: 'El número de la poliza debe ser único',
                  status: 400
                });
              } else {
                // creando el alias del modelo

                const tipe = _req.body.policyType.toUpperCase();
                const number = _req.body.policyNumber;

                // asignando la aseguradora a la poliza
                const insuranceId = _req.body.insuranceId;

                const isInsuranceExist = await InsuranceModel.findOne({ externalId: insuranceId });

                if (isInsuranceExist) {
                  try {
                    const aseguradora = isInsuranceExist?.name;
                    // construyendo el alias momentario
                    const alias = `${aseguradora}-${tipe}-${number}`;
                    // instantiating the model for save data
                    const user = new InsurancePoliciesModel({
                      insuranceId: insuranceId,
                      policyNumber: number,
                      policyType: tipe,
                      alias: alias,
                      effectiveDate: _req.body.effectiveDate,
                      expirationDate: _req.body.expirationDate,
                      status: numUse,
                      fileUrl: `${file.filename}`,
                      externalId: _req.body.externalId,
                      externalIdClient: _req.params.externalIdClient
                    });
                    // save data
                    await user.save();
                    await user.updateOne({});
                    // send request exit
                    res.status(200).json({
                      message: 'Poliza registrada',
                      UserPolicy: [
                                    `InsurerName : ${user.insuranceId}`,
                                    `PolicyNumber : ${user.policyNumber}`,
                                    `alias : ${user.alias}`,
                                    `PolicyType : ${user.policyType}`,
                                    `EffectiveDate : ${user.effectiveDate}`,
                                    `ExpirationDate : ${user.expirationDate}`,
                                    `Status : ${user.status}`,
                                    `FileName : ${user.fileUrl}`,
                                    `externalId : ${user.externalId}`
                      ]
                    });
                    // UploadFile().uploadFiles.single('file')
                  } catch (error) {
                    res.status(404).json({
                      error,
                      status: 404
                    });
                  }
                } else {
                  res.status(400).json({
                    message: 'No se encuentra la aseguradora',
                    status: 400
                  });
                }
              }
            }
          } else {
            // fs.unlinkSync(`${_req.file?.path}`);
            res.status(400).json({
              message: 'Cliente no encontrado',
              status: 400
            });
          }
        } else {
          const name = file.filename;
          let noPDF:Array<any> = [];

          await mongoClient.connect();
          const database = await mongoClient.db();
          const buscar = await database.collection('insurancePolicies.files').findOne({ filename: name });

          const binarios = await database.collection('insurancePolicies.chunks').find({ files_id: buscar?._id });
          await binarios.forEach(item => {
            noPDF.push(
              {
                _id: item._id
              }
            );
          });

          for (let x = 0; x < noPDF.length; x++) {
            const id = noPDF[x]._id;
            await database.collection('insurancePolicies.chunks').findOneAndDelete({ _id: id });
          }

          await database.collection('insurancePolicies.files').findOneAndDelete({ filename: name });
          noPDF = [];

          res.status(400).json({
            message: 'no es un archivo pdf: ',
            status: 400
          });
        }
      } catch (error) {
        res.status(400).json({
          message: 'Ocurrio un error: ' + error,
          status: 400
        });
      }
    }

    // vizualisar clientes
    public ViewClients = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');

      try {
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
      } catch (error) {
        res.status(400).json({
          message: 'Ocurrio un error: ' + error,
          status: 400
        });
      }
    }

    // visaualizar cliente por telefono
    public ViewClient = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');

      const externalId = _req.params.externalId;
      try {
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
      } catch (error) {
        res.status(400).json({
          message: 'Ocurrio un error: ' + error,
          status: 400
        });
      }
    }

    // guardar cliente
    public SaveClient = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');
      const removeAccents = (str: string) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      };

      const phoneNumber = _req.body.phoneNumber;
      const fullNameFI = _req.body.fullName;
      const fullNameCA = fullNameFI.toUpperCase();
      const fullName = removeAccents(fullNameCA);
      const phone = phoneNumber.replace(/\s+/g, '');
      try {
        if (_req.body.phoneNumber === null) {
          return res.status(208).json({
            error: 'El número telefónico es requerido',
            status: 208
          });
        } else if (_req.body.externalId === null) {
          return res.status(208).json({
            error: 'El exterlId es requerido',
            status: 208
          });
        } else {
          const isfullNameExist = await ClientsModel.findOne({ fullName: fullName });
          const isEzternalIDExist = await ClientsModel.findOne({ externalId: _req.body.externalId });

          if (isfullNameExist) {
            return res.status(208).json({
              error: 'El nombre del cliente ya se encuentra registrado en la base de datos',
              status: 208
            });
          } else if (isEzternalIDExist) {
            return res.status(208).json({
              error: 'El ExternalId ya se encuentra registrado en la base de datos y es un campo requerido',
              status: 208
            });
          } else {
            // instantiating the model for save data
            const client = new ClientsModel({
              fullName: fullName,
              incorporationOrBirthDate: _req.body.incorporationOrBirthDate,
              phoneNumber: phone,
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
      } catch (error) {
        res.status(400).json({
          message: 'Ocurrio un error: ' + error,
          status: 400
        });
      }
    }

    // eliminar cliente
    public DeleteClient = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');
      const externalId = _req.params.externalId;
      try {
        const isTelefonoExist = await ClientsModel.findOne({ externalId: externalId });

        if (!isTelefonoExist) {
          return res.status(400).json({
            message: 'El cliente no se encuentra en la base de datos',
            status: 400
          });
        } else {
          await isTelefonoExist.delete();
          const User = await UsersModel.findOne({ clientId: isTelefonoExist._id });
          await User?.delete();
          res.status(200).json({
            message: 'El cliente se elimino correctamente',
            status: 200
          });
        }
      } catch (error) {
        res.status(400).json({
          message: 'Ocurrio un error: ' + error,
          status: 400
        });
      }
    }

    // eliminar poliza
    public DeletePolice = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');
      const externalId = _req.params.externalId;
      try {
        const isPolicyExist = await InsurancePoliciesModel.findOne({ externalId: externalId });

        if (!isPolicyExist) {
          return res.status(400).json({
            message: 'La póliza no se encuentra en la base de datos',
            status: 400
          });
        } else {
          await fs.unlinkSync('src/uploads/' + isPolicyExist.fileUrl);
          await isPolicyExist.delete();
          res.status(200).json({
            message: 'La poliza se elimino correctamente',
            status: 200
          });
        }
      } catch (error) {
        res.status(400).json({
          message: 'Ocurrio un error: ' + error,
          status: 400
        });
      }
    }

    // actualizar cliente
    public UpdateClient = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');
      const _id = _req.params.externalId;
      const update = _req.body;
      try {
        if (_req.body.externalId != null) {
          res.status(400).json({
            message: 'El externalId no se puede editar',
            status: 400
          });
        } else {
          const mostrar = await ClientsModel.findOne({ externalId: _id });

          if (mostrar) {
            const idclient = mostrar._id;

            const isExistPhoneNumber = await ClientsModel.findOne({ phoneNumber: update.phoneNumber });

            if (isExistPhoneNumber) {
              res.status(400).json({
                message: 'El número de teléfono ya esta registrado en la base de datos',
                status: 400
              });
            } else {
              await ClientsModel.findByIdAndUpdate(idclient, update);

              const Updatedclient = await ClientsModel.findOne({ _id: idclient });
              res.status(200).json({
                message: 'Cliente actualizado',
                Updatedclient,
                status: 200
              });
            }
          } else {
            return res.status(400).json({
              message: 'No se encontró el cliente en la base de datos',
              status: 400
            });
          }
        }
      } catch (error) {
        res.status(400).json({
          message: 'Ocurrio un error: ' + error,
          status: 400
        });
      }
    }

    // actualizar poliza
    public UpdatePoliza = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');
      const file = _req.file;
      const externalId = _req.params.externalId;
      const update = _req.body;
      const status = _req.body.status;
      const numUse = Status[status];
      const UpdateStatus = { status: numUse };
      try {
        const data = {
          fileUrl: file?.filename
        };

        if (_req.body.externalId != null) {
          res.status(400).json({
            message: 'El externalId no se puede editar',
            status: 400
          });
        } else if (numUse === undefined) {
          res.status(400).json({
            message: 'El status es invalido',
            status: 400
          });
        } else {
          if (!file) {
            const isPolicyExist = await InsurancePoliciesModel.findOne({ externalId: externalId });

            if (isPolicyExist) {
              const _id = isPolicyExist._id;
              await InsurancePoliciesModel.findByIdAndUpdate(_id, update);
              if (status !== undefined) {
                await InsurancePoliciesModel.findByIdAndUpdate(_id, UpdateStatus);
                const idPolicy = JSON.stringify(_id);
                const idActualizar = idPolicy.slice(1, -1);
                const policyActualizar = await ExternalPolicyClinetModel.findOne({ externalIdPolicy: idActualizar });
                await ExternalPolicyClinetModel.findByIdAndUpdate(policyActualizar?._id, UpdateStatus);
              }
              try {
                // await InsurancePoliciesModel.findByIdAndUpdate(_id, data);
                const updatePoliceNow = await InsurancePoliciesModel.findById(_id);
                res.status(200).send({ message: 'poliza actualizada', updatePoliceNow });
              } catch (error) {
                fs.unlinkSync(`${_req.file?.path}`);
                return res.status(400).send({
                  message: `Error al actualizar la poliza: ${error}`,
                  status: 400
                });
              }
            } else {
              res.status(400).json({
                message: 'No se encuentra la póliza',
                status: 400
              });
            }
          } else if (file.mimetype === 'application/pdf' || status !== undefined) {
            const isPolicyExist = await InsurancePoliciesModel.findOne({ externalId: externalId });

            if (isPolicyExist) {
              const _id = isPolicyExist._id;
              await InsurancePoliciesModel.findByIdAndUpdate(_id, update);
              try {
                await InsurancePoliciesModel.findByIdAndUpdate(_id, data);
                if (status !== undefined) {
                  await InsurancePoliciesModel.findByIdAndUpdate(_id, UpdateStatus);
                  const idPolicy = JSON.stringify(_id);
                  const idActualizar = idPolicy.slice(1, -1);
                  const policyActualizar = await ExternalPolicyClinetModel.findOne({ externalIdPolicy: idActualizar });
                  await ExternalPolicyClinetModel.findByIdAndUpdate(policyActualizar?._id, UpdateStatus);
                }
                const updatePoliceNow = await InsurancePoliciesModel.findById(_id);
                res.status(200).send({ message: 'poliza actualizada', updatePoliceNow });
              } catch (error) {
                fs.unlinkSync(`${_req.file?.path}`);
                return res.status(400).send({
                  message: `Error al actualizar l apoliza: ${error}`,
                  status: 400
                });
              }
            } else {
              res.status(400).json({
                message: 'No se encuentra la póliza',
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
      } catch (error) {
        res.status(400).json({
          message: 'Ocurrio un error: ' + error,
          status: 400
        });
      }
    }

    /**
     * crud de aseguradoras
    */

    // guardar poliza
    public SaveInsurance = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');
      const phoneNumber = _req.body.phoneNumber;
      let valuesMax = 0;
      try {
        if (_req.body.phoneNumber === null) {
          return res.status(400).json({
            error: 'El número telefónico es requerido',
            status: 400
          });
        } else if (_req.body.externalId === null) {
          return res.status(400).json({
            error: 'El exterlId es requerido',
            status: 400
          });
        } else if (_req.body.name === null) {
          return res.status(400).json({
            error: 'El nombre es requerido',
            status: 400
          });
        } else {
          try {
            // const phone = phoneNumber.replace(/\s+/g, '');
            // const isTelefonoExist = await InsuranceModel.findOne({ phoneNumber: phone });
            const isExternalIDExist = await InsuranceModel.findOne({ externalId: _req.body.externalId });
            const valueOrderMax = await InsuranceModel.find().sort({ order: -1 }).limit(1);
            valueOrderMax.forEach(item => {
              valuesMax = item.order as number;
            });

            const name = _req.body.name.toUpperCase();

            if (isExternalIDExist) {
              return res.status(208).json({
                error: 'El ExternalId ya se encuentra registrado en la base de datos y es un campo requerido',
                status: 208
              });
            } else {
              // instantiating the model for save data
              const insurance = new InsuranceModel({
                externalId: _req.body.externalId,
                name: name,
                phoneNumber: phoneNumber,
                order: valuesMax + 1
              });

              try {
                // save data
                await insurance.save();

                // send request exit
                res.status(200).json({
                  message: 'Aseguradora registrada',
                  Insurance: insurance,
                  status: 200
                });
              } catch (error) {
                res.status(404).json({
                  error,
                  status: 404
                });
              }
            }
          } catch (error) {
            return res.status(400).json({
              error: 'Ocurrio un error: ' + error,
              status: 400
            });
          }
        }
      } catch (error) {
        res.status(400).json({
          message: 'Ocurrio un error: ' + error,
          status: 400
        });
      }
    }

    // ver las aseguradoras
    public ViewInsurances = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');
      try {
        const insurances:Array<any> = [];
        const resultsCorrect:Array<any> = [];
        const isInsuranceExist = await InsuranceModel.find({}).sort({ order: 1 });
        isInsuranceExist.forEach(item => {
          insurances.push({
            _id: item._id,
            numbers: item.phoneNumber
          });
        });

        if (!isInsuranceExist) {
          res.json({
            message: 'No hay aseguradoras registradas'
          });
        } else if (isInsuranceExist) {
          for (let x = 0; x < insurances.length; x++) {
            const id = insurances[x]._id;
            const numeros = insurances[x].numbers;
            const searchInsurance = await InsuranceModel.findById(id);
            const resultado = numeros.find((value: { type: string; }) => value.type === 'GENERAL');
            resultsCorrect.push({
              _id: searchInsurance?._id,
              phoneNumber: resultado?.number,
              name: searchInsurance?.name,
              externalId: searchInsurance?.externalId,
              iconCode: searchInsurance?.iconCode,
              colorCode: searchInsurance?.colorCode,
              order: searchInsurance?.order
            });
          }
          res.status(200).json(resultsCorrect);
        } else {
          res.json({
            mensaje: 'ocurrio un error'
          });
        }
      } catch (error) {
        res.status(400).json({
          message: 'Ocurrio un error: ' + error,
          status: 400
        });
      }
    }

    // ver aseguradora con el externalId
    public ViewInsurance = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');

      const externalId = _req.params.externalId;
      try {
        const isClientExist = await InsuranceModel.findOne({ externalId: externalId });
        if (!isClientExist) {
          res.status(400).json({
            message: 'No existe la aseguradora',
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
      } catch (error) {
        res.status(400).json({
          message: 'Ocurrio un error: ' + error,
          status: 400
        });
      }
    }

    // eliminar aseguradora
    public DeleteInsurance = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');
      const externalId = _req.params.externalId;
      try {
        const isInsuranceExist = await InsuranceModel.findOne({ externalId: externalId });

        if (!isInsuranceExist) {
          return res.status(400).json({
            message: 'La aseguradora no se encuentra en la base de datos',
            status: 400
          });
        } else {
          await isInsuranceExist.delete();
          res.status(200).json({
            message: 'La aseguradora se elimino correctamente',
            status: 200
          });
        }
      } catch (error) {
        res.status(400).json({
          message: 'Ocurrio un error: ' + error,
          status: 400
        });
      }
    }

    // actualizar aseguradora
    public UpdateInsurance = async (_req : Request, res : Response) => {
      res.set('Access-Control-Allow-Origin', '*');
      const _id = _req.params.externalId;
      const update = _req.body;
      try {
        if (_req.body.externalId != null) {
          res.status(400).json({
            message: 'El externalId no se puede editar',
            status: 400
          });
        } else {
          const mostrar = await InsuranceModel.findOne({ externalId: _id });

          if (mostrar) {
            const idInsurance = mostrar._id;
            const isExistPhoneNumber = await InsuranceModel.findOne({ phoneNumber: update.phoneNumber });

            if (isExistPhoneNumber) {
              res.status(400).json({
                message: 'El número de teléfono ya esta registrado en la base de datos',
                status: 400
              });
            } else {
              await InsuranceModel.findByIdAndUpdate(idInsurance, update);

              const UpdatedInsurance = await InsuranceModel.findOne({ _id: idInsurance });
              res.status(200).json({
                message: 'Aseguradora actualizada',
                UpdatedInsurance,
                status: 200
              });
            }
          } else {
            return res.status(400).json({
              message: 'No se encontró la aseguradora en la base de datos',
              status: 400
            });
          }
        }
      } catch (error) {
        res.status(400).json({
          message: 'Ocurrio un error: ' + error,
          status: 400
        });
      }
    }

    // notificaciones push
    public sendPush = async (_req:Request, res:Response) => {
      const title = _req.body.title;
      const notification = _req.body.notification;
      const externalId = _req.params.externalId;
      try {
        const client = await ClientsModel.findOne({ externalId: externalId });
        if (client) {
          const _id = JSON.stringify(client?._id);
          const search = _id.slice(1, -1);
          const user = await UsersModel.findOne({ clientId: search });
          const firebaseToken = user?.firebaseToken;
          if (firebaseToken !== undefined) {
            console.log(search);
            // token omar: cOqymngbRTyswgSRVOgwQu:APA91bFZYKtqTPNZESfxau0jnI1PS8klEybOhcif2FxON20xuEgGnFitw0uh5OrGa-Ae3LxUWoWtWuQzV67uHKlNVbvIXl-Sh7NOhMpNPT-HLt2BiyVV7Pg7kp9ohaxN0q6dn1HSmFrL
            const data = {
              to: `${firebaseToken}`,
              notification: {
                sound: 'default',
                vibration: true,
                body: `${notification}`,
                title: `${title}`,
                content_available: true,
                priority: 'high'
              },
              android: {
                notification: {
                  sound: 'default',
                  vibration: true
                }
              },
              apns: {
                payload: {
                  sound: 'default'
                }
              }
            };

            const instance = await axios.create({
              baseURL: 'https://fcm.googleapis.com/',
              timeout: 1000,
              headers: {
                Authorization: process.env.KEY_FIREBASE || '',
                'Content-Type': 'application/json'
              }
            });

            const notificationPush = new NotificationPushModel({
              type: 'APP',
              title: title,
              notification: notification,
              date: now(),
              externalIdClient: externalId
            });
            await notificationPush.save();

            instance.post('fcm/send', data)
              .then(function (response) {
                res.status(200).json({
                  message: `La notificación se ha enviado de manera correcta: ${response.data}`,
                  status: 200
                });
              })
              .catch(function (error) {
                res.status(400).json({
                  message: 'Ocurrio un error: ' + error,
                  status: 400
                });
              });
          } else {
            res.status(400).json({
              message: 'El cliente no tiene el token de firebase',
              status: 400
            });
          }
        } else {
          res.status(400).json({
            message: 'No se encuentra el Cliente',
            status: 400
          });
        }
      } catch (error) {
        res.send({ 'Ocurrio un error ': error });
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
