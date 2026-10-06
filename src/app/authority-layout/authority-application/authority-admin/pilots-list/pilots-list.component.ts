import { Component, OnInit } from '@angular/core';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';
import Swal from 'sweetalert2';
import html2PDF from 'jspdf-html2canvas';

@Component({
  selector: 'app-pilots-list',
  templateUrl: './pilots-list.component.html',
  styleUrls: ['./pilots-list.component.scss'],
})
export class PilotsListComponent implements OnInit {
  //loader
  loader;
  generateCertificateLoader;
  // Pilot/Operators data
  getOperatorsDetails;
  getOperatorsDetailsValid;
  operatorData;
  operatorDataValidtimeout;
  //search
  pilotsSearchBy = [];
  selected;
  userDetailsVal;
  rawData;
  searchByFlag;
  selectedOption = '';
  //Dropdown for filter
  subscriptionArr = ['Premium', 'Advanced', 'Basic', 'Free'];
  //configration of alert messages
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

  constructor(private authorityApi: AuthorityapisService) {}

  ngOnInit(): void {
    this.initialApiCall();
  }

  //Contain those functionality needed at first run of this component
  initialApiCall() {
    this.loader = true;

    //API with promises (New version)
    //API to get Operators/ Pilots data
    this.authorityApi.getOperatorsDetails().then(
      (res) => {
        this.getOperatorsDetails = res['data']?.MainData;
        this.getOperatorsDetailsValid = res['data']?.MainData;
        let arr = [];
        this.rawData = this.getOperatorsDetails;
        if (this.getOperatorsDetails.length != 0) {
          //Search bar data
          this.getOperatorsDetails.map((val) => {
            arr.push({
              UserId: val.UserId,
              Name: val.FirstName + ' ' + val.LastName,
              Country: val.Country,
              custom:
                val.UserId +
                ', ' +
                val.Country +
                ', ' +
                val.FirstName +
                ' ' +
                val.LastName,
            });
          });
          this.pilotsSearchBy = arr;
        }
        this.loader = false;
      },
      (err) => {
        this.loader = false;
      }
    );
  }

  //Confirmation before deleting an existing Pilot or Operator user
  deleteOperators(operatorsData) {
    this.showSwal(
      'Are you sure you want to delete this Operator',
      operatorsData.UserId
    );
  }

  //After confirmation to delete
  deleteOperatorsCall(operatorsData) {
    this.loader = true;
    let payload = {
      UserId: operatorsData,
    };
    //API to delete operators or Pilot
    this.authorityApi.getDeleteOperators(payload).then(
      (res) => {
        this.loader = false;
        if (res['data']?.MainData == 'Operator deleted successfully') {
          this.showSwal('Operator deleted successfully', 'optional');
        }
      },
      (err) => {
        this.showSwal('deleteOperatorsErr', err?.error?.error?.message);
      }
    );
  }

  // Alert/Confirmation and Pop-up  methods
  showSwal(type, UserId) {
    if (type == 'Are you sure you want to delete this Operator') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'warning',
          background: '#1b1f27',
          title: `Are you sure you want to delete this Operator?`,
          text: `This action cannot be undone.`,
          focusConfirm: false,
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.deleteOperatorsCall(UserId);
          }
          if (result.isDismissed) {
            // console.log("denied")
          }
        });
    }
    if (type == 'Operator deleted successfully') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'success',
          background: '#1b1f27',
          title: `Operator deleted successfully`,
          // text:`Password reset successfully`,
          focusConfirm: false,
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.initialApiCall();
          }
        });
    }
    if (type == 'Successfully Sent certification report') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'success',
          background: '#1b1f27',
          title: `Successfully Sent certification report`,
          // text:`Password reset successfully`,
          focusConfirm: false,
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
        })
        .then((result) => {
          // if (result.isConfirmed) {
          //   this.initialApiCall();
          // }
        });
    }
    if (type == 'deleteOperatorsErr') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'error',
          background: '#1b1f27',
          title: `Error`,
          text: UserId,
          focusConfirm: false,
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
        })
        .then((result) => {
          if (result.isConfirmed) {
          }
        });
    }
  }

  //Search
  searchByOnSelect(e) {
    this.searchByFlag = true;
    this.getOperatorsDetails = this.rawData;
    this.getOperatorsDetails = this.getOperatorsDetails.filter((data) => {
      return data.UserId == e.item.UserId ? data : null;
    });
  }
  //clear Search or reset
  clearSearch() {
    this.selected = '';
    this.searchByFlag = false;
    this.getOperatorsDetails = this.rawData;
    this.selectedOption = '';
  }
  onKeyDownEvent(e) {
    if (e.keyCode == 13) {
      this.onSearchKeyWord();
    }
  }
  //on key press to search perticular authority or regulator from search bar
  onSearchKeyWord() {
    this.searchByFlag = true;
    this.getOperatorsDetails = this.rawData;
    let fileteredArr = this.pilotsSearchBy
      .filter((data) => {
        return data.custom.toLowerCase().includes(this.selected.toLowerCase());
      })
      .map((data) => {
        return data.UserId;
      });
    this.getOperatorsDetails = this.getOperatorsDetails.filter((data) => {
      return fileteredArr.includes(data.UserId);
    });
  }

  //onchange for Subscription dropdown
  filterSubscriptionChange(e) {
    if (e.target.value !== '') {
      this.getOperatorsDetails = this.rawData.filter(
        (data) => data.SubscriptionPlan === e.target.value
      );
    }
  }
  //trackByFlag
  trackByUserId(index: number, operatorsDetails: any): string {
    return operatorsDetails.UserId;
  }
  //generateCertificate
  async generateCertificate(data) {
    this.loader = true;
    this.generateCertificateLoader = true;
    if (this.operatorDataValidtimeout)
      clearTimeout(this.operatorDataValidtimeout);
    this.operatorData = data;

    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    this.operatorData.currentDate = date.toLocaleDateString(undefined, options);
    const certificate = document.getElementById('certificate');
    await new Promise(
      (resolve) => (this.operatorDataValidtimeout = setTimeout(resolve, 1000))
    );
    certificate.style.height = 'max-content';
    certificate.style.padding = '30px';
    const pdf = await html2PDF(certificate, {
      jsPDF: {
        format: 'a4',
        unit: 'px',
        orientation: 'landscape',
      },
      imageType: 'image/jpeg',
      imageQuality: 1,

      success: (pdf) => {
        certificate.style.height = '0';
        certificate.style.padding = '0';

        var blob = pdf.output('blob');
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          // pdf.save('certificate.pdf');
          const base64Report = reader.result;
          this.storeCertificate(base64Report, this.operatorData.UserId);
        };
      },
    });
    certificate.style.height = '0';
    certificate.style.padding = '0';

    this.generateCertificateLoader = false;
  }

  storeCertificate(base64Certificate, UserId) {
    const payload = {
      OperatorId: UserId,
      CertificationBase64: base64Certificate,
      CertificationDocType: 'pdf',
    };
    this.authorityApi
      .storeCertificate(payload)
      .then((res) => {
        this.loader = false;
        if(res.data.MainData ===  'Successfully Sent certification report'){
       this.showSwal(
          'Successfully Sent certification report',
          ''
        );
        }
      })
      .catch((err) => {
        this.loader = false;
      });
  }
}
