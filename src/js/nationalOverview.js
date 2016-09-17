function createOverview()
{
    var width = 400,
        height = 200;

    var maxExpense = 3966889.724;

        var projection = d3.geoAlbersUsa()
        .scale(450)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    d3.select("#overview").append("h1")
        .text("Expense Overview (2012-2015)");


    var map_expense_2012 = d3.select("#overview").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    var map_expense_2013 = d3.select("#overview").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    var map_expense_2014 = d3.select("#overview").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    var map_expense_2015 = d3.select("#overview").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");




    d3.json("./data/topo-us-expenses.json", function(error, us) {
        if (error) throw error;
        console.log(us);
        var expenseColorScale = d3.scaleLinear()
            .domain([0, maxExpense])
            .range(['#bae4b3', '#238b45']);

        map_expense_2012.insert("path", ".graticule")
            .datum(topojson.feature(us, us.objects.land))
            .attr("class", "land")
            .attr("d", path);

        map_expense_2012.append("g")
            .attr("id", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function(d) {
                return expenseColorScale(d.properties.exp_2012)
            });


        map_expense_2012.insert("path", ".graticule")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) {
                return a !== b;
            }))
            .attr("class", "state-boundary")
            .attr("d", path);




        map_expense_2013.insert("path", ".graticule")
            .datum(topojson.feature(us, us.objects.land))
            .attr("class", "land")
            .attr("d", path);

        map_expense_2013.append("g")
            .attr("id", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function(d) {
                return expenseColorScale(d.properties.exp_2013)
            });


        map_expense_2013.insert("path", ".graticule")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) {
                return a !== b;
            }))
            .attr("class", "state-boundary")
            .attr("d", path);



        map_expense_2014.insert("path", ".graticule")
            .datum(topojson.feature(us, us.objects.land))
            .attr("class", "land")
            .attr("d", path);

        map_expense_2014.append("g")
            .attr("id", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function(d) {
                return expenseColorScale(d.properties.exp_2014)
            });

        map_expense_2014.insert("path", ".graticule")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) {
                return a !== b;
            }))
            .attr("class", "state-boundary")
            .attr("d", path);



        map_expense_2015.insert("path", ".graticule")
            .datum(topojson.feature(us, us.objects.land))
            .attr("class", "land")
            .attr("d", path);

        map_expense_2015.append("g")
            .attr("id", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function(d) {
                return expenseColorScale(d.properties.exp_2015)
            });


        map_expense_2015.insert("path", ".graticule")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) {
                return a !== b;
            }))
            .attr("class", "state-boundary")
            .attr("d", path);
    });


    d3.select("#overview").append("h1")
        .text("Utilization Overview (2012-2015)");
    var map_utilization_2012 = d3.select("#overview").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    var map_utilization_2013 = d3.select("#overview").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    var map_utilization_2014 = d3.select("#overview").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    var map_utilization_2015 = d3.select("#overview").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    d3.json("./data/topo-us-util.json", function(error, us) {
        if (error) throw error;

        console.log(us);

        var utilizationColorScale = d3.scaleLinear()
            .domain([0, 100])
            .range(['#cbc9e2', '#6a51a3']);

        map_utilization_2012.insert("path", ".graticule")
            .datum(topojson.feature(us, us.objects.land))
            .attr("class", "land")
            .attr("d", path);

        map_utilization_2012.append("g")
            .attr("id", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function(d) {
                return utilizationColorScale(d.properties.util_2012);
            });


        map_utilization_2012.insert("path", ".graticule")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) {
                return a !== b;
            }))
            .attr("class", "state-boundary")
            .attr("d", path);




        map_utilization_2013.insert("path", ".graticule")
            .datum(topojson.feature(us, us.objects.land))
            .attr("class", "land")
            .attr("d", path);

        map_utilization_2013.append("g")
            .attr("id", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function(d) {
                return utilizationColorScale(d.properties.util_2013)
            });


        map_utilization_2013.insert("path", ".graticule")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) {
                return a !== b;
            }))
            .attr("class", "state-boundary")
            .attr("d", path);



        map_utilization_2014.insert("path", ".graticule")
            .datum(topojson.feature(us, us.objects.land))
            .attr("class", "land")
            .attr("d", path);

        map_utilization_2014.append("g")
            .attr("id", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function(d) {
                return utilizationColorScale(d.properties.util_2014)
            });

        map_utilization_2014.insert("path", ".graticule")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) {
                return a !== b;
            }))
            .attr("class", "state-boundary")
            .attr("d", path);



        map_utilization_2015.insert("path", ".graticule")
            .datum(topojson.feature(us, us.objects.land))
            .attr("class", "land")
            .attr("d", path);

        map_utilization_2015.append("g")
            .attr("id", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function(d) {
                return utilizationColorScale(d.properties.util_2015)
            });


        map_utilization_2015.insert("path", ".graticule")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) {
                return a !== b;
            }))
            .attr("class", "state-boundary")
            .attr("d", path);
    });

}