import { Component, inject, numberAttribute } from '@angular/core';
import { StepOne } from './components/step-one/step-one';
import { StepTwo } from './components/step-two/step-two';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthServices } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';


@Component({
  selector: 'app-register',
  imports: [StepOne, StepTwo, ReactiveFormsModule],
  templateUrl: './register.html',
})
export class Register {

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthServices);

  userService = inject(UserService);

  mouseX = 0;
  mouseY = 0;

  step = 1;
  loading = false;

  
  registerForm = this.fb.nonNullable.group({ // angular crea un Typed Form asi q los values ya no son ANY (mi bbdd no recibe edad como string -> debo convertirlo a number)
  nombre: ["", [Validators.required]],
  apellido: ["", [Validators.required]],
  edad: ["", [Validators.required, Validators.pattern("^[0-9]+$")]],
  mail: ["", [Validators.required, Validators.email]],
  contrasena: ["", [Validators.required, Validators.minLength(6)]]
});

  constructor() {
    this.registerForm.get('mail')?.valueChanges.subscribe(() => {
      const control = this.registerForm.get('mail');
      if (control?.hasError('alreadyRegistered')) {
        const errors = { ...control.errors };
        delete errors['alreadyRegistered'];
        control.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    });
  }


  async handleSubmit(): Promise<void> {
    if(this.loading) return;  
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid || this.loading) return;
    
    this.loading = true;

    const { nombre, apellido, edad, mail, contrasena } = this.registerForm.getRawValue(); //getRawValue() devuelve TODOS los campos incluso los disabled

    const profile = { nombre, apellido, edad: Number(edad) }; //guardamos los datos que van a ser insertados a la tabla

    try {
      // 1. AUTH
    
      const { data, error } = await this.authService.register(mail, contrasena); //llamo a la funcion y paso parametros

      if (error) {
        this.registerForm.get('mail')?.setErrors({ alreadyRegistered: true });
        this.registerForm.get('mail')?.markAsTouched();
        this.loading = false;
        return;
      } //si no hay error, se tuvo que crear un auth user

      const userId = data.user?.id //si se creó sin ID, error

      if (!userId) { 
        console.error("No se pudo obtener el usuario");
        this.loading = false; //cancelamos y cortamos el flujo
        return;
      }

      // 2. PROFILE
      const { error: profileError } = //mandamos el id para vincular authUser con userProfile  (se decide que son LA MISMA persona-)
        
      await this.userService.createProfile(userId, profile);

      if (profileError) {
        console.error(profileError.message);
        
        this.loading = false;
        return;
      }

      console.log("Registrado correctamente");
      this.authService.currentUser.set({id: userId, email: mail});
      this.authService.userProfile.set(profile);
      this.router.navigate(['/home']);

    } finally {
      this.loading = false;
    }
  };

  next() {
    this.registerForm.get('nombre')?.markAsTouched();
    this.registerForm.get('apellido')?.markAsTouched();
    this.registerForm.get('edad')?.markAsTouched();

    if (
      this.registerForm.get('nombre')?.invalid ||
      this.registerForm.get('apellido')?.invalid ||
      this.registerForm.get('edad')?.invalid
    ) {
      return;
    }

    this.step = 2;
  };

  prev() {
    this.step--;
  };

  onMouseMove(event: MouseEvent): void {

    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;

    // intensidad del efecto
    const strength = 10;

    this.mouseX = x * strength;
    this.mouseY = y * strength;
  };
}