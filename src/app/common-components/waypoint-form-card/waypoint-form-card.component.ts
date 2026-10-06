import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-waypoint-form-card',
  templateUrl: './waypoint-form-card.component.html',
  styleUrls: ['./waypoint-form-card.component.scss'],
})
export class WaypointFormCardComponent implements OnInit {
  @Input() waypointNo;
  @Input() waypoint;
  @Input() correlationData;
  @Input() submitted;
  @Input() isDisable;
  @Input() showCorr;
  @Output() formValueChanged = new EventEmitter<any>();
  @Output() waypointError = new EventEmitter<any>();
  wayPointForm: FormGroup;
  statusGreen:boolean = false;
  statusYellow:boolean = false;
  statusGreenInitial:boolean = false;
  statusYellowInitial:boolean = false;
  private wayPointSubscription:Subscription;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.wayPointForm = this.fb.group({
      Latitude: [this.waypoint?.value.Latitude || '', [Validators.required]],
      Longitude: [this.waypoint?.value.Longitude || '', [Validators.required]],
      Altitude: [
        this.waypoint?.value.Altitude || 0,
        [Validators.required],
      ],
    });
    this.checkAltCorrelation();
    this.wayPointSubscription = this.wayPointForm.valueChanges.subscribe(() => {
      this.formValueChanged.emit({
        index: this.waypointNo,
        value: this.wayPointForm.value,
      });
      if(this.wayPointForm.value.Altitude > 120){
        this.statusGreen = true;
      }
      else{
        this.statusGreen = false;
        this.statusGreenInitial = false;
      }
      if(this.wayPointForm.value.Altitude >60 && this.correlationData?.outeryellow[this.waypointNo] ){
        this.statusYellow = true;
      }
      else{
        this.statusYellow = false;
        this.statusYellowInitial= false;
      }
      this.waypointError.emit({
        error: this.waypointValue.Latitude.errors || this.waypointValue.Altitude.errors || this.waypointValue.Longitude.errors || null
      })
    });
  }
  checkAltCorrelation(){
    if(this.waypoint?.value.Altitude){
       this.statusYellowInitial = true;
    }
    else{
      this.statusYellowInitial = false;

    }
    if(this.waypoint?.value.Altitude > 120){
      this.statusGreenInitial = true;
   }
   else{
     this.statusGreenInitial= false;
   }

  }
  ngOnDestroy(): void {
    if(this.wayPointSubscription){
     this.wayPointSubscription.unsubscribe();
    }
  }
  get waypointValue() {
    return this.wayPointForm.controls;
  }
}
