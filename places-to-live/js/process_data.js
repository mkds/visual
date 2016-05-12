(function() {
    /*global d3 google topojson */
    var places = {};
    var col_names = [];
    var score = {};
    var county_name = {};
    var state_name = {};
    // var counties_map = {};

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
        for (variable in data[0]) {
            col_names.push({
                label: variable,
                value: variable
            });
        }
        // console.log(col_names);
        $("#vars").multiselect({
            delimiterText: "<br>",
            enableHTML: true,
            numberDisplayed: 7,
            onChange: function() {
                limit_selection("#vars", 7, 3);
            }
        });

        //Add the variable as options skip first 4 variables as they are
        //        for FIPS, County, State and Overall_score
        var var_opts = col_names.slice(4);
        $("#vars").multiselect("dataprovider", var_opts);
        $("#vars").multiselect("select", var_opts.slice(0, 5).map(function(d) {
            return d.label;
        }));
        // console.log(data[1]);
        add_sliders();

        google.charts.load("current", {
            "packages": ["table", "corechart", "bar"]
        });
        google.charts.setOnLoadCallback(drawTable);
    }

    function draw_map(place_score) {
        /*eslint-env d3, jquery*/
        /*global d3*/
        var width = $("#map").width();
        var height = $("#map").height();
        var init_scale = width / 950;
        // console.log(height);

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
            .attr("width", "100%")
            .attr("height", "100%")
            .style("margin", "10px auto");
        //console.log(svg);

        var path = d3.geo.path();

        //Reading map file and data

        d3.json("data/county.json", county_map);

        //Start of Choropleth drawing

        function county_map(error, counties) {
            //  console.log(counties);

            // counties_map = counties;

            place_score.forEach(function(d) {
                score[+d.FIPS] = +d.Overall_Score;
                county_name[+d.FIPS] = d.County;
                state_name[+d.FIPS] = d.State;
            });
            //console.log(score);
            //Drawing Choropleth
            var g = svg.append("g").attr("class", "region")
                .attr("id", "reg_1");

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
                    // d3.select(this).moveToFront();
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
            // legend.attr("fill","white");
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
                .scaleExtent([0.5, 16])
                .scale(init_scale)
                .on("zoom", zoomed);

            //Set zoom behavior for svg
            svg.call(zoom).call(zoomed);
            // g.attr("transform","scale("+init_scale+")");

            //zoom function
            function zoomed() {
                // var g = d3.select("#reg_1");
                // g.attr("transform",
                //     "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                d3.select("#reg_1")
                    .attr("transform",
                        "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");

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

    function limit_selection(id, max, min) {
        var selectedOptions = $(id).find(":selected");

        if (selectedOptions.length >= max) {
            // Disable all other checkboxes.
            var nonSelectedOptions = $(id).find("option").filter(function() {
                return !$(this).is(":selected");
            });

            // var dropdown = $(id).siblings(".multiselect-container");
            nonSelectedOptions.each(function() {
                var input = $("input[value='" + $(this).val() + "']");
                input.prop("disabled", true);
                input.parent("li").addClass("disabled");
            });
        } else if (selectedOptions.length <= min) {
            // var dropdown = $(id).siblings(".multiselect-container");
            selectedOptions.each(function() {
                var input = $("input[value='" + $(this).val() + "']");
                input.prop("disabled", true);
                input.parent("li").addClass("disabled");
            });
        } else {
            // Enable all checkboxes.
            // var dropdown = $(id).siblings(".multiselect-container");
            $(id).find("option").each(function() {
                var input = $("input[value='" + $(this).val() + "']");
                input.prop("disabled", false);
                input.parent("li").addClass("disabled");
            });
            // d3.selectAll("path")
            //     .style("fill", function(d,i) {
            //         if (i==1) console.log(d);
            //         return ["white","orange"][i%3];
            //     });
        }
    }


        function add_sliders() {

            // $("#wt1").on("change", wt_change);
            // wt_change();

            var vars_selected = $("#vars").find(":selected");
            // console.log(vars_selected);
            for (var i = 1; i <= 5; i++) {
                $("#wt" + i).slider();
                $("#wt" + i).on("change", wt_change);
                $("#wt" + i + "_label").text(vars_selected[i - 1].label + " - Wt: " + $("#wt" + i).val());
                // console.log("wt"+i+"_label"+vars_selected[i-1].label+" - Wt: " + "#wt"+i);

            }

            function wt_change() {
                var id = this.id;
                // console.log("change");
                // console.log($("#vars").find(":selected")[0].label);
                $("#" + id + "_label").text($("#vars").find(":selected")[id.slice(-1) - 1].label + "- Wt: " + $(this).val());
                var color_domain = [50, 100, 150, 200, 250, 300, 350, 400, 450];
                var color = d3.scale.threshold()
                    .domain(color_domain)
                    .range(["#dcdcdc", "#d0d6cd", "#bdc9be", "#aabdaf", "#97b0a0", "#84a491", "#5e8b73", "#387255", "#256546", "#004d28"]);
                var factor = $(this).val();
                d3.selectAll("path")
                    .style("fill", function(d) {
                        // console.log(color(score[+d.id] * factor/10));
                        return color(score[+d.id] * factor/10);
                    });

            }
        }


})(this);
