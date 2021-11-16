import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public user: any;

  constructor(private router: Router, public auth: AngularFireAuth) {
    this.auth.authState.subscribe(user => {
      if (user) {
        this.user = user;
      } else {
        this.user = null;
      }
    })
   }
  
  async login() {
    await this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    this.router.navigate(['/my-calendar']);
  }
  logout() {
    this.auth.signOut();
    this.router.navigate(['/login']);
  }
}
