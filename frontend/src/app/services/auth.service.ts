import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { User } from '../models/user.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url:string = environment.apiURL;

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
      sessionStorage.clear();
      window.location.reload();
    }
  }

  
  async getProfile(){
    const user:User = await this.currentUser().then( user => {
      return user;
    }).catch(error => {return error;});
    const profileImgURL = await this.getProfileImg(user.profileImg).then( img => {
      if(img.status){return null;}
      else{return img;}
      
    }).catch(error => {return error;});
    const profileCoverImgURL = await this.getProfileImg(user.profileCoverImg).then( img => {
      if(img.status){return null;}
      else{return img;}
    }).catch(error => {return error;});

    const profile = {
      user:user,
      profileImgURL: profileImgURL,
      profileCoverImgURL: profileCoverImgURL
    }

    return profile;
  }
  
  async currentUser(){
    const token = this.getToken();
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    return await this.http.get(`${this.url}/api/auth/profile`, { headers: headers }).toPromise().then( (res:User) => {
      return res;
    }).catch( error => {
      return error;
    });
  }

  async getProfileImg(imageURL){
    const token = this.getToken();
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};

    const params = {
      path: imageURL.replace('src/','').replace('public/','')
    }
    if(imageURL != '' && imageURL != null && imageURL != undefined){
      return this.http.get(`${this.url}/api/uploads/profile/getProfileImages`, { params: params, headers: headers, responseType: 'blob' }).toPromise().then( (img:any) => {
        return img;
      }).catch( error => {
        return error;
      });
    }else{
      let img = '';
      return img;
    }
    
  }


  async checkToken(){
    const token = this.getToken();
    if(token != null && token != undefined && token != ''){
      const headerType = 'x-access-token';
      const headers = {[headerType]: token};
      return await this.http.get(`${this.url}/api/auth/checkToken`, { headers: headers }).toPromise().then( res => {
        this.isLoggedIn = true;
        return res;
      }).catch(error => {
        this.isLoggedIn = false;
        return false;
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
  
}
