var Chart = Class.extend({
    init: function (divId, svgId1, svgId2, csvPath, height) {
        var box = this.getBox(divId);
        var divRatio = box.width/height;
        var ratio = 0.5*divRatio;
        console.log("ratio:" + ratio);
        this.setHeightForAspectRatio(divId, divRatio);
        this.svg = d3.select("#" + svgId1)
            .style("width", box.width/2.0)
            .style("height", height)
            .attr("viewBox", "0 0 1000 " + parseInt(1000.0/ratio) )
            .attr("preserveAspectRatio", "xMinYMin meet");

        this.aspect = ratio;
        this.svg2 = d3.select("#" + svgId2)
            .style("width", box.width/2.0)
            .style("height", height)
            .attr("viewBox", "0 0 1000 " + parseInt(1000.0/ratio) )
            .attr("preserveAspectRatio", "xMinYMin meet");
        console.log(box);
        d3.csv (csvPath, this.process.bind(this));
        this.aspect = ratio;
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
        this.expenseChart(states);
    },
    utilizationChart: function(states) {
        var chartTop = 0;
        var chartLeft = 0;

        var chartWidth = 1000.0;
        var chartLeftMargin = chartWidth * 0.04;
        var chartHeight = 0.8*chartWidth/this.aspect;
        var chartTopMargin = chartHeight * 0.06;
        var barWidth = 10.0;
        /*console.log(chartHeight,chartWidth,chartLeft,chartTop);
        console.log();*/
        var stateChartXScale = d3.scaleOrdinal()
                .range(states.map(function(d, i) {
                    var left = chartLeft + chartLeftMargin + 2*barWidth;
                    var right = chartLeft + chartWidth;
                    return left + (right - left)*i/states.length;
                }));
        var stateChartYScale = d3.scaleLinear()
                .range([0, chartHeight]);
        stateChartXScale.domain(states.map(function(d) { return d.STATE;}));
        stateChartYScale.domain([d3.max(states,function(d){
            return parseFloat(d.CAPACITY)/d.Centers;}), 0]);
        var stateChartBars = this.svg.selectAll(".capacityBars")
            .data(states);
        
        
        var yAxis = d3.axisLeft()
            .scale(stateChartYScale)
            .tickSizeInner(0)
            .tickSizeOuter(0)
            .tickPadding(0);
 
        this.svg.append("g")
            .attr("class", "axis")
            .attr("fill", "rgb(220,220,220)")
            .attr("font-size", "1rem")
            .attr("transform", "translate(" + (chartLeftMargin) +",0)")
            .attr('id', 'yAxis')
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("x", 0)
            .attr("y", -chartLeftMargin)
            .attr("fill", "rgb(30,30,30)")
            .attr("font-size", "0.7rem")
            .attr("dy", ".7rem")
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
            .attr("transform", "translate(0,"+ (chartHeight + chartTopMargin*0.75) + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "translate(" + (chartWidth) + ",0)")
            .attr("x", -chartLeftMargin/2)
            .attr("y", 0)
            .attr("fill", "rgb(30,30,30)")
            .attr("font-size", "0.7rem")
            .attr("dy", "-0.3rem")
            .style("text-anchor", "end");
            //.text("State");

        var stateFillColor = "rgb(180,108,112)";
        var stateEmptyColor = "rgb(180,180,180)";
        var bar = stateChartBars.enter()
                .append("g")
                .attr("class", "capacityBars");
        

        bar.append("rect")
            .attr("x", function(d, i){ return stateChartXScale(d.STATE) - barWidth/2.0; })
            .attr("y", function(d){ return stateChartYScale(d.CAPACITY/d.Centers); })
            .attr("width", barWidth)
            .attr("fill", stateEmptyColor)
            .attr("height", function(d){ return (chartTop + chartHeight - stateChartYScale(d.CAPACITY/d.Centers)); });
        bar.append("rect")
            .attr("x", function(d, i){ return stateChartXScale(d.STATE) - barWidth/2.0; })
            .attr("y", function(d){ return stateChartYScale(d.ASSIGNED/d.Centers); })
            .attr("width", barWidth)
            .attr("fill", stateFillColor)
            .attr("height", function(d){ return (chartTop + chartHeight - stateChartYScale(d.ASSIGNED/d.Centers)); });
        var legend = this.svg.append("g");

        legend.append("rect")
            .attr("x", chartWidth - chartLeftMargin)
            .attr("y", chartTop + chartTopMargin)
            .attr("width", 10)
            .attr("fill", stateEmptyColor)
            .attr("height", 10);
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
            .attr("width", 10)
            .attr("fill", stateFillColor)
            .attr("height", 10);
        legend.append("text")
            .attr("class", "legend")
            .attr("x", chartWidth - 1.1* chartLeftMargin)
            .attr("y", chartTop + 2*chartTopMargin)
            .attr("fill", "rgb(30,30,30)")
            .attr("font-size", "0.7rem")
            .attr("dy", "0.5rem")
            .style("text-anchor", "end")
            .text("assigned");
    },
    expenseChart: function(states) {
        var chartTop = 0;
        var chartLeft = 0;

        var chartWidth = 1000.0;
        var chartLeftMargin = chartWidth * 0.04;
        var chartHeight = 0.8*chartWidth/this.aspect;
        var chartTopMargin = chartHeight * 0.06;
        var barWidth = 10.0;
        /*console.log(chartHeight,chartWidth,chartLeft,chartTop);
        console.log();*/
        var stateChartXScale = d3.scaleOrdinal()
                .range(states.map(function(d, i) {
                    var left = chartLeft + chartLeftMargin + 2*barWidth;
                    var right = chartLeft + chartWidth;
                    return left + (right - left)*i/states.length;
                }));
        var stateChartYScale = d3.scaleLinear()
                .range([0, chartHeight]);
        stateChartXScale.domain(states.map(function(d) { return d.STATE;}));
        stateChartYScale.domain([d3.max(states,function(d){
            return parseFloat(d.EXPENSE)/d.Centers;}), 0]);
        var stateChartBars = this.svg2.selectAll(".expenseBars")
            .data(states);
        
        
        var yAxis = d3.axisLeft()
            .scale(stateChartYScale)
            .tickSizeInner(0)
            .tickSizeOuter(0)
            .tickPadding(0);
 
        this.svg2.append("g")
            .attr("class", "axis")
            .attr("fill", "rgb(220,220,220)")
            .attr("font-size", "1rem")
            .attr("transform", "translate(" + (chartLeftMargin) +",0)")
            .attr('id', 'yAxis')
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("x", 0)
            .attr("y", -chartLeftMargin)
            .attr("fill", "rgb(30,30,30)")
            .attr("font-size", "0.7rem")
            .attr("dy", ".7rem")
            .style("text-anchor", "end")
            .text("Average expense in $");

        var xAxis = d3.axisBottom()
            .scale(stateChartXScale)
            .tickSizeInner(chartWidth/100.0)
            .tickSizeOuter(chartWidth/100.0)
            .tickPadding(5);

        this.svg2.append("g")
            .attr("class", "axis")
            .attr("fill", "rgb(220,220,220)")
            .attr("font-size", "1rem")
            .attr("transform", "translate(0,"+ (chartHeight + chartTopMargin*0.75) + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "translate(" + (chartWidth) + ",0)")
            .attr("x", -chartLeftMargin/2)
            .attr("y", 0)
            .attr("fill", "rgb(30,30,30)")
            .attr("font-size", "0.7rem")
            .attr("dy", "-0.3rem")
            .style("text-anchor", "end");
            //.text("State");

        var stateFillColor = "rgb(180,108,112)";
        var stateEmptyColor = "rgb(180,180,180)";
        var bar = stateChartBars.enter()
                .append("g")
                .attr("class", "expenseBars");
        

        bar.append("rect")
            .attr("x", function(d, i){ return stateChartXScale(d.STATE) - barWidth/2.0; })
            .attr("y", function(d){ return stateChartYScale(d.EXPENSE/d.Centers); })
            .attr("width", barWidth)
            .attr("fill", stateFillColor)
            .attr("height", function(d){ return (chartTop + chartHeight - stateChartYScale(d.EXPENSE/d.Centers)); });
        /*bar.append("rect")
            .attr("x", function(d, i){ return stateChartXScale(d.STATE) - barWidth/2.0; })
            .attr("y", function(d){ return stateChartYScale(d.ASSIGNED/d.Centers); })
            .attr("width", barWidth)
            .attr("fill", stateFillColor)
            .attr("height", function(d){ return (chartTop + chartHeight - stateChartYScale(d.ASSIGNED/d.Centers)); });
        var legend = this.svg.append("g");

        legend.append("rect")
            .attr("x", chartWidth - chartLeftMargin)
            .attr("y", chartTop + chartTopMargin)
            .attr("width", 10)
            .attr("fill", stateEmptyColor)
            .attr("height", 10);
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
            .attr("width", 10)
            .attr("fill", stateFillColor)
            .attr("height", 10);
        legend.append("text")
            .attr("class", "legend")
            .attr("x", chartWidth - 1.1* chartLeftMargin)
            .attr("y", chartTop + 2*chartTopMargin)
            .attr("fill", "rgb(30,30,30)")
            .attr("font-size", "0.7rem")
            .attr("dy", "0.5rem")
            .style("text-anchor", "end")
            .text("assigned");*/
    }
});