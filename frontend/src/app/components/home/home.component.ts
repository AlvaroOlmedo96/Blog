import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Post } from 'src/app/models/posts.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { PostsService } from 'src/app/services/posts.service';
import { SocketWebService } from 'src/app/services/socket-web.service';

@Component({
  selector: 'app-home',
  providers: [MessageService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  isBrowser:boolean = false;

  user:User = {
    username: '',
    contacts: []
  };
  chargingData:boolean = true;

  listPost:Array<Post> = [];
  postSettings: MenuItem[];
  displayCreatePostModal:boolean = false;
  modalWidth = {width: '80vw'};

  textAreaPost: string;

  chatMenuSettings: MenuItem[];
  
  
  constructor(@Inject(PLATFORM_ID) platformId: Object, private authSrv: AuthService, private postSrv:PostsService, private socketSrv: SocketWebService, private messageService: MessageService) {
    this.isBrowser = isPlatformBrowser(platformId);

    socketSrv.callback.subscribe( res => {
      console.log("CALLBACK SOCKET", res);
      this.messageService.add({severity: 'success', summary:`${res.username}`, detail:`Se ha conectado.`});
    });

    this.postSettings = [
      {label: 'Ocultar publicaciones', icon: 'pi pi-eye-slash', command: () => {
        
      }}
    ];

    this.chatMenuSettings = [
      {
        label: 'Chats',
            icon:'pi pi-comentarios',
            items: [
                {
                    label: 'Icon online',
                    icon:'pi pi-circle-off'
                },
                {
                  label: 'Icon offline',
                  icon:'pi pi-circle-on'
              }
            ]
      }
    ]
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
      console.log(this.user);
      //Enviamos esto al socket.io para notificar nueva conexión a todos los usuarios
      const userConection = {username:res.username, email:res.email};
      this.socketSrv.emitEvent(userConection);
    });
  }

  getPosts(){
    this.postSrv.getPosts(this.authSrv.getToken()).then( (res:[Post]) => {
      this.listPost = res.sort((a,b) => <any>new Date(b.createdAt) - <any>new Date(a.createdAt)); //Ordenamos por los mas recientes
      console.log(res);
    });
  }

  showCreatePostModal(){
    this.displayCreatePostModal = true;
  }
 
  createPost(){
    let testForm = {
      title: 'Prueba de post', 
      category: '', 
      imgURL: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/el-gato-con-botas-1551289404.jpg', 
      description: ':)',
      propietaryId: this.user._id,
      propietaryUsername: this.user.username
  }
    this.postSrv.createPost(this.authSrv.getToken(), testForm, this.user).then( res => {
      console.log(res);
    }).catch( error => {
      console.log(error);
    })
  }

}
