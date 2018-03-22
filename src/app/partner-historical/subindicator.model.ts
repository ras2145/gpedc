export class Subindicator {
    id: string;
    title: string;
    type: string;
    subdropdown: string;
    chartText: string;
    autoselect: boolean;
    image: string;
    whatdoes: string;
    constructor() {
        this.id = this.title = this.type = this.chartText = '';
        this.autoselect = false;
    }
}
