import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private ws: WebSocket;
  private websocketKey: string;
  private profileDetails: any;
  private messageSubject: Subject<any>;
  private isReconnecting: boolean = false;

  constructor(private http: HttpClient) {
    this.messageSubject = new Subject<any>();
  }

  connectWebSocket(websocketKey: string, profileDetails: any): void {
    this.websocketKey = websocketKey;
    this.profileDetails = profileDetails;

    this.openConnection();
  }

  private openConnection(): void {
    const target = this.websocketKey + this.profileDetails?.UserId;

    if ('WebSocket' in window) {
      this.ws = new WebSocket(target);

      this.ws.onopen = () => {
        // console.log('WebSocket connection established.');
      };

      this.ws.onmessage = (event) => {
        // Handle received message from the server
        const receivedMessage = JSON.parse(event.data);
        // Pass the received message to subscribers
        this.messageSubject.next(receivedMessage);
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed.');
        // websocket getting closed after 1 min,
        // added a function to reestablish the connection
        // but sometime i have to close the websocket connection
        if (!this.isReconnecting) {
          this.reconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.ws.close();
        this.reconnect();
      };
    } else {
      alert('WebSocket is not supported by this browser.');
    }
  }

  closeConnection(): void {
    if (this.ws) {
      this.isReconnecting = false; // Reset the reconnect flag if manually closing
      this.ws.close();
      console.log('WebSocket connection manually closed.');
    }
  }

  close() {
    this.ws.close();
  }

  reconnect(): void {
    this.isReconnecting = true; // Set the flag to prevent multiple reconnects
    console.log('Reconnecting Websocket...');

    setTimeout(() => {
      this.openConnection();
      this.isReconnecting = false; // Reset the flag after reconnecting
    }, 5000); // Wait 5 seconds before reconnecting
  }

  getMessages(): Subject<any> {
    return this.messageSubject;
  }
  sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify(message);
      this.ws.send(payload);
    } else {
      // console.log('WebSocket connection is not open.');
    }
  }
  getCurrentWeather(lat: number, lon: number) {
    return firstValueFrom(
      this.http.get(
        `${environment.openWeatherUrl}/weather?lat=${lat}&lon=${lon}&appid=${environment.openWeatherapiKey}`
      )
    );

    // return this.http
    //   .get(
    //     `${environment.openWeatherUrl}/weather?lat=${lat}&lon=${lon}&appid=${environment.openWeatherapiKey}`
    //   )
    //   .toPromise();
  }
}
