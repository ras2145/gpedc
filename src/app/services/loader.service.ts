import { Injectable } from '@angular/core';

@Injectable()
export class LoaderService {

  private loading: number;
  private loaded: number;
  constructor() {
    this.loading = 0;
    this.loaded = 0;
  }

  loadStart() {
    this.loading++;
  }
  loadEnd() {
    this.loaded++;
  }
  isLoading() {
    // TODO enable
    // return this.loading != this.loaded;
    return false;
  }
}
