$(document).ready(function() {
    //Script to initialize UI and set Inital Dispplay
    $("#map_sel,#data_sel,#nj_sel").click(function() {
        $(this).addClass("active").siblings().removeClass("active");
        switch($(this).text()) {
            case "Nation":
                $("#map").css("display", "block");
                $("#dt1").css("display", "none");
                $("#dt2").css("display", "none");
                $("#right_panel").css("display", "block");
                $("#top_dest").css("display", "block");
                break;
            case "State" :
                $("#map").css("display", "none");
                $("#dt2").css("display", "block");
                $("#dt1").css("display", "none");
                $("#right_panel").css("display", "block");
                $("#top_dest").css("display", "none");
                break;
            case "Data" :
                $("#map").css("display", "none");
                $("#dt2").css("display", "none");
                $("#dt1").css("display", "block");
                $("#right_panel").css("display", "none");

        }

    });


});
