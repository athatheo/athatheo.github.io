
var timer=null;

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function initializeCompressionLibraries()
{
    compression_libraries=new Array();
    for(var i=0;i<3;i++)
        compression_libraries.push(new Compression_library());
    /**************************************************** NO COMPRESSION  ****************************************************/
    compression_libraries[0].compression_name = "NONE";
    compression_libraries[0].get_overhead = 1;
    compression_libraries[0].put_overhead = 1;
    compression_libraries[0].space_reduction_ratio = 0.0;

    /**************************************************** SNAPPY  ****************************************************/
    compression_libraries[1].compression_name = "SNAPPY";
    compression_libraries[1].get_overhead = 0.53;
    compression_libraries[1].put_overhead = 8.21;
    compression_libraries[1].space_reduction_ratio = 0.68;

    /**************************************************** ZLIB  ****************************************************/
    compression_libraries[2].compression_name = "ZLIB";
    compression_libraries[2].get_overhead = 25.45;
    compression_libraries[2].put_overhead = 31.26;
    compression_libraries[2].space_reduction_ratio = 0.83;
}

/**
 * Runs when is called from the switchStatistics and switchQuestions functions.
 * @TODO: Check if this is actually needed. Is there any point in using this?
 * @param e
 * @param if_regenerate
 */
function re_run(e, if_regenerate=true) {
    if(timer){
        clearTimeout(timer);
        timer = null;
    }

    var event = e || event;

    var x = event.which || event.keyCode;  // Use either which or keyCode, depending on browser support

    if (!((x==38 || x==40) && (event.target.id=="E" || event.target.id=="mbuffer" || event.target.id=="P" || event.target.id=="T")))
    {
	    if (x>=37 && x<=40 || x==9 || x==16 || x==17 || x==91 || x==18 || x==65)
	    {
	        // if (event.target.id=="N" || event.target.id=="mfilter")
	        console.log("User is clicking ["+x+"] on arrows or tab (9) or shift (16) or ctrl (17) or cmd (91) or alt (18). No rerun.")
	        return;
	    }
	}

    var inputIdList=[
        "N","E","F","qS","qL","insert_workload","blind_update_workload","read_modify_update_workload","r","query_count","v","s","cost"
    ]

    for(var i=0;i<inputIdList.length;i++) {
        if (!checkInput(document.getElementById(inputIdList[i]))){
            return;
        }
    }

    //$("#loading_canvas").animate({opacity:0.8}, 'fast').css('z-index',20);
    if(if_display) {

        //navigateDesignSpace();
        //analyzeTKZ();
        //drawCharts();
        //drawChart2();
        //$(document.body).css({'cursor' : 'wait'});
        drawContinuumsMultithread(if_regenerate);
    }
}

/**
 * This functions initializes basic values as demo defaults.
 */
function init(){

    // Dataset and Environment
    document.getElementById("N").value=numberWithCommas(100000000000); //(10M values)
    document.getElementById("E").value=512;
    //document.getElementById("B").value=4096; //in B
    document.getElementById("F").value=64;

    // Workload
    document.getElementById("s").value = 4096;
    document.getElementById("qS").value = 0;
    //document.getElementById("w").value = 0.1 This was before adding the insert to read modify boxes
    document.getElementById("insert_workload").value = 0.5;
    document.getElementById("blind_update_workload").value = 0.0;
    document.getElementById("read_modify_update_workload").value = 0.0;
    document.getElementById("r").value = 0.0;
    document.getElementById("v").value = 0.5;
    document.getElementById("qL").value = 0.0;
    document.getElementById("qEL").value = 0.0;
    //document.getElementById("X").value = numberWithCommas(0);
    updateReadOnlyFields();
    //buttons

    document.getElementById("AWS").style.fontWeight='bold';
    document.getElementById("AWS").style.fontSize='16px';

    document.getElementById("cost").value = 3200;
    //document.getElementById("latency").value = 5.7;

    document.getElementById("query_count").value=10000000000;

    initializeCompressionLibraries();

    initializeSLACheckboxes();

    initializeCloudCheckboxes();

    initializeExistDesignPanel();

    interval=setInterval("drawCanvas(\"#FFFFFF\")",40);
    reverseColor();
    $("#title").css("height",($(window).height()+100)+"px");
    $("#title").css("padding-top",($(window).height()/2-300)+"px");

    window.scrollTo(0, 1390);

    $(".rotate").click(function () {
        $(this).toggleClass("down");
    })

    $(".rotate_2").click(function () {
        $(this).toggleClass("down");
        if($(".SLA-tab").css("color")=="rgb(0, 0, 0)"){
            setTimeout('$(".SLA-tab").toggleClass("down")',1000);
        }else {
            $(".SLA-tab").toggleClass("down");
        }
    })

    $("#switch_1").click(function () {
        $(this).toggleClass("down");
        $("#switchbar_1").toggleClass("down");
    })

    $("#switch_2").click(function () {
        $(this).toggleClass("down");
        $("#switchbar_2").toggleClass("down");
    })

    $("#switch_3").click(function () {
        $(this).toggleClass("down");
        $("#switchbar_3").toggleClass("down");
    })

    var e=event;

    var redraw=true;
    $('#myForm_1 input').on('change', function() {
        if($('input[name=radio_1]:checked', '#myForm_1').val()=="skew")
            $("#myForm_2").animate({height: '168px',opacity:'1',margin:'7px 6px 6px 6px',padding:'5px',borderWidth:'0px'}, "slow");
        else {
            $("#myForm_2").animate({height: '0px', opacity: '0', margin: '0px', padding: '0px', borderWidth: '0px'}, "slow");
            workload_type = 0;
            U_1 = 10000;
            U_2=100000000000;
            p_get = 0.7;
            p_put=0.0001;
        }
    });

    $('#myForm_2 input').on('change', function() {
        redraw=true;
        workload_type = 1;
        U_1 = 10000;
        U_2 = 10000000000;
        if($('input[name=radio_2]:checked', '#myForm_2').val()=="1"){
            //$("#check_mark_1").animate({top: "3px", left: "3px", width: "12px",height: "12px",opacity: 1}, {speed:"slow",quene:false});
            p_get=0.8;
            p_put=0.0001;
        }
        if($('input[name=radio_2]:checked', '#myForm_2').val()=="2"){
            p_get=0.0001;
            p_put=0.8;
        }
        if($('input[name=radio_2]:checked', '#myForm_2').val()=="3"){
            p_get=0.2;
            p_put=0.2;
        }
        if($('input[name=radio_2]:checked', '#myForm_2').val()=="4"){
            p_get=0.5;
            p_put=0.5;
        }
    });

    $('[name=exsys_tab]').on('click',function(){
        if(!$(this).hasClass("down")){
            $('[name=exsys_tab]').removeClass('down');
            $(this).addClass('down');
            displayRocks();
        }
    })

    $('[name=interactive_tab]').on('click',function(){
        if(!$(this).hasClass("down")){
            $('[name=interactive_tab]').removeClass('down');
            $(this).addClass('down');
            switchText($(this).attr('id'));
        }
    })

    $('[name=explore_tab]').on('click',function(){
        if(!$(this).hasClass("down")){
            $('[name=explore_tab]').removeClass('down');
            $(this).addClass('down');
            displayContinuums();
        }
    })

    $("#guide_7").hover(function(){
        $("#exsys_tab").css("-webkit-animation",'shinebox 1.5s infinite linear');
    },function(){
        $("#exsys_tab").css("-webkit-animation",'shinebox 1.5s 1 linear');
    });

    $('input').attr('autocomplete','off');

    $("#cost_conscious_checkbox").change(function() {
        if(this.checked) {
            $("#performance_conscious_checkbox").prop( "checked", false );
        }
    });

    $("#performance_conscious_checkbox").change(function() {
        if(this.checked) {
            $("#cost_conscious_checkbox").prop( "checked", false );
        }
    });

    $("#cloud-provider").change(function() {
        prune_cloud_provider();
    });

    $("#title_fonts").change(function () {
        $("#title_explanation").css("font-family",$(this).val())
    })
}

function updateReadOnlyFields(){
    document.getElementById("lookup_percentage").value = parseFloat(document.getElementById("v").value) + parseFloat(document.getElementById("r").value);
    document.getElementById("insert_percentage").value = parseFloat(document.getElementById("insert_workload").value) + parseFloat(document.getElementById("blind_update_workload").value) + parseFloat(document.getElementById("read_modify_update_workload").value);
    document.getElementById("range_queries_percentage").value = parseFloat(document.getElementById("qL").value) + parseFloat(document.getElementById("qEL").value) + parseFloat(document.getElementById("qS").value);

}

/**
 * This function is called when the main Design button is called, where the computations to produce the Cosine designs
 * is called.
 */
function LoadCharts() {

    if_display=1;
    drawContinuumsMultithread();

}

function displayCharts(){
    if(if_display) {
        document.getElementById("charts").style.display = '';
        document.getElementById("interactive_mode_tab").style.display = '';
        document.getElementById("guide_4").style.display = '';
        document.getElementById("guide_5").style.display = '';
        document.getElementById("guide_6").style.display = '';
        document.getElementById("guide_7").style.display = '';
        document.getElementById("guide_8").style.display = '';
        document.getElementById("guide_9").style.display = '';
        $("html,body").animate({scrollTop: $("#interactive_mode_tab").offset().top - 100}, 500);
    }
    $("#loading_canvas_2").css('opacity', '0');
}

function displayContinuums() {
    if(document.getElementById("explore_text").innerHTML=="Explore More Designs: Off") {

        document.getElementById("continuums_chart").style.display = 'inline-block';
        $("#continuums_chart").animate({height: '360px',opacity:'1'}, "slow");
        if(!using_compression)
            $("#split_1").animate({height: "633px"}, "slow");
        else
            $("#split_1").animate({height: "686px"}, "slow");
    }
    else {
        $("#continuums_chart").animate({height: '0px',opacity: '0'}, "slow");
        $("#split_1").animate({height: "0px"}, "slow");
        //document.getElementById("continuums_chart").style.display = 'none';
    }
    //$("html,body").animate({scrollTop: $("#cost_result_p1").offset().top-140}, 500);
    if(document.getElementById("explore_text").innerHTML=="Explore More Designs: Off")
        document.getElementById("explore_text").innerHTML="Explore More Designs: On";
    else
        document.getElementById("explore_text").innerHTML="Explore More Designs: Off";
}

function switchText(id) {
    if(using_compression){
        $("#interactive-panel").height(640);
        $("#questions_block").height(638);
    }
    $("#stat").css("height","0px");
    $("#stat").css("opacity","0");
    $("#stat").css("z-index","0");
    if(id=="interactive_tab_2") {
        $("#charts").animate({opacity:"1"}, "slow");
        document.getElementById("interactive_mode_text").innerHTML = "Interactive Mode: On";
        $("#questions_block").animate({width: '240px',opacity:'1'}, "slow");
        //$("#rocks,#WT").animate({width: '0px',opacity:'0'}, "slow");
        $("#exist_title").animate({width: '30%', opacity: '0'}, "slow");
        $("#interactive-panel").animate({width: '1136px',borderWidth:1,borderOpacity:1}, "slow");
        $("#charts").css('left','calc(50% - 620px)');
        $("#charts").css('transform','scale(0.9) translateY(-40px)');
        $("#interactive-content").css('transform','scale(0.9) translateX(-40px) translateY(-12px)');
        //$("#interactive-panel").css({border:"0px solid #7379DE"}).animate({borderWidth:1},"slow");
        $("#interactive_banner").animate({height: "35px", opacity:"1", borderWidth:1}, "slow");
        $("#explore_switch").css('transform','translateY(-50px) ');
        $("#explore_switch").animate({opacity:"1"}, "slow");
        $("#exsys_switch").animate({opacity:"0"}, "slow");
        $("#split_1").animate({opacity:"1"}, "slow");
        if(document.getElementById("explore_text").innerHTML=="Explore More Designs: On") {
            $("#continuums_chart").animate({height: '360px',opacity:'1'}, "slow");
        }
        $("#guide").animate({opacity:"0"}, "slow");

        $("#WT,#rocks,#faster,#faster_h").css("width","0");
        $("#WT,#rocks,#faster,#faster_h").css("opacity","0");
        $("#exist_panel").animate({width: '0', opacity: '0'}, "slow");
        $("#exist_panel").css("margin-left","0px");
        $("#cost_result_p1_1").css("opacity","0");
    }
    else if (id=="interactive_tab_1"){
        $("#charts").animate({opacity:"1"}, "slow");
        document.getElementById("interactive_mode_text").innerHTML = "Interactive Mode: Off";
        $("#questions_block").animate({width: '0px',opacity:'0'}, "slow");
        /*
        if(document.getElementById("exsys_text").innerHTML=="Compare with existing systems: On") {
            $("#rocks,#WT").animate({width: '255px', opacity: '1'}, "slow");
            $("#exist_title").animate({width: '30%', opacity: '1'}, "slow");
        }
        else {
            $("#rocks,#WT").animate({width: '255px', opacity: '0'}, "slow");
            $("#exist_title").animate({width: '30%', opacity: '0'}, "slow");
        }
        */
        //$("#interactive-panel").css({border:"1px solid #7379DE"}).animate({borderWidth:0},"slow");
        $("#interactive-panel").animate({width: '1392px',borderWidth:0,borderOpacity:0}, "slow");
        $("#charts").css('left','calc(50% - 480px)');
        $("#charts").css('transform','scale(1) translateY(0px)');
        $("#interactive-content").css('transform','scale(1)');
        $("#interactive_banner").animate({height: "0px", opacity:"0", borderWidth:0}, "slow");
        $("#explore_switch").css('transform','translateY(0px)');
        $("#split_1").animate({opacity:"0"}, "slow");
        $("#explore_switch").animate({opacity:"0"}, "slow");
        $("#exsys_switch").animate({opacity:"1"}, "slow");

        $("#continuums_chart").animate({height: '0px',opacity:'0'}, "slow");
        $("#guide").animate({opacity:"1"}, "slow");
        $("#exist_panel").animate({width: '50px', opacity: '1'}, "slow");
        if($("#rocks_button").hasClass("show-design")){
            $("#rocks").animate({width: '255px',opacity:'1'}, "fast");
        }
        if($("#wt_button").hasClass("show-design")){
            $("#WT").animate({width: '255px',opacity:'1'}, "fast");
        }
        if($("#fast_button").hasClass("show-design")){
            $("#faster").animate({width: '255px',opacity:'1'}, "fast");
        }
        if($("#fasterh_button").hasClass("show-design")){
            $("#faster_h").animate({width: '255px',opacity:'1'}, "fast");
        }
        $("#exist_panel").css("margin-left","25px");
        $("#cost_result_p1_1").css("opacity","1");
    }else{
        $("#charts").animate({opacity:"0"}, "slow");
        $("#guide").animate({opacity:"0"}, "slow");
        $("#stat").animate({height:"650px", opacity:"1"}, "slow");
        $("#stat").css("z-index","2");
    }

}

function checkInput(input){
    if(isNaN(parseFloat(input.value))){
        alert("Invalid input!");
        return false;
    }else
        return true
}

function checkInput2(input){
    if(isNaN(parseFloat(input.value))||parseFloat(input.value)<0||parseFloat(input.value)>100){
        alert("Invalid input!");
        return false;
    }else
        return true
}

/**
 * This function fills the results in the Interactive What-If Design subcategory.
 * It is called after everytime a Question is asked by the user.
 */
function switchQuestion() {
    document.getElementById("question0").style.display="none";
    document.getElementById("question1").style.display="none";
    document.getElementById("question2").style.display="none";
    document.getElementById("question3").style.display="none";
    document.getElementById("question4").style.display="none";
    document.getElementById("question5").style.display="none";
    if(document.getElementById("questions").value=="1") {
        document.getElementById("question1").style.display = "";
        var input = document.getElementById("question1_input");
        input.addEventListener("keydown", function (e) {
            if (e.keyCode == 13) {  //checks whether the pressed key is "Enter"
                if(checkInput(input)) {
                    document.getElementById("question0").style.display="";
                    document.getElementById("question0").innerHTML="Previous input value: "+ parseFloat(document.getElementById("cost").value);
                    //document.getElementById("cost").value = parseFloat(document.getElementById("cost").value) + parseFloat(input.value);
                    budget_change=parseFloat(input.value);
                    re_run(e,false);
                }
            }
        });
    }
    if(document.getElementById("questions").value=="2") {
        document.getElementById("question2").style.display = "";
        var input = document.getElementById("question2_input");
        input.addEventListener("change", function (e) {
            if(input.value=="Any"){
                user_cloud_provider_enable=[1,1,1];
            }
            if(input.value=="AWS"){
                user_cloud_provider_enable=[1,0,0]
            }
            if(input.value=="GCP"){
                user_cloud_provider_enable=[0,1,0]
            }
            if(input.value=="Azure"){
                user_cloud_provider_enable=[0,0,1]
            }
            prune_cloud_provider();
            re_run(e);
        });
    }
    if(document.getElementById("questions").value=="3") {
        document.getElementById("question3").style.display = "";
        var input = document.getElementById("question3_input");
        input.addEventListener("keydown", function (e) {
            if (e.keyCode == 13) {
                if(checkInput(input)) {
                    var cost = parseFloat(document.getElementById("cost").value);
                    var result_array = global_continuums_array;
                    result_array.sort(function (a, b) {
                        return a[0] - b[0];
                    });
                    result_array = getBestDesignEverArray(result_array);
                    var index;
                    for (var i = 0; i < result_array.length; i++) {
                        if (cost < result_array[i][0]) {
                            if ((cost - result_array[i - 1][0]) > (result_array[i][0] - cost))
                                index = i;
                            else
                                index = i - 1;
                            break;
                        }
                        if (i == result_array.length - 1)
                            alert("Design not exist!");
                    }
                    for (var i = index + 1; i < result_array.length; i++) {
                        if (result_array[i][1] < result_array[index][1] * (1 - input.value / 100)) {
                            document.getElementById("cost").value = Math.ceil(result_array[i][0]);
                            re_run(e,false);
                            break;
                        }
                        if (i == result_array.length - 1)
                            alert("Design not exist!");
                    }
                }
            }
        });
    }
    if(document.getElementById("questions").value=="4") {
        document.getElementById("question4").style.display = "";
        var input = document.getElementById("question4_input");
        input.addEventListener("change", function (e) {
            if(checkInput2(input)) {
                document.getElementById("question0").style.display="";
                document.getElementById("question0").innerHTML="Previous input value: "+ (document.getElementById("v").value*100).toFixed(2)+"%";
                document.getElementById("v").value = (input.value / 100).toFixed(4);
                document.getElementById("w").value = (1 - (input.value / 100).toFixed(4));
                re_run(e);
            }
        });
    }
    if(document.getElementById("questions").value=="5") {
        document.getElementById("question5").style.display = "";
        var input = document.getElementById("question5_input");
        input.addEventListener("change", function (e) {
            if(checkInput2(input)) {
                document.getElementById("question0").style.display="";
                document.getElementById("question0").innerHTML="Previous input value: "+ (document.getElementById("w").value*100).toFixed(2)+"%";
                document.getElementById("w").value = (input.value / 100).toFixed(4);
                document.getElementById("v").value = (1 - (input.value / 100).toFixed(4));
                re_run(e);
            }
        });
    }
    if(document.getElementById("questions").value=="6") {
        var result_array = global_continuums_array;
        result_array.sort(function (a, b) {
            return a[0] - b[0];
        });
        var index=0;
        for(var i=0;i<result_array.length;i++){
            if(result_array[i][5].throughput/result_array[i][0]>result_array[index][5].throughput/result_array[index][0]&&result_array[i][5].L!=0){
                index=i;
            }
        }

        document.getElementById("cost").value = Math.floor(result_array[index][0]);
        re_run(event);
    }
}

/**
 * This code presents the results in the Statistical Analysis output.
 * @TODO: Use the other global arrays instead of the global_continuums_array
 */
function switchStatistics() {
    removeAllChildren(document.getElementById("statistics_result"));
    document.getElementById("statistic1").style.display="none";
    if(document.getElementById("statistics").value=="1") {
        var old_length=[0,0,0];
        document.getElementById("statistic1").style.display = "";
        var input = document.getElementById("statistic1_input");
        input.addEventListener("keydown", function (e) {
            if (e.keyCode == 13) {  //checks whether the pressed key is "Enter"
                if(checkInput2(input)) {

                    removeAllChildren(document.getElementById("statistics_result"));
                    var result_array = global_continuums_array;
                    result_array.sort(function (a, b) {
                        return a[1] - b[1];
                    });
                    var cloud_provider_num = [0, 0, 0];
                    for (var i = 0; i < Math.ceil(result_array.length * input.value / 100); i++) {
                        for (var j = 0; j < 3; j++) {
                            if (result_array[i][3] == cloud_array[j]) {
                                cloud_provider_num[j]++;
                            }
                        }
                    }
                    var max_num = Math.max(cloud_provider_num[0], cloud_provider_num[1], cloud_provider_num[2]);
                    var width = 100;
                    var div_result = document.getElementById("statistics_result");
                    for (var i = 0; i < 3; i++) {
                        var div_temp = document.createElement("div");
                        div_temp.setAttribute("style", "width:98%;text-align:left");
                        div_temp.setAttribute("class", "myinput2")
                        var text = document.createElement("div");
                        text.setAttribute("style", "display:inline-block;width:50px;font-size:12px;text-align:left;vertical-align: top;padding: 3px;");
                        text.innerHTML = cloud_array[i];
                        div_temp.appendChild(text);
                        var bar = document.createElement("div");
                        bar.setAttribute("class", "color_bar");
                        bar.setAttribute("style", "width:" + old_length[i] + "px;background-color:#83"+(9-i)+"BFF; height:15px; margin-top:3px");
                        old_length[i]=width * cloud_provider_num[i] / max_num;
                        div_temp.appendChild(bar);
                        var percent = document.createElement("div");
                        percent.setAttribute("style", "display:inline-block;font-size:12px;vertical-align: top;padding: 0px;;opacity:0");
                        percent.innerHTML = ((cloud_provider_num[i] / result_array.length) * 100).toFixed(1) + "%";
                        div_temp.appendChild(percent);
                        div_result.appendChild(div_temp);

                        $(bar).animate({width:old_length[i]+"px"},{speed:"slow",quene:false});
                        $(percent).animate({opacity:1},"slow");
                    }
                }
            }
        });
    }

    if(document.getElementById("statistics").value=="2"){
        var div_result = document.getElementById("statistics_result");
        var result_array = (global_continuums_array);
        var old_length_3=[0,0,0,0,0];
        result_array.sort(function (a, b) {
            return a[0] - b[0];
        });
        var result_array = getBestDesignEverArray(result_array);
        for (var i = 0; i < 5; i++) {
            var div_temp = document.createElement("div");
            div_temp.setAttribute("class", "myinput2");
            div_temp.setAttribute("style", "display:inline-block;width:100%;text-align:left");
            var text = document.createElement("div");
            text.setAttribute("style", "display:inline-block;width:70px;font-size:12px;text-align:left;vertical-align: top;padding: 1px;");
            text.innerHTML = "$"+result_array[i][0] ;
            div_temp.append(text);
            var bar = document.createElement("div");
            bar.setAttribute("class", "color_bar");
            bar.setAttribute("style", "width:" + old_length_3[i] + "px;background-color:#83"+(9-i)+"BFF; height:15px; margin-top:2px");
            old_length_3[i]=120 * result_array[i][0] / result_array[4][0];
            div_temp.append(bar);
            div_result.appendChild(div_temp);
            $(bar).animate({width:old_length_3[i]+"px"},{speed:"slow"});
        }
    }

    if(document.getElementById("statistics").value=="3"){
        removeAllChildren(document.getElementById("statistics_result"));
        var div_result = document.getElementById("statistics_result");
        var old_length_2=[[0,0],[0,0]]
        for (var j=1;j<=2;j++) {
            var div_temp = document.createElement("div");
            div_temp.setAttribute("class", "myinput2");
            div_temp.setAttribute("style", "width:98%;text-align:left;margin-top:15px");
            div_temp.innerHTML = "Key-value store "+j+":";
            div_result.appendChild(div_temp);

            var result_array = global_continuums_array;
            result_array.sort(function (a, b) {
                return a[1] - b[1];
            });

            var query_IO = [result_array[global_index+j-1][5].read_cost * result_array[global_index+j-1][5].v, result_array[global_index+j-1][5].update_cost * result_array[global_index+j-1][5].w];
            var query_type = ["Read", "Write"];
            var colors_2 = ["#837BFF", "#83DEFF"];


            for (var i = 0; i < 2; i++) {
                var div_temp = document.createElement("div");
                div_temp.setAttribute("style", "width:98%;text-align:left");
                div_temp.setAttribute("class", "myinput2")
                var text = document.createElement("div");
                text.setAttribute("style", "display:inline-block;width:50px;font-size:12px;text-align:left;vertical-align: top;padding: 2px;");
                text.innerHTML = query_type[i];
                div_temp.appendChild(text);
                var bar = document.createElement("div");
                bar.setAttribute("class", "color_bar");
                bar.setAttribute("style", "width:" + old_length_2[j-1][i] + "px;background-color:" + colors_2[i] + "; height:15px");
                old_length_2[j-1][i]=90 * query_IO[i] / (query_IO[1] + query_IO[0]);
                div_temp.appendChild(bar);
                var percent = document.createElement("div");
                percent.setAttribute("style", "display:inline-block;font-size:12px;vertical-align: top;padding: 2px;");
                percent.innerHTML = ((query_IO[i] / (query_IO[1] + query_IO[0])) * 100).toFixed(1) + "%";
                div_temp.appendChild(percent);
                div_result.appendChild(div_temp);
                $(bar).animate({width:old_length_2[j-1][i]+"px"},{speed:"slow",quene:false});
            }


        }


    }
    if(document.getElementById("statistics").value=="4"){
        var div_result = document.getElementById("statistics_result");
        var result_array = global_continuums_array;
        result_array.sort(function (a, b) {
            return a[0] - b[0];
        });
        var index=0;
        var index_2=0;
        for(var i=0;i<result_array.length;i++){
            if(result_array[i][5].throughput/result_array[i][0]>result_array[index][5].throughput/result_array[index][0]&&result_array[i][5].L!=0){
                index_2=index;
                index=i;
            }
        }
        var div_temp = document.createElement("div");
        div_temp.setAttribute("class", "myinput");
        div_temp.setAttribute("style", "width:98%;text-align:left;height:auto;margin-top:15px");
        div_temp.innerHTML = "Best Cost Performance Design:<br>"+"Cost: $"+result_array[index][0]+"<br>Throughput: "+result_array[index][5].throughput.toFixed(0)+" queries/s<br>"+"Cost Performance: "+(result_array[index][5].throughput/result_array[index][0]).toFixed(1);
        div_result.appendChild(div_temp);

        var div_temp = document.createElement("div");
        div_temp.setAttribute("class", "myinput");
        div_temp.setAttribute("style", "width:98%;text-align:left;height:auto;margin-top:15px");
        div_temp.innerHTML = "Second Best Cost Performance Design:<br>"+"Cost: $"+result_array[index_2][0]+"<br>Throughput: "+result_array[index_2][5].throughput.toFixed(0)+" queries/s<br>"+"Cost Performance: "+(result_array[index_2][5].throughput/result_array[index_2][0]).toFixed(1);
        div_result.appendChild(div_temp);

    }
}

function displayRocks() {
    //$("html,body").animate({scrollTop: $("#cost_result_p1").offset().top-140}, 500);
    if(document.getElementById("exsys_text").innerHTML=="Compare with existing systems: Off") {
        document.getElementById("exsys_text").innerHTML = "Compare with existing systems: On";
        $("#WT,#rocks").animate({opacity:"1"}, "slow");
    }
    else {
        document.getElementById("exsys_text").innerHTML = "Compare with existing systems: Off";
        $("#WT,#rocks").animate({opacity:"0"}, "slow");
    }
}

function adjustGuide() {
    setTimeout('$("#guide_3").animate({height:$("#input").height()-31+48},"fast")',100);
    setTimeout('$("#guide_3").animate({height:$("#input").height()-31+48},"normal")',300);
    setTimeout('$("#guide_3").animate({height:$("#input").height()-31+48},"normal")',500);
    //setTimeout('$("#guide").animate({height:$("#input").height()-15+80,top:($("#input").height()*(-1)+15-30)+"px"},"slow")',500);
}

function switch_SLA() {
    $('body').toggleClass("blur-body");
    $('#demo_body').toggleClass("blur");
    if($("#SLA-setting").css('opacity')==0){
        $("#SLA-tab").animate(({width:1300+"px"}),"fast");
        $("#SLA-tab").animate(({height:365+"px"}),"fast");
        $("#SLA-setting").css("height","85%");
        setTimeout('$("#SLA-setting,#SLA-title").animate(({opacity:1}),"normal")', 500);
        //$("#SLA-setting").animate(({width:200+"px"}),"normal");
    }else{
        $("#SLA-setting,#SLA-title").animate(({opacity:0}),"fast");
        //$("#SLA-setting").animate(({width:0}),"normal");
        $("#SLA-tab").animate(({width:315+"px"}),"fast");
        $("#SLA-tab").animate(({height:50+"px"}),"fast");
        $("#SLA-setting").css("height","0%");
        prune_cloud_provider();
    }
}

function hideNavigation(){
    $("#question_navigation").animate({opacity:"0"}, "slow");
    setTimeout('$("#question_navigation").css(\'display\',\'none\')',1000);
}

function initializeSLACheckboxes() {
    $("#SLA_radio_1").prop("checked", enable_DB_migration);
    $("#SLA_radio_2").prop("checked", enable_dev_ops);
    $("#SLA_radio_3").prop("checked", enable_backup);


    $("#SLA_radio_1").on('click', function() {
        if(enable_DB_migration==true) {
            enable_DB_migration = false;
            $(this).prop("checked", false);
        }else{
            enable_DB_migration = true;
            $(this).prop("checked", true);
        }
        if(if_display)
            drawContinuumsMultithread();
    });

    $("#SLA_radio_2").on('click', function() {
        if(enable_dev_ops==true) {
            enable_dev_ops = false;
            $(this).prop("checked", false);
        }else{
            enable_dev_ops = true;
            $(this).prop("checked", true);
        }
        if(if_display)
            drawContinuumsMultithread();
    });

    $("#SLA_radio_3").on('click', function() {
        if(enable_backup==true) {
            enable_backup = false;
            $(this).prop("checked", false);
        }else{
            enable_backup = true;
            $(this).prop("checked", true);
        }
        if(if_display)
            drawContinuumsMultithread();
    });

    $("#SLA_radio_4").on('click', function() {
        if(enable_availability==true) {
            enable_availability = false;
            $(this).prop("checked", false);
        }else{
            enable_availability = true;
            $(this).prop("checked", true);
        }
        prune_cloud_provider()
        if(if_display)
            drawContinuumsMultithread();
    });

    $("#SLA_radio_5").on('click', function() {
        if(enable_durability==true) {
            enable_durability = false;
            $(this).prop("checked", false);
        }else{
            enable_durability = true;
            $(this).prop("checked", true);
        }
        prune_cloud_provider()
        if(if_display)
            drawContinuumsMultithread();
    });

    $("#availability_checkbox_1,#availability_checkbox_2").on('click', function() {
        if($(this).prop("checked")) {
            $("#availability_checkbox_1").prop("checked", false);
            $("#availability_checkbox_2").prop("checked", false);
            $(this).prop("checked", true);
            enable_availability=true;
            $("#SLA_radio_4").prop("checked",true);
        }else{
            enable_availability=false;
            $("#SLA_radio_4").prop("checked",false);
        }
        if(if_display)
            drawContinuumsMultithread();
    });


    $("#durability_checkbox_1,#durability_checkbox_2,#durability_checkbox_3").on('click', function() {
        if($(this).prop("checked")) {
            $("#durability_checkbox_1").prop("checked", false);
            $("#durability_checkbox_2").prop("checked", false);
            $("#durability_checkbox_3").prop("checked", false);
            $(this).prop("checked", true);
            enable_durability=true;
            $("#SLA_radio_5").prop("checked",true);
        }else{
            enable_durability=false;
            $("#SLA_radio_5").prop("checked",false);
        }
        if(if_display)
            drawContinuumsMultithread();
    });
}

function prune_cloud_provider(){
    $("#AWS_checkbox").prop("checked", user_cloud_provider_enable[0]);
    $("#GCP_checkbox").prop("checked", user_cloud_provider_enable[1]);
    $("#Azure_checkbox").prop("checked", user_cloud_provider_enable[2]);
    cloud_provider_enable[0]=user_cloud_provider_enable[0];
    cloud_provider_enable[1]=user_cloud_provider_enable[1];
    cloud_provider_enable[2]=user_cloud_provider_enable[2];
    $("#AWS_checkbox").prop("disabled", "");
    $("#GCP_checkbox").prop("disabled", "");
    $("#Azure_checkbox").prop("disabled", "");
    if(enable_availability) {
        if ($("#availability_checkbox_1").prop("checked")) {
        }
        if ($("#availability_checkbox_2").prop("checked")) {
            cloud_provider_enable[1] = 0;
            $("#GCP_checkbox").prop("checked", false);
            $("#GCP_checkbox").prop("disabled", "true");
        }
    }
    if(enable_durability) {
        if ($("#durability_checkbox_2").prop("checked")) {
            cloud_provider_enable[0] = 0;

            $("#AWS_checkbox").prop("checked", false);
            $("#AWS_checkbox").prop("disabled", "true");
        }
        if ($("#durability_checkbox_3").prop("checked")) {
            cloud_provider_enable[0] = 0;
            cloud_provider_enable[1] = 0;
            $("#AWS_checkbox").prop("checked", false);
            $("#AWS_checkbox").prop("disabled", "true");
            $("#GCP_checkbox").prop("checked", false);
            $("#GCP_checkbox").prop("disabled", "true");
        }
    }
    var flag=0;
    for(i=0;i<cloud_provider_num;i++){
        if(cloud_provider_enable[i])
            flag=1;
    }
    if(!flag)
        alert("No available cloud provider");
}

function initializeCloudCheckboxes() {
    $("#AWS_checkbox").prop("checked", true);
    $("#GCP_checkbox").prop("checked", true);
    $("#Azure_checkbox").prop("checked", true);

    $("#AWS_checkbox,#GCP_checkbox,#Azure_checkbox").on('click', function() {
        if($(this).prop("disabled")!="true") {

            user_cloud_provider_enable[$(this).prop("value")]=$(this).prop("checked");
            prune_cloud_provider();
        }
    });
}

function initializeExistDesignPanel() {
    $("#WT,#rocks,#faster,#faster_h").css("width", "0");
    $("#WT,#rocks,#faster,#faster_h").css("opacity", "0");
    exist_1="rocks_button";
    $("#rocks_button").addClass("show-design");
    $("#rocks").animate({width: '255px',opacity:'1'}, "fast");
    exist_2="wt_button";
    $("#wt_button").addClass("show-design");
    $("#WT").animate({width: '255px',opacity:'1'}, "fast");
    $("#rocks_button,#wt_button,#fast_button,#fasterh_button").on('click', function() {
        if(exist_2!=$(this).attr("id")) {
            $("#"+exist_1).removeClass("show-design");
            $(this).addClass("show-design");
            exist_1=exist_2;
            exist_2=$(this).attr("id");
            $("#WT,#rocks,#faster,#faster_h").css("width", "0");
            $("#WT,#rocks,#faster,#faster_h").css("opacity", "0");
            if ($(this).attr("id") == "rocks_button" || exist_1== "rocks_button") {
                $("#rocks").css("width", "255px");
                $("#rocks").animate({width: '255px', opacity: '1'}, "fast");
            }
            if ($(this).attr("id") == "wt_button" || exist_1== "wt_button") {
                $("#WT").css("width", "255px");
                $("#WT").animate({width: '255px', opacity: '1'}, "fast");
            }
            if ($(this).attr("id") == "fast_button" || exist_1== "fast_button") {
                $("#faster").css("width", "255px");
                $("#faster").animate({width: '255px', opacity: '1'}, "fast");
            }
            if ($(this).attr("id") == "fasterh_button" || exist_1== "fasterh_button") {
                $("#faster_h").css("width", "255px");
                $("#faster_h").animate({width: '255px', opacity: '1'}, "fast");
            }
        }
    });

}

function reverseColor() {
    if(document.getElementById("title").style.backgroundColor=="white"){
        document.getElementById("title").style.backgroundColor="#222222";
        document.getElementById("title").style.color="white";
        clearInterval(interval)
        interval=setInterval("drawCanvas(\"#FFFFFF\")",40);
    }else{
        document.getElementById("title").style.backgroundColor="white";
        document.getElementById("title").style.color="black";
        clearInterval(interval)
        interval=setInterval("drawCanvas(\"#000000\")",40);
    }
}