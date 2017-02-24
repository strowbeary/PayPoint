$(document).ready(function(){
    $("div[targetScreen]").click(function(e){
        console.log("Screen", $(this).attr("targetScreen"));
        $($(".screen[screenId='" + $(this).attr("targetScreen") + "']")[0]).css("display", "block");
        $(".screenPane").css("marginLeft", "-100%");
    });
});
class ScreenManager{
    static resetScreen(){
        $(".screen[screenId]").css("display", "none");
        $(".screen#main").css("display", "block");
        $(".screenPane").css("marginLeft", "0");
    }
}