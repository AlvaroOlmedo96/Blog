import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private url:string = 'http://localhost:3000';

  private isBrowser:boolean = false;

  constructor(private http:HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async getPosts(token:string){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    return await this.http.get(`${this.url}/api/posts`, { headers: headers }).toPromise().then( res => {
      return res;
    }).catch( error => {
        return error;
    });
  }

  async createPost(token, body, currentUser){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    return await this.http.post(`${this.url}/api/posts`, body, { headers: headers }).toPromise().then( res => {
        return res;
    }).catch( error => {
        return error;
    });
  }


}