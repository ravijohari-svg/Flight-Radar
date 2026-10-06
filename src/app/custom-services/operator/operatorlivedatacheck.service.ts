import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OperatorlivedatacheckService {
  
  private liveDataCheck = new Subject<any>();
  private newMission = new Subject<any>();
  constructor() { }
  
  public getLiveDataExchange(): Observable<string> {
    return this.liveDataCheck.asObservable();
  }
  /*
   * @param {string} message : siblingMsg
   */
  public updateLiveDataExchange(message): void {
    this.liveDataCheck.next(message);
  }

  public getNewMissionData(): Observable<string> {
    return this.newMission.asObservable();
  }
  /*
   * @param {string} message : siblingMsg
   */
  public updatenewMissionData(message): void {
    this.newMission.next(message);
  }
}
