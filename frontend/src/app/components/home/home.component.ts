import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Post } from 'src/app/models/posts.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  isBrowser:boolean = false;

  user:User = {
    username: ''
  };
  chargingData:boolean = true;

  listPost:Array<Post> = [];
  displayCreatePostModal:boolean = false;
  modalWidth = {width: '80vw'};

  textAreaPost: string;
  
  constructor(@Inject(PLATFORM_ID) platformId: Object, private authSrv: AuthService) {
    this.isBrowser = isPlatformBrowser(platformId);
  }


  ngOnInit(): void {
    if(this.isBrowser){this.modalWidth = (window.innerWidth <= 800) ? {width: '90vw'} : {width: '30vw'}};
    this.getProfile();
    this.getPosts();
    
    this.chargingData = false;
  }

  getProfile(){
    this.authSrv.currentUser().then( (res:User) => {
      this.user = res;
    });
  }

  getPosts(){
    this.authSrv.getPosts().then( (res:[Post]) => {
      this.listPost = res;
    });
  }

  showCreatePostModal(){
    this.displayCreatePostModal = true;
  }
 
  createPost(){

  }

}
