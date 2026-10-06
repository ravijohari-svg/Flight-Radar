import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-layout',
  templateUrl: './common-layout.component.html',
  styleUrls: ['./common-layout.component.scss']
})
export class CommonLayoutComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }
  onLogin() {
    this.router.navigateByUrl('operator/operator-login');
  }
}
