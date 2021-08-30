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

  async getPosts(token:string, idList:Array<string>, currentId){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};
    idList.push(currentId);
    const params = {
      idList: idList
    }
    return await this.http.get(`${this.url}/api/posts`, { params: params, headers: headers }).toPromise().then( res => {
        return res;
    }).catch( error => {
        return error;
    });
  }

  async getPostsById(token, idList:Array<string>){
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
    console.log(imageURL);
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

  async deletePost(token, postId, userId, imagePath){
    const headerType = 'x-access-token';
    const headers = {[headerType]: token};

    const params = {
      postId: postId,
      userId: userId,
      imagePath: imagePath.replace('src/','').replace('public/','')
    }

    console.log("PARAMS", params);
    
    return this.http.delete(`${this.url}/api/posts/deletePostById`, { params: params, headers: headers }).toPromise().then( (res:any) => {
      return res;
    }).catch( error => {
      return error;
    });
    
  }


}