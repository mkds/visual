$(document).ready(function() {
    $("#map_sel,#data_sel,#nj_sel").click(function() {
        $(this).attr("class","active");
        $(this).addClass("active").siblings().removeClass("active");
        switch($(this).text()) {
            case "Nation":
                $("#map").css("display", "block");
                $("#dt1").css("display", "none");
                $("#dt2").css("display", "none");
                break;
            case "NJ" :
                $("#map").css("display", "none");
                $("#dt2").css("display", "block");
                $("#dt1").css("display", "none");
                break;
            case "Data" :
                $("#map").css("display", "none");
                $("#dt2").css("display", "none");
                $("#dt1").css("display", "block");

        }

    });
});
