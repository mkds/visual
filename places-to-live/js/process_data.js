(function() {
    /*global d3 google topojson */
    // Function level scope variables
    // County data
    var places = {};
    var col_names = [];
    //Sliders for factor importance
    var all_sliders=[];
    //Color function to get choropleth color
    var get_color;
    //Max number of factors
    var max_vars = 9;
    var min_vars = 1;
    //Google data table and bar chart
    var gtable, chart;
    // var top_chart;
    // variables used for pre-defined interests
    var retirement_vars=["Saftey","Good_Health","Associations_per1000","No_Housing_problem","Road_density"];
    var employment_vars=["Employment_per1000","Employment_pct","Household_income","Saftey","No_Housing_problem"];
    var top_counties=[];

    // Read data from csv

    d3.csv("./data/places_scores.csv", function(d){
            return {
                FIPS : +d.FIPS,
                County : d.County,
                State : d.State,
                Saftey : +d.Saftey,
                Air_Quality : +d.Air_Quality,
                Water_Area_per100Acre : +d.Water_Area_per100Acre,
                Good_Health : +d.Good_Health,
                Rural_pct : +d.Rural_pct,
                Employment_per1000 : +d.Employment_per1000,
                No_Housing_problem : +d.No_Housing_problem,
                Employment_pct : +d.Employment_pct,
                Household_income : +d.Household_income,
                Wage_more_than3333_per1000 : +d.Wage_more_than3333_per1000,
                Exercise_Facility : +d.Exercise_Facility,
                Age65_plus : +d.Age65_plus,
                UnProtected_Area : +d.UnProtected_Area,
                Population : +d.Population,
                WorkAge_pct : +d.WorkAge_pct,
                Road_density : +d.Road_density,
                Primary_care_per1000 : +d.Primary_care_per1000,
                Associations_per1000 : +d.Associations_per1000,
                Reatil_jobs_per1000 : +d.Reatil_jobs_per1000,
                Office_jobs_per1000 : +d.Office_jobs_per1000,
                Industrial_jobs_per1000 : +d.Industrial_jobs_per1000,
                Education_jobs_per1000 : +d.Education_jobs_per1000,
                Service_jobs_per1000 : +d.Service_jobs_per1000,
                HealthCare_jobs_per1000 : +d.HealthCare_jobs_per1000,
                Households_per100Acre : +d.Households_per100Acre,
                Wage_less_than3333_per1000 : +d.Wage_less_than3333_per1000,
                Availability_healthy_food : +d.Availability_healthy_food,
                Healthcare_Affordable : +d.Healthcare_Affordable
            };


        },
        process_data
    );

    //UI event handling for pre-defined interests
    $("#emp_sel,#ret_sel,#custom_sel").click(function() {
        $(this).addClass("active").siblings().removeClass("active");
        switch($(this).text()) {
            case "Employment":
                $("#vars").multiselect("deselectAll", false);
                $("#vars").multiselect("updateButtonText");
                $("#vars").multiselect("select",employment_vars);
                selection_change("#vars",max_vars,min_vars);
                $("#vars_sec").css("display", "none");
                break;
            case "Retirement" :
                $("#vars").multiselect("deselectAll", false);
                $("#vars").multiselect("updateButtonText");
                $("#vars").multiselect("select",retirement_vars);
                selection_change("#vars",max_vars,min_vars);
                $("#vars_sec").css("display", "none");
                break;
            case "Custom" :
                $("#vars_sec").css("display", "block");

        }

    });

    //Process the data read from csv
    function process_data(error, data) {
        // console.log(error);
        // console.log(data[0]);
        places = data;
        draw_map();
        var variable;
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
            numberDisplayed: 10,
            maxHeight: 300,
            onChange: function() {
                selection_change("#vars", max_vars, min_vars);
            }
        });

        //Add the variable as factors available for selection
        //  skip first 3 variables as they are for FIPS, County, State
        var var_opts = col_names.slice(3);
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

    //Function to draw inital D3 map
    function draw_map() {
        /*eslint-env d3, jquery*/
        /*global d3*/
        var width = $("#map").width();
        var height = $("#map").height();
        var init_scale = width / 950;
        // console.log(height);

        // Setting color domains(intervals of values) for our map
        var color_domain = [10, 30, 50, 70, 90];
        var ext_color_domain = [0, 10, 30, 50, 70, 90];
        var legend_labels = ["< 10 Percentile", "20+", "40+", "60+", "80+", "90+"];
        get_color = d3.scale.threshold()
            .domain(color_domain)
            .range(["#dcdcdc", "#bdc9be", "#97b0a0",  "#5e8b73", "#256546", "#004d28"]);

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

        //Function for Choropleth drawing

        function county_map(error, counties) {
            //  console.log(counties);

            // counties_map = counties;

            // place_score.forEach(function(d) {
            //     score[+d.FIPS] = +d.Overall_Score;
            //     county_name[+d.FIPS] = d.County;
            //     state_name[+d.FIPS] = d.State;
            // });
            // console.log(score[1001]);
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
                // .style("fill", function(d) {
                //     //console.log(score[+d.id]);
                //     return get_color(score[+d.id]);
                // })
                .style("opacity", 0.8)
                //Adding mouseevents
                .on("mouseover", function(d) {
                    // d3.select(this).moveToFront();
                    div.transition().duration(300)
                        .style("opacity", 1);
                    // tooltip_text(d.id);
                    // div.html(state_name[d.id] + " - " + county_name[d.id] + "<br> Score : " + score[d.id])
                    div.html(tooltip_text(d.id))
                        .style("left", (d3.event.pageX + 10) + "px")
                        .style("top", (d3.event.pageY - 10) + "px");
                })
                .on("mouseout", function() {
                    div.transition().duration(300)
                        .style("opacity", 0);
                });
                compute_score();

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
                    return get_color(d);
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



    //Function to create inital map
    function drawTable() {
        var all_states = places.map(function(d){return d.State;});
        var uniq_states = all_states.filter(function(d,i,arr){
            return i == arr.indexOf(d);
        });
        //Find unique states and add that to dropdown
        $.each(uniq_states, function(key,value) {
        $("#st_sel")
         .append($("<option></option>")
                    .attr("value",value)
                    .text(value));
        });
        //Set NJ as inital selection
        $("#st_sel option[value='NJ']").attr("selected", "selected");
        //Add behavior for selection change
        $("#st_sel").on("change",refresh_chart);
        gtable = new google.visualization.Table(document.getElementById("dt1_table"));
        chart = new google.visualization.BarChart(document.getElementById("dt2_chart"));
        // top_chart = new google.visualization.BarChart(document.getElementById("top_chart"));
        // chart.draw(data2, options);
        refresh_chart();

    }

    // Change change in selection of factors
    function selection_change(id, max, min) {
        var selectedOptions = $(id).find(":selected");
        // console.log(selectedOptions);
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


        }
        var select_vars =$(id).val();
        //Get current sliders using D3 data bound to sliders
        var cur_sliders = d3.select("#wt_scrolls")
                            .selectAll("input")
                            .data();
        //Get current factor name
        var cur_vars = cur_sliders.map(function(d){
            if (d){
                return d.var_name;
            } else {
               return "";
            }
            });

        //Construct new sliders for importance based on selected factors
        var new_sliders = [];
        var vars;
        for (vars in select_vars){
            var var_in = cur_vars.indexOf(select_vars[vars]);
            if (var_in >-1 ){
                new_sliders.push(cur_sliders[var_in]);
            } else {
                new_sliders.push({var_name:select_vars[vars],var_wt:1});
            }
        }
        var slide_labels = $("#wt_scrolls  span");
        // var all_sliders = $("#wt_scrolls input");
        // console.log(new_sliders);
        // console.log(all_sliders[0].slider("setValue",12));
        for (var i = 0; i< select_vars.length;i++){
            $(slide_labels[i]).text(new_sliders[i].var_name+ " : " + new_sliders[i].var_wt);
            $(slide_labels[i]).parent("div").removeClass("hide");
            all_sliders[i].slider("setValue", +new_sliders[i].var_wt);
        }
        for (var i = select_vars.length; i < max; i++){
            $(slide_labels[i]).parent("div").addClass("hide");
        }
        d3.select("#wt_scrolls")
            .selectAll("input")
            .data(new_sliders);
        //Call function to redraw map colors
        compute_score();
        //Call function to refresh chart and data table
        refresh_chart();

    }


    //Function to add factor importance sliders
    function add_sliders() {


        var vars_selected = $("#vars").find(":selected");
        var weights = [];
        // console.log(vars_selected);
        for (var i = 1; i <= max_vars; i++) {
            all_sliders[i-1]=$("#wt" + i).slider();
            $("#wt" + i).on("change", wt_change);
            // console.log("wt"+i+"_label"+vars_selected[i-1].label+" - Wt: " + "#wt"+i);
            if ( i <= vars_selected.length){
                $("#wt" + i + "_label").text(vars_selected[i - 1].label + " : " + $("#wt" + i).val());
                weights.push({
                    var_name: vars_selected[i - 1].label,
                    var_wt: 1
                });
            } else {
                weights.push({
                    var_name: " ",
                    var_wt: 0
                });

            }

        }
        // console.log(all_sliders);
        // console.log(weights);

        //Bind D3 data to sliders
        d3.select("#wt_scrolls")
            .selectAll("input")
            .data(weights);

        function wt_change() {
            var id = this.id;
            // console.log("change");
            // console.log($("#vars").find(":selected")[0].label);
            $("#" + id + "_label").text($("#vars").find(":selected")[id.slice(-1) - 1].label + " : " + $(this).val());
            var weights = d3.select("#" + id).data();
            weights[0].var_wt = +$(this).val();
            compute_score();
            refresh_chart();

        }
    }

    function compute_score() {
        //Compute score based on factor and factor importance
        var weights = d3.select("#wt_scrolls")
            .selectAll("input")
            .data();
        var score = [];
        var score_copy = [];
        var vars_count = $("#vars").find(":selected").length;
        // console.log(weights);
        var weights_total;
        //Comput score based on factors selected for each county
        places.forEach(function(d) {
            score[+d.FIPS] = 0;
            weights_total = 0;


            for (var i = 0; i < vars_count; i++) {
                    score[+d.FIPS] += weights[i].var_wt * d[weights[i].var_name];
                    weights_total += weights[i].var_wt;
            }
            score[+d.FIPS] = score[+d.FIPS] / weights_total;
            score_copy[+d.FIPS] = score[+d.FIPS];

        });
        d3.selectAll("path")
            .style("fill", function(d) {
                // console.log(color(score[+d.id] * factor/10));
                return get_color(score[+d.id]);
            });

        //Find top 5 counties
        var top5_value = score_copy.sort(function(a,b){return b-a;})[4];
        top_counties = [];
        places.forEach(function(d) {
            if (score[+d.FIPS] >= top5_value) {
                top_counties.push(+d.FIPS);
            }
        });

        // console.log(top_counties);

    }

    //Function to generate tool tip text
    function tooltip_text(fips) {
        var weights = d3.select("#wt_scrolls")
            .selectAll("input")
            .data();
        var vars_count = $("#vars").find(":selected").length;
        var county = places.filter(function(d){
            return d.FIPS == fips;
        })[0];
        var tooltip_text = "<span style='font-weight:bold'>"+ county.County +", " + county.State +"</span>";
        // console.log(county);
        // places.forEach(function(d) {
        //     score[+d.FIPS] = 0;
        for (var i = 0; i < vars_count; i++) {
                tooltip_text += "</br>" + weights[i].var_name + ": " + county[weights[i].var_name] ;
        }
        var your_score = 0;
        var weights_total = 0;
        // console.log(weights_total);
        for (var i = 0; i < vars_count; i++) {
                your_score += weights[i].var_wt * county[weights[i].var_name];
                weights_total += weights[i].var_wt;
        }
        // console.log(weights_total);
        your_score = Math.round(your_score / weights_total);
        tooltip_text += "</br><span style='font-weight:bold'>Score as per you: " + your_score + "</span>";
        // console.log(tooltip_text);
        return(tooltip_text);
    }

    //Function to refresh google chart
    function refresh_chart() {

        refersh_top_chart(top_counties);
        var weights = d3.select("#wt_scrolls")
            .selectAll("input")
            .data();
        var vars_count = $("#vars").find(":selected").length;

        //Data to Draw google table
        var data1 = new google.visualization.DataTable();
        //Data to draw Bar Chart
        var data2 = new google.visualization.DataTable();
        data1.addColumn("string", "State");
        data1.addColumn("string", "County");
        data2.addColumn("string", "County");
        var weights_total = 0;
        for (var i = 0; i < vars_count;i++){
            weights_total += weights[i].var_wt;
            data1.addColumn("number", weights[i].var_name);
            data2.addColumn("number", weights[i].var_name);
        }

        var values1 = [];
        var values2 = [];
        places.forEach(function(d) {
            var row = [d.State,d.County];
            for (var i =0; i < vars_count;i++){
                row.push(d[weights[i].var_name]);
            }
            values1.push(row);
        });
        //Bar chart for NJ
        var selected_st = $("#st_sel").val();
        places.forEach(function(d) {
            if (d.State == selected_st) {
                var row = [d.County];
                for (var i =0; i < vars_count;i++){
                    row.push(d[weights[i].var_name]*weights[i].var_wt/weights_total);
                }
                values2.push(row);
            }
        });
        data1.addRows(values1);
        data2.addRows(values2);
        // gtable = new google.visualization.Table(document.getElementById("dt1"));
        gtable.draw(data1, {
            showRowNumber: true,
            width: "100%",
            height: "100%",
            page: "enable",
            pageSize: 20
        });
        var options = {
            title: "Counties",
            width: 1000,
            height: 900,
            legend: {
                position: "right",
                maxLines: 3
            },
            chartArea: {
                top:20,width:"55%",height:"80%"},
            bar: {
                groupWidth: "75%"
            },
            isStacked: true
        };
        // chart = new google.visualization.BarChart(document.getElementById("dt2"));
        chart.draw(data2, options);

    }

    //Function to print top counties
    function refersh_top_chart(nfips) {
        var weights = d3.select("#wt_scrolls")
            .selectAll("input")
            .data();
        var vars_count = $("#vars").find(":selected").length;

        //Data to draw Bar Chart
        var data2 = new google.visualization.DataTable();
        data2.addColumn("string", "County");
        var weights_total = 0;
        for (var i = 0; i < vars_count;i++){
            weights_total += weights[i].var_wt;
            data2.addColumn("number", weights[i].var_name);
        }

        var values2 = [];
        var top_chart_html="";
        places.forEach(function(d) {
            if (nfips.indexOf(+d.FIPS) > -1) {
                var row = [d.State+"-"+d.County];
                top_chart_html += "<h4>"+d.County+", "+d.State;
                var tot_score=0;
                for (var i =0; i < vars_count;i++){
                    row.push(d[weights[i].var_name]*weights[i].var_wt/weights_total);
                    tot_score+=(d[weights[i].var_name]*weights[i].var_wt/weights_total);
                }
                values2.push(row);
                top_chart_html += " :"+Math.round(tot_score)+"</h4>";
            }
        });
        $("#top_chart").html(top_chart_html);
        data2.addRows(values2);
        //Future implementation - Try a chart instead of list of names
        // // gtable = new google.visualization.Table(document.getElementById("dt1"));
        // var options = {
        //     title: "Top Counties",
        //     width: 350,
        //     height: 400,
        //     legend: {
        //         position: "none"
        //     },
        //     chartArea: {
        //         top:5,width:"40%",height:"80%"},
        //     bar: {
        //         groupWidth: "25%"
        //     },
        //     isStacked: true
        // };
        // // chart = new google.visualization.BarChart(document.getElementById("dt2"));
        // top_chart.draw(data2, options);

    }





})(this);
