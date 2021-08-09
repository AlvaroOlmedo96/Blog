import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Post } from 'src/app/models/posts.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { PostsService } from 'src/app/services/posts.service';
import { SocketWebService } from 'src/app/services/socket-web.service';
import { UsersService } from 'src/app/services/users.service';

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
  profileImg: string = '';
  profileCoverImg: string = '';
  chargingData:boolean = true;

  listPost:Array<Post> = [];
  postSettings: MenuItem[];
  displayCreatePostModal:boolean = false;
  modalWidth = {width: '80vw'};
  postForm: FormGroup;
  textAreaPost: string;
  isPosting:boolean = false;

  usersOfPost:any = [];

  chatMenuSettings: MenuItem[];
  
  
  constructor(@Inject(PLATFORM_ID) platformId: Object, private authSrv: AuthService, private postSrv:PostsService, private userSrv: UsersService,
  private socketSrv: SocketWebService, private messageService: MessageService, private formBuilder: FormBuilder) {
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
    
    await this.authSrv.getProfile().then( res => {
      this.user = res.user;
      let reader = new FileReader(); let reader2 = new FileReader();
      if(res.profileImgURL != null && res.profileImgURL != ''){ 
        reader.readAsDataURL(res.profileImgURL);
        reader.onload = (_event) => {
          this.profileImg = reader.result.toString();
        }
      }else{this.profileImg = '';}
      
      if(res.profileCoverImgURL != null && res.profileCoverImgURL != ''){ 
        reader2.readAsDataURL(res.profileCoverImgURL);
        reader2.onload = (_event) => {
          this.profileCoverImg = reader2.result.toString();
        }
      }else{this.profileCoverImg = '';}
    });
    
    //Enviamos esto al socket.io para notificar nueva conexión a todos los usuarios
    const userConection = {username:this.user.username, email:this.user.email};
    this.socketSrv.emitEvent(userConection);
  }

  async getPosts(){
    await this.postSrv.getPosts(this.authSrv.getToken()).then( async (res:[Post]) => {
      this.listPost = res.sort((a,b) => <any>new Date(b.createdAt) - <any>new Date(a.createdAt)); //Ordenamos por los mas recientes
      let usersId = [];
      if(this.listPost.length > 0){
        for(let post of this.listPost){
          usersId.push(post.propietaryId);
        }
        await this.userSrv.getUsersById(this.authSrv.getToken(), usersId).then( async res => {
          for(let user of res){
            if(user.profileImg != '' && user.profileImg != null && user.profileImg != undefined){
              await this.authSrv.getProfileImg(user.profileImg).then( img => {
                let reader = new FileReader();
                if(!img.error){ 
                  reader.readAsDataURL(img);
                  reader.onload = (_event) => {
                    user.profileImg = reader.result.toString();
                  }
                }else{user.profileImg = '';}
                this.usersOfPost.push(user);
              });
            }else{
              this.usersOfPost.push(user);
            }
          };
        });
      }
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
