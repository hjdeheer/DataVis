var margin = { top: 40, right: 40, bottom: 50, left: 50 },
  width = 550 - margin.left - margin.right,
  height = 550 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#scatterplot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// append the svg object to the body of the page
var svg2 = d3
  .select("#boxplot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Load the csv
d3.csv("dataset/SpotifyFeatures.csv", function (data) {
  console.log(data);
  // d3.csv("https://raw.githubusercontent.com/hjdeheer/DataVis/main/dataset/SpotifyFeatures.csv", function (data) {
  //Global variables
  //On initialization, show 100 points with opacity 1 and 500 with opacity 0
  n = 100;
  xAxis = "acousticness";
  yAxis = "energy";
  document.getElementById("selectY").selectedIndex = 2;
  nDensityPlot = 2500;
  maxPoints = 500;
  densityIsVisible = false;
  regressionIsVisible = false;
  shuffleArray(data);
  subset = data.slice(0, n);
  maxSubset = data.slice(0, maxPoints);

  // Add X axis
  var x = d3
    .scaleLinear()
    .domain([0, 0])
    .range([margin.left, width - margin.right]);
  svg
    .append("g")
    .attr("id", "myXaxis")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .attr("opacity", "0");

  //Add y-axis
  var y = d3
    .scaleLinear()
    .domain([0, 1])
    .range([height - margin.bottom, margin.top]);
  svg.append("g").attr("class", "axis").call(d3.axisLeft(y));

  //Density plot
  var color = d3
    .scaleLinear()
    .domain([0, 1]) // Points per square pixel.
    .range(["white", "#69b3a2"]);

  //Compute density data
  var densityData = d3
    .contourDensity()
    .x(function (d) {
      return x(selectXAxis);
    })
    .y(function (d) {
      return y(selectYAxis);
    })
    .size([width, height])(data.slice(0, n));

  //Initialize paths with 0.
  svg
    .insert("g")
    .attr("id", "densityPlot")
    .selectAll("path")
    .data(densityData)
    .enter()
    .append("path")
    .attr("id", "paths")
    .attr("opacity", 0)
    .attr("d", d3.geoPath())
    .attr("fill", function (d) {
      return color(d.value * 100);
    });

  //Create regression line base
  svg.append("g").attr("id", "regressionLine");

  //Create all 500 data points
  var circle = svg
    .append("g")
    .attr("id", "groupOfCircles")
    .attr("z-index", "1")
    .selectAll("circle")
    .data(maxSubset);

  allCircles = circle
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return x(selectXAxis(d));
    })
    .attr("cy", function (d) {
      return y(selectYAxis(d));
    })
    .attr("id", "dataPoints")
    .attr("r", 3)
    .attr("z-index", "1")
    .attr("opacity", 0)
    .attr("fill", "#69b3a2");

  shownCircles = allCircles.data(subset).attr("opacity", 1);

  d3.selectAll("#dataPoints")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

  //X axis transition
  x.domain([0, 1]);
  svg
    .select("#myXaxis")
    .transition()
    .duration(750)
    .attr("opacity", "1")
    .call(d3.axisBottom(x));

  //Point transition
  allCircles
    .transition()
    .delay(function (d, i) {
      return i * 1;
    })
    .duration(750)
    .attr("cx", function (d) {
      return x(selectXAxis(d));
    })
    .attr("cy", function (d) {
      return y(selectYAxis(d));
    });

  //Create tooltip div
  var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  //X-axis label:
  svg
    .append("text")
    .attr("id", "xAxisText")
    .attr("text-anchor", "end")
    .attr("class", "axis")
    .attr("x", width - margin.right)
    .attr("y", height + 0.9 * margin.top)
    .text(xAxis);

  // Y axis label:
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("id", "yAxisText")
    .attr("class", "axis")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -margin.top)
    .text(yAxis);

  //----------------- BOXPLOT -------------------
  var map1 = new Map();
  var perGenre = d3
    .nest()
    .key(function (d) {
      return d.genre;
    })
    .entries(data);

  genre_list = [];
  for (i = 0; i < perGenre.length; i++) {
    genre_list.push(perGenre[i].key);
  }
  Genre = perGenre[0].values;
  sumstat = [];
  update(Genre);

  // add the genres to the dropdown menu
  d3.select("#artistmenu")
    .selectAll("myOptions")
    .data(genre_list)
    .enter()
    .append("option")
    .text(function (d) {
      return d;
    }) // text showed in the menu
    .attr("value", function (d) {
      return d;
    }); // corresponding value returned

  // A function that updates the chart
  function update(genre) {
    // Compute quartiles, median, inter quantile range min and max for the accousticness value
    sumstat = d3
      .nest()
      .key(function (d) {
        return d.genre;
      })
      .rollup(function (d) {
        q1 = d3.quantile(
          d
            .map(function (g) {
              return g.acousticness;
            })
            .sort(d3.ascending),
          0.25
        );
        median = d3.quantile(
          d
            .map(function (g) {
              return g.acousticness;
            })
            .sort(d3.ascending),
          0.5
        );
        q3 = d3.quantile(
          d
            .map(function (g) {
              return g.acousticness;
            })
            .sort(d3.ascending),
          0.75
        );
        interQuantileRange = q3 - q1;
        min = q1 - 1.5 * interQuantileRange;
        max = q3 + 1.5 * interQuantileRange;
        return {
          q1: q1,
          median: median,
          q3: q3,
          interQuantileRange: interQuantileRange,
          min: min,
          max: max,
        };
      })
      .entries(genre);

    // Compute quartiles, median, inter quantile range min and max for the danceability value
    sumstat_dance = d3
      .nest()
      .key(function (d) {
        return d.genre;
      })
      .rollup(function (d) {
        q1 = d3.quantile(
          d
            .map(function (g) {
              return g.danceability;
            })
            .sort(d3.ascending),
          0.25
        );
        median = d3.quantile(
          d
            .map(function (g) {
              return g.danceability;
            })
            .sort(d3.ascending),
          0.5
        );
        q3 = d3.quantile(
          d
            .map(function (g) {
              return g.danceability;
            })
            .sort(d3.ascending),
          0.75
        );
        interQuantileRange = q3 - q1;
        min = q1 - 1.5 * interQuantileRange;
        max = q3 + 1.5 * interQuantileRange;
        return {
          q1: q1,
          median: median,
          q3: q3,
          interQuantileRange: interQuantileRange,
          min: min,
          max: max,
        };
      })
      .entries(genre);

    // Compute quartiles, median, inter quantile range min and max for the liveness value
    sumstat_live = d3
      .nest()
      .key(function (d) {
        return d.genre;
      })
      .rollup(function (d) {
        q1 = d3.quantile(
          d
            .map(function (g) {
              return g.liveness;
            })
            .sort(d3.ascending),
          0.25
        );
        median = d3.quantile(
          d
            .map(function (g) {
              return g.liveness;
            })
            .sort(d3.ascending),
          0.5
        );
        q3 = d3.quantile(
          d
            .map(function (g) {
              return g.liveness;
            })
            .sort(d3.ascending),
          0.75
        );
        interQuantileRange = q3 - q1;
        min = q1 - 1.5 * interQuantileRange;
        max = q3 + 1.5 * interQuantileRange;
        return {
          q1: q1,
          median: median,
          q3: q3,
          interQuantileRange: interQuantileRange,
          min: min,
          max: max,
        };
      })
      .entries(genre);

    // Compute quartiles, median, inter quantile range min and max for the energy value
    sumstat_energy = d3
      .nest()
      .key(function (d) {
        return d.genre;
      })
      .rollup(function (d) {
        q1 = d3.quantile(
          d
            .map(function (g) {
              return g.energy;
            })
            .sort(d3.ascending),
          0.25
        );
        median = d3.quantile(
          d
            .map(function (g) {
              return g.energy;
            })
            .sort(d3.ascending),
          0.5
        );
        q3 = d3.quantile(
          d
            .map(function (g) {
              return g.energy;
            })
            .sort(d3.ascending),
          0.75
        );
        interQuantileRange = q3 - q1;
        min = q1 - 1.5 * interQuantileRange;
        max = q3 + 1.5 * interQuantileRange;
        return {
          q1: q1,
          median: median,
          q3: q3,
          interQuantileRange: interQuantileRange,
          min: min,
          max: max,
        };
      })
      .entries(genre);

    // Compute quartiles, median, inter quantile range min and max for the speechiness value
    sumstat_speechiness = d3
      .nest()
      .key(function (d) {
        return d.genre;
      })
      .rollup(function (d) {
        q1 = d3.quantile(
          d
            .map(function (g) {
              return g.speechiness;
            })
            .sort(d3.ascending),
          0.25
        );
        median = d3.quantile(
          d
            .map(function (g) {
              return g.speechiness;
            })
            .sort(d3.ascending),
          0.5
        );
        q3 = d3.quantile(
          d
            .map(function (g) {
              return g.speechiness;
            })
            .sort(d3.ascending),
          0.75
        );
        interQuantileRange = q3 - q1;
        min = q1 - 1.5 * interQuantileRange;
        max = q3 + 1.5 * interQuantileRange;
        return {
          q1: q1,
          median: median,
          q3: q3,
          interQuantileRange: interQuantileRange,
          min: min,
          max: max,
        };
      })
      .entries(genre);

    //combine all nests into a single nest
    sumstat.push(sumstat_dance[0]);
    sumstat.push(sumstat_live[0]);
    sumstat.push(sumstat_energy[0]);
    sumstat.push(sumstat_speechiness[0]);

    //Rename the keys
    sumstat[0].key = "Acousticness";
    sumstat[1].key = "Danceability";
    sumstat[2].key = "Liveness";
    sumstat[3].key = "Energy";
    sumstat[4].key = "Speechiness";
  }

  //Create tooltip
  var Tooltip = d3
    .select("#perartist")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  //initialize the boxplots
  if (sumstat[0].value.min < -0.5) {
    min = sumstat[0].value.min - 0.1;
  } else {
    min = -0.5;
  }
  if (sumstat[0].value.max > 2) {
    min = sumstat[0].value.max + 0.1;
  } else {
    max = 2;
  }

  var keys = [];
  for (i = 0; i < sumstat.length; i++) {
    keys.push(sumstat[i].key);
  }

  // Show the X scale
  var xBox = d3
    .scaleBand()
    .range([0, width])
    .domain(keys)
    .paddingInner(1)
    .paddingOuter(0.5);
  svg2
    .append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xBox));

  // Show the Y scale
  var yBox = d3.scaleLinear().domain([min, max]).range([height, 0]);
  vert = svg2.append("g").attr("class", "axis").call(d3.axisLeft(yBox));

  // Show the main vertical line
  var vertline = svg2
    .selectAll("vertLines")
    .data(sumstat)
    .enter()
    .append("line")
    .attr("x1", function (d) {
      return xBox(d.key);
    })
    .attr("x2", function (d) {
      return xBox(d.key);
    })
    .attr("y1", function (d) {
      return yBox(d.value.min);
    })
    .attr("y2", function (d) {
      return yBox(d.value.max);
    })
    .attr("stroke", "black")
    .style("width", 40);

  //Show rectangle for the main box
  var boxWidth = 70;
  var box = svg2
    .selectAll("boxes")
    .data(sumstat)
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return xBox(d.key) - boxWidth / 2;
    })
    .attr("y", function (d) {
      return yBox(d.value.q3);
    })
    .attr("height", function (d) {
      return yBox(d.value.q1) - yBox(d.value.q3);
    })
    .attr("width", boxWidth)
    .attr("stroke", "black")
    .style("fill", "blue")
    .on("mouseover", function (d) {
      Tooltip.style("opacity", 1);
      d3.select(this).style("fill", "steelblue");
    })
    .on("mousemove", function (d) {
      Tooltip.html(
        "Q1: " +
          d.value.q1.toFixed(3) +
          "<br>Median: " +
          d.value.median.toFixed(3) +
          "<br>Q3: " +
          d.value.q3.toFixed(3) +
          "<br>Min: " +
          d.value.min.toFixed(3) +
          "<br>Max: " +
          d.value.max.toFixed(3)
      )
        .style("left", d3.mouse(document.body)[0] + 15 + "px")
        .style("top", d3.mouse(document.body)[1] + 10 + "px");
    })
    .on("mouseleave", function (d) {
      Tooltip.style("opacity", 0);
      d3.select(this).style("fill", "blue");
    });
  console.log(svg2.left);

  // Show the median
  var med = svg2
    .selectAll("medianLines")
    .data(sumstat)
    .enter()
    .append("line")
    .attr("x1", function (d) {
      return xBox(d.key) - boxWidth / 2;
    })
    .attr("x2", function (d) {
      return xBox(d.key) + boxWidth / 2;
    })
    .attr("y1", function (d) {
      return yBox(d.value.median);
    })
    .attr("y2", function (d) {
      return yBox(d.value.median);
    })
    .attr("stroke", "black")
    .style("width", 80);

  //functions for updating the boxplots
  function updateplot(svg2, sumstat) {
    //update the min and max values if the new data does not fit
    if (sumstat[0].value.min < -0.5) {
      min = sumstat[0].value.min - 0.1;
    } else {
      min = -0.5;
    }
    if (sumstat[0].value.max > 2) {
      min = sumstat[0].value.max + 0.1;
    } else {
      max = 2;
    }

    var keys = [];
    for (i = 0; i < sumstat.length; i++) {
      keys.push(sumstat[i].key);
    }

    yBox.domain([min, max]).range([height, 0]);
    vert.transition().duration(1000).call(d3.axisLeft(yBox));

    //Update vertical line
    vertline
      .data(sumstat)
      .transition()
      .duration(1000)
      .attr("x1", function (d) {
        return xBox(d.key);
      })
      .attr("x2", function (d) {
        return xBox(d.key);
      })
      .attr("y1", function (d) {
        return yBox(d.value.min);
      })
      .attr("y2", function (d) {
        return yBox(d.value.max);
      })
      .attr("stroke", "black")
      .style("width", 40);

    //Update rectangle for the main box
    box
      .data(sumstat)
      .transition()
      .duration(1000)
      .attr("x", function (d) {
        return xBox(d.key) - boxWidth / 2;
      })
      .attr("y", function (d) {
        return yBox(d.value.q3);
      })
      .attr("height", function (d) {
        return yBox(d.value.q1) - yBox(d.value.q3);
      })
      .attr("width", boxWidth)
      .attr("stroke", "black")
      .style("fill", "blue");

    //Update the median
    med
      .data(sumstat)
      .transition()
      .duration(1000)
      .attr("x1", function (d) {
        return xBox(d.key) - boxWidth / 2;
      })
      .attr("x2", function (d) {
        return xBox(d.key) + boxWidth / 2;
      })
      .attr("y1", function (d) {
        return yBox(d.value.median);
      })
      .attr("y2", function (d) {
        return yBox(d.value.median);
      })
      .attr("stroke", "black")
      .style("width", 80);
  }
  //When a new artist is selected from the dropdown menu, update the values of the boxplot
  d3.select("#artistmenu").on("change", function (d) {
    var selectedOption = d3.select(this).property("value");
    index = 0;
    for (i = 0; i < perGenre.length; i++) {
      if (selectedOption == perGenre[i].values[0].genre) {
        index = i;
      }
    }
    genre = perGenre[index].values;
    update(genre);
    updateplot(svg2, sumstat);
  });

  function handleMouseOver(d, i) {
    if (d3.select(this).attr("opacity") == 0) {
      return;
    }

    var matrix = this.getScreenCTM().translate(
      +this.getAttribute("cx"),
      +this.getAttribute("cy")
    );

    info = document.getElementById("selectX");
    xAxis = info.options[info.selectedIndex].value;
    info = document.getElementById("selectY");
    yAxis = info.options[info.selectedIndex].value;
    div
      .html(
        "<p><span style='font-weight:bold'>" +
          d.track_name +
          "</span> by " +
          d.artist_name +
          "</p><p>" +
          xAxis +
          ": " +
          d3.format(".2f")(selectXAxis(d)) +
          "<br>" +
          yAxis +
          ": " +
          d3.format(".2f")(selectYAxis(d)) +
          "</p>"
      )
      .style("left", window.pageXOffset + matrix.e + 10 + "px")
      .style("top", window.pageYOffset + matrix.f - 10 + "px");
    div.transition().duration(0).style("opacity", 1);

    d3.select(this).transition().duration("100").attr("r", 7);

    // div.html(d3.format(".2f")(d.energy))
    // 	.style("left", d3.select(this).attr("cx") + document.getElementById("scatterplot").offsetLeft + 10 + "px")
    // 	.style("top", d3.select(this).attr("cy") + document.getElementById("scatterplot").offsetTop- 10 + "px");
  }

  function handleMouseOut(d, i) {
    if (d3.select(this).attr("opacity") == 0) {
      return;
    }
    div.transition().duration("0").style("opacity", 0);
    d3.select(this).transition().duration(250).attr("r", 3);
  }

  function updatePoints(setN) {
    //If density is visible, remove all current paths and add new ones
    if (densityIsVisible) {
      nDensityPlot = this.value;
      if (nDensityPlot == undefined) {
        nDensityPlot = setN;
      }
      d3.selectAll("#paths").remove();
      var densityData = d3
        .contourDensity()
        .x(function (d) {
          return x(selectXAxis(d));
        })
        .y(function (d) {
          return y(selectYAxis(d));
        })
        .size([width, height])(data.slice(0, nDensityPlot));

      // show the shape!
      svg
        .select("#densityPlot")
        .selectAll("path")
        .data(densityData)
        .enter()
        .append("path")
        .attr("id", "paths")
        .attr("opacity", 1)
        .attr("d", d3.geoPath())
        .attr("fill", function (d) {
          return color(d.value * 20);
        });
    } else {
      //Update points
      n = this.value;
      subset = data.slice(0, n);
      switchRegression();
      shownCircles = allCircles.nodes().slice(0, n);
      opacityCircles = allCircles.nodes().slice(n, maxPoints);
      for (var i = 0; i < shownCircles.length; i++) {
        d3.select(shownCircles[i])
          .transition()
          .duration(1000)
          .attr("opacity", 1);
      }

      for (var i = 0; i < opacityCircles.length; i++) {
        d3.select(opacityCircles[i])
          .transition()
          .duration(1000)
          .attr("opacity", 0);
      }
      d3.selectAll("#paths").remove();
      var densityData = d3
        .contourDensity()
        .x(function (d) {
          return x(selectXAxis(d));
        })
        .y(function (d) {
          return y(selectYAxis(d));
        })
        .size([width, height])(data.slice(0, nDensityPlot));

      // show the shape!
      svg
        .select("#densityPlot")
        .selectAll("path")
        .data(densityData)
        .enter()
        .append("path")
        .attr("id", "paths")
        .attr("opacity", "0")
        .attr("d", d3.geoPath())
        .attr("fill", function (d) {
          return color(d.value * 20);
        });
    }
  }

  function switchDensity() {
    if (d3.select("#isDensity").property("checked")) {
      densityIsVisible = true;
      //Set max points to higher value
      document.getElementById("numberPoints").max = 10000;
      document.getElementById("numberPoints").value = nDensityPlot;
      document.getElementById("innerValue").innerHTML = nDensityPlot;
      updatePoints(nDensityPlot);

      //Turn all points opaque
      d3.selectAll("#dataPoints").transition().duration(500).attr("opacity", 0);

      //Show all paths
      d3.selectAll("#paths").attr("opacity", 0);
      d3.selectAll("#paths").transition().duration(500).attr("opacity", 1);
    } else {
      densityIsVisible = false;
      document.getElementById("numberPoints").max = 500;
      document.getElementById("numberPoints").value = n;
      document.getElementById("innerValue").innerHTML = n;

      shownCircles = allCircles.nodes().slice(0, n);

      for (var i = 0; i < shownCircles.length; i++) {
        d3.select(shownCircles[i])
          .transition()
          .duration(1000)
          .attr("opacity", 1);
      }

      //Show all paths
      d3.selectAll("#paths").transition().duration(500).attr("opacity", 0);
    }
  }
  function changeXAxis() {
    info = document.getElementById("selectX");
    xAxis = info.options[info.selectedIndex].value;
    changeDensity(densityIsVisible);
    switchRegression();
    changeScatter();

    d3.select("#xAxisText").text(xAxis);
    console.log(allCircles);
  }

  function changeYAxis() {
    info = document.getElementById("selectY");
    yAxis = info.options[info.selectedIndex].value;
    changeDensity(densityIsVisible);
    switchRegression();
    changeScatter();
    d3.select("#yAxisText").text(yAxis);
    console.log(allCircles);
  }

  function changeScatter() {
    //Turn all points opaque
    d3.selectAll("#dataPoints")
      .transition()
      .duration(1000)
      .attr("cx", function (d) {
        return x(selectXAxis(d));
      })
      .attr("cy", function (d) {
        return y(selectYAxis(d));
      });
  }

  function changeDensity(isVisible) {
    d3.selectAll("#paths").remove();
    var densityData = d3
      .contourDensity()
      .x(function (d) {
        return x(selectXAxis(d));
      })
      .y(function (d) {
        return y(selectYAxis(d));
      })
      .size([width, height])(data.slice(0, nDensityPlot));

    if (isVisible) {
      svg
        .select("#densityPlot")
        .selectAll("path")
        .data(densityData)
        .enter()
        .append("path")
        .attr("id", "paths")
        .attr("opacity", 1)
        .attr("d", d3.geoPath())
        .attr("fill", function (d) {
          return color(d.value * 20);
        });
    } else {
      svg
        .select("#densityPlot")
        .selectAll("path")
        .data(densityData)
        .enter()
        .append("path")
        .attr("id", "paths")
        .attr("opacity", 0)
        .attr("d", d3.geoPath())
        .attr("fill", function (d) {
          return color(d.value * 20);
        });
    }
  }

  function switchRegression() {
    if (d3.select("#isRegression").property("checked")) {
      svg.selectAll("#regressionLines").remove();
      regressionIsVisible = true;
      linearRegression = d3
        .regressionLinear()
        .x((d) => selectXAxis(d))
        .y((d) => selectYAxis(d))
        .domain([0, 1]);

      let res = linearRegression(subset);
      console.log(res);
      let line = d3
        .line()
        .x(function (d) {
          return x(d[0]);
        })
        .y(function (d) {
          return y(d[1]);
        });

      svg
        .select("#regressionLine")
        .append("path")
        .datum(res)
        .attr("id", "regressionLines")
        .attr("d", line)
        .attr("class", "reg")
        .style("stroke-dasharray", "5, 5")
        .style("stroke-linecap", "round")
        .attr("stroke", "#4a7d71")
        .attr("stroke-width", 3);
    } else {
      regressionIsVisible = false;
      svg.selectAll("#regressionLines").remove();
    }
  }
  //On changes
  d3.select("#numberPoints").on("input", updatePoints);
  d3.select("#isDensity").on("change", switchDensity);
  d3.select("#isRegression").on("change", switchRegression);
  d3.select("#selectX").on("change", changeXAxis);
  d3.select("#selectY").on("change", changeYAxis);
});

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function selectXAxis(d) {
  switch (xAxis) {
    case "acousticness":
      return d.acousticness;
    case "danceability":
      return d.danceability;
    case "energy":
      return d.energy;
    case "instrumentalness":
      return d.instrumentalness;
    case "liveness":
      return d.liveness;
    case "valence":
      return d.valence;
    case "speechiness":
      return d.speechiness;
    default:
      console.log("Axis not found");
      break;
  }
}

function selectYAxis(d) {
  switch (yAxis) {
    case "acousticness":
      return d.acousticness;
    case "danceability":
      return d.danceability;
    case "energy":
      return d.energy;
    case "instrumentalness":
      return d.instrumentalness;
    case "liveness":
      return d.liveness;
    case "valence":
      return d.valence;
    case "speechiness":
      return d.speechiness;
    default:
      console.log("Axis not found");
      break;
  }
}

// BUBBLEPLOT FROM HERE ON

// Daterange picker
// Copied from internet: https://www.daterangepicker.com/#config
var inputDate = $("#dateinput").daterangepicker({
  showDropdowns: true,
  startDate: "10/29/2021",
  endDate: "10/30/2021",
  minDate: "01/01/2017",
  maxDate: "10/30/2021",
});

inputDate.on("apply.daterangepicker", function (ev, picker) {
  start_date = picker.startDate.format("YYYY-MM-DD");
  end_date = picker.endDate.format("YYYY-MM-DD");
  filter_date = filterData(start_date, end_date, dataglobal);
  render(filter_date);
});

// Function to filter the given dataset between the indicated start and end dates
function filterData(start_date, end_date, data) {
  data = data.filter((d) => d.date >= start_date && d.date <= end_date);

  // Groupby song title
  data = d3.groups(data, (d) => d.title);

  // Computes percentage difference if there are 2 occurences of the song on the 2 dates. (New-old)/old * 100
  data.forEach((song) => {
    song[1].sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
  });
  data.forEach((song) => {
    if (song[1].length > 1) {
      song.push(
        (
          ((song[1][song[1].length - 1].streams - song[1][0].streams) /
            song[1][0].streams) *
          100
        ).toFixed(1)
      );
    } else {
      // Recently added songs with only 1 date get value 0 to seperate from data with 2 data points
      song.push(0);
    }
  });
  return data;
}

// Load dataset and render the data to show on startup (today compared to yesterday)
d3.csv("dataset/global_charts_modified.csv", function (data) {
  dataglobal = data;

  // Filter on latest day in dataset
  first_filter = filterData("2021-10-29", "2021-10-30", dataglobal);
  render(first_filter);
});

// Get width and height of current allocated gridbox
var svg_bubble_width = document.getElementById("bubbleplot").offsetWidth;
var svg_bubble_height = document.getElementById("bubbleplot").offsetHeight;

// Set svg
var svg3 = d3
  .select("#bubbleplot")
  .append("svg")
  .attr("width", svg_bubble_width)
  .attr("height", svg_bubble_height);

/* Function to render current data selection
	 Sets up scale, simulation, circles, texts
  */
var render = (data) => {
  // Quick fix: delete all svg elements and start from clean
  // Desired solution: use d3 general update pattern
  svg3.selectAll("*").remove();

  // Quick fix: take all perc and find max
  // TODO: more efficient
  var minmax = [];
  data.forEach((song) => {
    minmax.push(+song[2]);
  });
  var max_percentage = Math.max.apply(null, minmax.map(Math.abs));
  var min_percentage = Math.min.apply(null, minmax.map(Math.abs));

  // Scale to convert percentage change to the radius of a circle
  var radiusScale = d3
    .scaleSqrt()
    .domain([min_percentage, max_percentage])
    .range([20, 100]);

  // Forcelayout to move the bubbles and do collisions
  var simulation = d3
    .forceSimulation()
    .force("x", d3.forceX(svg_bubble_width / 2).strength(0.05))
    .force("y", d3.forceY(svg_bubble_height / 2).strength(0.05))
    .force(
      "collide",
      d3.forceCollide((d) => {
        return radiusScale(Math.abs(d[d.length - 1])) + 5;
      })
    );

  // Every bubbles represents one song in the dataset
  // Bubble = group of circle + text
  var bubbles = svg3.selectAll(".bubble").data(data);

  // Bubble exit selection, remove g
  bubbles.exit().remove();

  // Bubbles enter selection, append g
  bubblesEnter = bubbles
    .enter()
    .merge(bubbles)
    .append("g")
    .attr("class", "bubble");

  // Bubbles enter selection append circle to g
  bubblesEnter
    .append("circle")
    .attr("class", "circle")
    .attr("r", (d) => {
      return radiusScale(Math.abs(d[d.length - 1]));
    })
    // Give + green color, - red color, recently added blue color
    .attr("fill", (d) => {
      if (d[2] !== 0) {
        if (Math.sign(d[2]) == 1) {
          return "green";
        } else {
          return "red";
        }
      } else {
        return "#d2d6d2";
      }
    });

  // Bubbles enter selection append Title text to g
  bubblesEnter
    .append("text")
    .text((d) => d[1][0].title)
    .attr("text-anchor", "middle")
    .attr("color", "black")
    .attr("font-size", 15)
    .attr("y", (d) => {
      if (d[2] !== 0) {
        return -radiusScale(Math.abs(d[d.length - 1])) / 3;
      } else {
        return -20 / 3;
      }
    });

  // Bubbles enter selection append Percentage text to g
  bubblesEnter
    .append("text")
    .attr("text-anchor", "middle")
    .attr("color", "black")
    .attr("font-size", 15)
    .attr("y", (d) => {
      if (d[2] !== 0) {
        return radiusScale(Math.abs(d[d.length - 1])) / 3;
      } else {
        return 20 / 3;
      }
    })
    .text((d) => d[d.length - 1] + "%");

  // Bubbles enter + update selection
  bubbles = bubblesEnter
    .on("click", (d) => onBubbleClick(d))
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  // Set data for simulation and link with ticked function
  simulation.nodes(data).on("tick", ticked);

  // Update bubble position on every tick
  function ticked() {
    bubbles.attr("transform", function (d) {
      // enter + update, position the g
      bubbleradius = radiusScale(Math.abs(d[d.length - 1]));
      dx = Math.max(
        bubbleradius,
        Math.min(svg_bubble_width - bubbleradius, d.x)
      );
      dy = Math.max(
        bubbleradius,
        Math.min(svg_bubble_height - bubbleradius, d.y)
      );
      //   dx = Math.max(radius, Math.min(svg_bubble_width-radius, d.x))
      return "translate(" + dx + "," + dy + ")";
    });
  }

  // Three functions to make bubbles draggable
  // Copied from internet: https://bl.ocks.org/mbostock/4062045
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.03).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0.03);
    d.fx = null;
    d.fy = null;
  }
};

// Varius options to filter data based on selections. Buttons, sliders, input etc
d3.select("#edSheeran").on("click", () => {
  filtered_data = filterData("2017-03-03", "2017-03-04", dataglobal);
  filtered_data = filtered_data.filter((d) => d[1][0].artist == "Ed Sheeran");
  render(filtered_data);
});

d3.select("#reset").on("click", () => {
  filtered_data = filterData("2017-03-03", "2017-03-04", dataglobal);
  render(filtered_data);
});

/* Function executes when bubble is clicked
	It creates two new rectangles on the screen.
	First rectangle contains information about the selected bubble
	Second rectangle draws a line chart over the WHOLE timeline of the selected bubble
	Some interacties with mousehover is added
  */
function onBubbleClick(d) {
  if (d3.event.defaultPrevented) return; // click suppressed

  // Make sure any other (previous charts) is deleted
  d3.selectAll(".chart").remove();

  // Have to retrieve original dataset to get the whole timeline data of the song
  songdata = dataglobal.filter((dglobal) => dglobal.title == d[1][0].title);
  // Sort new dataset by date
  songdata.sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });

  songdata.forEach((song) => {
    song.date = new Date(song.date);
  });

  line_chart_width = 400;
  line_chart_height = 300;

  // Create group for chart information
  chart_info = svg3
    .append("g")
    .attr("class", "chart")
    .attr(
      "transform",
      "translate(" +
        (svg_bubble_width / 2 - 200) +
        "," +
        (svg_bubble_height / 2 - 200) +
        ")"
    );

  chart_info
    .append("rect")
    .attr("width", line_chart_width)
    .attr("height", 200)
    .attr("fill", "gray")
    .attr("stroke", "red")
    .attr("fill-opacity", 0.97);

  var song_name = chart_info
    .append("text")
    .attr("y", 50)
    .attr("x", 10)
    .text("Song: ");

  var artist_name = chart_info
    .append("text")
    .attr("y", 80)
    .attr("x", 10)
    .text("Artist: ");

  var rank = chart_info
    .append("text")
    .attr("y", 110)
    .attr("x", 10)
    .text("Rank: ");

  var date = chart_info
    .append("text")
    .attr("y", 140)
    .attr("x", 10)
    .text("Date: ");

  var streams = chart_info
    .append("text")
    .attr("y", 170)
    .attr("x", 10)
    .text("Streams: ");

  var song_name_input = chart_info
    .append("text")
    .attr("y", 50)
    .attr("x", 80)
    .text(d[1][0].title);

  var artist_name_input = chart_info
    .append("text")
    .attr("y", 80)
    .attr("x", 80)
    .text(d[1][0].artist);

  var streams_input = chart_info.append("text").attr("y", 170).attr("x", 80);

  var rank_input = chart_info.append("text").attr("y", 110).attr("x", 80);

  var date_input = chart_info.append("text").attr("y", 140).attr("x", 80);

  var close_chart = chart_info
    .append("g")
    .attr("class", "chartclose")
    .attr("transform", "translate(" + (line_chart_width - 55) + "," + 5 + ")");

  var close_button = close_chart
    .append("path")
    .attr("d", "M 5,5 l 45,45 M 50,5 l -45,45")
    .attr("stroke", "red")
    .attr("stroke-width", 10);

  var close_rect = close_chart
    .append("rect")
    .attr("width", 50)
    .attr("height", 50)
    .attr("fill", "black")
    .attr("opacity", 0)
    .on("click", () => d3.selectAll(".chart").remove())
    .on("mouseover", () => close_button.attr("stroke", "white"))
    .on("mouseout", () => close_button.attr("stroke", "red"));

  // Create group for the chart
  chart = svg3
    .append("g")
    .attr("class", "chart")
    .attr(
      "transform",
      "translate(" +
        (svg_bubble_width / 2 - 200) +
        "," +
        svg_bubble_height / 2 +
        ")"
    );

  chart
    .append("rect")
    .attr("width", line_chart_width)
    .attr("height", line_chart_height)
    .attr("fill", "gray")
    .attr("fill-opacity", 0.97)
    .style("pointer-events", "all")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);

  var x = d3
    .scaleTime()
    .domain(d3.extent(songdata, (d) => d.date))
    .range([0, line_chart_width]);

  var y = d3
    .scaleLinear()
    .domain([0, d3.max(songdata, (d) => +d.streams)])
    .range([0, line_chart_height]);

  chart
    .append("path")
    .datum(songdata)
    .attr(
      "d",
      d3
        .area()
        .x(function (d) {
          return x(d.date);
        })
        .y1(function (d) {
          return y(d.streams);
        })
        .y0(line_chart_height)
    )
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("fill", "#69b3a2");

  // Create the circle that travels along the curve of chart
  var focus = chart
    .append("circle")
    .style("fill", "none")
    .attr("stroke", "black")
    .attr("r", 8.5)
    .style("opacity", 0);

  var focusText = chart
    .append("text")
    .style("opacity", 0)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("y", 20);

  // This allows to find the closest X index of the mouse:
  var bisect = d3.bisector(function (d) {
    return d.date;
  }).right;

  // What happens when the mouse move -> show the annotations at the right positions.
  function mouseover() {
    focus.style("opacity", 1);
    focusText.style("opacity", 1);
  }

  function mousemove() {
    // recover coordinate we need
    var x0 = x.invert(d3.mouse(this)[0]);
    var i = bisect(songdata, x0, 1);
    selectedData = songdata[i];
    // console.log(selectedData);
    focus.attr("cx", x(selectedData.date)).attr("cy", y(selectedData.streams));
    focusText
      .text("streams:" + selectedData.streams)
      .attr("x", x(selectedData.date));
    rank_input.text(selectedData.rank);
    date_input.text(
      selectedData.date.getDate() +
        "/" +
        selectedData.date.getMonth() +
        "/" +
        selectedData.date.getFullYear()
    );
    streams_input.text(Math.floor(selectedData.streams));
  }
  function mouseout() {
    focus.style("opacity", 0);
    focusText.style("opacity", 0);
  }
}
