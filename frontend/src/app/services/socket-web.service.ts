import { EventEmitter, Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketWebService extends Socket{

  callback: EventEmitter<any> = new EventEmitter();

  constructor() {
    super({
      url: environment.apiURL,
      options: {
        
      }
    });

    this.listen();
  }

  //Se encarga de escuchar cuando el back emite algún evento al front
  listen = () => {
    this.ioSocket.on('event', res => this.callback.emit(res)); 
  }

  //Se encarga de emitir eventos desde el Front al Back
  emitEvent = ( payload = {} ) => {
    this.ioSocket.emit('event', payload);
  }


}
