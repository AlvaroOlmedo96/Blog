import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlobImageService {

  private url:string = environment.apiURL;

  private isBrowser:boolean = false;

  constructor(@Inject(PLATFORM_ID) platformId: Object, private imageCompress: NgxImageCompressService) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

    units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']; 
    prettyBytes(x){
        let l = 0, n = parseInt(x, 10) || 0;
        while(n >= 1024 && ++l){
            n = n/1024;
        }
        return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + this.units[l]);
    }

    async compressFile(reader, orientation, ratio, quality, filename){
        console.warn('Ántes de comprimir Size:', this.prettyBytes(this.imageCompress.byteCount(reader)));
        if(this.imageCompress.byteCount(reader) <= 5000000){
            return this.imageCompress.compressFile(reader, orientation, ratio, quality).then( async result => {
                console.warn('Después de comprimir Size:', this.prettyBytes(this.imageCompress.byteCount(result)));
                const resultBlob = await this.imageToBlob(result);
                let finalFile = new File([resultBlob], filename, { type: 'image/jpeg' });
                const image = {
                    overLimit: false,
                    lastSize: this.prettyBytes(this.imageCompress.byteCount(reader)),
                    newSize: this.prettyBytes(this.imageCompress.byteCount(result)),
                    imgString: result,
                    imgFile: finalFile
                }
                return image;
            });
        }else{
            const image = {
                overLimit: true,
                lastSize: '',
                newSize: '',
                imgString: '',
                imgFile: ''
            }
            return image;
        }
    }

    imageToBlob(result){
        const dataURI = result.split(',')[1]
        const byteString = window.atob(dataURI);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const int8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
        int8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([int8Array], { type: 'image/jpeg' });
        return blob;
    }

    cropImage(event: ImageCroppedEvent){
        return event.base64;
    }
}