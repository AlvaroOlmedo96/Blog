import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url:string = 'http://localhost:3000';

  private isBrowser:boolean = false;
  isLoggedIn:boolean = false;//Variable para que pueda ser usada por AppComponent y habilitar el navbar

  constructor(private http:HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
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
    if(this.isBrowser){
      localStorage.clear();
      window.location.reload();
    }
  }


  async checkToken(token:string){
    if(token != null && token != undefined && token != ''){
      const headerType = 'x-access-token';
      return await this.http.get(`${this.url}/api/auth/checkToken`, { headers: {[headerType]: token} }).toPromise().then( res => {
        this.isLoggedIn = true;
        return res;
      }).catch(error => {
        this.isLoggedIn = false;
        return error;
      });
    }else{
      this.isLoggedIn = false;
      return false;
    }
  }

  saveToken(token: string){
    if(this.isBrowser){
      localStorage.setItem('signIn', token);
    }
  }
  getToken(){
    if(this.isBrowser){
      const token = localStorage.getItem('signIn');
      return token;
    }
  }


  async getPosts(){
    const headerType = 'x-access-token';
    const token = this.getToken();
    return await this.http.get(`${this.url}/api/posts`, { headers: {[headerType]: token} }).toPromise().then( res => {
      return res;
    });
  }
}
