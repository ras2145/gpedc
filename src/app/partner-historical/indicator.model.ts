import { Subindicator } from './subindicator.model';

export class Indicator {
    id: string;
    title: string;
    dropdown: string;
    subindicators: Array<Subindicator>;
    type: string;
    chartText: string;
    autoselect: boolean;
    image: string;

    constructor() {
        this.id = this.title = this.dropdown = this.type = this.chartText = '';
        this.autoselect = false;
        this.subindicators = new Array<Subindicator>();
    }
}
