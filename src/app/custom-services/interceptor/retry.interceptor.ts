import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retryWhen, mergeMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Constants } from 'src/app/constants/constants';

@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn primary-btn mb-3 px-4',
      cancelButton: 'btn btn-dark-border mb-3 px-4 mx-2',
      title: 'alert-title',
      //  text : 'alert-text'
      // cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false,
  });
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      retryWhen((errors) => {
        let retryAttempts = 0;
        const maxRetryAttempts = Constants.maxRetryAttempts;
        const delayTime = 3000; // Delay time in milliseconds (e.g., 3000ms = 3 seconds)

        return errors.pipe(
          mergeMap((error: any) => {
            if (retryAttempts < maxRetryAttempts && this.shouldRetry(error)) {
              retryAttempts++;
              // console.log('retry attempt', retryAttempts, );
              // console.error(`API throwing error, attempting ${retryAttempts}`,error);
              return timer(delayTime); // Delay before retrying
            }
            //   if (retryAttempts === maxRetryAttempts) {
            //   this.swalWithBootstrapButtons.fire({
            //     iconHtml: '<img src="../../../assets/common-layout/error-image.svg" style="width: 150px; height: 150px;">',
            //     icon: 'error',
            //     background: '#1b1f27',
            //     title: `Something Went Wrong`,
            //     text: `Please try after sometime.`,
            //     focusConfirm: false,
            //     showCancelButton: false,
            //     allowOutsideClick: false,
            //     confirmButtonText: 'Okay',
            //   }).then((result) => {
            //     if (result.isConfirmed) {
            //         // implement anything or naviagtion if the user clicks "Okay"
            //     }
            //   });
            // }

            return throwError(() => error);
          })
          // catchError((error: any) => {
          //   return throwError(error);
          // })
        );
      })
    );
  }

  shouldRetry(error: HttpErrorResponse): boolean {
    // Check for network or server-related errors
    const networkErrors = [
      'Unknown Error',
      'Timeout',
      'No connection',
      'Backend Error',
    ];
    return (
      networkErrors.includes(error.message) ||
      error.status >= 500 ||
      error.status === 0
    );
  }
}
