import { Component, inject, signal } from '@angular/core';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthServices } from '../../core/services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login {  
  private auth = inject(AuthServices);
  private router = inject(Router);
  private fb = inject(FormBuilder);
   
  mouseX = 0;
  mouseY = 0;

  onMouseMove(event: MouseEvent): void {

    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;

    // intensidad del efecto
    const strength = 10;

    this.mouseX = x * strength;
    this.mouseY = y * strength;
  }

  constructor() {
    this.loginForm.valueChanges.subscribe(() => this.error.set('')); //"borro" el error de contraseña incorrecta o se pisa con el de minimo de caracteres
  }


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

  loginForm = this.fb.group({ // angular crea un Typed Form asi q los values ya no son ANY (mi bbdd no recibe edad como string -> debo convertirlo a number)
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(6)]]
  });

  selectProfile(profile: { email: string; password: string }) { //para autorellenar el login
    this.loginForm.patchValue(profile);
  }

  async onSubmit() {
    this.loading.set(true);
    this.error.set('')

    try {
      const { email, password } = this.loginForm.getRawValue();
      if (!email || !password) return;

      const result = await this.auth.login(email, password);

      if (!result.success) {
        if (result.error?.includes('Invalid login credentials')) {
          this.error.set('Contraseña incorrecta')}
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

