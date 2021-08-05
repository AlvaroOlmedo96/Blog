import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';

  isLogged: boolean = false;
  constructor(private authSrv: AuthService){
    this.enableNavbar();
  }

  enableNavbar(){
    this.isLogged = this.authSrv.isLoggedIn;
  }
  
}
