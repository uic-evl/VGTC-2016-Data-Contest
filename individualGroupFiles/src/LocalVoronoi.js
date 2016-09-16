/* global d3 */
/* global topojson */
/* global d3-voronoi */

let WIDTH = 1000;
let HEIGHT = 600;

let zipData = [];
let testCenterData = {};
let testCenterIDs = [];

let mySVG = d3.select("body").append("svg")
  .attr("width", WIDTH)
  .attr("height", HEIGHT);

mySVG.append("rect")
  .attr("width", WIDTH)
  .attr("height", HEIGHT)
  .style("fill", "#40a4df");

let map = mySVG.append("g")
  .attr("class", "usMap");

// read data in

readAllPoints();

function readAllPoints() {
  d3.csv("./csv/ACT_AllPointsFile.csv")
    .row((d) => {
      if (d.POINTTYPE === "ZIP") {
        // if it is a Zip point, push zip data object
        zipData.push({
          pID: Number(d.POINTID),
          zipcode: Number(d.ZIPCODE),
          lat: Number(d.LATITUDE),
          long: Number(d.LONGITUDE),
          population: Number(d.POPULATION)
        });
      } else if (d.POINTTYPE === "TESTCENTER") {
        // if it is a test center point, push zip data object
        if (testCenterData[d.TESTCENTERID] === undefined) {
          testCenterIDs.push(d.TESTCENTERID);
        }

        testCenterData[d.TESTCENTERID] = {
          pID: Number(d.POINTID),
          zipcode: Number(d.ZIPCODE),
          lat: Number(d.LATITUDE),
          long: Number(d.LONGITUDE),
          tcID: Number(d.TESTCENTERID),
          tcType: d.TCTYPE,
          institution: d.INSTITUTION,
          testEvents: []
        };
      }
    })
    .get((error, rows) => {
      if (error) {
        alert(error);
      }

      // once done, read test events file
      readTestEvents();
    });
}

function readTestEvents() {
  d3.csv("./csv/ACT_TestEvents.csv")
    .row((d) => {
      testCenterData[d.TestCenterID].testEvents.push({
        teID: Number(d.TestEventID),
        date: new Date(d.TESTDATE),
        year: Number(d.YEAR),
        month: Number(d.MONTH),
        capacity: Number(d.CAPACITY),
        assigned: Number(d.ASSIGNED),
        expense: Number(d.EXPENSE),
        flag: (d.ASSIGNED_SPECIAL_FL === "Y"),
        cycleDesc: d.CYCLE_DESCRIPTION,
        adminGroup: d.ADMIN_GROUP
      });
    })
    .get((error, rows) => {
      if (error) {
        alert(error);
      }

      // console.log(zipData);
      // console.log(testCenterData);
      // console.log(testCenterIDs);

      drawMap();
    });

    // svg.selectAll(".testCenter")
    //   .data(testCenterIDs)
    // .enter().append("circle")
    //   .datum((d) => {
    //     return testCenterData[d];
    //   })
    //   .attr("class", "testCenter");
}

function drawMap() {
  let projection = d3.geoAlbersUsa()
    .scale(3000)
    .translate([WIDTH / 2, HEIGHT / 2]);

  let path = d3.geoPath()
    .projection(projection);

  let voronoiFill = d3.scaleLinear()
    .domain([0, 1])
    .range(["white", "blue"]);

  console.log("Zip Extent", d3.extent(zipData, el => el.population));
  console.log("Capacity Extent", d3.extent(testCenterIDs, (el) => {
    return d3.mean(testCenterData[el].testEvents, (el2) => {
      return el2.capacity;
    });
  }));

  // size based on capacity/population
  let dotSize = d3.scaleLinear()
    .domain(d3.extent(zipData, el => el.population))
    .range([3, 8]);

  // color based on expense per unit
  // let testCenterColor = d3.scaleLinear()
  // .domain(d3.extent(testCenterIDs, (el) => {
  //   return d3.mean(testCenterData[el].testEvents, (el2) => {
  //     return el2.expense / el2.assigned;
  //   });
  // }))
  // .range(["white", "green"]);

  // size of zip based on population
  // let zipSize = d3.scaleLinear()
  //   .domain(d3.extent(zipData, el => el.population))
  //   .range([2, 5]);

  d3.json("./json/us.json", function(error, us) {
    if (error) {
      throw error;
    }

    // create Voronoi diagram
    let voronoiGeo = d3.voronoi()
        .extent([[-1, -1], [WIDTH + 1, HEIGHT + 1]])
        .polygons(testCenterIDs.map((el) => {
          let proj = projection([testCenterData[el].long, testCenterData[el].lat]);
          return proj;
        }));

    map.selectAll(".voronoiPath")
      .data(voronoiGeo)
    .enter().append("path")
      .attr("class", "voronoiPath")
      .attr("d", function(d) {
        return d ? "M" + d.join("L") + "Z" : null;
      })
      .datum((d, i) => {
        return testCenterData[testCenterIDs[i]];
      })
      .style("fill", (d, i) => {
        return voronoiFill(d3.mean(d.testEvents, (el) => {
          return el.assigned / el.capacity;
        }));
      })
      .style("stroke", "red")
      .style("stroke-width", 0.15);

    // create map
    map.append("g")
      .attr("class", "counties")
    .selectAll("path")
      // .data(topojson.feature(us, us.objects.states).features) // states
      .data(topojson.feature(us, us.objects.counties).features) // counties
    .enter().append("path")
      .attr("id", (d) => {
        return "county" + d.id;
      })
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", "black")
      .style("stroke-width", 0.5);

    // create zip points
    map.selectAll(".zip")
      .data(zipData)
    .enter().append("circle")
      .attr("class", "zip")
      .attr("cx", (d) => {
        return projection([d.long, d.lat])[0];
      })
      .attr("cy", (d) => {
        return projection([d.long, d.lat])[1];
      })
      .attr("r", (d) => {
        // return zipSize(d.population);
        return dotSize(d.population);
      })
      .style("fill", "orange")
      .style("stroke", "white")
      .style("stroke-width", 0.5);

    // create Test Center points (on top of zip points)
    map.selectAll(".testCenter")
      .data(testCenterIDs)
    .enter().append("circle")
      .attr("class", "testCenter")
      .datum((d) => {
        return testCenterData[d];
      })
      .attr("cx", (d) => {
        return projection([d.long, d.lat])[0];
      })
      .attr("cy", (d) => {
        return projection([d.long, d.lat])[1];
      })
      .attr("r", (d) => {
        return dotSize(d3.sum(d.testEvents, (el) => el.capacity));
      })
      .style("fill", (d) => {
        return "url(#grad" + Number(d.tcID) + ")";
      })
      .style("stroke", "green")
      .style("stroke-width", 0.05);

    // use linearGradient to fill circle
    var grad = mySVG.append("defs")
      .selectAll("linearGradient")
      .data(testCenterIDs)
      .enter().append("linearGradient")
      .datum((d) => testCenterData[d])
      .attr("id", function(d) {
        return "grad" + Number(d.tcID);
      })
      .attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%");

    grad.append("stop")
      .attr("offset", function(d) {
        //console.log(Number(d.id) + ": " + assignedSum[Number(d.id)] * 100 / capacitySum[Number(d.id)] + " - " + capacitySum[Number(d.id)]);
        return (d3.sum(d.testEvents, el => el.assigned) * 100 /
          d3.sum(d.testEvents, el => el.capacity)) + "%";
      })
      .style("stop-color", "green");

    grad.append("stop")
      .attr("offset", function(d) {
        return (d3.sum(d.testEvents, el => el.assigned) * 100 /
          d3.sum(d.testEvents, el => el.capacity)) + "%";
      })
      .style("stop-color", "white");

    // zoom into Cook County
    zoomIntoID("#county17031");

  });

  function zoomIntoID(id) {
    console.log("Zooming to " + id);

    var bounds = path.bounds(d3.select(id).datum().geometry),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .9 / Math.max(dx / WIDTH, dy / HEIGHT),
      translate = [WIDTH / 2 - scale * x, HEIGHT / 2 - scale * y];

    console.log("Scaling to " + scale);

    map.attr("transform", "translate(" + translate + ")scale(" + scale + ")")
    .select(".counties")
    .selectAll("path")
      .style("stroke-width", 0.5 / scale);

    // testCenterSize
    //   .domain(testCenterSize.domain().map(el => el / scale));

    map.selectAll(".voronoiPath")
      .style("stroke-width", 0.25 / scale);

    map.selectAll(".testCenter")
      .style("stroke-width", 0.5 / scale)
      .attr("r", (d) => {
        return dotSize(d3.mean(d.testEvents, (el) => el.capacity)) / scale;
      });

    map.selectAll(".zip")
      .attr("r", (d) => {
        // return zipSize(d.population) / scale;
        return dotSize(d.population) / scale;
      })
      .style("stroke-width", 0.5 / scale);
  }
}
