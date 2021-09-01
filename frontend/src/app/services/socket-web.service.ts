import { EventEmitter, Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketWebService extends Socket{

  cb_userConnection: EventEmitter<any> = new EventEmitter();
  cb_newPost: EventEmitter<any> = new EventEmitter();
  cb_newNotification: EventEmitter<any> = new EventEmitter();
  cb_newLike: EventEmitter<any> = new EventEmitter();
  cb_newComment: EventEmitter<any> = new EventEmitter();

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
    this.ioSocket.on('newPost', res => this.cb_newPost.emit(res)); 
    this.ioSocket.on('getUsers', res => this.cb_userConnection.emit(res)); 
    this.ioSocket.on('newNotification', res => this.cb_newNotification.emit(res)); 
    this.ioSocket.on('newLike', res => this.cb_newLike.emit(res)); 
    this.ioSocket.on('newComment', res => this.cb_newComment.emit(res)); 
  }

  createUserSocketId = (userId) => {
    this.ioSocket.emit('addUserSocketId', userId);
  }

  updateReadedNotification = (userId, notification) => {
    this.ioSocket.emit('readedNotification', userId, notification);
  }

  //Se encarga de emitir eventos desde el Front al Back
  userConnection = ( payload = {} ) => {
  }

  updateProfile = (userId) => {
    this.ioSocket.emit('profileUpdated', userId);
  }


}
