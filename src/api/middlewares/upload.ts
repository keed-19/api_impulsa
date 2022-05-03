import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import { conection } from '../../config/database';

const storage = new GridFsStorage({
  url: conection,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (_req: any, file: { originalname: any; }) => {
    return {
      bucketName: 'insurancePolicies',
      filename: `${Date.now()}-${file.originalname}`
    };
  }
});
const uploadFiles = multer({ storage: storage });
export { uploadFiles };
