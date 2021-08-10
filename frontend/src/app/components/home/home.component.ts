import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxImageCompressService } from 'ngx-image-compress';
import { MenuItem, MessageService } from 'primeng/api';
import { Post } from 'src/app/models/posts.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { BlobImageService } from 'src/app/services/blobImages.service';
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
  uploadFileErrorMsg:string = '';

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
  private socketSrv: SocketWebService, private messageService: MessageService, private formBuilder: FormBuilder, private bImgSrv: BlobImageService) {
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
    await console.log("TODOS LOS POST CARGADOS", this.usersOfPost.length, this.listPost.length);
    
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
    let usersId = [];
    await this.postSrv.getPosts(this.authSrv.getToken()).then( async (res:[Post]) => {
      this.listPost = res.sort((a,b) => <any>new Date(b.createdAt) - <any>new Date(a.createdAt)); //Ordenamos por los mas recientes
      if(this.listPost.length > 0){
        for(let post of this.listPost){
          //Obtiene Imagen de Post
          await this.postSrv.getPostImage(this.authSrv.getToken(), post.imgURL).then( imgUrl => {
            if(!imgUrl.error){
              let reader = new FileReader();
              reader.readAsDataURL(imgUrl);
              reader.onload = (_event) => {
                post.imgURL = reader.result.toString();
              }
            }else{
              post.imgURL = '';
            }
          });
          usersId.push(post.propietaryId);
        }
      }
    });

    //Obtiene userInfo de cada Post
    await this.userSrv.getUsersById(this.authSrv.getToken(), usersId).then( async res => {
      console.log(res);
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

  selectedPost:any = {
    imgURL:''
  };
  displayZoomPost:boolean = false;
  //Hace zoom
  zoomPostImage(post){
    console.log(post);
    this.selectedPost = post;
    this.displayZoomPost = true;
  }

  showCreatePostModal(){
    this.displayCreatePostModal = true;
  }
 
  async createPost(){
    this.isPosting = true;
    if(this.postForm.valid){
      let testForm = {
        title: this.postForm.controls['title'].value,
        imgURL: '', 
        description: this.postForm.controls['description'].value,
        likes: 0,
        propietaryId: this.user._id,
        propietaryUsername: this.user.username
      }
      console.log("IMGFORM", this.postForm.controls['imgURL'].value);
      if(this.postForm.controls['imgURL'].value != '' && this.postForm.controls['imgURL'].value != null){
        const formData = new FormData();
        formData.append('file', this.postForm.controls['imgURL'].value);
        await this.postSrv.uploadPostImage(this.authSrv.getToken(), this.user._id, formData).then( res => {
          console.log(res);
          testForm.imgURL = res.postImgURL;
        });
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


  openFile(){
    document.getElementById("postImg").click();
  }

  imgChangeEvt: any = '';
  cropImgPreview: any = '';
  uploadedImage = {imgURL:'', lastSize:'', newSize:''};
  compressingFile: boolean = false;
  fileOverLimit: boolean = false;
  onChangeImage(event){
    this.imgChangeEvt = event;
    this.fileOverLimit = false;
    this.compressingFile = true;
  }

  cropImg(event){//NO BORRAR NECESARIO PARA IMAGE-CROPPER
    this.cropImgPreview = this.bImgSrv.cropImage(event);
    console.log("cropImg");
    let file = this.imgChangeEvt.target.files[0];
    let filename = file['name'];
    let quality = { ratio:100, quality: 50};
    this.bImgSrv.compressFile(this.cropImgPreview, -1, quality.ratio, quality.quality, filename).then( img => {
      if(!img.overLimit){
        this.uploadedImage.imgURL = img.imgString;
        this.uploadedImage.lastSize = img.lastSize;
        this.uploadedImage.newSize = img.newSize;
        this.postForm.controls['imgURL'].setValue(img.imgFile);
      }else{
        console.warn("Archivo demasiado grande");
        this.fileOverLimit = true;
        this.uploadFileErrorMsg = 'Archivo demasiado grande. El archivo debe ocupar 5MB o menos';
      }
      this.compressingFile = false;
    });
  }

  initCropper() {//NO BORRAR NECESARIO PARA IMAGE-CROPPER
    // init cropper
    console.log("initCropper")
    let file = this.imgChangeEvt.target.files[0];
  }

  imgLoad() { //NO BORRAR NECESARIO PARA IMAGE-CROPPER
    // display cropper tool
    console.log("imgLoad");
  }
  imgFailed() {//NO BORRAR NECESARIO PARA IMAGE-CROPPER
      // error msg
      console.log("imgFailed");
      this.cropImgPreview = '';
      this.fileOverLimit = true;
      this.compressingFile = false;
      this.uploadFileErrorMsg = 'Formato no admitido. Solo imagenes.'
  }

}
