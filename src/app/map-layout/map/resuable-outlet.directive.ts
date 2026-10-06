/**
 * @description
 * This directive is used to display single view map with doesn't rerenders on page change.
 * @author
 * Saroj Kumar Pahi
 */
import { Directive, ViewContainerRef, OnInit } from '@angular/core';
import { ReusableService } from './reusable.service';

@Directive({
  selector: '[appResuableOutlet]',
})
export class ReusableDirective implements OnInit {
  constructor(
    private viewContainerRef: ViewContainerRef,
    private reusableService: ReusableService
  ) {}

  public ngOnInit(): void {
    this.reusableService.attach(this.viewContainerRef);
  }
}
