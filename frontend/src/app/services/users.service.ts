import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private url:string = 'http://localhost:3000';

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

  async getUserByName(token:string, textSearched: string){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    const params = {
        username: textSearched
    }
    return await this.http.get(`${this.url}/api/users/userName`, { params: params, headers: headers}).toPromise().then( res => {
        return res;
    }).catch( error => {
        return error;
    });
  }

  getUserById(){

  }

}