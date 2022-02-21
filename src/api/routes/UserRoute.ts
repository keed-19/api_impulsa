import { Router } from 'express';
import UserController from '../controllers/UserController';
import UserMiddleware from '../middlewares/middleware';
import multer from "multer";
import mimeTypes from 'mime-types';
import { Request, Response } from 'express';

// const sf = multer.diskStorage({
//     destination:'../files/',
//     filename:function(req,file,cb){
//         cb(null,Date.now + "." + mimeTypes.extension(file.mimetype));
//     }
// })

// const files = multer({
//     storage : sf
// });

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+ "." + mimeTypes.extension(file.mimetype));
    }
  })
   
var upload = multer({ storage: storage });




const UserRoute: Router = Router();
/**
    // UserRoute.get('/', UserController.index);
 */
UserRoute.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
    
});

UserRoute.post('/users', UserController.register);

UserRoute.post('/login', UserController.login);

//implementacion del middleware
UserRoute.post('/veryfic', UserMiddleware.veryfy);


//TODOs: estas funciones ya estan listas pero hay que separar el codigo de route con el controlador.
// hay que implemetar la ñlogica del modelo de impuls
//verificando el codigo de sms
UserRoute.post('/verificar', UserController.ComprobarCod);
//upload.single('myFile')
//provando la ruta con middleware y controlador
UserRoute.post('/uploadfile', upload.single('myFile'), UserController.Savefiles);


export default UserRoute;