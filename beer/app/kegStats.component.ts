import {Component, Output, Input, EventEmitter} from '@angular/core';  
import 'rxjs/Rx';

export class KegStatsComponent {
    errorMessage: string;
    mode = 'Observable';

    constructor() {}

    ngOnInit() { this.getAmbianceStats(); }

    getAmbianceStats(){
        
    }
}

export class AmbianceStats {
    temperature: number;
    humidity: number;
}