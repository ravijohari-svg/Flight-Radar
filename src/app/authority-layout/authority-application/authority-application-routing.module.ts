import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLevelGuard } from 'src/app/custom-guard/authority/auth-level.guard';
import { AuthorityRoutesGuard } from 'src/app/custom-guard/authority/authority-routes.guard';
import { AuthorityApplicationComponent } from './authority-application.component';
import { AuthorityRemoteidComponent } from './authority-remoteid/authority-remoteid.component';
import { AuthorityPreflightReportComponent } from './authority-preflight-report/authority-preflight-report.component';
import { AuthorityPostflightReportComponent } from './authority-postflight-report/authority-postflight-report.component';

const routes: Routes = [
  {
    path: '',
    component: AuthorityApplicationComponent,
    children: [
      {
        path: 'dashboard',
        canActivate: [AuthorityRoutesGuard, AuthLevelGuard],
        data: { authorityLevels: ['L1', 'L2', 'L3', 'L4'] },
        loadChildren: () =>
          import('./authority-manned-flight/authority-manned-flight.module').then(
            (m) => m.AuthorityMannedFlightModule
          ),
      },
      {
        path: 'missions',
        canActivate: [AuthorityRoutesGuard, AuthLevelGuard],
        data: { authorityLevels: ['L1', 'L2', 'L3', 'L4'] },
        loadChildren: () =>
          import('./authority-missions/authority-missions.module').then(
            (m) => m.AuthorityMissionsModule
          ),
      },
      {
        path: 'blackbox',
        canActivate: [AuthorityRoutesGuard, AuthLevelGuard],
        data: { authorityLevels: ['L1', 'L2', 'L3'] },
        loadChildren: () =>
          import('./authority-blackbox/authority-blackbox.module').then(
            (m) => m.AuthorityBlackboxModule
          ),
      },
      {
        path: 'blackbox/:metric',
        canActivate: [AuthorityRoutesGuard, AuthLevelGuard],
        data: { authorityLevels: ['L1', 'L2', 'L3'] },
        loadChildren: () =>
          import('./authority-blackbox/authority-blackbox.module').then(
            (m) => m.AuthorityBlackboxModule
          ),
      },
      {
        path: 'manned-flight',
        canActivate: [AuthorityRoutesGuard, AuthLevelGuard],
        data: { authorityLevels: ['L1', 'L2', 'L3', 'L4'] },
        loadChildren: () =>
          import('./authority-dashboard/authority-dashboard.module').then(
            (m) => m.AuthorityDashboardModule
          ),
      },
      {
        path: 'rule-engine',
        canActivate: [AuthorityRoutesGuard, AuthLevelGuard],
        data: { authorityLevels: ['L1'] },
        loadChildren: () =>
          import('./authority-rule-engine/authority-rule-engine.module').then(
            (m) => m.AuthorityRuleEngineModule
          ),
      },
      {
        path: 'pilots',
        canActivate: [AuthorityRoutesGuard, AuthLevelGuard],
        data: { authorityLevels: ['L1', 'L2', 'L3', 'L4'] },
        loadChildren: () =>
          import('./authority-pilots/authority-pilots.module').then(
            (m) => m.AuthorityPilotsModule
          ),
      },
      {
        path: 'flight-radar',
        canActivate: [AuthorityRoutesGuard, AuthLevelGuard],
        data: { authorityLevels: ['L1', 'L2', 'L3', 'L4'] },
        loadChildren: () =>
          import('./authority-flight-radar/authority-flight-radar.module').then(
            (m) => m.AuthorityFlightRadarModule
          ),
      },
      // {
      //   path: 'remote-id', canActivate: [AuthorityRoutesGuard, AuthLevelGuard],
      //   data: { authorityLevels: ['L1', 'L2', 'L3', 'L4'] },
      //   component: AuthorityRemoteidComponent
      // },
      // {
      //   path: 'onelap',
      //   canActivate: [AuthorityRoutesGuard, AuthLevelGuard],
      //   data: { authorityLevels: ['L1', 'L2', 'L3', 'L4'] },
      //   component: AuthorityRemoteidComponent,
      // },
      {
        path: 'admin',
        canActivate: [AuthorityRoutesGuard, AuthLevelGuard],
        data: { authorityLevels: ['L1'] },
        loadChildren: () =>
          import('./authority-admin/authority-admin.module').then(
            (m) => m.AuthorityAdminModule
          ),
      },
      {
        path: 'preflightreport',
        canActivate: [AuthorityRoutesGuard, AuthLevelGuard],
        data: { authorityLevels: ['L1'] },
        component: AuthorityPreflightReportComponent,
      },
      {
        path: 'postflightreport',
        canActivate: [AuthorityRoutesGuard, AuthLevelGuard],
        data: { authorityLevels: ['L1'] },
        component: AuthorityPostflightReportComponent,
      },
      { path: 'onelap', redirectTo: 'dashboard' },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthorityApplicationRoutingModule {}
