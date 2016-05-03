/*eslint-env d3, jquery*/
/*global d3*/
var width = 1275;
var height = 750;

// Setting color domains(intervals of values) for our map
var color_domain = [50, 100, 150, 200, 250, 300, 350, 400, 450];
var ext_color_domain = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450];
var legend_labels = ["< 50", "50+", "100+", "150+", "200+", "250+", "300+", "350+", "400+", "450+"];
var color = d3.scale.threshold()
    .domain(color_domain)
    .range(["#dcdcdc", "#d0d6cd", "#bdc9be", "#aabdaf", "#97b0a0", "#84a491", "#5e8b73", "#387255", "#256546", "#004d28"]);

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("margin", "10px auto");
//console.log(svg);

var path = d3.geo.path();

//Reading map file and data

queue() //eslint-disable no-queue
    .defer(d3.json, "data/county.json")
    .defer(d3.csv, "data/place_score.csv")
    .await(process);

//Start of Choropleth drawing

function process(error, counties, place_score) {
  //  console.log(counties);
    var score = {};
    var county_name = {};
    var state_name = {};

    place_score.forEach(function(d) {
        score[+d.FIPS] = +d.Overall;
        county_name[+d.FIPS] = d.County;
        state_name[+d.FIPS] = d.State;
    });
  //console.log(score);
    //Drawing Choropleth
    var g = svg.append("g").attr("class", "region")
        .attr("id", "reg_1")
        .attr("transform", "scale(1.5)");

    //g.append("g")
    //.attr("class", "region")
    g.selectAll("path")
        .data(topojson.feature(counties,counties.objects.counties).features)
        //.data(topojson.feature(map, map.objects.russia).features) <-- in case topojson.v1.js
        .enter().append("path")
        .attr("d", path)
        .style("fill", function(d) {
            //console.log(score[+d.id]);
            return color(score[+d.id]);
        })
        .style("opacity", 0.8)
    //Adding mouseevents
    .on("mouseover", function(d) {
            // d3.select(this).transition().duration(300).style("opacity", 1);
            div.transition().duration(300)
                 .style("opacity", 1);
             div.html(state_name[d.id] + " - " + county_name[d.id]+ "<br> Score : " + score[d.id])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 30) + "px");
        });
        // .on("mouseout", function() {
        //     d3.select(this)
        //         .transition().duration(300)
        //         .style("opacity", 0.8);
            div.transition().duration(300)
                 .style("opacity", 0);
        // });
        //Adding legend for our Choropleth
        var legend = svg.selectAll("g.legend")
            .data(ext_color_domain)
            .enter().append("g")
            .attr("class", "legend");

        var ls_w = 20,
            ls_h = 20;

        legend.append("rect")
            .attr("x", 20)
            .attr("y", function(d, i) {
                return height - (i * ls_h) - 2 * ls_h;
            })
            .attr("width", ls_w)
            .attr("height", ls_h)
            .style("fill", function(d) {
                return color(d);
            })
            .style("opacity", 0.8);

        legend.append("text")
            .attr("x", 50)
            .attr("y", function(d, i) {
                return height - (i * ls_h) - ls_h - 4;
            })
            .text(function(d, i) {
                return legend_labels[i];
            });
        var zoom = d3.behavior.zoom()
            .scaleExtent([1.5, 16])
            .scale(0.5)
            .on("zoom", zoomed);

        svg.call(zoom).call(zoomed);

        function zoomed() {
            var g = d3.select("#reg_1");
            g.attr("transform",
                "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            //console.log(d3.event.scale);
        }


}
