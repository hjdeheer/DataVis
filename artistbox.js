// set the dimensions and margins of the graph
var margin = { top: 40, right: 40, bottom: 50, left: 50 },
	width = 550 - margin.left - margin.right,
	height = 550 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg2 = d3.select("#boxplot")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


// Read the data
d3.csv("https://raw.githubusercontent.com/hjdeheer/DataVis/main/dataset/SpotifyFeatures.csv", function(data) {

    var map1 = new Map();
    var perArtist = d3.nest()
    .key(function(d) { return d.artist_name; })
    .entries(data);

    artist_list = []
    for (i = 0; i < perArtist.length; i++){
      artist_list.push(perArtist[i].key)
    }
    artist = perArtist[0].values;
    sumstat = []
    update(artist)

     // add the artists to the dropdown menu
     d3.select("#artistmenu")
     .selectAll('myOptions')
      .data(artist_list)
     .enter()
     .append('option')
     .text(function (d) { return d; }) // text showed in the menu
     .attr("value", function (d) { return d; }) // corresponding value returned

  // A function that updates the chart
  function update(artist) {
    
    // Compute quartiles, median, inter quantile range min and max for the accousticness value
    sumstat = d3.nest() 
    .key(function(d) { return d.artist_name;})
    .rollup(function(d) {
    q1 = d3.quantile(d.map(function(g) { return g.acousticness;}).sort(d3.ascending),.25)
    median = d3.quantile(d.map(function(g) { return g.acousticness;}).sort(d3.ascending),.5)
    q3 = d3.quantile(d.map(function(g) { return g.acousticness;}).sort(d3.ascending),.75)
    interQuantileRange = q3 - q1
    min = q1 - 1.5 * interQuantileRange
    max = q3 + 1.5 * interQuantileRange
    return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
    })
    .entries(artist)

    // Compute quartiles, median, inter quantile range min and max for the danceability value
    sumstat_dance = d3.nest() 
    .key(function(d) { return d.artist_name;})
    .rollup(function(d) {
    q1 = d3.quantile(d.map(function(g) { return g.danceability;}).sort(d3.ascending),.25)
    median = d3.quantile(d.map(function(g) { return g.danceability;}).sort(d3.ascending),.5)
    q3 = d3.quantile(d.map(function(g) { return g.danceability;}).sort(d3.ascending),.75)
    interQuantileRange = q3 - q1
    min = q1 - 1.5 * interQuantileRange
    max = q3 + 1.5 * interQuantileRange
    return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
    })
    .entries(artist)

    // Compute quartiles, median, inter quantile range min and max for the liveness value
    sumstat_live = d3.nest() 
    .key(function(d) { return d.artist_name;})
    .rollup(function(d) {
    q1 = d3.quantile(d.map(function(g) { return g.liveness;}).sort(d3.ascending),.25)
    median = d3.quantile(d.map(function(g) { return g.liveness;}).sort(d3.ascending),.5)
    q3 = d3.quantile(d.map(function(g) { return g.liveness;}).sort(d3.ascending),.75)
    interQuantileRange = q3 - q1
    min = q1 - 1.5 * interQuantileRange
    max = q3 + 1.5 * interQuantileRange
    return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
    })
    .entries(artist)

    //combine all nests into a single nest
    sumstat.push(sumstat_dance[0]);
    sumstat.push(sumstat_live[0]);

    
    //Rename the keys
    sumstat[0].key = 'Acousticness'
    sumstat[1].key = 'Danceability'
    sumstat[2].key = 'Liveness'
  }

  //initialize the boxplots
  min = -0.5;
  max = 2;

  var keys = []
  for (i = 0; i < sumstat.length; i++){
    keys.push(sumstat[i].key);
  }

  // Show the X scale
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(keys)
    .paddingInner(1)
    .paddingOuter(.5)
  svg2.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

  // Show the Y scale
  var y = d3.scaleLinear()
    .domain([min, max])
    .range([height, 0])
  vert = svg2.append("g").call(d3.axisLeft(y))

  // Show the main vertical line
  var vertline = svg2
    .selectAll("vertLines")
    .data(sumstat)
    .enter()
    .append("line")
      .attr("x1", function(d){return(x(d.key))})
      .attr("x2", function(d){return(x(d.key))})
      .attr("y1", function(d){return(y(d.value.min))})
      .attr("y2", function(d){return(y(d.value.max))})
      .attr("stroke", "black")
      .style("width", 40)

  //Show rectangle for the main box
  var boxWidth = 100
  var box =  svg2
    .selectAll("boxes")
    .data(sumstat)
    .enter()
    .append("rect")
        .attr("x", function(d){return(x(d.key)-boxWidth/2)})
        .attr("y", function(d){return(y(d.value.q3))})
        .attr("height", function(d){return(y(d.value.q1)-y(d.value.q3))})
        .attr("width", boxWidth )
        .attr("stroke", "black")
        .style("fill", "#69b3a2")

  // Show the median
  var med = svg2
    .selectAll("medianLines")
    .data(sumstat)
    .enter()
    .append("line")
      .attr("x1", function(d){return(x(d.key)-boxWidth/2) })
      .attr("x2", function(d){return(x(d.key)+boxWidth/2) })
      .attr("y1", function(d){return(y(d.value.median))})
      .attr("y2", function(d){return(y(d.value.median))})
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

    y
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
        .attr("x1", function(d){return(x(d.key))})
        .attr("x2", function(d){return(x(d.key))})
        .attr("y1", function(d){return(y(d.value.min))})
        .attr("y2", function(d){return(y(d.value.max))})
        .attr("stroke", "black")
        .style("width", 40)

    //Update rectangle for the main box
    var boxWidth = 100
    box
      .data(sumstat)
      .transition()
      .duration(1000)
        .attr("x", function(d){return(x(d.key)-boxWidth/2)})
        .attr("y", function(d){return(y(d.value.q3))})
        .attr("height", function(d){return(y(d.value.q1)-y(d.value.q3))})
        .attr("width", boxWidth )
        .attr("stroke", "black")
        .style("fill", "#69b3a2")

    //Update the median
    med
      .data(sumstat)
      .transition()
      .duration(1000)
        .attr("x1", function(d){return(x(d.key)-boxWidth/2) })
        .attr("x2", function(d){return(x(d.key)+boxWidth/2) })
        .attr("y1", function(d){return(y(d.value.median))})
        .attr("y2", function(d){return(y(d.value.median))})
        .attr("stroke", "black")
        .style("width", 80)
  
  }
  //When a new artist is selected from the dropdown menu, update the values of the boxplot
  d3.select("#artistmenu").on("change", function(d) {
    var selectedOption = d3.select(this).property("value")
    index = 0;
    for (i = 0; i < perArtist.length; i++){
      if (selectedOption == perArtist[i].values[0].artist_name){
        index = i;
      }
    }
    artist = perArtist[index].values;
    update(artist);
    updateplot(svg2, sumstat);
})
})