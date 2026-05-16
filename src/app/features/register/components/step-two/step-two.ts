import { Component, EventEmitter, Output , Input} from '@angular/core';
import { FormBuilder, FormGroup,ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-step-two',
  imports: [ReactiveFormsModule],
  templateUrl: './step-two.html',

})
export class StepTwo {
   @Output() submit = new EventEmitter<void>();
   @Input() registerForm!: FormGroup;
   @Output() prev = new EventEmitter<void>();
   @Input() loading: boolean = false;
}
