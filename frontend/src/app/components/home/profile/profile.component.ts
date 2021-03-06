import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { PostsService } from 'src/app/services/posts.service';
import { UsersService } from 'src/app/services/users.service';

import { BlobImageService } from 'src/app/services/blobImages.service';
import { SocketWebService } from 'src/app/services/socket-web.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  chargingData:boolean = true;
  isBrowser:boolean = false;

  editProfileForm: FormGroup;
  isUpdatingProfile: Boolean = false;

  items: MenuItem[];
  activeItem: MenuItem;

  displayEditProfileModal:boolean = false;
  modalWidth = {width: '80vw'};

  user:User = {
    username : '',
    profileImg: '',
    profileCoverImg: '',
    biography: ''
  };
  profileImg: string = '';
  profileCoverImg: string = '';

  uploadImg:any = {profileImg: '', profileCoverImg: ''};
  compressingFile: boolean = false;
  fileOverLimit: boolean = false;
  lastFileOpened = '';

  userPosts = [];
  postSettings: MenuItem[];

  contacts = [];

  constructor(@Inject(PLATFORM_ID) platformId: Object, private authSrv: AuthService, private postSrv:PostsService, private formBuilder: FormBuilder, 
  private userSrv:UsersService, private bImgSrv: BlobImageService, private socketSrv: SocketWebService) { 
    this.isBrowser = isPlatformBrowser(platformId);

    this.editProfileForm = this.formBuilder.group({
      profileImg: new FormControl(''),
      profileCoverImg: new FormControl(''),
      biography: new FormControl(this.user.biography),
    });

    this.postSettings = [
      {label: 'Eliminar post', icon: 'pi pi-trash', command: () => {
        this.deletePost();
      }}
    ];

  }

  ngOnInit(): void {
    this.items = [
      {label: 'Publicaciones', icon: '', command: (event) => {
        this.toggleContent('posts');
      }},
      {label: 'Contactos', icon: '',command: (event) => {
        this.toggleContent('contacts');
      }},
    ];
    this.activeItem = this.items[0];

    this.initCharge();
  }

  async initCharge(){
    if(this.isBrowser){this.modalWidth = (window.innerWidth <= 1150) ? {width: '90vw'} : {width: '30vw'}};
    await this.getProfile();
    await this.getMyPosts();
    await this.getContacts();
    this.chargingData = false;
  }

  showContacts: boolean = false;
  showPosts: boolean = true;
  toggleContent(page){
    if(page == 'posts'){this.showContacts = false; this.showPosts = true;}
    if(page == 'contacts'){this.showContacts = true; this.showPosts = false;}
  }


  async getProfile(){
    await this.authSrv.getProfile().then( res => {
      this.user = res.user;
      this.editProfileForm.controls['biography'].setValue(this.user.biography);
      let reader = new FileReader();
      let reader2 = new FileReader();

      if(res.profileImgURL != null && res.profileImgURL != ''){ 
        reader.readAsDataURL(res.profileImgURL);
        reader.onload = (_event) => {
          this.profileImg = reader.result.toString();
          this.uploadImg.profileImg = this.profileImg;
        }
      }else{this.profileImg = '';}

      if(res.profileCoverImgURL != null && res.profileCoverImgURL != ''){ 
        reader2.readAsDataURL(res.profileCoverImgURL);
        reader2.onload = (_event) => {
          this.profileCoverImg = reader2.result.toString();
          this.uploadImg.profileCoverImg = this.profileCoverImg;
        }
      }else{this.profileCoverImg = '';}
    });
  }

  async getMyPosts(){
    await this.postSrv.getPostsById(this.authSrv.getToken(), this.user.posts).then( async res => {
      this.userPosts = res;
      for(let post of this.userPosts){
        //Obtiene Imagen de Post
        await this.postSrv.getPostImage(this.authSrv.getToken(), post.imgURL).then( async imgUrl => {
          if(!imgUrl.error){
            let reader = new FileReader();
            reader.readAsDataURL(imgUrl);
            reader.onload = async (_event) => {
              post.imgURLBlob = await reader.result.toString();
            }
          }else{
            post.imgURLBlob = '';
          }
        }).catch( error => {
          console.log(error);
          post.imgURLBlob = '';
        });
      }
    }).catch( error => {
      this.userPosts = [];
    });
  }

  async getContacts(){
    if(this.user.contacts.length > 0){
      console.log(this.user.contacts);
      this.userSrv.getUsersById(this.authSrv.getToken(), this.user.contacts).then( res =>{
        console.log(res);
        this.contacts = res;
      });
    }
  }

  showEditProfile(){
    this.displayEditProfileModal = true;
  }

  openFile(inputId){
    this.lastFileOpened = inputId;
    document.getElementById(inputId).click();
    console.time('onBasicUpload')
    console.timeEnd('onBasicUpload');
  }

  resetProfileModal(){
    this.displayEditProfileModal=false
    this.lastFileOpened = '';
    this.uploadImg.profileImg = this.profileImg; this.uploadImg.profileCoverImg = this.profileCoverImg;
    this.compressingFile = false;
    this.fileOverLimit = false;
    this.editProfileForm.controls['profileImg'].setValue('');
    this.editProfileForm.controls['profileCoverImg'].setValue('');
  }

  onBasicUpload(event){
    let file = event.target.files[0];
    let quality = { ratio:50, quality: 50};
    if(this.lastFileOpened == 'profileImgInput'){quality = { ratio:50, quality: 25};}
    if(this.lastFileOpened == 'coverImgInput'){quality = { ratio:50, quality: 70};}
    this.fileOverLimit = false;
    this.compressingFile = true;

    //Solo se admiten imagenes
    if(file.type.indexOf('image') > -1){
      let newFile = new File([file], file['name'], { type: 'image/jpeg' });//lo convertimos a jpeg para comprimir mejor
      file = newFile;
      const filename = (file) ? file['name'] : '';
      //Para previsualizar y comprimir
      var reader = new FileReader();
      reader.readAsDataURL(file); 
      reader.onload = (_event) => { 
        //Comprimimos imagen
        this.bImgSrv.compressFile(reader.result.toString(), -1, quality.ratio, quality.quality, filename).then( img => {
          console.log(img);
          if(!img.overLimit){
            if(this.lastFileOpened == 'profileImgInput'){ 
              this.uploadImg.profileImg = img.imgString;
              this.editProfileForm.controls['profileImg'].setValue(img.imgFile);
            }
            if(this.lastFileOpened == 'coverImgInput'){ 
              this.uploadImg.profileCoverImg = img.imgString;
              this.editProfileForm.controls['profileCoverImg'].setValue(img.imgFile);
            }
          }else{
            this.compressingFile = false;
            this.fileOverLimit = true;
          }
          this.compressingFile = false;
        });
      }
    }
  }

  async updateProfile(){
    this.isUpdatingProfile = true;
    const profileImg = this.editProfileForm.controls['profileImg'].value;
    const profileCoverImg = this.editProfileForm.controls['profileCoverImg'].value;

    let credentials = {
      token: this.authSrv.getToken(),
      userId: this.user._id
    }

    let body = {
      token: this.authSrv.getToken(),
      userId: this.user._id,
      biography: this.editProfileForm.controls['biography'].value,
      profileImgURL: this.user.profileImg,
      profileCoverImgURL: this.user.profileCoverImg,
    }
    
    if(profileImg != null && profileImg != undefined && profileImg != ''){
      const formDataProfile = new FormData();
      formDataProfile.append('file', profileImg);
      await this.userSrv.updateProfileImages(credentials, 'profileImg', formDataProfile).then( res => {
        body.profileImgURL = res.profileImgURL;
      });
    }
    if(profileCoverImg != null && profileCoverImg != undefined && profileCoverImg != ''){
      const formDataCover = new FormData();
      formDataCover.append('file', profileCoverImg);
      await this.userSrv.updateProfileImages(credentials, 'profileCoverImg', formDataCover).then( res => {
        body.profileCoverImgURL = res.profileCoverImgURL;
      });
    }

    await this.userSrv.updateProfile(body).then( res => {
      this.displayEditProfileModal = false;   
      this.getProfile();
    });

    this.isUpdatingProfile = false;
    this.resetProfileModal();
  }

  lastPostSelected:any;
  getLastPost(post){
    this.lastPostSelected = post;
  } 
  async deletePost(){
    let post = this.lastPostSelected;
    await this.postSrv.deletePost(this.authSrv.getToken(), post._id, post.propietaryId, post.imgURL).then( async (res) => {
      this.userPosts = this.userPosts.filter( (p) => { return p._id !== post._id; }); 
    });
  }

}
