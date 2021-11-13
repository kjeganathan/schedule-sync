import { Component, OnInit } from '@angular/core';
import { SocialAuthService } from "angularx-social-login";
import { SocialUser } from "angularx-social-login";
import { GoogleLoginProvider } from "angularx-social-login";
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
   public user: SocialUser = new SocialUser;
   	constructor(private authService: SocialAuthService) {}
ngOnInit() {
      this.authService.authState.subscribe(user => {
      this.user = user;
      console.log(user);
    });
  }
  public signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }
  public signOut(): void {
    this.authService.signOut();
  }
}