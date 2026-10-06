import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthorityRuleEngineRoutingModule } from './authority-rule-engine-routing.module';
import { AuthorityRuleEngineComponent } from './authority-rule-engine.component';
import { AuthorityDroneParametersComponent } from './authority-drone-parameters/authority-drone-parameters.component';

import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthorityMissionParametersComponent } from './authority-mission-parameters/authority-mission-parameters.component';
import { CommonComponentsModule } from 'src/app/common-components/common-components.module';

@NgModule({
  declarations: [
    AuthorityRuleEngineComponent,
    AuthorityDroneParametersComponent,
    AuthorityMissionParametersComponent,
  ],
  imports: [
    CommonModule,
    AuthorityRuleEngineRoutingModule,
    //Ngx Bootstrap
    ModalModule.forRoot(),
    //Forms
    FormsModule,
    ReactiveFormsModule,
    //Loader
    CommonComponentsModule,
  ],
})
export class AuthorityRuleEngineModule {}
