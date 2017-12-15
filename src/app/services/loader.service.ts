import { Injectable } from '@angular/core';

@Injectable()
export class LoaderService {

  private loading: number;
  private loaded: number;
  constructor() {
    this.loading = 0;
    this.loaded = 0;
  }

  start() {
    this.loading++;
  }
  end() {
    this.loaded++;
  }
  isLoading() {
    return this.loading != this.loaded;
  }
}
