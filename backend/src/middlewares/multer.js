const multer  = require('multer');
import fs from 'fs';
import path from 'path';

const storageUserProfile = multer.diskStorage({
    destination: function (req, file, cb) {
        const { id } = req.query;
        const directory = `src/public/uploads/${id}/profile`;
        fs.mkdirSync(directory, { recursive: true });
        cb(null, directory);
    },
    filename: function (req, file, cb) {
        const { imageType } = req.query;
        cb(null, Date.now() + '_' + imageType + '_' + file.originalname);
    }
});

const uploadUserFolder = multer({ storage: storageUserProfile });

exports.uploadSingleConf = uploadUserFolder.single('file');
exports.uploadMultiFileConf = uploadUserFolder.array('multi-files');

//Subir Imagen - Editar Perfil
export const updateProfileImages = async (req, res) => {
    const profileImgURL = req.file.path.replace(/\\/g, "/");
    const profileCoverImgURL = req.file.path.replace(/\\/g, "/");

    if(req.query.imageType == 'profileImg'){
        res.json({profileImgURL: profileImgURL});
    }
    if(req.query.imageType == 'profileCoverImg'){
        res.json({profileCoverImgURL: profileCoverImgURL});
    }
    
}


