import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { User } from '../models/user.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private url:string = environment.apiURL;

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

  async getPostsById(token, idList){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    const params = {
      idList: idList
    }
    return await this.http.get(`${this.url}/api/posts/postsById`, {params: params, headers: headers }).toPromise().then( res => {
        return res;
    }).catch( error => {
        return error;
    });
  }

  async createPost(token, body){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    console.log("BODY", body);
    return await this.http.post(`${this.url}/api/posts`, body, { headers: headers }).toPromise().then( res => {
        return res;
    }).catch( error => {
        return error;
    });
  }


}