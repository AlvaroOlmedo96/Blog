import fs from 'fs';

export function removeAccents(string = '') {
    string = string.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    return string.replace(/a/g, '[a,á,à,ä]')
       .replace(/e/g, '[e,é,ë]')
       .replace(/i/g, '[i,í,ï]')
       .replace(/o/g, '[o,ó,ö,ò]')
       .replace(/u/g, '[u,ü,ú,ù]');
}
