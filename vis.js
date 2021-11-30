var margin = { top: 10, right: 30, bottom: 30, left: 50 },
    width = 560 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Load the csv
d3.csv("dataset/SpotifyFeatures.csv", function (data) {
    //On initialization, show 100 points with opacity 1 and 500 with opacity 0
    n = 100
    maxPoints = 500
    shuffleArray(data)
    subset = data.slice(0, n)
    maxSubset = data.slice(0, maxPoints)
    // for (var i = 0; i < 10; i++) {
    //     console.log(data[i].genre);
    //     console.log(data[i].artist_name);
    // }

    // Add X axis
    var x = d3.scaleLinear()
        .domain([0, 0])
        .range([margin.left, width - margin.right]);
    svg.append("g")
        .attr("class", "myXaxis")   // Note that here we give a class to the X axis, to be able to call it later and modify it
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .attr("opacity", "0")


    var y = d3.scaleLinear()
        .domain([0, 1])
        .range([height - margin.bottom, margin.top]);
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

    //Create all 500 circles
    var circle = svg.append('g')
        .selectAll("circle")
        .data(maxSubset);

    allCircles = circle.enter().append("circle")
        .attr("r", 2.5)
        .merge(circle)
        .attr("cx", function (d) { return x(d.acousticness); })
        .attr("cy", function (d) { return y(d.energy); })
        .attr("id", "dataPoints")
        .attr("r", 3)
        .attr('opacity', 0)
        .style("fill", "#69b3a2");
    console.log(allCircles)

    shownCircles = allCircles.nodes().slice(0, n)

    for (var i = 0; i < shownCircles.length; i++) {
        d3.select(shownCircles[i]).attr('opacity', 1)
    }
    // new X axis
    x.domain([0, 1])
    svg.select(".myXaxis")
        .transition()
        .duration(750)
        .attr("opacity", "1")
        .call(d3.axisBottom(x));

    svg.selectAll("circle")
        .transition()
        .delay(function (d, i) { return (i * 3) })
        .duration(750)
        .attr("cx", function (d) { return x(d.acousticness); })
        .attr("cy", function (d) { return y(d.energy); })


    //Density plot
    // Prepare a color palette
    var color = d3.scaleLinear()
        .domain([0, 1]) // Points per square pixel.
        .range(["white", "#69b3a2"])

    // compute the density data
    var densityData = d3.contourDensity()
        .x(function (d) { return x(d.acousticness); })
        .y(function (d) { return y(d.energy); })
        .size([width, height])
        (data.slice(0, n))


    // show the shape!
    svg.insert("g")
        .selectAll("path")
        .data(densityData)
        .enter().append("path")
        .attr("id", "paths")
        .attr("opacity", 0)
        .attr("d", d3.geoPath())
        .attr("fill", function (d) { return color(d.value * 100); })

    function updatePoints(setN) {
        n = this.value;
        if (n == undefined) {
            n = setN
        }

        console.log(n)
        shownCircles = allCircles.nodes().slice(0, n)
        opacityCircles = allCircles.nodes().slice(n, maxPoints)
        if (d3.select("#isDensity").property("checked")) {
            
            d3.selectAll("#paths").remove();
            var densityData = d3.contourDensity()
                .x(function (d) { return x(d.acousticness); })
                .y(function (d) { return y(d.energy); })
                .size([width, height])
                (data.slice(0, n))


            // show the shape!
            svg.insert("g")
                .selectAll("path")
                .data(densityData)
                .enter().append("path")
                .attr("id", "paths")
                .attr("opacity", 1)
                .attr("d", d3.geoPath())
                .attr("fill", function (d) { return color(d.value * 20); })

            
        }
        else {
            for (var i = 0; i < shownCircles.length; i++) {
                d3.select(shownCircles[i]).transition()
                    .duration(1000).attr('opacity', 1)
            }
    
            for (var i = 0; i < opacityCircles.length; i++) {
                d3.select(opacityCircles[i]).transition()
                    .duration(1000).attr('opacity', 0)
            }
        }
        //Update amount of points





    }

    function switchDensity() {
        if (d3.select("#isDensity").property("checked")) {
            //Set max points to higher value
            document.getElementById("numberPoints").max = 10000;
            if(document.getElementById("numberPoints").value > 500) {
                document.getElementById("numberPoints").value = 2500;
                document.getElementById("innerValue").innerHTML = 2500;
                updatePoints(2500);
            }


            //Turn all points opaque
            d3.selectAll("#dataPoints").transition()
                .duration(500)
                .attr('opacity', 0)

            //Show all paths
            d3.selectAll("#paths").transition()
                .duration(500)
                .attr('opacity', 1)
        }
        else {
            if(document.getElementById("innerValue").innerHTML > 500) {
                document.getElementById("innerValue").innerHTML = 500;
            }
            document.getElementById("numberPoints").max = 500;
            shownCircles = shownCircles = allCircles.nodes().slice(0, n)

            for (var i = 0; i < shownCircles.length; i++) {
                d3.select(shownCircles[i]).transition()
                    .duration(1000).attr('opacity', 1)
            }

            //Show all paths
            d3.selectAll("#paths").transition()
                .duration(500)
                .attr('opacity', 0)

        }
    }


    //On changes
    d3.select("#numberPoints").on("input", updatePoints)
    d3.select("#isDensity").on("change", switchDensity)


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