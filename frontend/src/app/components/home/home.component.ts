import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Notifications } from 'src/app/models/notifications.model';
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
  imgChangeEvt: any = '';
  cropImgPreview: any = '';
  uploadedImage = {imgURL:'', lastSize:'', newSize:''};
  compressingFile: boolean = false;
  fileOverLimit: boolean = false;

  listPost = [];
  postSettings: MenuItem[];
  displayCreatePostModal:boolean = false;
  modalWidth = {width: '80vw'};
  postForm: FormGroup;
  textAreaPost: string;
  isPosting:boolean = false;
  newPublications:boolean = false;

  usersOfPost:any = [];

  friendsList = [];

  chatMenuSettings: MenuItem[];
  
  
  constructor(@Inject(PLATFORM_ID) platformId: Object, private authSrv: AuthService, private postSrv:PostsService, private userSrv: UsersService,
  private socketSrv: SocketWebService, private messageService: MessageService, private formBuilder: FormBuilder, private bImgSrv: BlobImageService) {
    this.isBrowser = isPlatformBrowser(platformId);

    socketSrv.cb_newPost.subscribe( res => {
      console.log("SOCKET cb_newPost", res);
      //@ts-ignore
      if(res.propietaryId == this.user._id || this.user.contacts.includes(res.propietaryId)){
        this.newPublications = true;
      }
    });
    socketSrv.cb_userConnection.subscribe( async res => {
      console.log("SOCKET cb_userConnection", res);
      this.friendsList.filter( u => res.find(connect => { if(connect.userId === u._id){u.online = true;} } ));
      console.log("ONLINE", this.friendsList);
    });
    socketSrv.cb_newLike.subscribe( async res => {
      console.log("SOCKET cb_newLike", res);
      if(this.listPost.filter(post => post._id.includes(res._id))){
        let index = this.listPost.indexOf(this.listPost.find(post => post._id.includes(res._id)));
        this.listPost[index].likes = res.likes;
      }
    });

    this.postSettings = [
      {label: 'Ocultar publicaciones', icon: 'pi pi-eye-slash', command: () => {
        //Funcion a ejecutar
      }}
    ];

    this.chatMenuSettings = [
      {
        label: 'Contactos',
        icon:'pi pi-comentarios',
        items: this.friendsList/*[
            {
                label: 'Icon online',
                icon:'pi pi-circle-off'
            },
            {
              label: 'Icon offline',
              icon:'pi pi-circle-on'
          }
        ]*/
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
    await this.getFriends();
    this.chargingData = false;
  }

  async getFriends(){
    await this.userSrv.getUsersById(this.authSrv.getToken(), this.user.contacts).then( res => {
      this.friendsList = res;
      console.log(this.friendsList);
      this.friendsList.forEach( friend => {
        friend.label = friend.username
      })
      this.chatMenuSettings[0].items = this.friendsList;
    });
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
  }

  async getPosts(){
    let usersId = [];
    this.usersOfPost = [];
    this.newPublications = false;
    await this.postSrv.getPosts(this.authSrv.getToken(), [...this.user.contacts], this.user._id).then( async (res) => {
      console.log("POSTS =>", res);
      if(res.length > 0){
        this.listPost = [];
        for(let post of res){
          //Obtiene Imagen de Post
          for(let p of post){
            await this.postSrv.getPostImage(this.authSrv.getToken(), p.imgURL).then( imgUrl => {
              if(imgUrl != '' && !imgUrl.error){
                let reader = new FileReader();
                reader.readAsDataURL(imgUrl);
                reader.onload = (_event) => {
                  p.imgURL = reader.result.toString();
                }
              }else{
                p.imgURL = '';
              }
            });
            this.listPost.push(p);
          }
        }
      }
    });

    this.listPost.sort((a,b) => <any>new Date(b.createdAt) - <any>new Date(a.createdAt)); //Ordenamos por los mas recientes
    this.listPost.forEach(post => {
      usersId.push(post.propietaryId);
    });

    //Obtiene userInfo de cada Post
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

  resetCreatePostModal(){
    this.displayCreatePostModal=false;
    this.isPosting = true;
    this.imgChangeEvt = '';
    this.cropImgPreview = '';
    this.uploadedImage.imgURL = '', this.uploadedImage.lastSize = ''; this.uploadedImage.newSize = '';
    this.compressingFile = false;
    this.fileOverLimit = false;
    this.postForm.controls['imgURL'].setValue('');
    this.postForm.controls['title'].setValue('');
    this.postForm.controls['description'].setValue('');
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
        likes: [],
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
        this.resetCreatePostModal();
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

  
  onChangeImage(event){
    this.imgChangeEvt = event;
    this.fileOverLimit = false;
    this.compressingFile = true;
  }

  cropImg(event){//NO BORRAR NECESARIO PARA IMAGE-CROPPER
    this.cropImgPreview = this.bImgSrv.cropImage(event);
    console.log("Croping Image...");
    this.compressingFile = true;

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
  //CROPE CONFIG
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



  async likePost(heartIcon, post){
    let postId = post._id;
    let newNotification:Notifications = {
      type: 'like',
      emiterUserId: this.user._id,
      emiterUsername: this.user.username,
      receiveUserId: post.propietaryId,
      receiveUsername: post.propietaryUsername,
      description: 'Le ha gustado tu publicación'
    }
    heartIcon.classList.remove("is-like");
    heartIcon.classList.remove("is-dislike");
    await this.postSrv.likePost(this.authSrv.getToken(), this.user._id, postId, post.propietaryId, newNotification).then( res => {
      if(res.msg == "like"){
        heartIcon.classList.remove("fa-heart-broken");
        heartIcon.classList.add("fa-heart");
        heartIcon.classList.add("is-like");
      }if(res.msg == "dislike"){
        heartIcon.classList.remove("fa-heart");
        heartIcon.classList.add("fa-heart-broken");
        heartIcon.classList.add("is-dislike");
      }
    });
  }

}
