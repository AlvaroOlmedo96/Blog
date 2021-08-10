import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { PostsService } from 'src/app/services/posts.service';
import { UsersService } from 'src/app/services/users.service';

import { BlobImageService } from 'src/app/services/blobImages.service';

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

  constructor(@Inject(PLATFORM_ID) platformId: Object, private authSrv: AuthService, private postSrv:PostsService, private formBuilder: FormBuilder, 
  private userSrv:UsersService, private bImgSrv: BlobImageService) { 
    this.isBrowser = isPlatformBrowser(platformId);

    this.editProfileForm = this.formBuilder.group({
      profileImg: new FormControl(''),
      profileCoverImg: new FormControl(''),
      biography: new FormControl(this.user.biography),
    });

  }

  ngOnInit(): void {
    this.items = [
      {label: 'Publicaciones', icon: '', command: (event) => {
        //this.
      }},
      {label: 'Contactos', icon: ''},
    ];
    this.activeItem = this.items[0];

    this.initCharge();
  }

  async initCharge(){
    if(this.isBrowser){this.modalWidth = (window.innerWidth <= 1150) ? {width: '90vw'} : {width: '30vw'}};
    await this.getProfile();
    await this.getMyPosts();
    this.chargingData = false;
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
    this.postSrv.getPostsById(this.authSrv.getToken(), this.user.posts).then( async res => {
      this.userPosts = res;
      for(let post of this.userPosts){
        //Obtiene Imagen de Post
        await this.postSrv.getPostImage(this.authSrv.getToken(), post.imgURL).then( async imgUrl => {
          if(!imgUrl.error){
            let reader = new FileReader();
            reader.readAsDataURL(imgUrl);
            reader.onload = async (_event) => {
              post.imgURL = await reader.result.toString();
            }
          }else{
            post.imgURL = '';
          }
        }).catch( error => {
          console.log(error);
        });
      }
    }).catch( error => {
      this.userPosts = [];
    });
  }

  showEditProfile(){
    this.displayEditProfileModal = true;
  }

  openFile(inputId){
    this.lastFileOpened = inputId;
    document.getElementById(inputId).click();
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
            console.warn("Archivo demasiado grande");
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
    });

    this.isUpdatingProfile = false;
    this.resetProfileModal();
  }

}
