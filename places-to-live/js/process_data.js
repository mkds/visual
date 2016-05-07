(function() {
    /*global d3 google topojson queue*/
    var places = {};

    d3.csv("./data/place_score.csv",
        function(data) {
            return {
                FIPS: data.FIPS,
                State: data.State,
                County: data.County,
                Overall_Score: +data.Overall,
                Facilities: +data.Facilities,
                Health_Cost: +data.Health_Cost,
                Saftey: +data.Saftey,
                Social_association: +data.Social_association,
                Primary_care: +data.Primary_care

            };
        },
        process_data
    );

    function process_data(data) {
        draw_map(data);
        places = data;
        // console.log(data[1]);
        google.charts.load("current", {
            "packages": ["table", "corechart", "bar"]
        });
        google.charts.setOnLoadCallback(drawTable);
    }

    function draw_map(place_score) {
        /*eslint-env d3, jquery*/
        /*global d3*/
        var width = 1200;
        var height = 650;

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

        var svg = d3.select("#map").append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("margin", "10px auto");
        //console.log(svg);

        var path = d3.geo.path();

        //Reading map file and data

        queue() //eslint-disable no-queue
            .defer(d3.json, "data/county.json")
            .await(county_map);

        //Start of Choropleth drawing

        function county_map(error, counties) {
            //  console.log(counties);
            var score = {};
            var county_name = {};
            var state_name = {};

            place_score.forEach(function(d) {
                score[+d.FIPS] = +d.Overall_Score;
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
                .data(topojson.feature(counties, counties.objects.counties).features)
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
                    div.transition().duration(300)
                        .style("opacity", 1);
                    div.html(state_name[d.id] + " - " + county_name[d.id] + "<br> Score : " + score[d.id])
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 30) + "px");
                })
                .on("mouseout", function() {
                    div.transition().duration(300)
                        .style("opacity", 0);
                });
            //Adding legend for our map
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
            //Define Zoom behavior
            var zoom = d3.behavior.zoom()
                .scaleExtent([1.5, 16])
                .scale(0.5)
                .on("zoom", zoomed);

            //Set zoom behavior for svg
            svg.call(zoom).call(zoomed);

            //zoom function
            function zoomed() {
                var g = d3.select("#reg_1");
                g.attr("transform",
                    "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                //console.log(d3.event.scale);
            }


        }



    }





    function drawTable() {
        //Data to Draw google table
        var data1 = new google.visualization.DataTable();
        //Data to draw Bar Chart
        var data2 = new google.visualization.DataTable();
        data1.addColumn("string", "State");
        data1.addColumn("string", "County");
        data1.addColumn("number", "Overall_Score");
        data1.addColumn("number", "Facilities");
        data1.addColumn("number", "Health_Cost");
        data1.addColumn("number", "Saftey");
        data1.addColumn("number", "Social_association");
        data1.addColumn("number", "Primary_care");

        data2.addColumn("string", "County");
        data2.addColumn("number", "Facilities");
        data2.addColumn("number", "Health_Cost");
        data2.addColumn("number", "Saftey");
        data2.addColumn("number", "Social_association");
        data2.addColumn("number", "Primary_care");

        var values1 = [];
        var values2 = [];
        places.forEach(function(d) {
            values1.push([
                d.State,
                d.County,
                d.Overall_Score,
                d.Facilities,
                d.Health_Cost,
                d.Saftey,
                d.Social_association,
                d.Primary_care
            ]);
        });
        //Bar chart for NJ
        places.forEach(function(d) {
            if (d.State == "NJ") {
                values2.push([
                    d.County,
                    d.Facilities,
                    d.Health_Cost,
                    d.Saftey,
                    d.Social_association,
                    d.Primary_care
                ]);
            }
        });
        data1.addRows(values1);
        data2.addRows(values2);
        var gtable = new google.visualization.Table(document.getElementById("dt1"));
        gtable.draw(data1, {
            showRowNumber: true,
            width: "100%",
            height: "100%",
            page: "enable",
            pageSize: 20
        });
        var options = {
            title: "New Jersey",
            width: 1000,
            height: 800,
            legend: {
                position: "right",
                maxLines: 3
            },
            bar: {
                groupWidth: "75%"
            },
            isStacked: true
        };
        var chart = new google.visualization.BarChart(document.getElementById("dt2"));
        chart.draw(data2, options);

    }

})(this);
