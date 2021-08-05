import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  isBrowser:boolean = false;

  displayModal:boolean = false;

  modalWidth = {width: '80vw'};

  user: User = {
    username: '',
    email: '',
    password: '',
    roles: []
  };
  signInForm: FormGroup;
  signUpForm: FormGroup;

  loadSignIn:boolean = false;
  loadSignUp:boolean = false;

  errors = {
    email_signIn: {
      error: false,
      msg: ''
    },
    password_signIn: {
      error: false,
      msg: ''
    },
    username_signUp: {
      error: false,
      msg: ''
    },
    email_signUp: {
      error: false,
      msg: ''
    },
    password_signUp: {
      error: false,
      msg: ''
    },
    c_password_signUp: {
      error: false,
      msg: ''
    }
  };

  errorReq = [
    {severity:'error', summary:'Error', detail:'Message Content', status: 0}
  ];

  constructor(@Inject(PLATFORM_ID) platformId: Object, private formBuilder: FormBuilder, private authSrv: AuthService, private router:Router) {
    this.isBrowser = isPlatformBrowser(platformId);

    this.signInForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email, Validators.minLength(4)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
    this.signUpForm = this.formBuilder.group({
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.minLength(4)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      c_password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  ngOnInit(): void {
    if(this.isBrowser){this.modalWidth = (window.innerWidth <= 800) ? {width: '90vw'} : {width: '30vw'}};
  }

  showModalDialog() {
    this.displayModal = true;
  }

  signIn(){
    this.loadSignIn = true;
    
    if(this.signInForm.controls['email'].invalid){
      this.errors.email_signIn.error = true;
      this.errors.email_signIn.msg = (this.signInForm.controls['email'].value.length > 0) ? 'Debe cumplir formato example@gmail.com' : 'Campo requerido';
    }else{
      this.errors.email_signIn.error = false;
    }
    if(this.signInForm.controls['password'].invalid){
      this.errors.password_signIn.error = true;
      this.errors.password_signIn.msg = (this.signInForm.controls['password'].value.length > 0) ? 'Debe tener al menos 6 caractéres' : 'Campo requerido';
    }else{
      this.errors.password_signIn.error = false;
    }

    if(this.signInForm.valid){
      this.user.email = this.signInForm.controls['email'].value.toString();
      this.user.password = this.signInForm.controls['password'].value.toString();
      this.authSrv.signIn(this.user).then( res => {
        if(res.status){
          this.errorReq[0].status = res.status;
          this.errorReq[0].detail = res.error.message;
        }else{
          this.errorReq[0].status = 0;
          this.errorReq[0].detail = '';
          this.authSrv.saveToken(res.token);
          this.router.navigate(['/home']);
        }
        this.loadSignIn = false;
      });
    }else{
      this.loadSignIn = false;
      return;
    }
  }

  signUp(){
    this.loadSignUp = true;
    if(this.signUpForm.controls['username'].invalid){
      this.errors.username_signUp.error = true;
      this.errors.username_signUp.msg = (this.signUpForm.controls['username'].value.length > 0) ? 'Debe cumplir formato example@gmail.com' : 'Campo requerido';
    }else{
      this.errors.username_signUp.error = false;
    }
    if(this.signUpForm.controls['email'].invalid){
      this.errors.email_signUp.error = true;
      this.errors.email_signUp.msg = (this.signUpForm.controls['email'].value.length > 0) ? 'Debe cumplir formato example@gmail.com' : 'Campo requerido';
    }else{
      this.errors.email_signUp.error = false;
    }
    if(this.signUpForm.controls['password'].invalid){
      this.errors.password_signUp.error = true;
      this.errors.password_signUp.msg = (this.signUpForm.controls['password'].value.length > 0) ? 'Debe tener al menos 6 caractéres' : 'Campo requerido';
    }else{
      this.errors.password_signUp.error = false;
    }
    if(this.signUpForm.controls['c_password'].invalid){
      this.errors.c_password_signUp.error = true;
      this.errors.c_password_signUp.msg = (this.signUpForm.controls['c_password'].value.length > 0) ? 'Debe tener al menos 6 caractéres' : 'Campo requerido';
    }
    console.log(this.signUpForm.controls['c_password'].value +"!=" + this.signUpForm.controls['password'].value)
    if(this.signUpForm.controls['c_password'].value != this.signUpForm.controls['password'].value){
      this.errors.c_password_signUp.error = true;
      this.errors.c_password_signUp.msg = 'Las contraseñas no coinciden';
    }else{
      this.errors.c_password_signUp.error = false;
    }
    
    if(this.signUpForm.valid){
      this.user.username = this.signUpForm.controls['username'].value.toString();
      this.user.email = this.signUpForm.controls['email'].value.toString();
      this.user.password = this.signUpForm.controls['password'].value.toString();
      this.user.roles = [];
      this.authSrv.signUp(this.user).then( res => {
        if(res.status){
          this.errorReq[0].status = res.status;
          this.errorReq[0].detail = res.error.message;
        }else{
          this.errorReq[0].status = 0;
          this.errorReq[0].detail = '';
          this.authSrv.saveToken(res.token);
          this.router.navigate(['/home']);
        }
        this.loadSignIn = false;
      });
    }else{
      this.loadSignUp = false;
      return;
    }
    
  }

}
