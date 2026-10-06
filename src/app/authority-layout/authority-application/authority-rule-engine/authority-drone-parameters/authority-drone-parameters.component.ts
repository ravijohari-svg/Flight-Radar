import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';

//Ngx Bootstrap
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-authority-drone-parameters',
  templateUrl: './authority-drone-parameters.component.html',
  styleUrls: ['./authority-drone-parameters.component.scss'],
})
export class AuthorityDroneParametersComponent implements OnInit {
  //Loader
  loader;
  loaderKey;
  //Drone Parameters
  droneParameters;
  //Modal
  modalRef: BsModalRef;

  //add parameters
  addDroneParameterForm: FormGroup;
  permissionList = [
    {
      Name: 'Manual',
      Value: 'Manual',
    },
    {
      Name: 'Auto Approve',
      Value: 'Auto-Approve',
    },
    {
      Name: 'Auto Reject',
      Value: 'Auto-Reject',
    },
  ];

  //Parameters
  droneParametersArr: any = [
    {
      Category: 'UAV Info',
      Parameters: [
        {
          Value: 'uav-info-type',
          Name: 'Type',
        },
        {
          Value: 'uav-info-class',
          Name: 'Class',
        },
        {
          Value: 'uav-info-gps-type',
          Name: 'GPS Type',
        },
      ],
    },
    {
      Category: 'UAV Make Info',
      Parameters: [
        {
          Value: 'uav-make-info-manufacturer',
          Name: 'Manufacturer',
        },
      ],
    },
    {
      Category: 'Avionics',
      Parameters: [
        {
          Value: 'avionics-flight-controller',
          Name: 'Flight Controller',
        },
        {
          Value: 'avionics-gcs',
          Name: 'Flight GCS',
        },
        {
          Value: 'avionics-protocol',
          Name: 'Flight Protocol',
        },
      ],
    },
    {
      Category: 'COMMS',
      Parameters: [
        {
          Value: 'comms-type',
          Name: 'Type',
        },
      ],
    },
  ];

  submitted;
  selectedDropDownType;

  //Editing Drone Parameters
  editFlag;
  editingDroneType;

  //Swal
  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn primary-btn mb-3 px-4',
      cancelButton: 'btn btn-dark-border mb-3 px-4 mx-2',
      title: 'alert-title',
      // text : 'alert-text'
      // cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false,
  });

  constructor(
    private authorityApi: AuthorityapisService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  // This function displays a confirmation in the form of a
  // dialog asking the user to confirm before editing,deleting,updating the drone parameter
  showSwal(type, option1?, option2?) {
    switch (type) {
      case 'edit-droneParameter':
        this.swalWithBootstrapButtons
          .fire({
            background: '#1b1f27',
            text: 'Are you sure? Please confirm once to update values',
            focusConfirm: false,
            showCancelButton: true,
            allowOutsideClick: false,
            confirmButtonText: 'Confirm',
          })
          .then((result) => {
            if (result.isConfirmed) {
              this.updateDroneParameters();
            }
          });
        break;
      case 'update-drone-success':
        this.swalWithBootstrapButtons.fire({
          background: '#1b1f27',
          text: 'Updated Successfully',
          icon: 'success',
          focusConfirm: false,
          showCancelButton: false,
          showConfirmButton: false,
          allowOutsideClick: false,
          timer: 1000,
        });
        break;
      case 'delete-droneParameter':
        this.swalWithBootstrapButtons
          .fire({
            background: '#1b1f27',
            text: "Are you sure? You won't be able to revert back?",
            focusConfirm: false,
            showCancelButton: true,
            allowOutsideClick: false,
            confirmButtonText: 'Delete',
          })
          .then((result) => {
            if (result.isConfirmed) {
              this.onDeleteDroneParameters(option1, option2);
            }
          });
        break;
      default:
        break;
    }
  }

  ngOnInit(): void {
    // this.showSwal('update-drone-success');
    this.initialFunction();
  }

  initialFunction() {
    this.getDroneParameter();
    this.addDroneParameterForm = this.fb.group({
      Value: ['', Validators.required],
      Permission: ['', [Validators.required]],
    });
  }

  //This function show all the category and their parameter in the drone parameters
  async getDroneParameter() {
    this.loader = true;
    this.loaderKey = 'getDroneParameter';
    try {
      const res = await this.authorityApi.getDroneParameters();
      this.loader = false;
      const droneParameters = res.data.MainData;
      const droneParametersArr = this.droneParametersArr.map((parameters) => {
        const updatedParameters = parameters.Parameters.map((values) => {
          for (const [key, value] of Object.entries(droneParameters)) {
            if (key === values.Value) {
              return { ...values, Types: value };
            }
          }
          return values;
        });
        return { ...parameters, Parameters: updatedParameters };
      });
      this.droneParameters = droneParametersArr;
    } catch (err) {
      this.loader = false;
    }
  }
  //After any successfully edition,deletion,addition of drone parameter this function is to update
  //the  drone parameters
  updatedDronesAndGear(res) {
    this.onCancel();
    const droneParameters = res.data.MainData;
    this.droneParametersArr.forEach((parameters) => {
      parameters.Parameters.forEach((values) => {
        for (const [key, value] of Object.entries(droneParameters)) {
          if (key === values.Value) {
            values.Types = value;
            values.Types = values.Types.filter((el) => el !== null);
            break;
          }
        }
      });
    });
    this.droneParameters = this.droneParametersArr;
  }

  // This function is called when the user clicks on one of the radio buttons to
  // select a permission type. It updates the Permission field value in the addDroneParameterForm
  // group with the selected value. This is done using the patchValue() method, which updates
  // the value of the specified form control without affecting the other controls in the form.
  onPermissionChange(Permission) {
    this.addDroneParameterForm.patchValue({
      Permission: Permission,
    });
  }

  //By clicking on the add button this function will open a add parameter window
  addDroneParameter(addDrone: TemplateRef<any>, dropdownType) {
    this.modalRef = this.modalService.show(addDrone, {
      class: 'modal-dialog-centered gray',
      backdrop: 'static',
      keyboard: false,
    });
    this.selectedDropDownType = dropdownType;
  }

  //In add parameter window after filling information when we click the add button
  // your information will add
  addDroneParameterSubmit(dropdownType) {
    this.submitted = true;
    if (this.addDroneParameterForm.valid) {
      this.loader = true;
      let payload = {
        DropDownType: this.selectedDropDownType,
        ...this.addDroneParameterForm.value,
      };
      this.authorityApi.addDroneParameter(payload).then(
        (res) => {
          this.loader = false;
          this.showSwal('update-drone-success');
          this.updatedDronesAndGear(res);
          // this.redirectTo('authority/authority-app/rule-engine');
        },
        (err) => {
          this.loader = false;
        }
      );
      this.modalService.hide();
    }
  }

  // This function is a getter that returns the form controls of the addDroneParameterForm form group
  get droneParameter() {
    return this.addDroneParameterForm.controls;
  }

  //Editing Drone Parameter
  //By clicking on the edit button this function will open a Apply parameter window
  onEditDroneParameters(addDrone: TemplateRef<any>, type, dropdownType) {
    this.editFlag = true;
    this.selectedDropDownType = dropdownType;
    this.addDroneParameterForm.patchValue({
      Value: type.Value,
      Permission: type.Permission,
    });
    this.editingDroneType = type;
    this.modalRef = this.modalService.show(addDrone, {
      class: 'modal-dialog-centered gray',
      backdrop: 'static',
      keyboard: false,
    });
  }

  //By clicking on the apply button in the Apply parameter window this function will call a function updateDroneParameter()
  //and update your details.
  editDroneParameterSubmit() {
    this.submitted = true;
    if (this.addDroneParameterForm.valid) {
      // this.showSwal('edit-droneParameter');
      this.updateDroneParameters();
    }
  }

  //This function will call an api to updated the above details in the drone parameters
  updateDroneParameters() {
    this.loader = true;
    let payload = {
      DropDownType: this.selectedDropDownType,
      ...this.addDroneParameterForm.value,
      Id: this.editingDroneType.Id,
    };
    this.authorityApi.editDroneParameter(payload).then(
      (res) => {
        this.loader = false;
        this.showSwal('update-drone-success');
        this.updatedDronesAndGear(res);
        // this.redirectTo('authority/authority-app/rule-engine');
      },
      (err) => {
        this.loader = false;
      }
    );
    this.modalService.hide();
  }

  //Delete Parameter
  //BY clicking on the delete button this function will delete the above parameter
  onDeleteDroneParameters(type, dropdownType) {
    this.loader = true;
    let payload = {
      DropDownType: dropdownType,
      Id: type.Id,
    };
    this.authorityApi.deleteDroneParameter(payload).then(
      (res) => {
        this.loader = false;
        this.showSwal('update-drone-success');
        this.updatedDronesAndGear(res);
        // this.redirectTo('authority/authority-app/rule-engine');
      },
      (err) => {
        this.loader = false;
      }
    );
  }

  //Implementation of the trackBy option
  getCategory(index: number, category: any): string {
    return category.Category;
  }

  getParameter(index: number, parameter: any): string {
    return parameter.Name;
  }

  getItemId(index: number, type: any): string {
    return type.Value;
  }

  getPermission(index: number, permission: any): string {
    return permission.Name;
  }

  //Cancel
  onCancel() {
    this.addDroneParameterForm.reset();
    this.modalRef.hide();
    this.submitted = false;
    this.editFlag = false;
  }
  //Redirect to same URL
  redirectTo(uri: string) {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([uri]));
  }
}
