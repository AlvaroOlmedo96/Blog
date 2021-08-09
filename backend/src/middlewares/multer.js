const multer  = require('multer');
import fs from 'fs';
import path from 'path';

const storageUserProfile = multer.diskStorage({
    destination: function (req, file, cb) {
        const { id } = req.query;
        const directory = `src/public/uploads/${id}/profile`;
        removeLastFile(file, directory, req.query.imageType);//Eliminamos la foto de perfil/cover anterior
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

const removeLastFile = async (file, directory, imageType) => {
    if(fs.existsSync(directory)){
        let allFiles = fs.readdirSync(directory);
        allFiles.forEach((file) => {
            if(file.indexOf(imageType) > -1){
                const pathFile = path.join(directory, file);
                fs.unlink(pathFile, (err) => { //Eliminamos el fichero
                    if (err) {
                      console.error(err)
                      return
                    }
                });
            }
        });
    }
    
}


