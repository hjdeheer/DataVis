var margin = {top: 10, right: 30, bottom: 30, left: 50},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#scatterplot")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Load the csv
d3.csv("dataset/SpotifyFeatures.csv", function(data) {
    n = 100
    shuffleArray(data)
    subset = data.slice(0, n)

    // for (var i = 0; i < 10; i++) {
    //     console.log(data[i].genre);
    //     console.log(data[i].artist_name);
    // }

    var x = d3.scaleLinear()
        .domain([0,1])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

    var y = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    var circle = svg.append('g')
        .selectAll("circle")
        .data(subset);

    circle.enter().append("circle")
        .attr("r", 2.5)
        .merge(circle)
        .attr("cx", function(d) { return x(d.acousticness);  })
        .attr("cy", function(d) { return y(d.energy); })
        .attr("id", "dataPoints")
        .attr("r", 3)
        .style("fill", "#69b3a2");

    function updateChart() {
        points = this.value;
        subset = data.slice(0, points)

        //Remove all current circles
        d3.selectAll("#dataPoints").remove()

        var circle = svg.append('g').selectAll("circle").data(subset);
        
        circle
        .enter().append("circle")
        .attr("r", 2.5)
        .merge(circle)
        .attr("cx", function(d) { return x(d.acousticness);  })
        .attr("cy", function(d) { return y(d.energy); })
        .attr("id", "dataPoints")
        .attr("r", 3)
        .style("fill", "#69b3a2");
    }

    d3.select("#buttonSize").on("input", updateChart )

    
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