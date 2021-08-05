import Role from '../models/Role.model';
import {ROLES} from '../models/Role.model';

export const createRoles = async () => {
    
    const count = await Role.estimatedDocumentCount(); //Comprueba si ya exitene documentos

    if(count > 0) return;

    for(let r of ROLES){
        new Role({name: r}).save();
    }
}