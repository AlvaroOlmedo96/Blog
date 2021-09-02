import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { User } from '../models/user.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private url:string = environment.apiURL;

  private isBrowser:boolean = false;
  isLoggedIn:boolean = false;//Variable para que pueda ser usada por AppComponent y habilitar el navbar

  constructor(private http:HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async getUsers(token:string){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    return await this.http.get(`${this.url}/api/users/users`, { headers: headers}).toPromise().then( res => {
        return res;
    }).catch( error => {
        return error;
    });
  }

  async getUsersById(token:string, idList){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    const params = {
      idList: idList
    }
    return await this.http.get(`${this.url}/api/users/usersById`, { params: params, headers: headers}).toPromise().then( res => {
        return res;
    }).catch( error => {
        return error;
    });
  }

  async getUserByName(token:string, textSearched: string){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    const params = {
        username: textSearched
    }
    return await this.http.get(`${this.url}/api/users/userName`, { params: params, headers: headers}).toPromise().then( (res:any) => {
        return res;
    }).catch( error => {
        return error;
    });
  }

  async getUserById(token, userId){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    const params = {
        userId: userId
    }
    return await this.http.get(`${this.url}/api/users/userId`, { params: params, headers: headers}).toPromise().then( (res:any) => {
        return res;
    }).catch( error => {
        return error;
    });
  }

  //UPDATE PROFILE
  async updateProfileImages(credentials, imageType, file){
    const headerType = 'x-access-token';
    const headers = {[headerType]: credentials.token};
    const params = {
      id: credentials.userId,
      imageType: imageType,
      originImage: 'profile'
    }
    return await this.http.post(`${this.url}/api/users/updateProfileImages`, file, { params: params, headers: headers}).toPromise().then( res => {
        return res;
    }).catch( error => {
        return error;
    });
  }

  async updateProfile(body){
    const headerType = 'x-access-token';
    const headers = {[headerType]: body.token};
    return await this.http.post(`${this.url}/api/users/updateProfile`, body, { headers: headers}).toPromise().then( res => {
        return res;
    }).catch( error => {
        return error;
    });
  }

  //FRIENDS REQUESTS
  async friendRequest(token, body){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    return await this.http.post(`${this.url}/api/users/friendRequest`, body, { headers: headers}).toPromise().then( res => {
        return res;
    }).catch( error => {
        return error;
    });
  }

  async acceptFriendRequest(token, body){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    return await this.http.post(`${this.url}/api/users/acceptFriendRequest`, body, { headers: headers}).toPromise().then( res => {
        return res;
    }).catch( error => {
        return error;
    });
  }

  async declineFriendRequest(token, body){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    return await this.http.post(`${this.url}/api/users/declineFriendRequest`, body, { headers: headers}).toPromise().then( res => {
        return res;
    }).catch( error => {
        return error;
    });
  }

  async getNotifications(token, idList:Array<string>){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    const body = {
      idList: idList
    }
    //He usado metodo post porque get tiene limite de tamaño para los parametros enviados
    return await this.http.post(`${this.url}/api/users/getNotifications`, body, { headers: headers}).toPromise().then( res => {
        return res;
    }).catch( error => {
        return error;
    });
  }

  async getChat(token, chatId){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    const params = {
      chatId: chatId
    }
    return await this.http.get(`${this.url}/api/users/getChat`, { params: params, headers: headers}).toPromise().then( (res:any) => {
        return res;
    }).catch( error => {
        return error;
    });
  }

  async sendMessage(token, chatRoomId, currentUser, receiverUser, msg){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    const body = {
      chatRoomId: chatRoomId,
      msg: msg,
      emiterUserId: currentUser._id,
      emiterUserName: currentUser.username,
      receiverUserId: receiverUser._id,
      receiverUserName: receiverUser.username
    }
    //He usado metodo post porque get tiene limite de tamaño para los parametros enviados
    return await this.http.post(`${this.url}/api/users/sendMessage`, body, { headers: headers}).toPromise().then( res => {
        return res;
    }).catch( error => {
        return error;
    });
  }

}