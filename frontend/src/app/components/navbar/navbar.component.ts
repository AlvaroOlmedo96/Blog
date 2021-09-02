import { isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import {MenuItem, MessageService} from 'primeng/api';
import { Notifications } from 'src/app/models/notifications.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { SocketWebService } from 'src/app/services/socket-web.service';
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

  isBrowser:boolean = false;
  modalWidth = {width: '100vw'};

  navbarSearchText:string = '';
  options: MenuItem[];
  recommendedListSearched = [];

  isBtnCollapse:boolean = false;

  user:User = {
    username: ''
  };

  notifications = [];

  constructor(@Inject(PLATFORM_ID) platformId: Object, private authSrv: AuthService, private messageService: MessageService, private userSrv:UsersService, 
  private socketSrv: SocketWebService, private router: Router) { 
    this.isBrowser = isPlatformBrowser(platformId);

    socketSrv.cb_newNotification.subscribe( res => {
      console.log("SOCKET cb_newNotification Navbar", res);
      this.notifications.push(res);
      let severity = 'info';//success info warn error
      if(res.type == 'friendRequest'){
        severity = 'success';
      }
      this.checkReadedNotifications();
      this.messageService.add({severity: severity, summary:`${res.emiterUsername}`, detail:`${res.description}`});
    });

  }

  ngOnInit(): void {
    if(this.isBrowser){this.modalWidth = (window.innerWidth <= 1000) ? {width: '100vw'} : {width: '30vw'}};
    this.getProfile();

    this.options = [
      {label: 'Ajustes', icon: 'pi pi-cog', routerLink: ['/login']},
      {separator:true},
      {label: 'Cerrar sesión', icon: 'pi pi-sign-out', command: () => {
        this.authSrv.signOut();
      }}
    ];
    

  }

  navigateTo(ruta){
    let params = { 'user': JSON.stringify(this.user) };
    if(ruta == 'home'){this.router.navigate(['/home']);}
    if(ruta == 'notifications'){
      this.notifications.forEach(not => {
        not.isReaded = true;
        this.socketSrv.updateReadedNotification(this.user._id, not);//Actualizamos la notificacion a leída.
      });
      this.checkReadedNotifications();
      this.router.navigate(['/home/notifications'], {queryParams: params});
    }
    if(ruta == 'messages'){this.router.navigate(['/home/messages']);}
    if(ruta == 'profile'){this.router.navigate(['/home/profile']);}
  }

  noReadedNotifications = [];
  checkReadedNotifications(){
    this.noReadedNotifications = [];
    for(let not of this.notifications){
      if(!not.isReaded){
        this.noReadedNotifications.push(not);
      }
    }
  }

  collapseNavbar(){
    this.isBtnCollapse = false;
    document.getElementById('toggleBtnNavbar').classList.add('collapsed');
    document.getElementById('navbarSupportedContent').classList.remove('show');
  }

  getProfile(){
    this.authSrv.currentUser().then( (res:User) => {
      this.user = res;
      this.notifications = res.notifications.filter( not => not.receive);
      this.checkReadedNotifications();
      this.socketSrv.createUserSocketId(this.user._id);//Creamos un socketID para el usuario
    });
  }

  async search(){
    if(this.navbarSearchText.trim().length > 0){
      const token = this.authSrv.getToken();
      await this.userSrv.getUserByName(token, this.navbarSearchText.toLowerCase()).then( async res => {
        if(res.length < 1){ this.recommendedListSearched = []; }
        if(res.length > 1){
          this.recommendedListSearched = res.slice(0, 4); //Limitamos el listado recomendado de busqueda de personas
        }else{
          this.recommendedListSearched = res;
        }
        
        //Si ya es mi contacto eliminar de la lista
        this.recommendedListSearched.filter( recUser => this.user.contacts.find(u => { if(u === recUser.id){recUser.isContact = true;} } ));

        await this.recommendedListSearched.forEach( async user => {
          if(user.imgProfile != ''){
            await this.authSrv.getProfileImg(user.imgProfile).then( img => {
              if(!img.error){
                let reader = new FileReader();
                reader.readAsDataURL(img);
                reader.onload = async (_event) => {
                  user.imgProfile = await reader.result.toString();
                }
              }else{
                user.imgProfile = '';
              }
            });
          }
        });
      });
    }else{
      this.recommendedListSearched = [];
    }
  }

  async sendFriendRequest(user){
    let newNotification:Notifications = {
      type: 'friendRequest',
      emiterUserId: this.user._id,
      emiterUsername: this.user.username,
      receiveUserId: user.id,
      receiveUsername: user.username,
      description: 'Friend request'
    }
    let body = {
      notification: newNotification,
    }

    this.userSrv.friendRequest(this.authSrv.getToken(), body).then( res => {
      
    });
  }


}
