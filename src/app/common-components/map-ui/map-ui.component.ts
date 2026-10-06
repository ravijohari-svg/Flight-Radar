/**
 * @description
 * This component is belongs to the map UI card which is used in Operator dashboard,ongoing mission,mision details part.
 * When user click on the map at any position it will show a UI card.
 * That UI card will show information related to the region information,airspace information and ground information.
 * In region information it show that region belongs to which zones like green,geo,airport inner,airport red,airport outer,VIDF,VECF,VOMF,VABF.
 * In airspace information it show like FIC,FIR,Zone type.
 * In ground information it show like country,states.
 * So when the user click on the map our handler.setInputAction event in onClickonMaps function take the input coordinates of that region.
 * And we use these coordinates in the onclickmapui function of maplayerservice to perform above calculations.
 * @author
 * Abhishek chauhan
 */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-map-ui',
  templateUrl: './map-ui.component.html',
  styleUrls: ['./map-ui.component.scss'],
})
export class MapUiComponent implements OnInit {
  @Input() title!: string;
  @Input() fircode!: string;
  @Input() airspacetype!: string;
  @Input() fic!: string;
  @Input() country!: string;
  @Input() state!: string;
  @Input() isView!: boolean;
  @Input() elevation:any;
  @Output() changeIsView = new EventEmitter();

  isDropdownOpen = false;
  showdata = false;
  showAccordian = false;
  makeClose = true;

  constructor() {}
  toggleDrop() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  showdatas() {
    this.showdata = !this.showdata;
    this.showAccordian = true;
  }
  close() {
    this.makeClose = !this.makeClose;
    this.isView = false;
    this.showAccordian = false;
    this.changeIsView.emit(this.isView);
  }

  ngOnInit(): void {}
}
