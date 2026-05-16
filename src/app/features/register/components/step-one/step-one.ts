import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-step-one',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './step-one.html',
})

export class StepOne {
   @Output() next = new EventEmitter<void>();
   @Input() registerForm!: FormGroup;
   
}
