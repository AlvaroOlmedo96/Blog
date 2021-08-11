import { EventEmitter, Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketWebService extends Socket{

  cb_userConnection: EventEmitter<any> = new EventEmitter();
  cb_deletePost: EventEmitter<any> = new EventEmitter();
  cb_profileUpdated: EventEmitter<any> = new EventEmitter();

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
    this.ioSocket.on('userConnection', res => this.cb_userConnection.emit(res)); 
    this.ioSocket.on('profileUpdated', res => this.cb_profileUpdated.emit(res)); 
    this.ioSocket.on('deletePost', res => this.cb_deletePost.emit(res)); 
    this.ioSocket.on('getUsers', res => console.log("GETUSER", res)); 
  }

  createUserSocketId = (userId) => {
    this.ioSocket.emit('addUserSocketId', userId);
  }

  //Se encarga de emitir eventos desde el Front al Back
  userConnection = ( payload = {} ) => {
    this.ioSocket.emit('userConnection', payload);
  }

  updateProfile = (userId) => {
    this.ioSocket.emit('profileUpdated', userId);
  }


}
