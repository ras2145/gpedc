import {Injectable} from '@angular/core';
import {ConnectionBackend, Headers, Http, RequestOptions, RequestOptionsArgs, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';


@Injectable()
export class WebService extends Http {

  constructor(
    backend: ConnectionBackend,
    defaultOptions: RequestOptions
  ) {
    super(backend, defaultOptions);
  }

  get(url: string, options?: RequestOptionsArgs): Observable<any> {
    const headerOptions = options;
    return super.get(url, headerOptions)
      .catch(this.onCatch)
      .do((res: Response) => {
        this.onSubscribeSuccess(res);
      }, (error: any) => {
        this.onSubscribeError(error);
      })
      .finally(() => {
        this.onFinally();
      });
  }

  post(url: string, body: any, options?: RequestOptionsArgs): Observable<any> {
    const headerOptions = options;
    return super.post(url, body, headerOptions)
      .catch(this.onCatch)
      .do((res: Response) => {
        this.onSubscribeSuccess(res);
      }, (error: any) => {
        this.onSubscribeError(error);
      })
      .finally(() => {
        this.onFinally();
      });
  }

  private onCatch(error: any, caught: Observable<any>) {
    return Observable.throw(error);
  }

  private onSubscribeSuccess(res: Response): void {}

  private onSubscribeError(res: any): void {}

  private onFinally(): void {}


  getHeaders() {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return options;
  }

  errorHandler(err) {
    return Observable.throw(err);
  }

}
