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

  async getPostsById(token, idList:Array<string>){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    console.log("IDLIST", idList);
    const params = {
      idList: idList
    }
    console.log("IDLIST", params);
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

  async uploadPostImage(token, id, image){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    const params = {
      id: id,
      originImage: 'post'
    }
    console.log("BODY", image);
    return await this.http.post(`${this.url}/api/posts/uploadPostImage`, image, { params: params, headers: headers }).toPromise().then( res => {
        return res;
    }).catch( error => {
        return error;
    });
  }
  async getPostImage(token, imageURL){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};

    const params = {
      path: imageURL.replace('src/','').replace('public/','')
    }
    if(imageURL != '' && imageURL != null && imageURL != undefined){
      return this.http.get(`${this.url}/api/posts/imagesPosts`, { params: params, headers: headers, responseType: 'blob' }).toPromise().then( (img:any) => {
        return img;
      }).catch( error => {
        return error;
      });
    }else{
      let img = '';
      return img;
    }
  }


}