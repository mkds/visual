$(document).ready(function() {
    //Script to initialize UI and set Inital Dispplay
    $("#map_sel,#data_sel,#nj_sel,#doc_sel").click(function() {
        $(this).addClass("active").siblings().removeClass("active");
        switch($(this).text()) {
            case "Nation":
                $("#map").css("display", "block");
                $("#dt1").css("display", "none");
                $("#dt2").css("display", "none");
                $("#doc").css("display", "none");
                $("#right_panel").css("visibility", "visible");
                $("#left_panel").css("visibility", "visible");
                $("#top_dest").css("display", "block");
                break;
            case "State" :
                $("#map").css("display", "none");
                $("#doc").css("display", "none");
                $("#dt2").css("display", "block");
                $("#dt1").css("display", "none");
                $("#left_panel").css("visibility", "visible");
                $("#right_panel").css("visibility", "visible");
                $("#top_dest").css("display", "none");
                break;
            case "Data" :
                $("#left_panel").css("display", "block");
                $("#map").css("display", "none");
                $("#doc").css("display", "none");
                $("#dt2").css("display", "none");
                $("#dt1").css("display", "block");
                $("#left_panel").css("visibility", "visible");
                $("#right_panel").css("visibility", "hidden");
                break;
            case "Doc":
                $("#map").css("display", "none");
                $("#dt2").css("display", "none");
                $("#dt1").css("display", "none");
                $("#doc").css("display", "block");
                $("#right_panel").css("visibility", "hidden");
                $("#left_panel").css("visibility", "hidden");



        }

    });


});
