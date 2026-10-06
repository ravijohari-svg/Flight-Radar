import { Component, Injectable, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import Swal from "sweetalert2";

@Injectable({
  providedIn: 'root'
})
export class SwaltsFileAuthority implements OnInit {

  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      // confirmButton: 'btn alert-login-button mb-3 px-4',
      // cancelButton: 'btn alert-cancel-button mb-3 px-4 mx-2',
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
    if (type == 'mission-approve') {
      this.swalWithBootstrapButtons.fire({
        // background: '#0a0d14',
        background: '#1b1f27',
        text: 'Please confirm once to approve the mission',
        focusConfirm: false,
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: 'Confirm',
        // onOpen: () => Swal.getCancelButton().focus()
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigateByUrl('operator/operator-app/dashboard');
        }
      });
    }
  }
}