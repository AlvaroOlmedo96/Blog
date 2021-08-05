import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  listPost = [];

  constructor(private authSrv: AuthService) { }


  ngOnInit(): void {
    this.authSrv.getPosts().then( (res:any) => {
      console.log(res);
      this.listPost = res;
    });
  }
 
  createPost(){
    
  }

}
