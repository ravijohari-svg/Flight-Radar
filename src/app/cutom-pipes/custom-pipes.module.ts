import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrantCelciusPipe } from '../cutom-pipes/frant-celcius.pipe';
import { MeterToKmPipe } from './meter-to-km.pipe';
import { UnixToLocalTimePipe } from './unix-to-local-time.pipe';
import { SpeedPipe } from './speed.pipe';
import { DMScordinatePipe } from './dmscordinate.pipe';
import { MetertofeetPipe } from './metertofeet.pipe';

@NgModule({
  declarations: [
    FrantCelciusPipe,
    MeterToKmPipe,
    UnixToLocalTimePipe,
    SpeedPipe,
    DMScordinatePipe,
    MetertofeetPipe,
  ],
  imports: [CommonModule],
  exports: [
    FrantCelciusPipe,
    MeterToKmPipe,
    UnixToLocalTimePipe,
    SpeedPipe,
    DMScordinatePipe,
    MetertofeetPipe,
  ],
  providers: [FrantCelciusPipe],
})
export class CustomPipesModule {}
