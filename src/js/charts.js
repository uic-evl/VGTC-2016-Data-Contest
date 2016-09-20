var Chart = Class.extend({
    init: function (divId, svgId, csvPath) {
        var box = this.getBox(divId);
        var ratio = 32.0/9.0;
        if (box.height < box.width/ratio) {
            this.setHeightForAspectRatio(divId, ratio);
        }
        this.svg = d3.select("#" + svgId)
            .style("width", box.width)
            .style("height", box.width/ratio);
        console.log(box);
        d3.csv (csvPath, this.process.bind(this));
        this.svgId = svgId;
    },
    getBox: function(elemId) {
        var e = document.getElementById(elemId);
        return e.getBoundingClientRect();
    },
    setHeightForAspectRatio: function(elemId, ratio) {
        var e = document.getElementById(elemId);
        e.style.height = parseInt(parseInt(e.style.width)/ratio) + "px";
    },
    process: function(error, states) {
        states = states.filter(function(d) { return d.STATE.length > 0;});
        states.sort(function(a, b) {
            var ar = (a.CAPACITY/a.Centers);
            var br = (b.CAPACITY/b.Centers);
            if (ar > br)
                return -1;
            if (br > ar)
                return 1;
            var ar2 = (a.ASSIGNED/a.Centers);
            var br2 = (b.ASSIGNED/b.Centers);
            if (ar2 > br2)
                return -1;
            if (br2 > ar2)
                return 1;
            return 0;
        })
        console.log(states);
        this.utilizationChart(states);
    },
    utilizationChart: function(states) {
        var rect = this.getBox(this.svgId);
        chartTop = rect.top;
        chartLeft = rect.left;

        chartWidth = parseInt(this.svg.style("width"));
        chartLeftMargin = chartWidth * 0.03;
        chartHeight = parseInt(this.svg.style("height")) * 0.6;
        chartTopMargin = chartHeight * 0.06;
        /*console.log(chartHeight,chartWidth,chartLeft,chartTop);
        console.log();*/
        var stateBars = this.svg.selectAll(".stateChartBar")
            .data(states);

        var stateChartXScale = d3.scaleOrdinal()
                .range(states.map(function(d, i) {
                    var left = chartLeft + 1.5*chartLeftMargin;
                    var right = chartLeft + chartWidth;
                    return left + (right - left)*i/states.length;
                }));
        var stateChartYScale = d3.scaleLinear()
                .range([0, chartHeight]);
        stateChartXScale.domain(states.map(function(d) { return d.STATE;}));
        stateChartYScale.domain([d3.max(states,function(d){
            return parseFloat(d.CAPACITY)/d.Centers;}), 0]);
        stateChartBars = this.svg.selectAll(".stateChartBar")
            .data(states);
        
        
        var yAxis = d3.axisLeft()
            .scale(stateChartYScale)
            .tickSizeInner(chartWidth/100.0)
            .tickSizeOuter(chartWidth/100.0)
            .tickPadding(5);
 
        this.svg.append("g")
            .attr("class", "axis")
            .attr("fill", "rgb(220,220,220)")
            .attr("font-size", "1rem")
            .attr("transform", "translate(" + (chartLeft+chartLeftMargin) +","+ (chartTop) + ")")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("x", 0)
            .attr("y", 6)
            .attr("fill", "rgb(30,30,30)")
            .attr("font-size", "0.7rem")
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Average capacity");

        var xAxis = d3.axisBottom()
            .scale(stateChartXScale)
            .tickSizeInner(chartWidth/100.0)
            .tickSizeOuter(chartWidth/100.0)
            .tickPadding(5);

        this.svg.append("g")
            .attr("class", "axis")
            .attr("fill", "rgb(220,220,220)")
            .attr("font-size", "1rem")
            .attr("transform", "translate(" + (chartLeft) +","+ (chartTop+chartHeight + chartTopMargin) + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "translate(" + (chartWidth) + "," + (-chartTopMargin) + ")")
            .attr("x", -chartLeftMargin/2)
            .attr("y", 5)
            .attr("fill", "rgb(30,30,30)")
            .attr("font-size", "0.7rem")
            .attr("dy", "0.6rem")
            .style("text-anchor", "end")
            .text("State");

        var stateFillColor = "rgb(180,128,132)";
        var stateEmptyColor = "rgb(180,180,180)"
        var bar = stateChartBars.enter()
                .append("g");

        bar.append("rect")
            .attr("x", function(d, i){ return stateChartXScale(d.STATE); })
            .attr("y", function(d){ return stateChartYScale(d.CAPACITY/d.Centers); })
            .attr("width", "1%")
            .attr("fill", stateEmptyColor)
            .attr("height", function(d){ return (chartTop + chartHeight - stateChartYScale(d.CAPACITY/d.Centers)); });
        bar.append("rect")
            .attr("x", function(d, i){ return stateChartXScale(d.STATE); })
            .attr("y", function(d){ return stateChartYScale(d.ASSIGNED/d.Centers); })
            .attr("width", "1%")
            .attr("fill", stateFillColor)
            .attr("height", function(d){ return (chartTop + chartHeight - stateChartYScale(d.ASSIGNED/d.Centers)); });
        var legend = this.svg.append("g");

        legend.append("rect")
            .attr("x", chartWidth - chartLeftMargin)
            .attr("y", chartTop + chartTopMargin)
            .attr("width", "1%")
            .attr("fill", stateEmptyColor)
            .attr("height", "2%");
        legend.append("text")
            .attr("class", "legend")
            .attr("x", chartWidth - 1.1* chartLeftMargin)
            .attr("y", chartTop + chartTopMargin)
            .attr("fill", "rgb(30,30,30)")
            .attr("font-size", "0.7rem")
            .attr("dy", "0.5rem")
            .style("text-anchor", "end")
            .text("available");
        legend.append("rect")
            .attr("x", chartWidth - chartLeftMargin)
            .attr("y", chartTop + 2*chartTopMargin)
            .attr("width", "1%")
            .attr("fill", stateFillColor)
            .attr("height", "2%");
        legend.append("text")
            .attr("class", "legend")
            .attr("x", chartWidth - 1.1* chartLeftMargin)
            .attr("y", chartTop + 2*chartTopMargin)
            .attr("fill", "rgb(30,30,30)")
            .attr("font-size", "0.7rem")
            .attr("dy", "0.5rem")
            .style("text-anchor", "end")
            .text("assigned");
    }
});