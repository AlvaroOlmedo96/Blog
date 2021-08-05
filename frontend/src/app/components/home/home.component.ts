import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  isBrowser:boolean = false;

  listPost = [];
  displayCreatePostModal:boolean = false;
  modalWidth = {width: '80vw'};
  
  constructor(@Inject(PLATFORM_ID) platformId: Object, private authSrv: AuthService) {
    this.isBrowser = isPlatformBrowser(platformId);
  }


  ngOnInit(): void {
    if(this.isBrowser){this.modalWidth = (window.innerWidth <= 800) ? {width: '90vw'} : {width: '30vw'}};

    this.authSrv.getPosts().then( (res:any) => {
      console.log(res);
      this.listPost = res;
    });
  }

  showCreatePostModal(){
    this.displayCreatePostModal = true;
  }
 
  createPost(){

  }

}
