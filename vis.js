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
var svg2 = d3.select("#boxplot")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
		"translate(" + margin.left + "," + margin.top + ")");


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
	svg.append("g")
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
	svg.insert("g")
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
	svg.select("#myXaxis")
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
	svg.append("text")
		.attr("id", "xAxisText")
		.attr("text-anchor", "end")
		.attr("class", "axis")
		.attr("x", width - margin.right)
		.attr("y", height + 0.9 * margin.top)
		.text(xAxis);

	// Y axis label:
	svg.append("text")
		.attr("text-anchor", "end")
		.attr("id", "yAxisText")
		.attr("class", "axis")
		.attr("transform", "rotate(-90)")
		.attr("y", -margin.left + 20)
		.attr("x", -margin.top)
		.text(yAxis);


	//----------------- BOXPLOT -------------------
	var map1 = new Map();
    var perGenre = d3.nest()
    .key(function(d) { return d.genre; })
    .entries(data);

    genre_list = []
    for (i = 0; i < perGenre.length; i++){
      genre_list.push(perGenre[i].key)
    }
    Genre = perGenre[0].values;
    sumstat = []
    update(Genre)

     // add the genres to the dropdown menu
     d3.select("#artistmenu")
     .selectAll('myOptions')
      .data(genre_list)
     .enter()
     .append('option')
     .text(function (d) { return d; }) // text showed in the menu
     .attr("value", function (d) { return d; }) // corresponding value returned

  // A function that updates the chart
  function update(genre) {
    
    // Compute quartiles, median, inter quantile range min and max for the accousticness value
    sumstat = d3.nest() 
    .key(function(d) { return d.genre;})
    .rollup(function(d) {
    q1 = d3.quantile(d.map(function(g) { return g.acousticness;}).sort(d3.ascending),.25)
    median = d3.quantile(d.map(function(g) { return g.acousticness;}).sort(d3.ascending),.5)
    q3 = d3.quantile(d.map(function(g) { return g.acousticness;}).sort(d3.ascending),.75)
    interQuantileRange = q3 - q1
    min = q1 - 1.5 * interQuantileRange
    max = q3 + 1.5 * interQuantileRange
    return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
    })
    .entries(genre)

    // Compute quartiles, median, inter quantile range min and max for the danceability value
    sumstat_dance = d3.nest() 
    .key(function(d) { return d.genre;})
    .rollup(function(d) {
    q1 = d3.quantile(d.map(function(g) { return g.danceability;}).sort(d3.ascending),.25)
    median = d3.quantile(d.map(function(g) { return g.danceability;}).sort(d3.ascending),.5)
    q3 = d3.quantile(d.map(function(g) { return g.danceability;}).sort(d3.ascending),.75)
    interQuantileRange = q3 - q1
    min = q1 - 1.5 * interQuantileRange
    max = q3 + 1.5 * interQuantileRange
    return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
    })
    .entries(genre)

    // Compute quartiles, median, inter quantile range min and max for the liveness value
    sumstat_live = d3.nest() 
    .key(function(d) { return d.genre;})
    .rollup(function(d) {
    q1 = d3.quantile(d.map(function(g) { return g.liveness;}).sort(d3.ascending),.25)
    median = d3.quantile(d.map(function(g) { return g.liveness;}).sort(d3.ascending),.5)
    q3 = d3.quantile(d.map(function(g) { return g.liveness;}).sort(d3.ascending),.75)
    interQuantileRange = q3 - q1
    min = q1 - 1.5 * interQuantileRange
    max = q3 + 1.5 * interQuantileRange
    return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
    })
    .entries(genre)

    // Compute quartiles, median, inter quantile range min and max for the energy value
    sumstat_energy = d3.nest() 
    .key(function(d) { return d.genre;})
    .rollup(function(d) {
    q1 = d3.quantile(d.map(function(g) { return g.energy;}).sort(d3.ascending),.25)
    median = d3.quantile(d.map(function(g) { return g.energy;}).sort(d3.ascending),.5)
    q3 = d3.quantile(d.map(function(g) { return g.energy;}).sort(d3.ascending),.75)
    interQuantileRange = q3 - q1
    min = q1 - 1.5 * interQuantileRange
    max = q3 + 1.5 * interQuantileRange
    return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
    })
    .entries(genre)

    // Compute quartiles, median, inter quantile range min and max for the speechiness value
    sumstat_speechiness = d3.nest() 
    .key(function(d) { return d.genre;})
    .rollup(function(d) {
    q1 = d3.quantile(d.map(function(g) { return g.speechiness;}).sort(d3.ascending),.25)
    median = d3.quantile(d.map(function(g) { return g.speechiness;}).sort(d3.ascending),.5)
    q3 = d3.quantile(d.map(function(g) { return g.speechiness;}).sort(d3.ascending),.75)
    interQuantileRange = q3 - q1
    min = q1 - 1.5 * interQuantileRange
    max = q3 + 1.5 * interQuantileRange
    return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
    })
    .entries(genre)


	    //combine all nests into a single nest
		sumstat.push(sumstat_dance[0]);
		sumstat.push(sumstat_live[0]);
		sumstat.push(sumstat_energy[0]);
		sumstat.push(sumstat_speechiness[0]);
	
		//Rename the keys
		sumstat[0].key = 'Acousticness'
		sumstat[1].key = 'Danceability'
		sumstat[2].key = 'Liveness'
		sumstat[3].key = 'Energy'
		sumstat[4].key = "Speechiness"
	  }
	
	  //Create tooltip
	  var Tooltip = d3.select("#perartist")
		.append("div")
		.attr("class", "tooltip")
		.style("opacity", 0)
		// .style("position", "fixed")
		// .style("opacity", 0)
		// .style("background-color", "white")
		// .style("border", "solid")
		// .style("border-width", "2px")
		// .style("border-radius", "5px")
		// .style("padding", "5px")
	
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
	
	  var keys = []
	  for (i = 0; i < sumstat.length; i++){
		keys.push(sumstat[i].key);
	  }
	
	  // Show the X scale
	  var xBox = d3.scaleBand()
		.range([ 0, width ])
		.domain(keys)
		.paddingInner(1)
		.paddingOuter(.5)
	  svg2.append("g")
	  	.attr( "class", "axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xBox))
	
	  // Show the Y scale
	  var yBox = d3.scaleLinear()
		.domain([min, max])
		.range([height, 0])
	  vert = svg2.append("g").attr("class", "axis").call(d3.axisLeft(yBox))
	
	  // Show the main vertical line
	  var vertline = svg2
		.selectAll("vertLines")
		.data(sumstat)
		.enter()
		.append("line")
		  .attr("x1", function(d){return(xBox(d.key))})
		  .attr("x2", function(d){return(xBox(d.key))})
		  .attr("y1", function(d){return(yBox(d.value.min))})
		  .attr("y2", function(d){return(yBox(d.value.max))})
		  .attr("stroke", "black")
		  .style("width", 40)
	
	  //Show rectangle for the main box
	  var boxWidth = 70
	  var box =  svg2
		.selectAll("boxes")
		.data(sumstat)
		.enter()
		.append("rect")
			.attr("x", function(d){return(xBox(d.key)-boxWidth/2)})
			.attr("y", function(d){return(yBox(d.value.q3))})
			.attr("height", function(d){return(yBox(d.value.q1)-yBox(d.value.q3))})
			.attr("width", boxWidth )
			.attr("stroke", "black")
			.style("fill", "blue")
			.on("mouseover", function(d) {
			  Tooltip
				.style("opacity", 1)
			  d3.select(this)
				.style("fill", "steelblue")
			})
			.on("mousemove", function(d) {
			  Tooltip
				.html("Q1: " + d.value.q1.toFixed(3) + 
				"<br>Median: " + d.value.median.toFixed(3) +
				"<br>Q3: " + d.value.q3.toFixed(3) +
				"<br>Min: " + d.value.min.toFixed(3) +
				"<br>Max: " + d.value.max.toFixed(3))
				.style("left", d3.mouse(document.body)[0] + 15 + "px")
				.style("top", d3.mouse(document.body)[1] + 10 + "px")
			})
			.on("mouseleave", function(d) {
			  Tooltip
				.style("opacity", 0)
			  d3.select(this)
				.style("fill", "blue")
			})
			console.log(svg2.left)
	
	  // Show the median
	  var med = svg2
		.selectAll("medianLines")
		.data(sumstat)
		.enter()
		.append("line")
		  .attr("x1", function(d){return(xBox(d.key)-boxWidth/2) })
		  .attr("x2", function(d){return(xBox(d.key)+boxWidth/2) })
		  .attr("y1", function(d){return(yBox(d.value.median))})
		  .attr("y2", function(d){return(yBox(d.value.median))})
		  .attr("stroke", "black")
		  .style("width", 80)
	  
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
	
		var keys = []
		for (i = 0; i < sumstat.length; i++){
		  keys.push(sumstat[i].key);
		}
	
		yBox
		  .domain([min, max])
		  .range([height, 0])
		vert
		  .transition().duration(1000)
		  .call(d3.axisLeft(y));
	
		//Update vertical line
		vertline
		  .data(sumstat)
		  .transition()
		  .duration(1000)
			.attr("x1", function(d){return(xBox(d.key))})
			.attr("x2", function(d){return(xBox(d.key))})
			.attr("y1", function(d){return(yBox(d.value.min))})
			.attr("y2", function(d){return(yBox(d.value.max))})
			.attr("stroke", "black")
			.style("width", 40)
	
		//Update rectangle for the main box
		box
		  .data(sumstat)
		  .transition()
		  .duration(1000)
			.attr("x", function(d){return(xBox(d.key)-boxWidth/2)})
			.attr("y", function(d){return(yBox(d.value.q3))})
			.attr("height", function(d){return(yBox(d.value.q1)-yBox(d.value.q3))})
			.attr("width", boxWidth )
			.attr("stroke", "black")
			.style("fill", "blue")
	
		//Update the median
		med
		  .data(sumstat)
		  .transition()
		  .duration(1000)
			.attr("x1", function(d){return(xBox(d.key)-boxWidth/2) })
			.attr("x2", function(d){return(xBox(d.key)+boxWidth/2) })
			.attr("y1", function(d){return(yBox(d.value.median))})
			.attr("y2", function(d){return(yBox(d.value.median))})
			.attr("stroke", "black")
			.style("width", 80)
	  
	  }
	  //When a new artist is selected from the dropdown menu, update the values of the boxplot
	  d3.select("#artistmenu").on("change", function(d) {
		var selectedOption = d3.select(this).property("value")
		index = 0;
		for (i = 0; i < perGenre.length; i++){
		  if (selectedOption == perGenre[i].values[0].genre){
			index = i;
		  }
		}
		genre = perGenre[index].values;
		update(genre);
		updateplot(svg2, sumstat);
	})
	
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
		div.html("<p><span style='font-weight:bold'>"+ d.track_name+"</span> by " + d.artist_name+ "</p><p>"
		+ xAxis + ": " + d3.format(".2f")(selectXAxis(d)) + "<br>"+ yAxis + ": " + d3.format(".2f")(selectYAxis(d))+"</p>")
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
			svg.select("#densityPlot")
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
			subset = data.slice(0,n);
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
			svg.select("#densityPlot")
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
			d3.selectAll("#dataPoints")
				.transition()
				.duration(500)
				.attr("opacity", 0);

			//Show all paths
			d3.selectAll("#paths").attr("opacity", 0);
			d3.selectAll("#paths")
				.transition()
				.duration(500)
				.attr("opacity", 1);
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
			d3.selectAll("#paths")
				.transition()
				.duration(500)
				.attr("opacity", 0);
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
			svg.select("#densityPlot")
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
			svg.select("#densityPlot")
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
				.domain([0,1])
	
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

			svg.select("#regressionLine")
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
