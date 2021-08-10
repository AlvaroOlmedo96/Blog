import { Component, HostListener, OnInit } from '@angular/core';
import {MenuItem, MessageService} from 'primeng/api';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-navbar',
  providers: [MessageService],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @HostListener('window:click', ['$event']) 
  doSomething(event:any) {
    if(event.target.id == 'toggleBtnNavbar'){
      this.isBtnCollapse = !document.getElementById('toggleBtnNavbar').classList.contains('collapsed');
    }
  }

  navbarSearchText:string = '';
  options: MenuItem[];
  recommendedListSearched = [];

  isBtnCollapse:boolean = false;

  user:User = {
    username: ''
  };

  constructor(private authSrv: AuthService, private messageService: MessageService, private userSrv:UsersService) { }

  ngOnInit(): void {
    this.getProfile();

    this.options = [
      {label: 'Ajustes', icon: 'pi pi-cog', routerLink: ['/login']},
      {separator:true},
      {label: 'Cerrar sesión', icon: 'pi pi-times', command: () => {
        this.authSrv.signOut();
      }}
    ];

  }

  collapseNavbar(){
    this.isBtnCollapse = false;
    document.getElementById('toggleBtnNavbar').classList.add('collapsed');
    document.getElementById('navbarSupportedContent').classList.remove('show');
  }

  getProfile(){
    this.authSrv.currentUser().then( (res:User) => {
      this.user = res;
    });
  }

  search(){
    if(this.navbarSearchText.trim().length > 0){
      const token = this.authSrv.getToken();
      this.userSrv.getUserByName(token, this.navbarSearchText.toLowerCase()).then( res => {
        if(res.length < 1){ this.recommendedListSearched = []; }
        if(res.length > 1){
          this.recommendedListSearched = res.slice(0, 4); //Limitamos el listado recomendado de busqueda de personas
        }else{
          this.recommendedListSearched = res;
        }
      });
    }else{
      this.recommendedListSearched = [];
    }
  }

}
