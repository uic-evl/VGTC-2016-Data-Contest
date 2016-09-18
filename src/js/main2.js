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

            new TopoMap2("#exp_aggr", us, 1100, "expense", 3966889.724, 9999, true, false);
            new TopoMap2("#exp_2012", us, 450, "expense", 3966889.724, 2012, false, true);
            new TopoMap2("#exp_2013", us, 450, "expense", 3966889.724, 2013, false, true);
            new TopoMap2("#exp_2014", us, 450, "expense", 3966889.724, 2014, false, true);
            new TopoMap2("#exp_2015", us, 450, "expense", 3966889.724, 2015, false, true);
        });

        d3.json("./data/topo-us-util.json", function(error, us) {
            if (error) throw error;

            new TopoMap2("#util_aggr", us, 1100, "utilization", 100, 2012, true, false);
            new TopoMap2("#util_2012", us, 450, "utilization", 100, 2012, false, true);
            new TopoMap2("#util_2013", us, 450, "utilization", 100, 2013, false, true);
            new TopoMap2("#util_2014", us, 450, "utilization", 100, 2014, false, true);
            new TopoMap2("#util_2015", us, 450, "utilization", 100, 2015, false, true);
        });
        createLocalVoronoi();
    };

})();
