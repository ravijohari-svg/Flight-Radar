import { Component, OnInit } from '@angular/core';
  import { FormGroup,FormControl,Validator, Validators } from '@angular/forms';
import { ClientApisService } from 'src/app/custom-services/client/client-apis.service';
import { DateTimeFormatService } from 'src/app/custom-services/common/date-time-format.service';
@Component({
  selector: 'app-flight',
  templateUrl: './flight.component.html',
  styleUrls: ['./flight.component.scss']
})
export class FlightComponent implements OnInit {
  Data:any;
  flightform = new FormGroup({
    ProductName:new FormControl("",[Validators.required]),
    DepartureTime:new FormControl("",[Validators.required]),
    DeliveryDate:new FormControl("",Validators.required),
    ETA:new FormControl("",Validators.required)
  });
  submitted;
  successFlag;


  constructor(private clientApis: ClientApisService,
    private dateAndTimeFormat: DateTimeFormatService) { }

  ngOnInit(): void {
  }
  
  submitDetail(){
    this.submitted = true;
    if(this.flightform.valid) {
      this.submitted = false;
      let payload = {
        ...this.flightform.value,
        DeliveryDate: this.dateAndTimeFormat.dateAndTimeFormatting(this.flightform.value.DeliveryDate,'date-inverse'),
        ETA: this.flightform.value.ETA + 'Mins'
      }
      this.clientApis.updateFlightTakeOff(payload)
      .then((res) => {
        this.successFlag = true;
      })
      // .catch((err) => console.log(err));
    }
    
  }

  onCancel() {
this.flightform.reset();
this.successFlag = false;

  }

  get productName(){
    return this.flightform.get('ProductName')
  }

  get departureTime(){
    return this.flightform.get('DepartureTime')
  }

  get deliveryDate(){
    return this.flightform.get('DeliveryDate')
  }
  get eta(){
    return this.flightform.get('ETA')
  }
}
