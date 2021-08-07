import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  postForm: FormGroup;
  textAreaPost: string;
  isPosting:boolean = false;

  chatMenuSettings: MenuItem[];
  
  
  constructor(@Inject(PLATFORM_ID) platformId: Object, private authSrv: AuthService, private postSrv:PostsService, private socketSrv: SocketWebService, 
  private messageService: MessageService, private formBuilder: FormBuilder) {
    this.isBrowser = isPlatformBrowser(platformId);

    socketSrv.callback.subscribe( res => {
      console.log("CALLBACK SOCKET", res);
      this.messageService.add({severity: 'success', summary:`${res.username}`, detail:`Se ha conectado.`});
    });

    this.postSettings = [
      {label: 'Ocultar publicaciones', icon: 'pi pi-eye-slash', command: () => {
        //Funcion a ejecutar
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
    ];

    this.postForm = this.formBuilder.group({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      imgURL: new FormControl(''),
    });
  }


  ngOnInit(): void {
    if(this.isBrowser){this.modalWidth = (window.innerWidth <= 1150) ? {width: '90vw'} : {width: '30vw'}};
    this.initCharge();
  }

  async initCharge(){
    await this.getProfile();
    await this.getPosts();
    
    this.chargingData = false;
  }

  async getProfile(){
    var profileDataExists = (sessionStorage.profileData) ? JSON.parse(sessionStorage.profileData) : '';
    if(profileDataExists == null || profileDataExists === ''){
      await this.authSrv.currentUser().then( (res:User) => {
        this.user = res;
        sessionStorage.setItem('profileData', JSON.stringify(this.user));
        //Enviamos esto al socket.io para notificar nueva conexión a todos los usuarios
        const userConection = {username:res.username, email:res.email};
        this.socketSrv.emitEvent(userConection);
      });
    }else{
      this.user = JSON.parse(sessionStorage.profileData);
    }
  }

  async getPosts(){
    await this.postSrv.getPosts(this.authSrv.getToken()).then( (res:[Post]) => {
      this.listPost = res.sort((a,b) => <any>new Date(b.createdAt) - <any>new Date(a.createdAt)); //Ordenamos por los mas recientes
    });
  }

  showCreatePostModal(){
    this.displayCreatePostModal = true;
  }
 
  async createPost(){
    this.isPosting = true;
    if(this.postForm.valid){
      let testForm = {
        title: this.postForm.controls['title'].value,
        imgURL: this.postForm.controls['imgURL'].value, 
        description: this.postForm.controls['description'].value,
        likes: 0,
        propietaryId: this.user._id,
        propietaryUsername: this.user.username
      }
      await this.postSrv.createPost(this.authSrv.getToken(), testForm).then( res => {
        this.isPosting = false;
        this.displayCreatePostModal = false;
      }).catch( error => {
        console.log(error);
        this.isPosting = false;
        this.displayCreatePostModal = false;
      });
    }else{
      this.isPosting = false;
    }
    
  }

}
