import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketFlightRadarService {
  private socket: WebSocket;
  private messageSubject: Subject<any> = new Subject<any>();

  constructor() { }

  public connect(url: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.socket = new WebSocket(url);

      this.socket.onopen = (event) => {
        console.log('Flight Radar WebSocket connected', event);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.messageSubject.next(data);
        } catch (e) {
          this.messageSubject.next(event.data);
        }
      };

      this.socket.onerror = (event) => {
        console.error('Flight Radar WebSocket error', event);
      };

      this.socket.onclose = (event) => {
        console.log('Flight Radar WebSocket closed', event);
      };
    }
  }

  public getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  public sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  public closeConnection(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
