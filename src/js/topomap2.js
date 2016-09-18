function TopoMap2(container, data, scale, chartType, maxValue, year, drawLegend, drawYear){
    this.map = {};
    this.map.margin = { top: 20, right: 10, bottom: 40, left: 90 };
    this.map.height = 0;
    this.map.width = 0;
    this.map.container = container;
    this.map.scale = scale;
    this.map.colorScale = null;
    this.map.quantizeScale = null;
    this.map.maxValue = maxValue;
    this.map.year = year;
    this.map.drawLegend = drawLegend;
    this.map.drawYear = drawYear;

    this.map.data = data;
    this.map.chartType = chartType;

    this.map.svg = null;
    this.map.path = null;
    this.map.tooltip = null;
    this.map.legend = null;

    this.init();
}

TopoMap2.prototype = {
    constructor: TopoMap2,

    update: function(){
        var self = this,
            map = self.map;
    },

    drawLegend: function(){
        var map = this.map,
            lineheight = 40,
            format = d3.format(".1s");

        // return quantize thresholds for the key
        var qrange = function(max, num) {
            var a = [];
            for (var i=0; i<num; i++) {
                a.push(i*max/num);
            }
            return a;
        }

        var legend = map.svg.append("g")
            .attr("class", "legend");

        // make legend box
        var lb = legend.append("rect")
            .attr("transform", "translate (" + (map.width - 110) + "," + (map.height - 220) + ")")
            .attr("class", "legend-box")
            .attr("width", 110)
            .attr("height", 220);

        // make quantized key legend items
        var li = legend.append("g")
            .attr("transform", "translate (8,"+(10)+")")
            .attr("class", "legend-items");

        li.selectAll("rect")
            .data(map.quantizeScale.range().map(function(color) {
                var d = map.quantizeScale.invertExtent(color);
                if (d[0] == null) d[0] = x.domain()[0];
                if (d[1] == null) d[1] = x.domain()[1];
                return d;
            }))
            .enter().append("rect")
            .attr("y", function(d, i) { return i*lineheight; })
            .attr("width", 35)
            .attr("height", 40)
            .attr("transform", "translate (" + (map.width - 110) + "," + (map.height - 220) + ")")
            .style("fill", function(d) { return map.quantizeScale(d[0]); });

        li.selectAll("text")
            .data(qrange(map.quantizeScale.domain()[1], map.quantizeScale.range().length))
            .enter().append("text")
            .attr("class", "legend-text")
            .attr("x", 50)
            .attr("y", function(d, i) { return (i+1)*lineheight - 20; })
            .attr("transform", "translate (" + (map.width - 100) + "," + (map.height - 220) + ")")
            .text(function(d) { return "< " + format(d); });
    },

    getValue: function(d, chartType, year) {
        if (chartType == "expense"){
            if (year == 9999)
                return d.properties["exp_2012"] + d.properties["exp_2013"] +
                       d.properties["exp_2014"] + d.properties["exp_2015"];
            else
                return d.properties["exp_" + year];
        } else if (chartType == "utilization") {
            if (year == 9999)
                return d.properties["util_2012"] + d.properties["util_2013"] +
                    d.properties["util_2014"] + d.properties["util_2015"];
            else
                return d.properties["util_" + year];
        } else return 0;
    },

    getMax: function(){
        var map = this.map;

        var max = 0,
            states = map.data.objects.states.geometries;
        for(var i = 0; i < states.length; i++){
            if (states[i].hasOwnProperty('properties') &&
                (states[i].properties["exp_" + map.year] > max))
                max = states[i].properties["exp_" + map.year];
        }

        return max;
    },

    init: function() {
        var self = this,
            map = self.map;

        // set up the map width and height based on the container properties
        // and create a SVG.g container for the map
        var x = d3.select(map.container).style("width");
        var y = d3.select(map.container).style("height");

        map.width = parseInt(x) - map.margin.left - map.margin.right;
        map.height = parseInt(y) - map.margin.top - map.margin.bottom;

        map.svg = d3.select(map.container)
            .append("svg")
             .attr("width", function() { return map.width + map.margin.left + map.margin.right; })
             .attr("height", function() { return map.height + map.margin.top + map.margin.bottom })
            .append("g")
             .attr("transform", "translate(" + map.margin.left + "," + map.margin.top + ")");

        // set up the color scale used for the choropleth map
        //map.maxValue = self.getMax();
        var colorScale = ['#f1eef6', '#d7b5d8', '#df65b0',  '#dd1c77', '#980043']
        map.quantizeScale = d3.scaleQuantize()
            .domain([0, map.maxValue])
            .range(colorScale);

        map.colorScale = d3.scaleLinear()
            .domain([0, map.maxValue])
            .range(colorScale);

        // set up d3 geo projections and add map borders: land, states and counties
        var projection = d3.geoAlbersUsa()
            .scale(map.scale).translate([map.width / 2, map.height / 2]);
        map.path = d3.geoPath().projection(projection);

        map.svg.insert("path", ".graticule")
            .datum(topojson.feature(map.data, map.data.objects.land))
            .attr("class", "land")
            .attr("d", map.path);

        map.svg.append("g")
             .attr("id", "states")
             .selectAll("path")
             .data(topojson.feature(map.data, map.data.objects.states).features)
            .enter().append("path")
             .attr("d", map.path)
             .style("fill", function(d) {
                return map.colorScale(self.getValue(d, map.chartType, map.year))
             });

        map.svg.insert("path", ".graticule")
            .datum(topojson.mesh(map.data, map.data.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "state-boundary")
            .attr("d", map.path);

        /*
        map.svg.append("path")
            .datum(topojson.mesh(map.data, map.data.objects.counties, function(a, b) { return a !== b; }))
            .attr("class", "border border--state")
            .attr("d", map.path);*/

        if (map.drawYear){
            map.svg.append('text')
                .attr('x', 220)
                .attr('y', 220)
                .attr('dy', '.35em')
                .style('font-size', 20)
                .style('font-weight', 'bold')
                .text(map.year);
        }

        if (map.drawLegend) self.drawLegend();
        self.update();
    }
}
