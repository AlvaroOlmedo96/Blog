const multer  = require('multer');
import fs from 'fs';
import path from 'path';

//Conf para subir imagenes perfil
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { id, originImage } = req.query;
        let directory = '';
        if(originImage == 'profile'){directory = `src/public/uploads/${id}/profile`;}
        if(originImage == 'post'){directory = `src/public/uploads/${id}/posts`;}
        
        if(originImage == 'profile'){removeLastFile(file, directory, req.query.imageType);}//Eliminamos la foto de perfil/cover anterior

        fs.mkdirSync(directory, { recursive: true });
        cb(null, directory);
    },
    filename: function (req, file, cb) {
        const { imageType, originImage } = req.query;
        if(originImage == 'profile'){ cb(null, Date.now() + '_' + imageType + '_' + file.originalname);}
        if(originImage == 'post'){ cb(null, Date.now() + file.originalname);}
    }
});

const uploadSingleFile = multer({ storage: storage });

exports.uploadSingleImage = uploadSingleFile.single('file');

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

//Subir Imagem - POST
export const uploadPostImage = async (req, res) => {
    const postImgURL = req.file.path.replace(/\\/g, "/");
    res.json({postImgURL: postImgURL});
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


