import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthServices } from '../../core/services/auth.service';
import { Route, Router } from '@angular/router';


@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(AuthServices);
  private router = inject(Router);
  
  email: string = '';
  password: string = '';
  loading = signal(false);
  error = signal('');
  errorMessage = '';
  profiles = [
    { email: 'test1@gmail.com', password: '123456' },
    { email: 'test2@gmail.com', password: '123456' },
    { email: 'test3@gmail.com', password: '123456' },
  ];

  selectProfile(profile: { email: string; password: string }) {
    this.email = profile.email;
    this.password = profile.password;
  }

  async onSubmit() {
    this.loading.set(true);
    this.error.set('')

    try {
      const success = await this.auth.login(this.email, this.password);
      if (!success) {
        this.error.set("Contraseña incorrecta");
      } else {
        this.router.navigate(["/home"]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.loading.set(false);
    }
  }
  //servicio de auntenticacion (crear service authenticator)


}

