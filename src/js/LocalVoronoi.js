/* global d3 */
/* global topojson */
/* global d3-voronoi */

function createLocalVoronoi(svgID, columnID, stateOrCounty, useFakeData) {
  let WIDTH = d3.select(columnID).node().clientWidth - 40;
  let HEIGHT = WIDTH * 1.5;

  let dotScale = window.innerWidth/1920;

  let zipData = [];
  let testCenterData = {};
  let testCenterIDs = [];

  // let fakeDataIDs = ["2268870", "2273631", "2269023", "2273126", "1", "2"];

  let mySVG = d3.select(svgID)
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
    d3.csv("./data/ACT_AllPointsFile.csv")
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
    d3.csv("./data/ACT_TestEvents.csv")
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

        // code to manufacture fake data

        if(useFakeData) {
          // add a new test center

          testCenterData["1"] = {
            pID: 1,
            lat: 42.095,
            long: -87.787,
            tcID: 1,
            testEvents: [{
              assigned: 80,
              capacity: 200
            }],
            fake: true
          };
          testCenterIDs.push("1");

          // change data from an existing test center
          testCenterData["2273631"].testEvents[0].assigned = 600;
          testCenterData["2273631"].fake = true;
          // change data from an existing test center
          testCenterData["2268870"].testEvents[0].assigned = -800;
          testCenterData["2268870"].fake = true;

          // add a second new test center
          testCenterData["2"] = {
            pID: 2,
            lat: 41.755,
            long: -87.860,
            tcID: 2,
            testEvents: [{
              assigned: 80,
              capacity: 200
            }],
            fake: true
          };
          testCenterIDs.push("2");

          // change data from an existing test center
          testCenterData["2269023"].testEvents[0].assigned = -300;
          testCenterData["2269023"].fake = true;
          testCenterData["2269024"].fake = true;
          // change data from an existing test center
          testCenterData["2273126"].testEvents[0].assigned = -100;
          testCenterData["2273126"].fake = true;
        }




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
      .range([2 * dotScale, 6 * dotScale]);

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

    d3.json("./data/us.json", function(error, us) {
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
          let percent = d3.mean(d.testEvents, (el) => {
            return el.assigned / el.capacity;
          });

          return percent > 1 ? "#FF0000" : voronoiFill(percent);
        })
        .style("stroke", (d) => {
          //return d.fake ? "yellow" : "red";
          return d.fake ? "red" : "gray";
        })
        .style("stroke-width", (d) => {
          return d.fake ? 0.5 : 0.15;
        })
        .on("click", (d) => {
          console.log(d);
          console.log(d3.mean(d.testEvents, (el) => {
            return el.assigned / el.capacity;
          }));
        });

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
        .style("stroke-width", 1);

      // create map
      map.append("g")
        .attr("class", "states")
      .selectAll("path")
        // .data(topojson.feature(us, us.objects.states).features) // states
        .data(topojson.feature(us, us.objects.states).features) // counties
      .enter().append("path")
        .attr("id", (d) => {
          return "state" + d.id;
        })
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-width", 5);

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
            if (d.pID == 1 || d.pID == 2)
              return "red";
            else
              return "url(#grad" + Number(d.tcID) + ")";
        })
        .style("stroke", "green")
        .style("stroke-width", 0.05)
        .on("click", (d) => {
          console.log(d);
        });

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
      if(stateOrCounty === "state") {
        zoomIntoID("#state17");
      } else {
        zoomIntoID("#county17031");
      }

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
        .style("stroke-width", dotScale * 1 / scale)
        .style("opacity", stateOrCounty === "state" ? 0 : 1);

      map.select(".states")
        .selectAll("path")
          .style("stroke-width", dotScale * 2 / scale);

      // testCenterSize
      //   .domain(testCenterSize.domain().map(el => el / scale));

      map.selectAll(".voronoiPath")
        .style("stroke-width", (d) => {
          return (dotScale / scale) * d.fake ? 0.25 : 0.05;
        });

      map.selectAll(".testCenter")
        .style("stroke-width", dotScale * 0.5 / scale)
        .attr("r", (d) => {
          return dotSize(d3.mean(d.testEvents, (el) => el.capacity)) / scale;
        });

      map.selectAll(".zip")
        .attr("r", (d) => {
          // return zipSize(d.population) / scale;
          return dotSize(d.population) / scale;
        })
        .style("stroke-width", dotScale * 0.5 / scale)
        .style("opacity", stateOrCounty === "state" ? 0 : 1);

      map.select(id).style("stroke-width", dotScale * 4 / scale)
    }
  }
}
