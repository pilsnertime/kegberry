"use strict";
var KegStatsComponent = (function () {
    function KegStatsComponent() {
        this.mode = 'Observable';
    }
    KegStatsComponent.prototype.ngOnInit = function () { this.getAmbianceStats(); };
    KegStatsComponent.prototype.getAmbianceStats = function () {
    };
    return KegStatsComponent;
}());
exports.KegStatsComponent = KegStatsComponent;
var AmbianceStats = (function () {
    function AmbianceStats() {
    }
    return AmbianceStats;
}());
exports.AmbianceStats = AmbianceStats;
//# sourceMappingURL=kegStats.component.js.map