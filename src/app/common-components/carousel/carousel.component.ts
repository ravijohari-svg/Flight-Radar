import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit {
  slideIndex = 1;
  @Input() images: any = [];
  @Input() indecators = true;
  @Input() controls = true;
  @Input() autoSlide = false;
  @Input() slideInterval = 4000;
  selectedIndex = 0;
  constructor() {}

  ngOnInit(): void {
    if (this.autoSlide) {
      this.autoSlideImages();
    }
  }
  //sets index of image on dot/indicator click
  selectImage(index: number): void {
    this.selectedIndex = index;
  }
  onPrevClick() {
    if (this.selectedIndex === 0) {
      this.selectedIndex = this.images?.length - 1;
    } else {
      this.selectedIndex--;
    }
  }
  onNextClick() {
    if (this.selectedIndex === this.images?.length - 1) {
      this.selectedIndex = 0;
    } else {
      this.selectedIndex++;
    }
  }
  //change slides in 3sec interval
  autoSlideImages() {
    setInterval(() => {
      this.onNextClick();
    }, this.slideInterval);
  }
}
