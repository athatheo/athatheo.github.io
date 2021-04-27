
var query_count = 10000000;
var read_percentage = 50;
var write_percentage = 100 - read_percentage;
var short_scan_percentage = 0;
var long_scan_percentage = 0;
var no_of_windows = 1;
var change_percent = 30;
var s = 64;
var head ;
var workload_exec_time = 0;
var total_budget;
var max_RAM_purchased; // in GB
var no_of_RAM_blocks;
var U = 100000000000000;
// static double U = 300000000;
var p_put = 0.2; // fraction of the time that you call get on elements in U_1
var U_1 = 100000;
var U_2 = 1000000000000;
// NOTE: it must always be true that (p_put / U_1) > (1 / U_2)
var p_get = 0.05;

var MIN_RAM_SIZE;
var RAM_BLOCK_COST;
var IOPS;
var network_bandwidth;

var machines = 30;
var workload_type = 0;

var time_unit;
var M_BC;

var global_continuums_array;
var global_rocks_variables_array;
var global_WT_variables_array;
var global_faster_variables_array;
var global_faster_h_variables_array;

var global_progress;
var global_input=0;
var if_display = 0;

var compression_libraries;
var using_compression=true;

var enable_SLA=true;
var enable_DB_migration = false;
var enable_dev_ops = false;
var enable_backup = false;
var enable_availability = false;
var enable_durability = false;

var cri_count=0;
var cri_miss_count=0;
var dri_count=0;
var dri_miss_count=0;
var cri_cache;
var dri_cache;
var log=new Array();

var worker_running=false;
var myWorker;

var cloud_provider_num=3;
var cloud_provider_enable=[1,1,1];
var user_cloud_provider_enable=[1,1,1];

var budget_change=0;

var canvas_theta=0;

var interval;
var exist_1;
var exist_2;

var colors=[
    'green',
    'steelblue',
    'crimson'
];

var cloud_array=[
    'AWS',
    'GCP',
    'AZURE'
];

var global_index;
var global_rocks_index;
var global_WT_index;
var global_faster_index;
var global_faster_h_index;



function Chart(){
    var data;
    var layout;
    var provider_num_array;
}

function VM_library()
{
    var provider_name;
    var no_of_instances;
    var name_of_instance;
    var mem_of_instance; // GB
    var rate_of_instance; // hourly price
}

function Compression_library(){
    var compression_name;
    var get_overhead;
    var put_overhead;
    var space_reduction_ratio;
}

function SLA_factor() {
    var DB_migration_cost;
    var dev_ops;
    var backup;
}

function Variables()
{
    var N;
    var E;
    var F;
    var B;
    var s;

    var cost;
    var scenario;

    var T;
    var K;
    var Z;
    var L;

    var insert;
    var blind_update;
    var read_modify_update;
    var r;
    var v;
    var qL;
    var qS;

    var X; //updated entries in LL-Bush
    var Y;

    var memory_footprint;
    var Buffer;
    var M_F_HI;
    var M_F; // = ((B*E + (M - M_F)) > 0 ? B*E + (M - M_F) : (B*E)); // byte
    var M_F_LO; // = (M_B*(F)*T)/((B)*(E));
    var M_BF;
    var M_FP;
    var FPR_sum;
    var FPR;

    var update_cost;
    var read_cost;
    var rmw_cost;
    var blind_update_cost;
    var no_result_read_cost;
    var short_scan_cost;
    var long_scan_cost;
    var total_cost;
    var SLA_cost;

    var query_count;

    var latency;

    var VM_info;
    var cloud_provider;
    var VM_instance;
    var VM_instance_num;
    var Vcpu_num;

    var compression_name;

    var is_classical;

}


function initChart(ContinuumArray, x, y, x_axis_title, y_axis_title, mode, cost){
    var chart=new Chart();
    var result_array=ContinuumArray;
    result_array.sort(function (a,b) {return a[x]-b[x];});
    var result_array_ever=new Array();
    var best_y=-1;
    var provider_num_array=[0,0,0];
    for(var i=0;i<result_array.length;i++){
        if(mode==0) {
            if (best_y == -1 || (best_y - result_array[i][y]) > 0) {
                best_y = result_array[i][y];
                result_array_ever.push(result_array[i]);
            }
        }
        if(mode==1) {
                result_array_ever.push(result_array[i]);
        }
        if(i<result_array.length/10) {
            for (var j = 0; j < 3; j++) {
                if (result_array[i][3] == cloud_array[j]) {
                    provider_num_array[j]++;
                }
            }
        }
    }

    var legend_array=new Array();
    for(var i=0; i<3; i++){
        legend_array[i]={x: [null],
            y: [null],
            marker: { size: 7, symbol: 'circle', color: "crimson"},
            showlegend: true,
            mode: 'markers',
            name: "red",
            type: 'scatter'
        };
        legend_array[i].marker.color=colors[i];
        legend_array[i].name=cloud_array[i];
    }

    var y_array=new Array();
    var x_array=new Array();
    var info_array=new Array();
    var name_array=new Array();
    var color_array_ad=new Array();
    for(var i=0;i<result_array_ever.length;i++){
        x_array.push(result_array_ever[i][x]);
        y_array.push(result_array_ever[i][y]);
        info_array.push(result_array_ever[i][4]);
        name_array.push(result_array_ever[i][3])
        for(var j=0;j<3;j++){
            if(result_array_ever[i][3]==cloud_array[j])
                color_array_ad.push(colors[j]);
        }
    }

    if(x==1){
        x_array=fixTimeArray(x_array);
        x_axis_title+=time_unit;
    }

    if(y==1){
        y_array=fixTimeArray(y_array);
        y_axis_title+=time_unit;
    }

    chart.data=[{
        x: x_array,
        y: y_array,
        marker: { size: 7, symbol: 'circle', color: color_array_ad},
        mode: 'lines+markers',
        text: info_array,
        line: {color: 'grey', width: 2},
        showlegend: false,
        hovertext: name_array,
        hovertemplate:
            "<b>%{hovertext}</b><extra></extra>",
        type: 'scatter'
    },legend_array[0],legend_array[1],legend_array[2]];

    chart.layout =
        {
            xaxis: {
                title: x_axis_title,
                autorange: true,
                showline: true,
                zeroline: false
            },
            yaxis: {
                title: y_axis_title,
                autorange: true,
                showline: true,
                zeroline: false
            },
            legend: {
                "orientation": "h",
                x: 0.1,
                y: 1
            },
            autosize: true,
            hovermode: "closest",
            width: 375,
            height: 300,
            //title:'Pareto frontiers for State-of-the-art and Monkey Tuning'
            margin: {
                l: 60,
                r: 20,
                b: 50,
                t: 20,
                pad: 5
            }, title: ''
        };

    chart.provider_num_array=provider_num_array;
    return chart;
}

function removeAllChildren(div){
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
}

/**
 * Reads the values from the html elements and sets them as values of a Variables object
 * @returns {Variables}
 */
function parseInputVariables()
{
    var parsedBoxes = new Variables();

    //Dataset and Environment
    parsedBoxes.N = parseInt(document.getElementById("N").value.replace(/\D/g,''),10);
    parsedBoxes.E = parseInt(document.getElementById("E").value.replace(/\D/g,''),10);
    parsedBoxes.F = parseFloat(document.getElementById("F").value);
    parsedBoxes.B = 4096;
    parsedBoxes.cost = parseInt(document.getElementById("cost").value.replace(/\D/g,''), 10);

    //Workload
    parsedBoxes.s = parseInt(document.getElementById("s").value.replace(/\D/g,''), 10);
    parsedBoxes.insert_percentage = parseFloat(document.getElementById("insert_workload").value);
    parsedBoxes.blind_update_percentage = parseFloat(document.getElementById("blind_update_workload").value);
    parsedBoxes.rmw_percentage = parseFloat(document.getElementById("read_modify_update_workload").value);
    parsedBoxes.r = parseFloat(document.getElementById("r").value);
    parsedBoxes.v = parseFloat(document.getElementById("v").value);
    parsedBoxes.qL = parseFloat(document.getElementById("qL").value);
    parsedBoxes.qEL = parseFloat(document.getElementById("qEL").value);
    parsedBoxes.qS = parseFloat(document.getElementById("qS").value);

    parsedBoxes.query_count = parseInt(document.getElementById("query_count").value.replace(/\D/g,''), 10);

    return parsedBoxes;
}

/**
 * Starts the Web Worker that connects this file with worker.js, to start building the 5 continuums.
 * @param if_regenerate
 * @returns {number}
 */
function drawContinuumsMultithread(if_regenerate=true) {
    var cloud_provider=document.getElementById("cloud-provider").selectedIndex;
    if(if_regenerate) {
        if(!worker_running) {
            worker_running=true;
        }else{
            myWorker.terminate();
        }
        myWorker = new Worker('js/worker.js');
        var input = parseInputVariables();
        if (input.blind_update_percentage + input.insert_percentage + input.rmw_percentage + input.r + input.v + input.qEL + input.qL != 1) {
            alert("Workload inputs do not add to 1!");
            return 0;
        } else {
            $("#loading_canvas_2").css('opacity', '1');
            var parameters = {};
            parameters.U = U;
            parameters.p_put = p_put;
            parameters.U_2 = U_2;
            parameters.U_1 = U_1;
            parameters.p_get = p_get;
            parameters.cloud_provider = cloud_provider;
            parameters.input = input;
            parameters.workload_type = workload_type;
            var SLA = {};
            SLA.enable_SLA = enable_SLA;
            SLA.enable_DB_migration = enable_DB_migration;
            SLA.enable_dev_ops = enable_dev_ops;
            SLA.enable_backup = enable_backup;
            SLA.cloud_provider_enable = cloud_provider_enable;
            parameters.SLA = SLA;
            myWorker.postMessage(parameters);
            myWorker.onmessage = function (e) {
                if (typeof e.data == "string") {
                    $("#loading_percentage").html(e.data);
                } else {
                    var ContinuumArray = e.data;
                    global_continuums_array = ContinuumArray[0];
                    global_rocks_variables_array = ContinuumArray[1];
                    global_WT_variables_array = ContinuumArray[2];
                    global_faster_variables_array = ContinuumArray[3];
                    global_faster_h_variables_array = ContinuumArray[4];
                    drawContinuumsNew(global_continuums_array);
                    displayCharts();
                    drawStats();
                    worker_running=false;
                }
            }
        }
    }
    else {
        var ContinuumArray = global_continuums_array;
        ContinuumArray.sort(function (a,b) {return a[0]-b[0];});
        console.log("not generate");
        drawContinuumsNew(ContinuumArray);
    }
}

function drawContinuumsNew(ContinuumArray){
    var provider_num_array=[0,0,0];
    var provider_num_array_ad=[0,0,0];

    var legend_array=new Array();
    for(var i=0; i<3; i++){
        legend_array[i]={x: [null],
            y: [null],
            marker: { size: 7, symbol: 'circle', color: "crimson"},
            showlegend: true,
            mode: 'markers',
            name: "red",
            type: 'scatter'
        };
        legend_array[i].marker.color=colors[i];
        legend_array[i].name=cloud_array[i];
    }
    document.getElementById("chart_style").value="1";

    var cost=parseInt(document.getElementById("cost").value.replace(/\D/g,''), 10)+budget_change;
    var latency=parseFloat(document.getElementById("latency").value);

    var cloud_provider=document.getElementById("cloud-provider").selectedIndex;

    var best_array=ContinuumArray;
    var info_array=new Array();
    for(var i=0;i<best_array.length;i++){
        info_array.push(best_array[i][4]);
        if(i<best_array.length/10){
            for(var j=0;j<3;j++){
                if(best_array[i][3]==cloud_array[j]) {
                    provider_num_array_ad[j]++;
                }
            }
        }
    }

    /**
     * Not sure if this process is needed, I think the correct continuum functionality in the worker.js does the job
     */
    global_rocks_variables_array = getBestExistingDesignArray(global_rocks_variables_array);
    global_WT_variables_array = getBestExistingDesignArray(global_WT_variables_array);
    global_faster_variables_array = getBestExistingDesignArray(global_faster_variables_array);
    global_faster_h_variables_array = getBestExistingDesignArray(global_faster_h_variables_array);
    var rocks_best_array = global_rocks_variables_array;
    var WT_best_array = global_WT_variables_array;
    var FASTER_best_array = global_faster_variables_array;
    var FASTER_H_best_array = global_faster_h_variables_array;


    best_array=getBestDesignEverArray(global_continuums_array);
    var chart_array=drawDesigns(best_array,cost,rocks_best_array,WT_best_array,FASTER_best_array,FASTER_H_best_array);


    $("#chart_style").change(function(){
        var chart;
        if(this.value=='1'){
            chart=initChart(chart_array,0,1,"Cost ($/month)","Latency ", 0, cost);
            provider_num_array=chart.provider_num_array;
            Plotly.newPlot('tester6', chart.data, chart.layout);
        }
        if(this.value=='2'){
            chart=initChart(chart_array,1,0,"Latency ","Cost ($/month)", 0, cost);
            provider_num_array=chart.provider_num_array;
            Plotly.newPlot('tester6', chart.data, chart.layout);
        }
        if(this.value=='3'){
            chart=initChart(chart_array,0,6,"Cost ($/month)","Memory (GB)", 1, cost);
            provider_num_array=chart.provider_num_array;
            Plotly.newPlot('tester6', chart.data, chart.layout);
        }

        var myPlot = document.getElementById('tester6');
        myPlot.on('plotly_hover', function(data){
            var hoverInfo = document.getElementById('hoverinfo6');
            hoverInfo.innerHTML=(data.points[0].text);
            //hoverInfo.innerHTML = infotext.join('<br/>');
            for(var i in ContinuumArray){
                if(data.points[0].text==ContinuumArray[i][4]) {
                    var result_div=document.getElementById("continuums_bar");
                    addTextAndBar(result_div, ContinuumArray[i][5],80,12);
                    drawDiagram(ContinuumArray[i][5], "diagram6");
                }
            }
        })
        $("#diagram6").html("<div style=\"font-size:18px;text-align: center;position: relative;top: 64px;\">Hover along the continuum to learn more.</span>");
        $("#hoverinfo6").html("");
        $("#continuums_bar").html("");
        $("#tester6").hover(function(){
        }, function() {
            $("#hoverinfo6").html("");
            $("#continuums_bar").html("");
            $("#diagram6").html("<div style=\"font-size:18px;text-align: center;position: relative;top: 64px;\">Hover along the continuum to learn more.</span>");
            //$("#hoverinfo6").html("Out of top 10% designs,<br>"+(provider_num_array[0]*100/ContinuumArray.length).toFixed(2)+"% are of AWS,<br>"+(provider_num_array[1]*100/ContinuumArray.length).toFixed(2)+"% are of GCP,<br>and "+(provider_num_array[2]*100/ContinuumArray.length).toFixed(2)+"% are of AZURE.");
        });
    });


    chart=initChart(chart_array,0,1,"Cost ($/month)","Latency ", 0, cost);
    provider_num_array=chart.provider_num_array;
    Plotly.newPlot('tester6', chart.data, chart.layout);
    var myPlot = document.getElementById('tester6');
    myPlot.on('plotly_hover', function(data){
        var hoverInfo = document.getElementById('hoverinfo6');
        hoverInfo.innerHTML=(data.points[0].text);
        //hoverInfo.innerHTML = infotext.join('<br/>');
        for(var i in ContinuumArray){
            if(data.points[0].text==ContinuumArray[i][4]) {
                var result_div=document.getElementById("continuums_bar");
                addTextAndBar(result_div, ContinuumArray[i][5],80,12);
                drawDiagram(ContinuumArray[i][5], "diagram6");
            }
        }
    })


    $("#tester6").hover(function(){
    }, function() {
        $("#hoverinfo6").html("");
        $("#continuums_bar").html("");
        $("#diagram6").html("<div style=\"font-size:18px;text-align: center;position: relative;top: 64px;\">Hover along the continuum to learn more.</span>");
    });

    $(document).ready(function(){
        $("#diagram6").html("<div style=\"font-size:18px;text-align: center;position: relative;top: 64px;\">Hover along the continuum to learn more.</span>");
        //$("#diagram6").html("Out of top 10% designs,<br>"+(provider_num_array[0]*100/ContinuumArray.length).toFixed(2)+"% are of AWS,<br>"+(provider_num_array[1]*100/ContinuumArray.length).toFixed(2)+"% are of GCP,<br>and "+(provider_num_array[2]*100/ContinuumArray.length).toFixed(2)+"% are of AZURE.");
    });


}

function getCol(matrix, col){
    var column = [];
    for(var i=0; i<matrix.length; i++){
        column.push(matrix[i][col]);
    }
    return column; // return column data..
}

function addTextAndBar(result_div,Variables,w,h){
    removeAllChildren(result_div);
    var div_tmp = document.createElement("div");
    div_tmp.setAttribute("style","background-image: url(./images/doublearrow.png); background-size:100% 100%; text-align: center; width:"+w+"px; height: 17px; padding-bottom:3px");
    var text_tmp= document.createElement("div");
    text_tmp.setAttribute("style", "background-color:white; display:inline-block; position:relative; bottom: 2px; padding-left:2px; padding-right:2px");
    text_tmp.innerHTML=Variables.memory_footprint/Variables.VM_instance_num+" GB";
    div_tmp.appendChild(text_tmp);
    //result_div.appendChild(div_tmp);
    drawBar(result_div,[[(Variables.Buffer/1024/1024/1024).toFixed(2),"Buffer"],[(Variables.M_BF/1024/1024/1024).toFixed(2),"Bloom filter"],[(Variables.M_FP/1024/1024/1024).toFixed(2),"Fence pointer"]],1,'no_legend', w, h);
}

function cutArray(array, start, end){
    var result=new Array();
    for(var i=start; i<=end; i++)
        result.push(array[i]);
    return result;
}

function multiplyArray(array, multiplier){
    var result=new Array();
    for(var i=0; i<array.length; i++){
        result.push(array[i]*multiplier);
    }
    return result;
}

/**
 * Takes input of time and translates it to days/hours/mins, etc, while changing the globar variable of
 * the time unit
 * @param array
 * @returns {any[]}
 */
function fixTimeArray(array){
    var result=array;
    time_unit="(day)"
    var mid=Math.floor(result.length/2);
    if(result[mid]<1){
        result=multiplyArray(result,24);
        time_unit="(hour)";
        if(result[mid]<1){
            result=multiplyArray(result,60);
            time_unit="(min)";
            if(result[mid]<1){
                result=multiplyArray(result,60);
                time_unit="(second)";
            }
        }
    }else if(result[mid]>365){
        result=multiplyArray(result,1/365);
        time_unit="(year)";
        if(result[mid]>10){
            result=multiplyArray(result,1/10);
            time_unit="(decade)";
            if(result[mid]>10){
                result=multiplyArray(result,1/10);
                time_unit="(century)";
            }
        }
    }
    return result;
}

function drawCanvas(color){
    var cost=Math.abs(Math.cos(canvas_theta));
    var performance=Math.abs(Math.cos(canvas_theta+Math.PI/3));
    var design=Math.abs(Math.cos(canvas_theta+Math.PI*2/3));
    canvas_theta+=0.008*Math.PI
    var origin={};
    origin.x=100;
    origin.y=190;
    var length=170;

    var Px={},Py={},Pz={};
    Px.x=origin.x+20+length*0.7*cost;
    Px.y=origin.y;
    Py.x=origin.x;
    Py.y=origin.y-20-length*0.7*performance;
    Pz.x=origin.x-14-80*0.7*design;
    Pz.y=origin.y+14+80*0.7*design;
    var canvas=document.getElementById("axis_graph");
    canvas.width=300;
    canvas.height=300;
    var ctx = canvas.getContext('2d');
    ctx.lineWidth=3
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    drawAxis(ctx,100,190,270,190);
    drawAxis(ctx,100,190,100,30);
    drawAxis(ctx,100,190,20,270);

    drawline(ctx,Px,Py);
    drawline(ctx,Pz,Py);
    drawline(ctx,Px,Pz);

    ctx.moveTo(Px.x,Px.y);
    ctx.lineTo(Py.x,Py.y);
    ctx.lineTo(Pz.x,Pz.y);
    ctx.fillStyle = 'rgba('+Math.abs(Math.cos(canvas_theta)*255)+', '+Math.abs(Math.cos(canvas_theta+Math.PI/3)*255)+', '+Math.abs(Math.cos(canvas_theta+Math.PI*2/3)*255)+', '+0.2+')';
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = "20px Simonetta";
    ctx.fillText("Cost", 240,175);
    ctx.fillText("Performance", 120,40);
    ctx.fillText("Data Structure", 35,285);
}

function drawAxis(ctx,start_x,start_y,end_x,end_y){
    var headlen=12;
    ctx.moveTo(start_x,start_y);
    ctx.lineTo(end_x,end_y);
    ctx.stroke();

    var dx = end_x - start_x;
    var dy = end_y - start_y;
    end_x=0.02*dx+end_x;
    end_y=0.02*dy+end_y;
    var angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.lineWidth=1;
    ctx.moveTo(end_x, end_y);
    ctx.lineTo(end_x - headlen * Math.cos(angle - Math.PI / 6), end_y - headlen * Math.sin(angle - Math.PI / 6));
    ctx.stroke();
    ctx.moveTo(end_x, end_y);
    ctx.lineTo(end_x - headlen * Math.cos(angle + Math.PI / 6), end_y - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
    ctx.closePath();
    ctx.lineWidth=3;

}

function drawline(ctx, start, end) {
    ctx.moveTo(start.x,start.y);
    ctx.lineTo(end.x,end.y);
    ctx.stroke()
}

function drawStats() {
    var height=168;
    var width=266;

    var layout={
        height:163,
        width:320,
        margin: {
            l: 55,
            r: 20,
            b: 34,
            t: 0,
            pad: 0
        },
        yaxis: {
            title: ''
        },
        xaxis: {
            title:'',
        },
        hovermode: false
    }

    var layout_2={
        height:163,
        width:300,
        margin: {
            l: 55,
            r: 20,
            b: 34,
            t: 0,
            pad: 0
        },
        yaxis: {
            title: ''
        },
        xaxis: {
            title:'',
            dtick:5000,
            tick0:0
        },
        legend: {
            "orientation": "h",
            x: 0.3,
            y: 1
        },
        hovermode: false
    }
    var result_array = global_continuums_array;
    var input=parseFloat(document.getElementById("stat_input_1").value);
    var cheapestNum=parseInt(document.getElementById("stat_input_2").value);
    var fastestNum=parseInt(document.getElementById("stat_input_5").value);
    result_array.sort(function (a, b) {
        return a[1] - b[1];
    });

    var cloud_provider_num = [0, 0, 0];
    var cheapest_budget=new Array();
    var color_array=new Array();
    var count_array=new Array();
    var width_array=new Array();


    for (var i = 0; i < Math.ceil(result_array.length * input / 100); i++) {
        for (var j = 0; j < 3; j++) {
            if (result_array[i][3] == cloud_array[j]) {
                cloud_provider_num[j]++;
            }
        }
    }

    for (var j=0; j<3; j++){
        cloud_provider_num[j]=((cloud_provider_num[j]/result_array.length)*100);
    }


    result_array.sort(function (a, b) {
        return a[0] - b[0];
    });

    for(var i=0; i < cheapestNum; i++){
        cheapest_budget.push(result_array[i][0]);
        color_array.push('rgb(130,'+(205-150/cheapestNum*i)+',245)');
        count_array.push(i+1);
        width_array.push(0.2);
    }

    result_array.sort(function (a, b) {
        return a[1] - b[1];
    });



    var data_structure_array=[0,0,0];

    for(var i=0; i<result_array.length; i++){
        if(result_array[i][5].data_structure=="LSM"){
            data_structure_array[0]++;
        }
        if(result_array[i][5].data_structure=="LSH"){
            data_structure_array[1]++;
        }
        if(result_array[i][5].data_structure=="B-tree"){
            data_structure_array[1]++;
        }
    }

    for (var j=0; j<3; j++){
        data_structure_array[j]=((data_structure_array[j]/result_array.length)*100);
    }

    var top_performance=new Array();
    var color_array_5=new Array();
    var count_array_5=new Array();
    var width_array_5=new Array();
    for(var i=0; i < fastestNum; i++){
        top_performance.push(result_array[i][1]*60);
        color_array_5.push('rgb(130,'+(205-150/fastestNum*i)+',245)');
        count_array_5.push(i+1);
        width_array_5.push(0.2);
    }

    var budget_array_6=new Array();
    var latency_array_6=new Array();
    var color_array_6=new Array();
    result_array.sort(function (a, b) {
        return a[0] - b[0];
    });
    var best_array=getBestDesignEverArray(result_array);
    for(var i=0; i<best_array.length; i++) {
        budget_array_6.push(parseFloat(best_array[i][0]).toFixed(2));
        latency_array_6.push(best_array[i][1]);
        if(best_array[i][5].if_classic==true){
            color_array_6.push('rgb(130,195,245)')
        }else {
            color_array_6.push('rgb(130,135,245)')
        }
    }
    var query_IO = [best_array[global_index][5].read_cost, best_array[global_index][5].update_cost];

    var improvement_array=new Array();
    improvement_array.push((global_rocks_variables_array[global_rocks_index].latency-best_array[global_index][1])/(global_rocks_variables_array[global_rocks_index].latency)*100);
    improvement_array.push((global_WT_variables_array[global_WT_index].latency-best_array[global_index][1])/(global_WT_variables_array[global_WT_index].latency)*100);
    improvement_array.push((global_faster_variables_array[global_faster_index].latency-best_array[global_index][1])/(global_faster_variables_array[global_faster_index].latency)*100);
    improvement_array.push((global_faster_h_variables_array[global_faster_h_index].latency-best_array[global_index][1])/(global_faster_h_variables_array[global_faster_h_index].latency)*100);

    var hybrid_legend={x: [null],
        y: [null],
        marker: { size: 7, symbol: 'circle', color: 'rgb(130,195,245)'},
        showlegend: true,
        mode: 'markers',
        name: "hybrid",
        type: 'scatter'
    };

    var classic_legend={x: [null],
        y: [null],
        marker: { size: 7, symbol: 'circle', color: 'rgb(130,135,245)'},
        showlegend: true,
        mode: 'markers',
        name: "classic",
        type: 'scatter'
    };

    var trace1 = {
        x: ['AWS', 'GCP', 'Azure'],
        y: cloud_provider_num,
        width: [0.35,0.35,0.35],
        type: 'bar',
        marker: {
            color: ['rgb(130,195,245)','rgb(130,165,245)','rgb(130,135,245)']
        },
        hovertemplate:
            "%{y:.2f}%<extra></extra>",
    };

    var trace2 = {
        x: count_array,
        y: cheapest_budget,
        width: width_array,
        type: 'bar',
        marker: {
            color: color_array
        },
        hovertemplate:
            "$%{y:.2f}",
    };

    var trace3 = {
        x: ['read','write'],
        y: [query_IO[0],query_IO[1]],
        width: [0.5,0.5],
        type: 'bar',
        marker: {
            color: ['rgb(130,195,245)','rgb(130,135,245)']
        },
        hovertemplate:
            "%{y:.3f}",
    };

    var trace4 = {
        x: ['LSM', 'LSH', 'B-tree'],
        y: data_structure_array,
        width: [0.35,0.35,0.35],
        type: 'bar',
        marker: {
            color: ['rgb(130,195,245)','rgb(130,165,245)','rgb(130,135,245)']
        },
        hovertemplate:
            "%{y:.2f}%",
    };

    var trace5 = {
        x: count_array_5,
        y: top_performance,
        width: width_array_5,
        type: 'bar',
        marker: {
            color: color_array_5
        },
        hovertemplate:
            "%{y:.2f}min",
    };

    var trace6 = {
        x: budget_array_6,
        y: latency_array_6,
        marker: { size: 5 ,opacity:0.8 ,symbol: 'circle', color: color_array_6},
        mode: 'lines+markers',
        line: {color: 'grey', width: 1},
        showlegend: false,
        hovertemplate:
            "%{y:.2f}h",
        type: 'scatter'
    }

    var trace7 = {
        x: ['RocksDB', 'Wiredtiger', 'Faster-H','Faster-A'],
        y: improvement_array,
        width: [0.3,0.3,0.3,0.3],
        type: 'bar',
        marker: {
            color: ['rgb(130,195,245)','rgb(130,175,245)','rgb(130,155,245)','rgb(130,135,245)']
        },
        hovertemplate:
            "%{y:.2f}x",
    };

    var trace8 = {
        x: ['min','max'],
        y: [best_array[0][0],best_array[best_array.length-1][0]],
        width: [0.5,0.5],
        type: 'bar',
        marker: {
            color: ['rgb(130,195,245)','rgb(130,135,245)']
        },
        hovertemplate:
            "$%{y:.3f}",
    };

    var trace9 = {
        x: ['min','max'],
        y: [best_array[best_array.length-1][1],best_array[0][1]],
        width: [0.5,0.5],
        type: 'bar',
        marker: {
            color: ['rgb(130,195,245)','rgb(130,135,245)']
        },
        hovertemplate:
            "%{y:.3f}h",
    };
    var data1 = [trace1];
    var data2 = [trace2];
    var data3 = [trace3];
    var data4 = [trace4];
    var data5 = [trace5];
    var data6 = [trace6, classic_legend, hybrid_legend];
    var data7 = [trace7];
    var data8 = [trace8];
    var data9 = [trace9];



    layout.yaxis.title="contribution to<br>design space (%)";
    layout.xaxis.title="cloud providers";
    Plotly.newPlot('stat_graph_1', data1, layout, {displayModeBar: false});

    layout.yaxis.title="budget ($)"
    layout.xaxis.title="rank (lower is better)";
    Plotly.newPlot('stat_graph_2', data2, layout, {displayModeBar: false});

    layout.yaxis.title="I/O cost <br>per operation"
    layout.xaxis.title="operation type";
    Plotly.newPlot('stat_graph_3', data3, layout, {displayModeBar: false});

    layout.yaxis.title="contribution to <br>design space (%)"
    layout.xaxis.title=" class of designs";
    Plotly.newPlot('stat_graph_4', data4, layout, {displayModeBar: false});

    layout.yaxis.title="latency (min)"
    layout.xaxis.title="rank (lower is better)";
    Plotly.newPlot('stat_graph_5', data5, layout, {displayModeBar: false});

    layout_2.yaxis.title="latency (hour)"
    layout_2.xaxis.title=" budget ($)";
    Plotly.newPlot('stat_graph_6', data6, layout_2, {displayModeBar: false});

    layout.yaxis.title=" performance<br>improvement (%)"
    layout.xaxis.title="Existing storage engines";
    Plotly.newPlot('stat_graph_7', data7, layout, {displayModeBar: false});

    layout.yaxis.title="cost ($)"
    layout.xaxis.title="<br>";
    Plotly.newPlot('stat_graph_8', data8, layout, {displayModeBar: false});

    layout.yaxis.title="latency (hour)"
    layout.xaxis.title="<br>";
    Plotly.newPlot('stat_graph_9', data9, layout, {displayModeBar: false});

}

/**
 * This function loops through the cleaned continuums, finds the entry that is closer to the budget and
 * adds the responding values to html. It also returns points to be drawn as a chart.
 * @param best_array
 * @param cost
 * @returns {any[]}
 */
function drawDesigns(best_array, cost, rocks_best_array, WT_best_array, faster_best_array, faster_h_best_array) {
    /**
     * This array contains several text entries to fill HTML elements in result presentation.
     * @type {Array}
     */
    var cost_result_text=new Array();
    /**
     * These two indexes indicate the start and end of the Cosine Design array entries that are relevant to drawing the chart
     * regarding the second output subcategory.
     */
    var chart_start_index, chart_end_index;
    var l1,l2;

    var max_mem;
    var switch_option;
    /**
     * The xyz_index_1 variables hold the index in each of the sorted design arrays (rocks, WT, faster, faster_h)
     * that indicates the entry before surpassing the budget indicated by the user. For example if the user selects a budget of 3000
     * then the entry of WT_best_array[WT_index_1] will contain a design that has a maximum cost of less than 3000
     *
     * The xyz_index_2 is the next entry after xyz_index_2. To clarify, it's not xyz_index_1+1 since there might be multiple entries
     * before the next cost is found.
     */
    var rocks_index_1, rocks_index_2, WT_index_1,WT_index_2, faster_index_1, faster_index_2, faster_h_index_1, faster_h_index_2;
    /**
     * Same thing as above, but for Cosine
     */
    var design_1_index;
    var design_2_index;
    if(cost<best_array[0][0]) {
        cost_result_text[0] = "Sorry, you have insufficient budget. The minimum budget to run the workload is $"+best_array[0][0]+".<br>";
        chart_start_index=0;
        chart_end_index=Math.ceil(best_array/5);
        removeAllChildren(document.getElementById("cost_result_p2"));
        removeAllChildren(document.getElementById("cost_result_p3"));
        removeAllChildren(document.getElementById("cost_result_p4"));
        removeAllChildren(document.getElementById("cost_result_p5"));
        removeAllChildren(document.getElementById("cost_result_p6"));
        removeAllChildren(document.getElementById("cost_result_p7"));
        removeAllChildren(document.getElementById("cost_result_p8"));
        removeAllChildren(document.getElementById("cost_result_p9"));
        document.getElementById("cost_result_p1").innerHTML=cost_result_text[0];
    }
    else{
        if(best_array[best_array.length-1][0]<cost) {
            design_1_index=best_array.length-1;
            rocks_index_1 = rocks_best_array.length - 1;
            WT_index_1 = WT_best_array.length - 1;
            faster_index_1 = faster_best_array.length - 1;
            faster_h_index_1
                = faster_h_best_array.length - 1;

            cost_result_text[0]=("We found 1 storage engine design for you at "+cost+".<br><br>");
            //drawDiagram(best_array[best_array.length-1][5], 'cost_result_diagram1');
            cost_result_text[1]="<b>Our Option:</b>"
            cost_result_text[2] = best_array[best_array.length - 1][5];
            chart_start_index=Math.floor(best_array.length*4/5);
            chart_end_index=best_array.length-1;
            l1=1;
            l2=-1;
        }else {
            for (var i = 1; i < best_array.length; i++) {
                if (best_array[i][0] >= cost||(best_array[i][1]*24<latency&&!isNaN(latency))) {
                    design_1_index = i - 1;
                    design_2_index = i;
                    if(!isNaN(latency)) {
                        if (best_array[i][1] * 24 < latency)
                            cost_result_text[0] = ("<i>We found 2 storage engine designs for you at $" + cost + " with latency less than " + fixTime(latency / 24) + ".</i><br><br>");
                        else {
                            for (var j = 1; j < best_array.length; j++) {
                                if (best_array[j][1]*24 < latency){
                                    design_2_index=j;
                                    break;
                                }
                            }
                            cost_result_text[0] = ("<i>The budget $" + cost + " is too low to achieve " + fixTime(latency / 24) + " latency. However, we found the following two storage engines for you.</i><br><br>");
                        }
                    }else{
                        cost_result_text[0] = ("<i>We found 2 storage engine designs for you at $" + cost + ".</i><br><br>");
                    }
                    cost_result_text[1] = "<b>Cosine configuration 1<br>saves money</b>"
                    cost_result_text[2] = best_array[design_1_index][5];
                    cost_result_text[3] = "<b>Cosine configuration 2<br>saves time</b>";
                    cost_result_text[4] = best_array[design_2_index][5];
                    chart_start_index = Math.floor(i - best_array.length / 5);
                    if (chart_start_index < 0)
                        chart_start_index = 0;
                    chart_end_index = Math.ceil(i + best_array.length / 5);
                    if (chart_end_index > best_array.length - 1)
                        chart_end_index = best_array.length - 1;

                    if (cost_result_text[2].memory_footprint / cost_result_text[2].VM_instance_num > cost_result_text[4].memory_footprint / cost_result_text[4].VM_instance_num) {
                        //max_mem=cost_result_text[2].memory_footprint/cost_result_text[2].VM_instance_num;
                        l1 = 1;
                        l2 = (cost_result_text[4].memory_footprint / cost_result_text[4].VM_instance_num) / (cost_result_text[2].memory_footprint / cost_result_text[2].VM_instance_num);
                    } else {
                        //max_mem=cost_result_text[4].memory_footprint/cost_result_text[4].VM_instance_num;
                        l2 = 1;
                        l1 = (cost_result_text[2].memory_footprint / cost_result_text[2].VM_instance_num) / (cost_result_text[4].memory_footprint / cost_result_text[4].VM_instance_num);
                    }

                    if ((cost - best_array[i - 1][0]) > (best_array[i][0] - cost))
                        switch_option = true;
                    break;
                }
            }
            var cost1 = best_array[design_1_index][0];
            var cost2 = best_array[design_2_index][0];
            var temp = getIndex(cost1, cost2, rocks_best_array);
            rocks_index_1 = temp[0];
            rocks_index_2 = temp[1];
            temp = getIndex(cost1, cost2, WT_best_array);
            WT_index_1 = temp[0];
            WT_index_2 = temp[1];
            temp = getIndex(cost1, cost2, faster_best_array);
            faster_index_1 = temp[0];
            faster_index_2 = temp[1];
            temp = getIndex(cost1, cost2, faster_h_best_array);
            faster_h_index_1 = temp[0];
            faster_h_index_2 = temp[1];
        }
        document.getElementById("cost_result_p1").innerHTML=cost_result_text[0];

        document.getElementById("cost_result_p2").innerHTML= cost_result_text[1];
        outputParameters(cost_result_text[2],"cost_result_p3", l1);

        /**
         * In the next section results fill the HTML elements of the first output subcategory
         */
        if(l2!=-1) {
            if(document.getElementById('performance_conscious_checkbox').checked){
                document.getElementById("cost_result_p4").innerHTML= "<b>Cosine configuration 2<br>saves money</b>";
                outputParameters(cost_result_text[2],"cost_result_p5", l1);
                document.getElementById("cost_result_p2").innerHTML = "<b>Cosine configuration 1<br> saves time</b>";
                outputParameters(cost_result_text[4], "cost_result_p3", l2);
            }else {
                document.getElementById("cost_result_p4").innerHTML = cost_result_text[3];
                outputParameters(cost_result_text[4], "cost_result_p5", l2);
            }
        }else{
            removeAllChildren(document.getElementById("cost_result_p4"));
            removeAllChildren(document.getElementById("cost_result_p5"));
        }

        var flag=0;
        if( cost_result_text[0] != "Cost is too little"){

            if(cost_result_text[0] == "We found 1 storage engine design for you at "+cost+".<br><br>"){ 
                if(rocks_index_1!=-1) {
                    document.getElementById("cost_result_p6").innerHTML = "<b>RocksDB<br><br></b>";
                    outputParameters(rocks_best_array[rocks_index_1], "cost_result_p7", l1);
                }else{
                    document.getElementById("cost_result_p6").innerHTML = "<b>RocksDB: Not Enough Memory<br><br></b>";
                    removeAllChildren(document.getElementById("cost_result_p7"));
                }
                if(WT_index_1!=-1) {
                    document.getElementById("cost_result_p8").innerHTML = "<b>WiredTiger<br><br></b>";
                    outputParameters(WT_best_array[WT_index_1], "cost_result_p9", l1);
                }else{
                    document.getElementById("cost_result_p8").innerHTML = "<b>WiredTiger: Not Enough Memory<br><br></b>";
                    removeAllChildren(document.getElementById("cost_result_p9"));
                }
                if(faster_index_1!=-1) {
                    document.getElementById("cost_result_p10").innerHTML = "<b>FASTER <br>(append-only logs)<br></b>";
                    outputParameters(faster_best_array[faster_index_1], "cost_result_p11", l1);
                }else{
                    document.getElementById("cost_result_p10").innerHTML = "<b>FASTER-A: Not Enough Memory<br><br></b>";
                    removeAllChildren(document.getElementById("cost_result_p11"));
                }
                if(faster_h_index_1!=-1) {
                    document.getElementById("cost_result_p12").innerHTML = "<b>FASTER <br>(hybrid logs)<br></b>";
                    outputParameters(faster_h_best_array[faster_h_index_1], "cost_result_p13", l1);
                }else{
                    document.getElementById("cost_result_p12").innerHTML = "<b>FASTER-H: Not Enough Memory<br><br></b>";
                    removeAllChildren(document.getElementById("cost_result_p13"));
                }

            } else {
                //document.getElementById("cost_result_p6").setAttribute("style","position:relative;top:0px");
                if(rocks_index_1!=-1) {
                    document.getElementById("cost_result_p6").innerHTML = "<b>RocksDB<br><br></b>";
                    if((cost-rocks_best_array[rocks_index_1].cost)>(rocks_best_array[rocks_index_2].cost-cost)) {
                        outputParameters(rocks_best_array[rocks_index_2], "cost_result_p7", l2);
                        outputNote(rocks_best_array[rocks_index_1], "cost_result_p7");
                        flag=1;
                    }else{
                        outputParameters(rocks_best_array[rocks_index_1], "cost_result_p7", l1);
                        outputNote(rocks_best_array[rocks_index_2], "cost_result_p7");

                    }
                }else{
                    document.getElementById("cost_result_p6").innerHTML = "<b>RocksDB: Not Enough Memory<br><br></b>";
                    removeAllChildren(document.getElementById("cost_result_p7"));
                }
                if(WT_index_1!=-1) {
                    document.getElementById("cost_result_p8").innerHTML = "<b>WiredTiger<br><br></b>";
                    if((cost-WT_best_array[WT_index_1].cost)>(WT_best_array[WT_index_2].cost-cost)) {
                        outputParameters(WT_best_array[WT_index_2], "cost_result_p9", l2);
                        outputNote(WT_best_array[WT_index_1], "cost_result_p9");
                    }else{
                        outputParameters(WT_best_array[WT_index_1], "cost_result_p9", l1);
                        outputNote(WT_best_array[WT_index_2], "cost_result_p9");
                    }
                }else{
                    document.getElementById("cost_result_p8").innerHTML = "<b>WiredTiger: Not Enough Memory<br><br></b>";
                    removeAllChildren(document.getElementById("cost_result_p9"));
                }
                if(faster_index_1!=-1) {
                    document.getElementById("cost_result_p10").innerHTML = "<b>FASTER <br>(append-only logs)<br></b>";
                    if((cost-faster_best_array[faster_index_1].cost)>(best_array[faster_index_2].cost-cost)) {
                        outputParameters(faster_best_array[faster_index_2], "cost_result_p11", l2);
                        outputNote(faster_best_array[faster_index_1], "cost_result_p11");
                    }else{
                        outputParameters(faster_best_array[faster_index_1], "cost_result_p11", l1);
                        outputNote(faster_best_array[faster_index_2], "cost_result_p11");
                    }
                }else{
                    document.getElementById("cost_result_p10").innerHTML = "<b>FASTER-A: Not Enough Memory<br><br></b>";
                    removeAllChildren(document.getElementById("cost_result_p11"));
                }

                if(faster_h_index_1!=-1) {
                    document.getElementById("cost_result_p12").innerHTML = "<b>FASTER <br>(hybrid logs)<br></b>";
                    if((cost-faster_h_best_array[faster_h_index_1].cost)>(faster_h_best_array[faster_h_index_2].cost-cost)) {
                        outputParameters(faster_h_best_array[faster_h_index_2], "cost_result_p13", l2);
                        outputNote(faster_h_best_array[faster_h_index_1], "cost_result_p13");
                    }else{
                        outputParameters(faster_h_best_array[faster_h_index_1], "cost_result_p13", l1);
                        outputNote(faster_h_best_array[faster_h_index_2], "cost_result_p13");
                    }
                }else{
                    document.getElementById("cost_result_p12").innerHTML = "<b>FASTER-H: Not Enough Memory<br><br></b>";
                    removeAllChildren(document.getElementById("cost_result_p13"));
                }
            }
        }
    }
    global_index=design_1_index+flag;
    if (flag == 0){
        global_rocks_index = rocks_index_1;
        global_WT_index = WT_index_1;
        global_faster_index = faster_index_1;
        global_faster_h_index = faster_h_index_1;
    } else {
        global_rocks_index = rocks_index_2;
        global_WT_index = WT_index_2;
        global_faster_index = faster_index_2;
        global_faster_h_index = faster_h_index_2;
    }

    var chart_array=cutArray(best_array,chart_start_index,chart_end_index);
    return chart_array;
}

/**
 * @param cost1 the cost optimized for price
 * @param cost2 the cost optimized for performance
 * @param array that contains 
 * @returns {number[]}
 */
function getIndex(cost1, cost2, array){
    var index1 = -1
    var index2 = -1;
    for (var i = 0; i < array.length; i++){
        if (array[i].cost >= cost1){
            index1 = i;
            for (var j = i; j < array.length; j++){
                if (array[j].cost >= cost2){
                    index2 = j;
                }
            }
            break;
        }
    }
    return [index1, index2];
}

/**
 * Adds elements in the diagrams of each design
 * @param Variables
 * @param id
 */
function drawDiagram(Variables, id){
    var result_div=document.getElementById(id)
    if(result_div==null)
        result_div=id;
    removeAllChildren(result_div);
    var L=Variables.L;
    var K=Variables.K;
    var Z=Variables.Z;
    var T=Variables.T;
    var Y=Variables.Y;

    var max_button_size=120;
    if (screen.width<=1200)
    {
        max_button_size=Math.max(screen.width-700,350);
    }
    var lsm_button_size_ratio=(max_button_size-70)/L;
    var cur_length=70;
    cur_length+=lsm_button_size_ratio;

    var height=18;
    if(L>5){
        height=96/L;
    }

    for (var i=0;i<L;i++){
        var div_new_row=document.createElement("div");
        div_new_row.setAttribute("class","row");

        var div_lsm_runs=document.createElement("div");
        div_lsm_runs.setAttribute("style","text-align: center;height:"+height+"px");
        div_new_row.appendChild(div_lsm_runs);

        var levelcss=i+1;
        if (L<5)
            levelcss=5-L+1+i;
        var n;
        if (i >= L-Y-1) {
            var maxRuns = Z;
            n=Z;
            if(L != 1 && i >= L-Y && Y != 0){
                // draw arrows
                var div_tmp_row=document.createElement("div");
                div_tmp_row.setAttribute("class","row");
                var margin_left = (max_button_size-cur_length+lsm_button_size_ratio)/2;
                div_tmp_row.setAttribute("style","text-align: center;font-weight:bold;margin-top:-"+(height-3)+"px;width:100%;z-index:2;position:absolute;left:15px");
                var div_tmp_lsm_runs=document.createElement("div");
                div_tmp_lsm_runs.setAttribute("style","text-align: center;height:25px;width:"+cur_length+"px;margin:auto auto");
                var tmp = Math.ceil((i-1)/3);
                var length_percent = 100/(2*tmp+2);
                for(j = 0; j <= tmp; j++){
                    var div_col = document.createElement("div");
                    div_col.setAttribute("class","");
                    div_col.setAttribute("style","width:"+length_percent+"%;font-size:"+(height+2)+"px;padding:unset;display:inline-block");
                    div_col.innerHTML="&#8601;"
                    div_tmp_lsm_runs.appendChild(div_col);
                }

                for(j = 0; j <= tmp; j++){
                    var div_col = document.createElement("div");
                    div_col.setAttribute("style","width:"+length_percent+"%;font-size:"+(height+2)+"px;padding:unset;display:inline-block");
                    div_col.setAttribute("class","");
                    div_col.innerHTML="&#8600;"
                    div_tmp_lsm_runs.appendChild(div_col);
                }
                div_tmp_row.appendChild(div_tmp_lsm_runs);
                result_div.appendChild(div_tmp_row);
            }
        } else {
            maxRuns = K;
            n=K;
            //n = Math.min(K, 7);
        }
        for (var j = 0; j < n; j++) {
            if (maxRuns > 8 && j == 7) {
                var span =document.createElement("span");
                span.setAttribute("style", "width:19.27px; font-size: 20px; color: #777;");
                span.id = i + "span";
                span.textContent=" ...";
                div_lsm_runs.appendChild(span);
            } else {
                if(j>8)
                    break;
                var button=document.createElement("button");
                button.setAttribute("class","lsm_button");

                var full_flag=true;

                if(maxRuns > 8){
                    button.setAttribute("style","width: "+cur_length/8+"px; height:"+height*2/3+"px; padding: 1px 0px 2px 0px");
                }else{
                    button.setAttribute("style","width: "+cur_length/n+"px; height: "+height*2/3+"px; background-color: white; padding: 1px 0px 2px 0px");
                }
                div_lsm_runs.appendChild(button);
            }
        }
        cur_length+=lsm_button_size_ratio;

        result_div.appendChild(div_new_row);
    }
}

function outputParameters(Variables, id, l) {
    if(l<0.2)
        l=0.2;
    var result_div = document.getElementById(id);
    var cost=parseInt(document.getElementById("cost").value.replace(/\D/g,''), 10);
    removeAllChildren(result_div);
    //outputParameter(result_div,Variables.memory_footprint/Variables.VM_instance_num,"M (GB)");
    outputParameter(result_div,Variables.Vcpu_num+" vCPUs","./images/cpu.png");
    var div_tmp = document.createElement("div");
    div_tmp.setAttribute("style"," background-size:100% 100%; text-align: center; width:"+230*l+"px; height: 17px; padding-bottom:3px");
    var text_tmp= document.createElement("div");
    text_tmp.setAttribute("style", "background-color:white; display:inline-block; position:relative; bottom: 2px; padding-left:2px; padding-right:2px");

    if (!isNaN(Variables.Buffer)){ // We don't care about Buffer here; it's just that if Buffer is NaN, that means the code didnt move forward => that means that the data fits in memory, and we don't wanna show this
        text_tmp.innerHTML=Variables.memory_footprint/Variables.VM_instance_num+" GB";
    }
    div_tmp.appendChild(text_tmp);
    result_div.appendChild(div_tmp);
    if(id=="cost_result_p11"){
        drawBar(result_div, [[(Variables.Buffer / 1024 / 1024 / 1024).toFixed(2)*0.9, "Mutable"], [(Variables.Buffer / 1024 / 1024 / 1024).toFixed(2)*0.1, "Read-only"],[(Variables.M_F / 1024 / 1024 / 1024).toFixed(2), "Hash index"]], l);
    }else if(id=="cost_result_p13"){
        drawBar(result_div, [[(Variables.Buffer / 1024 / 1024 / 1024).toFixed(2), "Buffer"], [(Variables.M_F / 1024 / 1024 / 1024).toFixed(2), "Hash index"]], l);
    }else if (!isNaN(Variables.Buffer) && Variables.data_structure!="LSH"){
        drawBar(result_div, [[(Variables.Buffer / 1024 / 1024 / 1024).toFixed(2), "Buffer"], [(Variables.M_BF / 1024 / 1024 / 1024).toFixed(2), "Bloom filter"], [(Variables.M_FP / 1024 / 1024 / 1024).toFixed(2), "Fence pointer"]], l);
    } else if (!isNaN(Variables.Buffer) && Variables.data_structure=="LSH"){
        drawBar(result_div, [[(Variables.Buffer / 1024 / 1024 / 1024).toFixed(2), "Buffer"], [(Variables.M_F / 1024 / 1024 / 1024).toFixed(2), "Hash index"]], l);
    }

    if(result_div.id=="cost_result_p3") {

        if(using_compression==false) {
            outputText(result_div,"Processor",8);
            outputText(result_div,"On-disk",150);
            outputText(result_div,"Cloud",226);
            outputText(result_div,"Cost",280);
            outputText(result_div,"Latency",330);
            outputText(result_div,"Throughput",382);
            outputText(result_div,"Detailed Storage Engine Design Description",424);
        }else{
            outputText(result_div,"Processor",8);
            outputText(result_div,"On-disk",150);
            outputText(result_div,"Cloud",226);
            outputText(result_div,"Cost",280);
            outputText(result_div,"Latency",330);
            outputText(result_div,"Throughput",382);
            //outputText(result_div,"Compression",427);
            outputText(result_div,"Detailed Storage Engine Design Description",424);
        }
    }

    var div_tmp = document.createElement("div");
    drawDiagram(Variables, div_tmp);
    div_tmp.setAttribute("style", "height:100px;");
    if(Variables.L==0 || Variables.latency == null || fixTime(Variables.latency) == "0.000 sec")
        //div_tmp.innerHTML="<span style='font-size: 12px'><i>The data fits in "+Variables.memory_footprint/Variables.VM_instance_num+" GB of memory (no I/Os).</i></span>";
        div_tmp.innerHTML="The total size of the base data is " + ((Variables.N*Variables.E)/(1024*1024*1024)).toFixed(2) + " GB and with the input budget you can buy at least " + Variables.memory_footprint + " GB of memory. Hence, the data fits in memory (no I/Os).";
    else {
        div_tmp.setAttribute("class", "tooltip1");
        var span_tmp = document.createElement("span");
        span_tmp.setAttribute("class", "tooltiptext");
        span_tmp.innerHTML = "<i>Growth Factor (T)=" + Variables.T + ", Hot Merge Threshold (K)=" + Variables.K + "<br>Cold Merge Threshold (Z)=" + Variables.Z+", Compression ="+Variables.compression_name+"</i> ";
        div_tmp.appendChild(span_tmp);

    }
    result_div.appendChild(div_tmp);
    if(using_compression){
        //outputParameter(result_div, Variables.compression_name, "./images/compression.png")
    }
    outputParameter(result_div,cloud_array[Variables.cloud_provider],"./images/cloud.png");
    outputParameter(result_div,"$"+parseFloat(Variables.cost).toFixed(1),"./images/dollar.png");
    if(Variables.L==0 || Variables.latency == null || fixTime(Variables.latency) == "0.000 sec"){
        outputParameter(result_div,"No Latency","./images/performance.png", true);
        outputParameter(result_div,"","./images/throughput.png", true);
    }else {
        outputParameter(result_div, fixTime(Variables.latency), "./images/performance.png", true);
        outputParameter(result_div, parseInt(Variables.query_count / (Variables.latency * 24 * 60 * 60)) + " queries/s", "./images/throughput.png", true);
    }
    generateDownload(Variables, result_div, id);
}

function outputText(result_div,text,top){
    if(text=="Detailed Storage Engine Design Description"){
        var div_text = document.createElement("div");
        div_text.setAttribute("style", "position:absolute; font-size:16px; left: -90px; top:" + top + "px; text-align:right; ");
        div_text.innerHTML = "Description";
        div_text.setAttribute("class", "tooltip2");
        var span_tmp = document.createElement("span");
        span_tmp.setAttribute("class", "tooltiptext_mode");
        span_tmp.setAttribute("style", "position:absolute; width:140px; height:50px; padding:5px; left: -20px")
        span_tmp.innerHTML = "Detailed Storage Engine Design Description ";
        div_text.appendChild(span_tmp);
        result_div.appendChild(div_text);
    }else {
        var div_text = document.createElement("div");
        div_text.setAttribute("style", "position:absolute; font-size:16px; left: -90px; top:" + top + "px; text-align:right");
        div_text.innerHTML = text;
        result_div.appendChild(div_text);
    }
}

function outputNote(Variables, id){
    var result_div = document.getElementById(id);
    var cost=parseInt(document.getElementById("cost").value.replace(/\D/g,''), 10);
    var text = document.createElement("div");
    if(1)
        text.setAttribute("style", "width:90%; position:absolute; top:462px; font-size:12px");
    else
        text.setAttribute("style", "width:90%; position:absolute; top:511px; font-size:12px");
    text.innerHTML="<i>The next configuration &#160&#160&#160&#160&#160&#160&#160&#160&#160&#160&#160&#160  closer to the requirement takes $"+Variables.cost+".</i>"
    result_div.appendChild(text);
    var div_tmp = document.createElement("div");
    var popup_id=id+"_popup"
    div_tmp.setAttribute("class","download_icon");
    div_tmp.setAttribute("id",popup_id);
    if(1)
        div_tmp.setAttribute("style","position:absolute; top:457px; left:122px")
    else
        div_tmp.setAttribute("style","position:absolute; top:506px; left:122px")
    div_tmp.innerHTML="<img class=\"img-responsive img-centered\" style=\"width:25px;\" src=\"./images/popup.png\"/>"
    result_div.appendChild(div_tmp);
    $("#"+popup_id).click(function(){
        createPopup(Variables);
        console.log("____");
    });
}

function createPopup(Variables){
    var popup = open("", "Popup", "width=300,height=600");
    popup.document.head.innerHTML=" <meta charset=\"utf-8\">\n" +

        "    <title>X</title>\n" +
        "\n" +
        "    <!-- Bootstrap Core CSS - Uses Bootswatch Flatly Theme: http://bootswatch.com/flatly/ -->\n" +
        "    <link href=\"https://volatill.github.io/demosubmitter_cloud/css/bootstrap.min.css\" rel=\"stylesheet\">\n" +
        "\n" +
        "    <!-- Custom CSS -->\n" +
        "        <link href=\"https://volatill.github.io/demosubmitter_cloud/css/lsm_button.css\" rel=\"stylesheet\">\n" +
        "    <link href=\"https://volatill.github.io/demosubmitter_cloud/css/tooltip.css\" rel=\"stylesheet\">\n" +

        "\n" +
        "    <!-- Font Awesome -->\n" +
        "    <script src=\"https://use.fontawesome.com/3227f266ec.js\"></script>\n" +
        "\n" +
        "    <!-- Custom Fonts -->\n" +
        "    <link href=\"https://fonts.googleapis.com/css?family=Montserrat:400,700\" rel=\"stylesheet\" type=\"text/css\">\n" +
        "    <link href=\"https://fonts.googleapis.com/css?family=Lato:400,700,400italic,700italic\" rel=\"stylesheet\" type=\"text/css\">\n" +
        "    <link href='https://fonts.googleapis.com/css?family=Permanent+Marker|Reenie+Beanie|Rock+Salt|Indie+Flower' rel='stylesheet' type='text/css'>\n" +
        "    <link href=\"https://fonts.googleapis.com/css?family=Raleway|Source+Sans+Pro\" rel=\"stylesheet\">\n" +
        "      <!--[if lt IE 9]>\n" +
        "        <script src=\"https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js\"></script>\n" +
        "        <script src=\"https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js\"></script>\n" +
        "    <![endif]-->"
    var result_div = popup.document.createElement("div");
    result_div.setAttribute("id","popup");
    result_div.setAttribute("class","col-lg-1 col-md-1 col-sm-1")
    result_div.setAttribute("style","width: 260px;  border-radius: 8px; font-size: 10px; padding-top:20px;");
    var l=1;

    removeAllChildren(result_div);
    //outputParameter(result_div,Variables.memory_footprint/Variables.VM_instance_num,"M (GB)");
    outputParameter(result_div,Variables.Vcpu_num+" vCPUs","https://volatill.github.io/demosubmitter_cloud//images/cpu.png");
    var div_tmp = document.createElement("div");
    div_tmp.setAttribute("style"," background-size:100% 100%; text-align: center; width:"+230*l+"px; height: 17px; padding-bottom:3px");
    var text_tmp= document.createElement("div");
    text_tmp.setAttribute("style", "background-color:white; display:inline-block; position:relative; bottom: 2px; padding-left:2px; padding-right:2px");
    text_tmp.innerHTML=Variables.memory_footprint/Variables.VM_instance_num+" GB";
    div_tmp.appendChild(text_tmp);
    result_div.appendChild(div_tmp);
    drawBar(result_div,[[(Variables.Buffer/1024/1024/1024).toFixed(2),"Buffer"],[(Variables.M_BF/1024/1024/1024).toFixed(2),"Bloom filter"],[(Variables.M_FP/1024/1024/1024).toFixed(2),"Fence pointer"]],l);

    if(result_div.id=="cost_result_p3") {

        if(using_compression==false) {
            outputText(result_div,"Processor",8);
            outputText(result_div,"On-disk",150);
            outputText(result_div,"Cloud",226);
            outputText(result_div,"Cost",280);
            outputText(result_div,"Latency",330);
            outputText(result_div,"Throughput",382);
            outputText(result_div,"Explanation",427);
        }else{
            outputText(result_div,"Processor",8);
            outputText(result_div,"On-disk",150);
            outputText(result_div,"Cloud",226);
            outputText(result_div,"Compression",280);
            outputText(result_div,"Cost",330);
            outputText(result_div,"Latency",382);
            outputText(result_div,"Throughput",427);
            outputText(result_div,"Explanation",476);
        }
    }

    var div_tmp = document.createElement("div");
    drawDiagram(Variables, div_tmp);
    div_tmp.setAttribute("style", "height:100px;");
    if(Variables.L==0 || Variables.latency == null || fixTime(Variables.latency) == "0.000 sec")
        //div_tmp.innerHTML="<span style='font-size: 12px'><i>The data fits in "+Variables.memory_footprint/Variables.VM_instance_num+" GB of memory (no I/Os).</i></span>";
        div_tmp.innerHTML="The total size of the base data is " + ((Variables.N*Variables.E)/(1024*1024*1024)).toFixed(2) + " GB and with the input budget you can buy at least " + Variables.memory_footprint + " GB of memory. Hence, the data fits in memory (no I/Os).";
    else {
        div_tmp.setAttribute("class", "tooltip1");
        var span_tmp = document.createElement("span");
        span_tmp.setAttribute("class", "tooltiptext");
        span_tmp.innerHTML = "T=" + Variables.T + "<br>K=" + Variables.K + "<br>Z=" + Variables.Z;
        div_tmp.appendChild(span_tmp);

    }
    result_div.appendChild(div_tmp);
    outputParameter(result_div,cloud_array[Variables.cloud_provider],"https://volatill.github.io/demosubmitter_cloud/images/cloud.png");
    outputParameter(result_div,"$"+parseFloat(Variables.cost).toFixed(1),"https://volatill.github.io/demosubmitter_cloud//images/dollar.png");
    if(Variables.L==0 || Variables.latency == null || fixTime(Variables.latency) == "0.000 sec"){
        outputParameter(result_div,"No Latency","https://volatill.github.io/demosubmitter_cloud//images/performance.png");
        outputParameter(result_div,"","https://volatill.github.io/demosubmitter_cloud//images/throughput.png");
    }else {
        outputParameter(result_div, fixTime(Variables.latency), "https://volatill.github.io/demosubmitter_cloud//images/performance.png");
        outputParameter(result_div, parseInt(Variables.query_count / (Variables.latency * 24 * 60 * 60)) + " queries/s", "https://volatill.github.io/demosubmitter_cloud//images/throughput.png");
    }
    if(using_compression){
        outputParameter(result_div, Variables.compression_name, "https://volatill.github.io/demosubmitter_cloud//images/compression.png")
    }
    removeAllChildren(popup.document.body);
    popup.document.body.appendChild(result_div);
}

function createExplanationPopup(Variables){
    var popup = open("", "Popup", "width=600,height=800");
    popup.document.head.innerHTML=" <meta charset=\"utf-8\">\n" +

        "    <title>X</title>\n" +
        "    <script src=\"https://volatill.github.io/demosubmitter_cloud/js/jquery.js\"></script>\n" +
        "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.3/jquery.easing.min.js\"></script>\n"+
        "\n" +
        "    <!-- Bootstrap Core CSS - Uses Bootswatch Flatly Theme: http://bootswatch.com/flatly/ -->\n" +
        "    <link href=\"https://volatill.github.io/demosubmitter_cloud/css/bootstrap.min.css\" rel=\"stylesheet\">\n" +
        "\n" +
        "    <!-- Custom CSS -->\n" +
        "        <link href=\"https://volatill.github.io/demosubmitter_cloud/css/lsm_button.css\" rel=\"stylesheet\">\n" +
        "    <link href=\"https://volatill.github.io/demosubmitter_cloud/css/tooltip.css\" rel=\"stylesheet\">\n" +

        "\n" +
        "    <!-- Font Awesome -->\n" +
        "\n" +
        "    <!-- Custom Fonts -->\n" +
        "    <link href=\"https://fonts.googleapis.com/css?family=Montserrat:400,700\" rel=\"stylesheet\" type=\"text/css\">\n" +
        "    <link href=\"https://fonts.googleapis.com/css?family=Lato:400,700,400italic,700italic\" rel=\"stylesheet\" type=\"text/css\">\n" +
        "    <link href='https://fonts.googleapis.com/css?family=Permanent+Marker|Reenie+Beanie|Rock+Salt|Indie+Flower' rel='stylesheet' type='text/css'>\n" +
        "    <link href=\"https://fonts.googleapis.com/css?family=Raleway|Source+Sans+Pro\" rel=\"stylesheet\">\n" +
        "      <!--[if lt IE 9]>\n" +
        "        <script src=\"https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js\"></script>\n" +
        "        <script src=\"https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js\"></script>\n" +
        "    <![endif]-->"
    var result_div = popup.document.createElement("div");
    result_div.setAttribute("id","popup");
    result_div.setAttribute("class","col-lg-1 col-md-1 col-sm-1")
    result_div.setAttribute("style","width: 600px;   font-size: 16px; padding-top:10px;");

    var insert_percentage = Variables.insert_percentage;
    var blind_update_percentage = Variables.blind_update_percentage;
    var rmw_percentage = Variables.rmw_percentage;
    var v=Variables.v;
    var r=Variables.r;
    //transform the format of N
    var N=Variables.N;
    if(N>=10000){
        var power=0;
        while(N>=10){
            N/=10;
            power++;
        }
        N=N.toFixed(2)+"E+"+power;
    }

    var query=Variables.query_count;
    if(query>=10000){
        var power=0;
        while(query>=10){
            query/=10;
            power++;
        }
        query=query.toFixed(2)+"E+"+power;
    }

    var FPR=Variables.FPR;
    var sum=insert_percentage+blind_update_percentage+rmw_percentage+v+r;
    var a_or_an;
    var E=parseInt(document.getElementById("E").value.replace(/\D/g,''));
    var F=parseInt(document.getElementById("F").value.replace(/\D/g,''));
    if(Variables.cloud_provider==1)
        a_or_an="a";
    else
        a_or_an="an";

    var bits_per_entry_text=" ";
    var fpr_text=" ";
    for(var i=1;i<=Variables.L;i++){
        if(i!=Variables.L){
            if(Variables.L!=2) {
                fpr_text += (FPR[i] * 100).toFixed(2) + "%, ";
                bits_per_entry_text += ((-1) * Math.log(FPR[i]) / (Math.pow(Math.log(2), 2))).toFixed(2) + ", ";
            }else{
                fpr_text += (FPR[i] * 100).toFixed(2) + "% ";
                bits_per_entry_text += ((-1) * Math.log(FPR[i]) / (Math.pow(Math.log(2), 2))).toFixed(2) + " ";
            }
        }else{
            fpr_text+="and "+(FPR[i]*100).toFixed(2)+"%, respectively. ";
            bits_per_entry_text+="and "+((-1)*Math.log(FPR[i])/(Math.pow(Math.log(2),2))).toFixed(2)+" bits/entry, respectively, offering FPR of ";
        }
    }
    var text_div = document.createElement("div");
    text_div.innerHTML+="This key-value storage configuration is tailored to a workload comprising of ";
    if (v!=0) {
        text_div.innerHTML+=v*100/sum+"% single-result lookups, ";
    }
    if (r!=0) {
        text_div.innerHTML+=r*100/sum+"% no-result lookups, ";
    }
    if (insert_percentage!=0) {
        text_div.innerHTML+=insert_percentage*100/sum+"% inserts, ";
    }
    if (rmw_percentage!=0) {
        text_div.innerHTML+=rmw_percentage*100/sum+"% read-modify updates, ";
    }
    if (blind_update_percentage!=0) {
        text_div.innerHTML+=blind_update_percentage*100/sum+"% blind updates ";
    }
    text_div.innerHTML = putTheWordAndBeforeTheLastPercentage(text_div.innerHTML);
    if (text_div.innerHTML.charAt(text_div.innerHTML.length-2).localeCompare(",")==0) {
        text_div.innerHTML = text_div.innerHTML.slice(0, text_div.innerHTML.length-2) + " ";
    }
    text_div.innerHTML+="on a base data of "+N+" entries each of size "+E+" bytes (key size is "+F+" bytes and value size is "+(E-F)+" bytes). To execute a workload at scale of "+query+" queries, this configuration takes "+fixTime(Variables.latency)+" with an average throughput of "+parseInt(Variables.query_count / (Variables.latency * 24 * 60 * 60))+" queries/sec. The expected cost for this configuration is $"+Variables.cost+" per month which is "
    if(document.getElementById('performance_conscious_checkbox').checked){
        text_div.innerHTML+="slightly more than"
    }else{
        text_div.innerHTML+="within"
    }
    text_div.innerHTML+=" your budget of $"+parseInt(document.getElementById("cost").value.replace(/\\D/g,''), 10)+" per month as a cost-conscious user!<br><br>";
    text_div.innerHTML+="This is "+a_or_an+" "+cloud_array[Variables.cloud_provider]+" configuration that will be deployed on "+Variables.VM_instance_num+" instance"+((Variables.VM_instance_num>1)?"s":"")+" of VMs of type "+Variables.VM_instance+". Within each VM, you can use "+Variables.Vcpu_num+" CPU cores and "+Variables.memory_footprint/Variables.VM_instance_num+" GB of memory for your workload. For expected memory usage, "+(Variables.M_BF / 1024 / 1024 / 1024).toFixed(2)+" GB of memory will be reserved for storing bloom filters. For each level in sequence, we reserve"+bits_per_entry_text+fpr_text+(Variables.M_FP / 1024 / 1024 / 1024).toFixed(2)+" GB of memory will be reserved for storing fence pointers and "+(Variables.Buffer / 1024 / 1024 / 1024).toFixed(2)+" GB will be the size of the in-memory buffer. Within disk, the data structure will be organised into "+Variables.L+" level"+((Variables.L>1)?"s":"")+" for which capacity grows by a factor of "+Variables.T+" across adjacent levels. Within each level, there will be a maximum of "+Variables.K+" run"+((Variables.K>1)?"s":"")+" for the first "+(((Variables.L-Variables.Y-1)==1)?"":(Variables.L-Variables.Y-1))+" level"+(((Variables.L-Variables.Y-1)>1)?"s":"")+" and "+Variables.Z+" run"+((Variables.Z>1)?"s":"")+" for the next "+(Variables.Y+1)+" level"+(((Variables.Y+1)>1)?"s":"")+". Disk-resident data will be compressed using "+Variables.compression_name+" compression scheme. ";
    text_div.innerHTML+="The chosen design incurs a per-I/O cost of ";
    if (v!=0 || r!=0) {
        text_div.innerHTML+=Variables.read_cost.toFixed(3)+" for lookups, ";
    }
    if (insert_percentage!=0) {
        text_div.innerHTML+=Variables.update_cost.toFixed(3)+" for inserts, ";
    }
    if (rmw_percentage!=0) {
        text_div.innerHTML+=Variables.rmw_cost.toFixed(3)+" for read-modify-writes, ";
    }
    if (blind_update_percentage!=0) {
        text_div.innerHTML+=Variables.blind_update_cost.toFixed(3)+" for blind updates, ";
    }
    text_div.innerHTML+="resulting in a total of "+Variables.total_cost.toFixed(3)+" for the entire workload.";
    result_div.append(text_div);

    var text_div_download=document.createElement("div");
    text_div_download.innerHTML="<br>Download:<br>";
    result_div.append(text_div_download);

    var div_tmp = document.createElement("div");
    div_tmp.setAttribute("class","download_icon");
    div_tmp.setAttribute("onclick","createAndDownloadFile()");
    var download_id="download";
    div_tmp.setAttribute("id",download_id);
    div_tmp.innerHTML="<img class=\"img-responsive img-centered\" style=\"width:25px;\" src=\"https://volatill.github.io/demosubmitter_cloud/images/download.png\"/>"
    result_div.appendChild(div_tmp);
    var src=document.createElement("script");
    src.setAttribute("type","text/javascript");
    src.innerHTML="function createAndDownloadFile() {\n" +
        "    var aTag = document.createElement('a');\n" +
        "    var blob = new Blob(['"+text_div.innerText+"']);\n" +
        "    aTag.download = 'explanation';\n" +
        "    aTag.href = URL.createObjectURL(blob);\n" +
        "    aTag.click();\n" +
        "    URL.revokeObjectURL(blob);\n" +
        "}"

    result_div.append(src);
    removeAllChildren(popup.document.body);
    popup.document.body.append(result_div);
}

function putTheWordAndBeforeTheLastPercentage(string_to_edit) {
    var last_percentage_index = string_to_edit.lastIndexOf("%");
    var number_of_digits_in_percentage;
    if (!isNaN(string_to_edit[last_percentage_index-1])) {
        number_of_digits_in_percentage = 2;
    } else {
        number_of_digits_in_percentage = -1;
    }
    string_to_edit=string_to_edit.slice(0, last_percentage_index-number_of_digits_in_percentage) + " and " + string_to_edit.slice(last_percentage_index-number_of_digits_in_percentage);
    return string_to_edit;
}

function outputParameter(result_div,value,text,highlight=false){
    var div_tmp = document.createElement("div");
    div_tmp.setAttribute("class", "input-group");
    var span_tmp = document.createElement("span");
    span_tmp.setAttribute("class","input-group-addon");
    //span_tmp.innerHTML=text;
    var icon_tmp=document.createElement("div");
    var img_tmp=document.createElement("img");
    img_tmp.setAttribute("src",text);
    img_tmp.setAttribute("class","img-responsive img-centered");
    img_tmp.setAttribute("style", "width:30px")
    icon_tmp.appendChild(img_tmp);
    if(highlight)
        icon_tmp.setAttribute("style","width:44px; height:44px; position:absolute; bottom: -3px; left:-3px; background-color:white; border-radius:30px; border: 2px solid #229966; padding:7px; z-index:10")
    else
        icon_tmp.setAttribute("style","width:44px; height:44px; position:absolute; bottom: -3px; left:-3px; background-color:white; border-radius:30px; border: 2px solid black; padding:7px; z-index:10")
    div_tmp.appendChild(icon_tmp);
    div_tmp.appendChild(span_tmp);
    var input_tmp = document.createElement("input");
    input_tmp.setAttribute("class","form-control")
    input_tmp.setAttribute("readonly","true");
    if(highlight)
        input_tmp.setAttribute("style","text-align:right; box-shadow: 0 0 5px #229966;");
    else
        input_tmp.setAttribute("style","text-align:right");
    if(text=="VM type")
        input_tmp.setAttribute("style","text-align:right; font-size:10px");
    input_tmp.value=value;
    div_tmp.appendChild(input_tmp);
    div_tmp.setAttribute("style","margin-bottom:15px")
    result_div.appendChild(div_tmp);
}

function drawBar(result_div,value,l,mode,w=230,h=15) {
    var div_tmp = document.createElement("div");
    var width = w*l;
    var length=value.length;
    if(length==3) {
        var colors = [
            "#837BFF",
            "#83AAFF",
            "#83DEFF"
        ]
    }

    if(length==2) {
        var colors = [
            "#837BFF",
            "#83DEFF"
        ]
    }
    var data=new Array();
    var memory_sum=0;
    for(var i=0;i<length;i++)
        memory_sum+=parseFloat(value[i][0]);

    if(result_div.id=="cost_result_p3") {
        outputText(result_div,"In-memory",75);

    }

    for(var i=0;i<length;i++){
        var bar=document.createElement("div");
        bar.setAttribute("class","color_bar tooltip3");
        bar.setAttribute("style","width:"+width*parseFloat(value[i][0])/memory_sum+"px;background-color:"+colors[i]+"; height:"+h+"px");
        var hover_text=document.createElement("div");
        hover_text.setAttribute("class","tooltiptext_mode");
        hover_text.innerText=value[i][0]+"GB";
        bar.append(hover_text)
        div_tmp.append(bar);
    }
    result_div.appendChild(div_tmp);
    if(mode!="no_legend") {
        div_tmp = document.createElement("div");
        for (var i = 0; i < length; i++) {
            var legend = document.createElement("div");
            legend.setAttribute("class", "color_bar");
            legend.setAttribute("style", "width: 10px;height: 10px;background-color:" + colors[i]);
            div_tmp.append(legend);
            var text = document.createElement("div");
            text.setAttribute("style", "display: inline-block;font-size:10px ; padding:4px 7px 8px 3px");
            text.innerHTML = value[i][1];
            div_tmp.append(text);
        }
        result_div.appendChild(div_tmp);
    }
}

function createAndDownloadFile(fileName, content) {
    var aTag = document.createElement('a');
    var blob = new Blob([content]);
    aTag.download = fileName;
    aTag.href = URL.createObjectURL(blob);
    aTag.click();
    URL.revokeObjectURL(blob);
}

function generateDownload(Variables, result_div, id) {
    var latency;
    if(Variables.latency == null) {
        latency = "0.000 sec";
    } else {
        latency = fixTime(Variables.latency);
    }
    var div_tmp = document.createElement("div");
    var download_id=id+"_download"
    div_tmp.setAttribute("class","download_icon");
    div_tmp.setAttribute("id",download_id);
    div_tmp.innerHTML="<img class=\"img-responsive img-centered\" style=\"width:25px;\" src=\"./images/explain.png\"/>"
    result_div.appendChild(div_tmp);
    var download_content=("Cloud provider: "+ cloud_array[Variables.cloud_provider] +"\nCost="+Variables.cost+", Latency=" + latency +  "\nT=" + Variables.T + ", K=" + Variables.K + ", Z=" + Variables.Z + ", L=" + Variables.L +"\nMemory="+ Variables.memory_footprint/Variables.VM_instance_num+ " GB\nBuffer=" + (Variables.Buffer / 1024 / 1024 / 1024).toFixed(2) + " GB\nBloom filter=" + (Variables.M_BF / 1024 / 1024 / 1024).toFixed(2) + " GB\nFence Pointer=" + (Variables.M_FP / 1024 / 1024 / 1024).toFixed(2) + " GB\nVM instance: " + Variables.VM_info);
    if(using_compression){
        download_content+="\nCompression: "+Variables.compression_name;
    }
    $("#"+download_id).click(function(){
        //createAndDownloadFile(("design_"+Variables.cost+".txt"),download_content);
        createExplanationPopup(Variables);
    });
}

function fixTime(time){
    if(time<1) {
        time *= 24;
        if(time<1){
            time*=60;
            if(time<1){
                time*=60
                return  time.toFixed(3)+" sec"
            }
            return time.toFixed(3)+" min"
        }
        return time.toFixed(3)+" hour"
    }
    return time.toFixed(3)+" day"
}

function getBestExistingDesignArray(Variables_array){
    var i = 0;
    while (Variables_array[i]==-1){
        i++;
    }
    var temp = i;
    var last_x = Variables_array[temp].cost;
    var best_y = -1;
    var best_design_index;
    var best_y_ever = -1;
    var bestDesignArray = new Array();
    for (i = temp; i < Variables_array.length; i++) {
        if (Variables_array[i].cost == last_x) {
            if (best_y == -1 || Variables_array[i].latency < best_y) {
                best_y = Variables_array[i].latency;
                best_design_index = i;
            }
        } else {
            best_y = Variables_array[i].latency;
            last_x = Variables_array[i].cost;
            if(Variables_array[best_design_index].latency<best_y_ever||best_y_ever==-1) {
                bestDesignArray.push(Variables_array[best_design_index]);
                best_y_ever=Variables_array[best_design_index].latency;
            }
            best_design_index = i;
        }
    }
    if(Variables_array[best_design_index].latency<best_y_ever||best_y_ever==-1) {
        bestDesignArray.push(Variables_array[best_design_index]);
        best_y_ever=Variables_array[best_design_index].latency;
    }
    return bestDesignArray;
}

function getBestDesignEverArray(result_array) {
    var last_x = result_array[0][0];
    var best_y = -1;
    var best_design_index;
    var best_y_ever = -1;
    var bestDesignArray = new Array();
    for (var i = 0; i < result_array.length; i++) {
        if (result_array[i][0] == last_x) {
            if (best_y == -1 || result_array[i][1] < best_y) {
                best_y = result_array[i][1];
                best_design_index = i;
            }
        } else {
            best_y = result_array[i][1];
            last_x = result_array[i][0];
            if(result_array[best_design_index][1]<best_y_ever||best_y_ever==-1) {
                bestDesignArray.push(result_array[best_design_index]);
                best_y_ever=result_array[best_design_index][1];
            }
            best_design_index = i;
        }
    }
    if(result_array[best_design_index][1]<best_y_ever||best_y_ever==-1) {
        bestDesignArray.push(result_array[best_design_index]);
        best_y_ever=result_array[best_design_index][1];
    }
    return bestDesignArray;
}
