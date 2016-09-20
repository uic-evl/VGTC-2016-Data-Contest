/**
 * Created by juan on 9/18/2016.
 */
'use strict';

// Main program object. Hang 'global' functions and variables off App
var App = App || {};

(function(){

    // iife global
    var self = this || {};

    App.initMap = function() {

        d3.json("./data/topo-us-expenses.json", function(error, us) {
            if (error) throw error;

            var maxValue = getMax(us);
            var minValue = getMin(us);
            new TopoMap2("#exp_aggr", us, 1100, "expense", maxValue, minValue, 9999, true, false);
            new TopoMap2("#exp_2012", us, 450, "expense", maxValue, minValue,  2012, false, true);
            new TopoMap2("#exp_2013", us, 450, "expense", maxValue, minValue, 2013, false, true);
            new TopoMap2("#exp_2014", us, 450, "expense", maxValue, minValue, 2014, false, true);
            new TopoMap2("#exp_2015", us, 450, "expense", maxValue, minValue, 2015, false, true);
        });

        d3.json("./data/topo-us-util.json", function(error, us) {
            if (error) throw error;

            new TopoMap2("#util_aggr", us, 1100, "utilization", 100, 0, 2012, true, false);
            new TopoMap2("#util_2012", us, 450, "utilization", 100, 0, 2012, false, true);
            new TopoMap2("#util_2013", us, 450, "utilization", 100, 0, 2013, false, true);
            new TopoMap2("#util_2014", us, 450, "utilization", 100, 0, 2014, false, true);
            new TopoMap2("#util_2015", us, 450, "utilization", 100, 0, 2015, false, true);
        });
        createLocalVoronoi("#something", "#voronoiCol", "state");
        createLocalVoronoi("#something2", "#voronoiCol2", "county");
        createLocalVoronoi("#something3", "#voronoiCol3", "county");
        var overViewChart = new Chart();
        overViewChart.init("overViewChart", "chartCanvas", "./data/stateSummary.csv");
        seasonalMaps();
    };

})();
