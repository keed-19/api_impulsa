import multer from "multer";
import mimeTypes from 'mime-types';


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/uploads')
    },
    filename: function (res, file, cb) {
        cb(null, file.fieldname + '-' + Date.now()+ "." + mimeTypes.extension(file.mimetype));
    }
  })
   
var Upload = multer({ storage: storage });

export {Upload}