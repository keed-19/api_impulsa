import multer from 'multer';
import {GridFsStorage} from 'multer-gridfs-storage';
import {conection} from '../../config/database';

var storage = new GridFsStorage({
  url: conection,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (_req, file) => {
    // const req = finalResult as any;
    // console.log('insurancePolicy', valor.f);
    // console.log('file', file)
    return {
      bucketName: 'insurancePolicies',
      filename: `${Date.now()}-${file.originalname}`
    };
  }
});
var uploadFiles = multer({ storage: storage });
  // var uploadFilesMiddleware = util.promisify(uploadFiles);
  // module.exports = uploadFilesMiddleware;
  export { uploadFiles };

// export { upload };