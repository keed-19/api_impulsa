import multer from 'multer';
import mimeTypes from 'mime-types';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/uploads');
  },
  filename: function (res, file, cb) {
    cb(null, file.originalname);
  }
});

const Upload = multer({ storage: storage });

export { Upload };