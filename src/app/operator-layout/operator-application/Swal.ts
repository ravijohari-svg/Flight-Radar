import { Component, Injectable, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import Swal from "sweetalert2";

@Injectable({
  providedIn: 'root'
})
export class SwaltsFile implements OnInit {

  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      cancelButton: 'btn btn-dark-border mb-3 px-4 mx-2',
      confirmButton: 'btn primary-btn mb-3 px-4',
      title: 'alert-title',
      // text : 'alert-text'
      // cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false
  })
  constructor(private router: Router) { }
  ngOnInit() {

  }
  showSwal(type, option1?) {
    if (type == 'missionCreationSuccess') {
      this.swalWithBootstrapButtons.fire({
        background: '#1b1f27',
        text: 'Mission Created Successfully',
        focusConfirm: false,
        showCancelButton: false,
        allowOutsideClick: false,
        confirmButtonText: 'Okay',
        // onOpen: () => Swal.getCancelButton().focus()
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigateByUrl('operator/operator-app/dashboard');
        }
      });
    } else  if (type == 'droneRegistrationSuccess') {
      this.swalWithBootstrapButtons.fire({
        background: '#1b1f27',
        text: 'Drone Registered Successfully',
        focusConfirm: false,
        showCancelButton: false,
        allowOutsideClick: false,
        confirmButtonText: 'Okay',
        // onOpen: () => Swal.getCancelButton().focus()
      }).then((result) => {
        if (result.isConfirmed) {
          // this.router.navigateByUrl('operator/operator-app/dashboard');
          this.router.navigateByUrl('operator/operator-app/drones-gears/list');
        }
      });
    } 
    else  if (type == 'droneUpdateSuccess') {
      this.swalWithBootstrapButtons.fire({
        background: '#1b1f27',
        text: 'Drone Updated Successfully',
        focusConfirm: false,
        showCancelButton: false,
        allowOutsideClick: false,
        confirmButtonText: 'Okay',
        // onOpen: () => Swal.getCancelButton().focus()
      }).then((result) => {
        if (result.isConfirmed) {
          // this.router.navigateByUrl('operator/operator-app/dashboard');
          this.router.navigateByUrl('operator/operator-app/drones-gears/list');
        }
      });
    }
  }

}