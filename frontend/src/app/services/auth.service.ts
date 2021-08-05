import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url:string = 'http://localhost:3000';

  constructor(private http:HttpClient) {
  }

  async signIn(user: User){
    let body = {
      email: user.email,
      password: user.password
    }
    return await this.http.post(`${this.url}/api/auth/signIn`, body).toPromise().then( res => {
      return res;
    }).catch( error => {
      return error;
    });
  }

  async signUp(user: User){
    let body = {
      username: user.username,
      email: user.email,
      password: user.password,
      roles: user.roles
    }
    return await this.http.post(`${this.url}/api/auth/signUp`, body).toPromise().then( res => {
      return res;
    }).catch( error => {
      return error;
    });
  }

  signOut(){
    localStorage.clear();
    window.location.reload();
  }


  async checkToken(token:string){
    if(token != null && token != undefined && token != ''){
      const headerType = 'x-access-token';
      return await this.http.get(`${this.url}/api/auth/checkToken`, { headers: {[headerType]: token} }).toPromise().then( res => {
        return res;
      }).catch(error => {
        return error;
      });
    }else{
      return false;
    }
    
  }
  saveToken(token: string){
    localStorage.setItem('signIn', token);
  }
  getToken(){
    const token = localStorage.getItem('signIn');
    return token;
  }
}
