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

//Load the csv
d3.csv("dataset/SpotifyFeatures.csv", function (data) {
	//Global variables
	//On initialization, show 100 points with opacity 1 and 500 with opacity 0
	n = 100;
	xAxis = "acousticness";
	yAxis = "energy";
  document.getElementById("selectY").selectedIndex = 2;
	nDensityPlot = 2500;
	maxPoints = 500;
	densityIsVisible = false;
	shuffleArray(data);
	subset = data.slice(0, n);
	maxSubset = data.slice(0, maxPoints);
	// for (var i = 0; i < 10; i++) {
	//     console.log(data[i].genre);
	//     console.log(data[i].artist_name);
	// }

	// Add X axis
	var x = d3
		.scaleLinear()
		.domain([0, 0])
		.range([margin.left, width - margin.right]);
	svg.append("g")
		.attr("class", "myXaxis") // Note that here we give a class to the X axis, to be able to call it later and modify it
		.attr("transform", "translate(0," + height+ ")")
		.call(d3.axisBottom(x))
		.attr("opacity", "0");

	var y = d3
		.scaleLinear()
		.domain([0, 1])
		.range([height - margin.bottom, margin.top]);
	svg.append("g").attr("class", "axis").call(d3.axisLeft(y));

	//Create all 500 circles
	var circle = svg.append("g").selectAll("circle").data(maxSubset);

	allCircles = circle
		.enter()
		.append("circle")
		.attr("r", 2.5)
		.merge(circle)
		.attr("cx", function (d) {
			return x(selectXAxis(d));
		})
		.attr("cy", function (d) {
			return y(selectYAxis(d));
		})
		.attr("id", "dataPoints")
		.attr("r", 3)
		.attr("opacity", 0)
		.style("fill", "#69b3a2");

	shownCircles = allCircles.nodes().slice(0, n);

	for (var i = 0; i < shownCircles.length; i++) {
		d3.select(shownCircles[i]).attr("opacity", 1);
	}
	// new X axis
	x.domain([0, 1]);
	svg.select(".myXaxis")
		.transition()
		.duration(750)
		.attr("opacity", "1")
		.call(d3.axisBottom(x));

	svg.selectAll("circle")
		.transition()
		.delay(function (d, i) {
			return i * 3;
		})
		.duration(750)
		.attr("cx", function (d) {
			return x(selectXAxis(d));
		})
		.attr("cy", function (d) {
			return y(selectYAxis(d));
		});

    svg.append("text")
    .attr("id", "xAxisText")
    .attr("text-anchor", "end")
    .attr("x", width - margin.right)
    .attr("y", height + 0.9*margin.top)
    .text(xAxis);

// Y axis label:
svg.append("text")
    .attr("text-anchor", "end")
    .attr("id", "yAxisText")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left+20)
    .attr("x", -margin.top)
    .text(yAxis)
	//Density plot
	// Prepare a color palette
	var color = d3
		.scaleLinear()
		.domain([0, 1]) // Points per square pixel.
		.range(["white", "#69b3a2"]);

	// compute the density data
	var densityData = d3
		.contourDensity()
		.x(function (d) {
			return x(selectXAxis);
		})
		.y(function (d) {
			return y(selectYAxis);
		})
		.size([width, height])(data.slice(0, n));

	// show the shape!
	svg.insert("g")
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

	function updatePoints(setN) {

		if (densityIsVisible) {
			nDensityPlot = this.value;
      if(nDensityPlot == undefined) {
        nDensityPlot = setN;
      }
		} else {
      n = this.value;
    }

		console.log(n);
		shownCircles = allCircles.nodes().slice(0, n);
		opacityCircles = allCircles.nodes().slice(n, maxPoints);
		if (d3.select("#isDensity").property("checked")) {
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
			svg.insert("g")
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
			svg.insert("g")
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
		//Update amount of points
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

			shownCircles = shownCircles = allCircles.nodes().slice(0, n);

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
		changeScatter();

    d3.select("#xAxisText").text(xAxis)
	}

	function changeYAxis() {
		info = document.getElementById("selectY");
		yAxis = info.options[info.selectedIndex].value;
		changeDensity(densityIsVisible);
		changeScatter();
    d3.select("#yAxisText").text(yAxis)
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
			svg.insert("g")
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
			svg.insert("g")
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

	//On changes
	d3.select("#numberPoints").on("input", updatePoints);
	d3.select("#isDensity").on("change", switchDensity);
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
