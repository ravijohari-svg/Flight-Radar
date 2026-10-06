import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm!: FormGroup;

  
 swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn primary-btn mb-3 px-4',
      cancelButton: 'btn btn-dark-border mb-3 px-4 mx-2',
      title: 'alert-title',
      //  text : 'alert-text'
      // cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false,
  });
  constructor(private fb: FormBuilder,
    private operatorApiService : OperatorapisService
  ) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      Name: ['', Validators.required],
      LastName: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Company: ['', Validators.required],
      Phone: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$') 
      ]],
      Role: ['', Validators.required],
      Message: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      let payload = {
        ...this.contactForm.value,
        FromUTM: 'UTM'
      }
      this.operatorApiService.contactDetails(payload).then((res) => {

        this.swalWithBootstrapButtons
        .fire({
          icon: 'success',
          background: '#1b1f27',
          title: `Thank you for your interest in Skye UTM!`,
          text: 'Our team will connect with you soon to schedule your Skye UTM demo',
          focusConfirm: false,
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'Close',
        })
        .then((result) => {
        });
        this.contactForm.reset();
      }).catch((err) => {
        console.error(' API Error:', err);
      });

      
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}