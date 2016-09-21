function seasonalMaps() {

    const margin = {
            top: 10,
            right: 20,
            bottom: 10,
            left: 10
        },
        width = 700 - margin.left - margin.right,
        height = 850 - margin.top - margin.bottom;

    const colorCode = d3.scaleOrdinal()
        .domain([ "HIGH SCHOOL", "4 YR COLLEGE/UNIVERSITY", "2 YR COMM COLLEGE", "JR HIGH/MIDDLE SCHOOL", "OTHER", "TECH HIGH SCHOOL", "TECH COLLEGE", "ELEMENTARY SCHOOL", "MILITARY FACILITY", "CORRECTIONAL INSTITUTION", "" ])
        .range(['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99'])

    // Queuing up asynchronous data loading. Convenient when you've got more than
    // one file you want to load.
    d3.queue()
        .defer(d3.json, "./data/chi-zips.json")
        .defer(d3.csv, "./data/ACT_TestEvents.csv")
        .defer(d3.csv, "./data/ACT_AllPointsFile.csv")
        .await(ready);


    function ready(error, zipmap, tcRaw, apRaw) {
        if (error) throw error;

        //drawZipCodeMap(zipmap, tcRaw, apRaw);

        let [zip_info, test_centers]  = preProcess(tcRaw, apRaw);

        drawZipCodeMap(d3.select("#fall"), zipmap, zip_info, test_centers, season_count = 1)
        drawZipCodeMap(d3.select("#winter"), zipmap, zip_info, test_centers, season_count = 2)
        drawZipCodeMap(d3.select("#spring"), zipmap, zip_info, test_centers, season_count = 3)
        drawZipCodeMap(d3.select("#summer"), zipmap, zip_info, test_centers, season_count = 4)
        drawLegend(d3.select("#season-legend"), zipmap, zip_info, test_centers)
        drawCircleLegend(d3.select("#season-legend-circle"), test_centers)
    }


    function preProcess(events, zips) {
        console.log(events, zips);

        let zip_chicago = zips.filter(d => {
            return (+d.ZIPCODE > 60600 && +d.ZIPCODE <= 60699) ||
                   (+d.ZIPCODE === 60707) ||
                   (+d.ZIPCODE === 60827) ||
                   (+d.ZIPCODE === 60666)
        });

        let zip_data = zip_chicago.filter(d => d.POINTTYPE === "ZIP"),
            minMax_pop = d3.extent(zip_data, d => +d.POPULATION),
            tc_data = zip_chicago
                .filter(d => d.POINTTYPE === "TESTCENTER")
                .sort((a, b) => {
                    if (a.TESTCENTERID > b.TESTCENTERID) return 1;
                    if (a.TESTCENTERID < b.TESTCENTERID) return -1;
                    return 0;
                });


        tc_data.forEach(d => {
            d.events = events.filter( tc => +d.TESTCENTERID === +tc.TestCenterID )
        })

        console.log("zip_data", zip_data);
        console.log("tc_data", tc_data);

        console.log("minMax", minMax_pop);
        return [{data: zip_data, extent: minMax_pop}, tc_data];
    }


    // function drawSeasons(selection){
    //     const margin = {
    //         top: 10,
    //         right: 30,
    //         bottom: 30,
    //         left: 30
    //     },
    //     width = 400 - margin.left - margin.right,
    //     height = 800 - margin.top - margin.bottom;

    //     const colorCode = d3.scaleOrdinal()
    //     .domain([ "HIGH SCHOOL", "4 YR COLLEGE/UNIVERSITY", "2 YR COMM COLLEGE", "JR HIGH/MIDDLE SCHOOL", "OTHER", "TECH HIGH SCHOOL", "TECH COLLEGE", "ELEMENTARY SCHOOL", "MILITARY FACILITY", "CORRECTIONAL INSTITUTION", "" ])
    //     .range(['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99'])


    // }

    // give me data bitch!
    function drawGlyphs(svg, projection, test_centers, opt_testcenter_pos, opt_testcenter_neg) {

        let stop_color = '#e44'

        // Gradients!!
        svg.append("defs").selectAll("linearGradient")
            .data(test_centers)
          .enter().append("linearGradient")
            .attr('id', d => "tc-"+d.TESTCENTERID )
            .attr('x1', "0%")
            .attr('x2', "0%")
            .attr('y1', "100%")
            .attr('y2', "0%")
         .append('stop')
            .attr('offset', d => 100*(+d.events[0].ASSIGNED / +d.events[0].CAPACITY)+"%")
            .attr('stop-color', stop_color)
            .attr('stop-opacity', 1)

        d3.selectAll("linearGradient")
            .append('stop')
            .attr('offset', "0%")
            .attr('stop-color', "transparent")
            .attr('stop-opacity', 0.5)


        let scale = d3.scaleLinear()
            .domain( d3.extent(test_centers.map(d => +d.events[0].CAPACITY)) )
            .range([5, 20])


        svg.append('g')
            .attr('class', 'test-centers')
          .selectAll('circle')
            .data(opt_testcenter_pos)
          .enter().append('circle')
            .attr('id', d => d.TESTCENTERID )
            .attr('r', d => 1.25*scale(+d.events[0].CAPACITY) )
            .attr('transform', d => 'translate(' + projection([+d.LONGITUDE, +d.LATITUDE]) + ')')
            .style('fill', d => 'url(#tc-'+d.TESTCENTERID+')') //
            .style("fill-opacity", 1)
            .style('stroke', '#000')
            // .on('mouseover', d => {
            //     console.log('mouseover +', d.ZIPCODE);
            // })

        // svg.append('g')
        //     .attr('class', 'test-centers')
        //   .selectAll('circle')
        //     .data(opt_testcenter_neg)
        //   .enter().append('circle')
        //     .attr('id', d => d.TESTCENTERID )
        //     .attr('r', d => scale(+d.events[0].CAPACITY) )
        //     .attr('transform', d => 'translate(' + projection([+d.LONGITUDE, +d.LATITUDE]) + ')')
        //     .style('fill', d => 'url(#tc-'+d.TESTCENTERID+')') //
        //     .style("fill-opacity", 0.3)
        //     .style('stroke', '#000')
        //     .on('mouseover', d => {
        //         console.log('mouseover -', d.ZIPCODE);
        //     })

    }

    function optimize_testcenters(test_centers){

        capacity_to_assigned = test_centers.sort(d => +d.events[0].ASSIGNED/+d.events[0].CAPACITY)
        console.log("Sorted Ratio ", capacity_to_assigned)

        let opt_testcenter_neg = capacity_to_assigned.filter(d => +d.events[0].ASSIGNED/+d.events[0].CAPACITY <= 0.25 )
        console.log(opt_testcenter_neg)

        let opt_testcenter_pos = capacity_to_assigned.filter(d => +d.events[0].ASSIGNED/+d.events[0].CAPACITY >= 0.5 )
        console.log(opt_testcenter_pos)

        return [opt_testcenter_neg, opt_testcenter_pos];

    }

    function drawLegend(selection, chi, zip_info, test_centers){
        let zipBoundaries = chi.objects.boundaries, //zip_codes_for_the_usa,
            zipGeoJson = topojson.feature(chi, {
                type: "GeometryCollection",
                geometries: zipBoundaries.geometries
            }),
            neighbors = topojson.neighbors(zipBoundaries.geometries);

        // Projection
        let projection = d3.geoAlbers()
            .fitSize([width, height], zipGeoJson)

        // Path generator
        let path = d3.geoPath()
            .projection(projection);

        let colorFill = d3.scaleLinear()
            .domain( zip_info.extent )
            .range(['#fff7fb','#023858'])

        let colorLegend = d3.legendColor()
            .scale(colorFill)
            .shapeWidth(50)
            .shapeHeight(50)

        let svg = selection.append("svg")
            .attr('width', 400)
            .attr('height', 280 )
        
         svg.append("g")
             .attr("class", "legendQuant")
             .attr("transform", "translate(130,10)") 
             //.call( d3.legendColor().scale(colorFill))
             .call(colorLegend)
             .style("font-size","30px")


    //     let scale = d3.scaleLinear()
    //         .domain( d3.extent(test_centers.map(d => +d.events[0].CAPACITY)) )
    // .range([5, 20])


    //     // circle legend
    //     svg.append("g")
    //         .attr("class", "legendSize")
    //         .attr("transform", "translate(50, 200)")
    //         .call( d3.legendSize()
    //             .scale(scale)
    //             .shape('circle')
    //             .shapePadding(23)
    //             .labelOffset(20)
    //             .orient('horizontal')
    //     );

    }

    function drawCircleLegend(selection, test_centers){

        let svg = selection.append("svg")
            .attr('width', 600)
            .attr('height', 200 )

        let scale = d3.scaleLinear()
            .domain( d3.extent(test_centers.map(d => +d.events[0].CAPACITY)) )
            .range([5, 40])

        // circle legend
        svg.append("g")
            .attr("class", "legendSize")
            .attr("transform", "translate(50, 50)")
            .call( d3.legendSize()
                .scale(scale)
                .shape('circle')
                .shapePadding(70)
                .labelOffset(35)
                .orient('horizontal'))
                .style("font-size","30px")

    }

    // This function maps all the test center locations on the US State map.
    function drawZipCodeMap(selection, chi, zip_info, test_centers, season_count) {

        console.log("LOLOLOLOLO", zip_info, test_centers);

        // Draw map starts here
        // Produce some convenience variables to #e44uce the # of calls

        let zipBoundaries = chi.objects.boundaries, //zip_codes_for_the_usa,
        zipGeoJson = topojson.feature(chi, {
            type: "GeometryCollection",
            geometries: zipBoundaries.geometries
        }),
        neighbors = topojson.neighbors(zipBoundaries.geometries);

        // Projection
        let projection = d3.geoAlbers()
         .fitSize([width, height], zipGeoJson)

        // Path generator
        let path = d3.geoPath()
         .projection(projection);

        let colorFill = d3.scaleLinear()
            .domain( zip_info.extent )
            .range(['#fff7fb','#023858'])

        let svg = selection.append("svg")
            .attr('width', width)
            .attr('height', height)

        function query( q ) {return (id =>  +id.ZIPCODE === +q )}

        svg.append("g")
            .attr("class", "land")
          .selectAll("path")
            .data(zipGeoJson.features)
          .enter().append("path")
            .attr("class", d => "zip " + d.properties.zip )
            .attr("d", path)
            .style('fill', d => {
                    let found = zip_info.data.find(query(d.properties.zip))
                    if (found) return colorFill(+found.POPULATION)
                    return '#fff7fb';
                })
            .style('fill-opacity', 1.0)

        // svg.append("g")
        //   .attr("class", "legendQuant")
        //   .attr("transform", "translate(20,20)")
        //   .call( d3.legendColor().scale(colorFill) )

        svg.append('g').append('path')
            .datum(topojson.mesh(chi, zipBoundaries, (a,b) => a !== b ))
            .attr('class', 'mesh')
            .attr('d', path)

        // Drawing map ends here

        // Drawing Seasonal Capacity maps
        var tc_fall = test_centers.filter(d => +d.events[0].MONTH === 10 || +d.events[0].MONTH === 12 )
        console.log("Fall ", tc_fall)

        var tc_winter = test_centers.filter(d => +d.events[0].MONTH === 2 )
        console.log("Winter ", tc_winter)

        var tc_spring = test_centers.filter(d => +d.events[0].MONTH === 4 || +d.events[0].MONTH === 6 )
        console.log("Spring ", tc_spring)

        var tc_summer = test_centers.filter(d => +d.events[0].MONTH === 9 )
        console.log("Summer ", tc_summer)

        if (season_count === 1)
        {
            // Optimize the test center network
            let [opt_testcenter_neg, opt_testcenter_pos] = optimize_testcenters(tc_fall)
            // Draw Circle Glyphs on the map
            drawGlyphs(svg, projection, tc_fall, opt_testcenter_pos, opt_testcenter_neg)
        }
        if (season_count === 2)
        {
            // Optimize the test center network
            let [opt_testcenter_neg, opt_testcenter_pos] = optimize_testcenters(tc_winter)
            // Draw Circle Glyphs on the map
            drawGlyphs(svg, projection, tc_winter, opt_testcenter_pos, opt_testcenter_neg)
        }
        if (season_count === 3)
        {
            // Optimize the test center network
            let [opt_testcenter_neg, opt_testcenter_pos] = optimize_testcenters(tc_spring)
            // Draw Circle Glyphs on the map
            drawGlyphs(svg, projection, tc_spring, opt_testcenter_pos, opt_testcenter_neg)

        }
        if (season_count === 4)
        {
            // Optimize the test center network
            let [opt_testcenter_neg, opt_testcenter_pos] = optimize_testcenters(tc_summer)
            // Draw Circle Glyphs on the map
            drawGlyphs(svg, projection, tc_summer, opt_testcenter_pos, opt_testcenter_neg)

        }
    }

}