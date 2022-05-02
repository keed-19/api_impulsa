import multer from 'multer';
import {GridFsStorage} from 'multer-gridfs-storage';
import util from 'util';
// const {GridFsStorage} = require('multer-gridfs-storage');
const url = process.env.DB_URI || '';

// Create a storage object with a given configuration
// const storage = new GridFsStorage({ url });

// Set multer storage engine to the newly created object
var storage = new GridFsStorage({
    url: url,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (_req, file) => {
      const match = ["application/pdf"];
      if (match.indexOf(file.mimetype) === -1) {
        const filename = `${Date.now()}-bezkoder-${file.originalname}`;
        return filename;
      }
      return {
        bucketName: url,
        filename: `${Date.now()}-bezkoder-${file.originalname}`
      };
    }
  });
  var uploadFiles = multer({ storage: storage }).single("file");
  var uploadFilesMiddleware = util.promisify(uploadFiles);
  module.exports = uploadFilesMiddleware;
  export { uploadFilesMiddleware };

// export { upload };