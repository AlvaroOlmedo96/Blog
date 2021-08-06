import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { SocketWebService } from './services/socket-web.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';

  isLogged: boolean = false;
  constructor(private authSrv: AuthService, private socketSrv: SocketWebService){
    this.enableNavbar();
  }

  enableNavbar(){
    this.isLogged = this.authSrv.isLoggedIn;
  }
  
}
