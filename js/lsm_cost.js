
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
var p_get = 0.7;

var MIN_RAM_SIZE;
var RAM_BLOCK_COST;
var IOPS;
var network_bandwidth;

var machines = 2;
var workload_type = 0;

var time_unit;
var M_BC;

var global_continuums_array;
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
    parsedBoxes.qS = parseFloat(document.getElementById("qS").value);

    parsedBoxes.query_count = parseInt(document.getElementById("query_count").value.replace(/\D/g,''), 10);


    return parsedBoxes;
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

    console.log(compression_libraries);
}

function initializeSLAFactors()
{

    SLA_factors=new Array();
    for(var i=0;i<3;i++)
        SLA_factors.push(new SLA_factor());

    // 0 for AWS, 1 for GCP, 2 for Azure
    /******************** DB Migration Cost ********************/

    SLA_factors[0].DB_migration_cost = 0.115; // $/GB
    SLA_factors[1].DB_migration_cost = 0.17; // $/GB
    SLA_factors[2].DB_migration_cost = 0.17; // $/GB

    SLA_factors[0].dev_ops = 0.02; // $/instance
    SLA_factors[2].dev_ops = 6; // $6/month in the basic plan (https://azure.microsoft.com/en-us/pricing/details/devops/azure-devops-services/)

    // dev_ops_GCP will be fixed based on the VM type
    SLA_factors[1]=new Array();

    SLA_factors[1][0]=0.1184;
    SLA_factors[1][1]=0.2368;
    SLA_factors[1][2]=0.4736;
    SLA_factors[1][3]=0.9472;
    SLA_factors[1][4]=1.8944;
    SLA_factors[1][5]=3.7888;
    SLA_factors[1][6]=5.6832;


    SLA_factors[0].backup = 0.05; // $0.05 per GB-Month
    SLA_factors[1].backup = 0.17; // $0.170 per GB/month for SSD storage capacity
    SLA_factors[2].backup = 0.0448; // $0.0448 per GB

    /******************** Other Factors ********************/
}

function navigateDesignSpace() {
    var Variables = parseInputVariables();
    Variables.cost=50000;
    var N = Variables.N/10;
    var E = Variables.E;
    var F = Variables.F;
    var B = Math.floor(Variables.B/E);
    var s = Variables.s;

    var insert = Variables.insert_percentage;
    var blind_update = Variables.blind_update_percentage;
    var read_modify_update = Variables.rmw_percentage;
    var r = Variables.r;
    var v = Variables.v;
    var qL = Variables.qL;
    var qS = Variables.qS;
    var scenario = 'A';//Variables.scenario;

    var X;
    var Y;
    var L;
    var M_F_HI;
    var M_F; // = ((B*E + (M - M_F)) > 0 ? B*E + (M - M_F) : (B*E)); // byte
    var M_F_LO; // = (M_B*(F)*T)/((B)*(E));
    var M_BF;
    var M_FP;
    var FPR_sum;

    M_BC=0;
    B=setPricesBasedOnScheme(Variables);
    if(!setMaxRAMNeeded(Variables))
        return;

    var best_cost=-1;

    var results=new Array();

    for (var T = 2; T <= 12; T++) {
        results[T]=new Array();
        for (var K = 1; K <= T - 1; K++) {
            results[T][K]=new Array();
            for (var Z = 1; Z <= T - 1; Z++) {
                for (var M_B_percent = 0.4; M_B_percent < 1; M_B_percent += 1) {
                    M_BC=0;
                    var M_B = M_B_percent * max_RAM_purchased*1024*1024*1024;
                    var M=max_RAM_purchased*1024*1024*1024;
                    X = (Math.pow(1 / Math.log(2), 2) * (Math.log(T) / 1 / (T - 1) + Math.log(K / Z)  / T) * 8);
                    M_F_HI = N * ((X / 8) / T + F / B);
                    if ((N / B) < (M_B * T / (B * E))) {
                        M_F_LO = (N / B) * F;
                    } else {
                        M_F_LO = (M_B * F * T) / (B * E);
                    }
                    M_F = M - M_B;
                    if (M_F < M_F_LO)
                        M_F = M_F_LO;
                    var universe_max = workload_type == 0 ? U : U_1 + U_2;
                    if (workload_type == 1) {
                        universe_max = U_1 + (1 - p_put) * (N);
                    }
                    var size = universe_max < N ? universe_max : N;
                    var multiplier_from_buffer = size*(E) / (M_B);
                    // handle case where data fits in buffer
                    if (multiplier_from_buffer < 1) multiplier_from_buffer = 1;
                    L = Math.ceil(Math.log(multiplier_from_buffer)/Math.log(T));

                    if (M_F >= M_F_HI) {
                        Y = 0;
                        M_FP = N * F / B;
                    } else if (M_F > M_F_LO && M_F < M_F_HI) {
                        Y = L - 1;
                        M_FP = M_F_LO;
                        for (var i = L - 2; i >= 1; i--) {
                            var h = L - i;
                            var temp_M_FP = M_F_LO;
                            for (var j = 2; j <= h; j++) {
                                temp_M_FP = temp_M_FP + (temp_M_FP * T);
                            }
                            if (temp_M_FP <= M_F) {
                                Y = i;
                                M_FP = temp_M_FP;
                            }
                        }
                    } else {
                        Y = L - 1;
                        M_FP = M_F_LO;
                    }
                    M_BF = 0;
                    var margin = 2;
                    if (M_F - M_FP > 0)
                        M_BF = M_F - M_FP - margin;
                    else
                        M_BF = 0.0;


                    var update_cost;
                    var read_cost;
                    var no_result_read_cost;
                    var short_scan_cost;
                    var long_scan_cost;

                    if (write_percentage != 0) {
                        if(scenario=='A'){
                            update_cost=aggregateAvgCaseUpdate(B, E, workload_type, T, K, Z, L, Y, M_B, 0);
                        }else {
                            update_cost = analyzeUpdateCost(B, T, K, Z, L, Y, M, M_F, M_B, M_F_HI, M_F_LO);
                        }
                    }
                    if (read_percentage != 0) {
                        if (scenario == 'A') // Avg-case
                        {
                            read_cost=analyzeReadCostAvgCase(FPR_sum, T, K, Z, L, Y, M, M_B, M_F, M_BF, N, E);
                        } else // Worst-case
                        {
                            read_cost = analyzeReadCost(B, E, N, T, K, Z, L, Y, M, M_B, M_F, M_BF, FPR_sum);
                            //logReadCost(d_list, T, K, 0, L, Y, M, M_B, M_F, M_F_HI, M_F_LO, M_FP, M_BF, FPR_sum, update_cost, read_cost, "");
                        }

                    }
                    if (short_scan_percentage != 0) {
                        short_scan_cost = analyzeShortScanCost(B, T, K, Z, L, Y, M, M_B, M_F, M_BF);
                    }
                    long_scan_cost = analyzeLongScanCost(B, s);
                    if (scenario == 'A') // Avg-case
                    {
                        //logTotalCost(T, K, Z, L, Y, M/(1024*1024*1024), M_B/(1024*1024*1024), M_F/(1024*1024*1024), M_F_HI/(1024*1024*1024), M_F_LO/(1024*1024*1024), M_FP/(1024*1024*1024), M_BF/(1024*1024*1024), FPR_sum, update_cost, read_cost, short_scan_cost, long_scan_cost);
                    } else // Worst-case
                    {
                        //logTotalCost(T, K, Z, L, Y, M/(1024*1024*1024), M_B/(1024*1024*1024), M_F/(1024*1024*1024), M_F_HI/(1024*1024*1024), M_F_LO/(1024*1024*1024), M_FP/(1024*1024*1024), M_BF/(1024*1024*1024), FPR_sum, update_cost, read_cost, short_scan_cost, long_scan_cost);
                        //logTotalCostSortByUpdateCost(d_list, T, K, 0, L, Y, M, M_B, M_F, M_F_HI, M_F_LO, update_cost, read_cost, "");
                        //console.log(Math.pow(K, 1/T));
                    }
                    var total_cost=(w*update_cost+v*read_cost)/(v+w);
                    //console.log(total_cost);
                    if(best_cost<0||best_cost>total_cost){
                        //Math.exp(((-M_BF*8)/N)*Math.pow(Math.log(2),2)*Math.pow(T, Y)) * Math.pow(Z, (T-1)/T) * Math.pow(K, 1/T) * Math.pow(T, (T/(T-1)))/(T-1);
                        //console.log( Math.pow(Z, (T-1)/T)+"-"+Math.pow(K, 1/T)+"-"+Math.pow(T, (T/(T-1)))/(T-1));
                        //logTotalCost(T, K, Z, L, Y, M/(1024*1024*1024), M_B/(1024*1024*1024), M_F/(1024*1024*1024), M_F_HI/(1024*1024*1024), M_F_LO/(1024*1024*1024), M_FP/(1024*1024*1024), M_BF/(1024*1024*1024), FPR_sum, update_cost, read_cost, short_scan_cost, long_scan_cost);
                        best_cost=total_cost;
                        Variables.K=K;
                        Variables.T=T;
                        Variables.L=L;
                        Variables.Z=Z;
                        Variables.Buffer=M_B;
                        Variables.M_BF=M_BF;
                        Variables.M_FP=M_FP;
                        Variables.read_cost=read_cost;
                        Variables.update_cost=update_cost;
                        Variables.short_scan_cost=short_scan_cost;
                        Variables.long_scan_cost=long_scan_cost;
                        Variables.no_result_read_cost=read_cost-1;
                        Variables.total_cost=total_cost;
                    }
                    results[T][K][Z]=read_cost;
                }
            }
        }
    }

    var cost_array = [
        Variables.update_cost,
        Variables.long_scan_cost,
        Variables.read_cost,
        Variables.no_result_read_cost,
        max_RAM_purchased*1024*1024*1024,
        0
    ]

    var id_array = [
        "write",
        "long_range_lookup",
        "existing_point_lookup",
        "zero_result_lookup",
        "memory",
        "storage"
    ]
    var text_array = [
        "Update",
        "Range Lookup",
        "Existing Point Lookup",
        "Zero-result Point Lookup",
        //"Space Amplification"
        "Memory",
        "Storage"
    ];

    for(j=0;j <= 4;j++){
        var div_tmp = document.getElementById(id_array[j]);
        removeAllChildren(div_tmp);
        div_tmp.setAttribute("style","text-align: center")
        var p_tmp=document.createElement("p");
        var span_tmp=document.createElement("span");

        var cost = parseFloat(cost_array[j]);
        var threshold_flag=false;
        var message;
        var msg_cost = cost;
        if(cost*1000%1 != 0){
            msg_cost=cost.toExponential(5);
        }
        if(cost > 2000){
            cost = cost.toExponential(2);
        }else if(cost <= 1e-9){
            if(cost != 0){
                threshold_flag=true;
            }
            cost = 0.0;
        }else if(typeof cost == 'number'  && cost*1000 < 1){
            cost = myFloor(cost, 1).toExponential(1)
        }else if(cost*1000%1 != 0){
            cost = (Math.round(cost*1000)/1000).toFixed(3)
        }


        if(j < 4){
            message = text_array[j] + " at this level has " + msg_cost + " I/O cost(s)."
            cost += " I/O";
        }else{
            message = text_array[j] + " of this data structure is " + formatBytes(msg_cost,1) + ".";
            cost = formatBytes(msg_cost/8,1);
        }

        if(threshold_flag){
            message += "Because the value here is too small (less than 1e-9), it is noted as 0 in breakdown table. "
        }

        span_tmp.setAttribute("data-tooltip",message);
        span_tmp.setAttribute("data-tooltip-position","bottom")
        if(j != 4){
            p_tmp.setAttribute("style","text-align: center;font-size:18px")
        }else{
            p_tmp.setAttribute("style","text-align: center;font-weight:bold;font-size:18px");
        }

        p_tmp.textContent=cost
        span_tmp.appendChild(p_tmp);
        div_tmp.appendChild(span_tmp);
    }

    var omega=1e-6;
    var throughput = 1/Variables.total_cost/omega;
    if(throughput > Math.pow(10, 8)){
        message=throughput.toExponential(2) + " ops/s";
        message2="Under the specified workload, the throughout is " + throughput.toExponential(6) + " ops/second"
    }else{
        message= throughput.toFixed(1) + " ops/s";
        message2="Under the specified workload, the throughout is " + throughput.toFixed(6) + " ops/second"
    }
    var div_throughput = document.getElementById("throughput");
    removeAllChildren(div_throughput);
    var span_tmp=document.createElement("span");
    var p_tmp = document.createElement("p");
    p_tmp.textContent = message;
    span_tmp.setAttribute("data-tooltip",message2);
    span_tmp.setAttribute("data-tooltip-position","bottom")
    p_tmp.setAttribute("style","text-align: center;font-weight:bold;font-size:18px")
    span_tmp.appendChild(p_tmp);
    div_throughput.appendChild(span_tmp);

    document.getElementById("mbuffer").value=(Variables.Buffer/1024/1024).toFixed(2); //in MB
    document.getElementById("memory_budget").value=(Variables.M_BF/Variables.N).toFixed(2); //0 bits per element
    document.getElementById("L").value=Variables.L;
    document.getElementById("K").value=Variables.K;
    document.getElementById("Z").value=Variables.Z;
    document.getElementById("T").value=Variables.T;

    return results;
}

function countThroughput(cost, cloud_provider) {
    var Variables = parseInputVariables();
    var N = Variables.N;
    var E = Variables.E;
    var F = Variables.F;
    var B = Math.floor(Variables.B/E);
    var s = Variables.s;

    var insert = Variables.insert_percentage;
    var blind_update = Variables.blind_update_percentage;
    var read_modify_update = Variables.rmw_percentage;
    console.log(insert);
    var r = Variables.r;
    var v = Variables.v;
    var qL = Variables.qL;
    var qS = Variables.qS;
    var scenario = 'W';//Variables.scenario;

    var query_count=Variables.query_count;

    var VM_libraries=initializeVMLibraries();
    Variables.cost=cost;

    var X;
    var Y;
    var L;
    var M_F_HI;
    var M_F; // = ((B*E + (M - M_F)) > 0 ? B*E + (M - M_F) : (B*E)); // byte
    var M_F_LO; // = (M_B*(F)*T)/((B)*(E));
    var M_BF;
    var M_FP;
    var FPR_sum;

    B=setPricesBasedOnScheme(Variables, cloud_provider);
    if(!setMaxRAMNeeded(Variables))
        return 0;

    var best_cost=-1;
    var best_latency=-1;

    for (var VM_index = 0; VM_index < VM_libraries[cloud_provider].no_of_instances; VM_index++) {
        mem_sum=Math.floor(total_budget/(24*30*VM_libraries[cloud_provider].rate_of_instance[VM_index]));
        if(mem_sum==0) continue;
        //console.log("VM="+VM_index+" cloud_provider:"+cloud_provider+" mem_sum="+mem_sum);
        max_RAM_purchased=VM_libraries[cloud_provider].mem_of_instance[VM_index];
        N=Variables.N/mem_sum;
        //console.log(VM_libraries);
        for (var T = 2; T <= 8; T++) {
            for (var K = 1; K <= T - 1; K++) {
                for (var Z = 1; Z <= T - 1; Z++) {
                    for (var M_B_percent = 0.2; M_B_percent < 1; M_B_percent += 0.2) {
                        var M_B = M_B_percent * max_RAM_purchased * 1024 * 1024 * 1024;
                        var M = max_RAM_purchased * 1024 * 1024 * 1024;
                        X = Math.max(Math.pow(1 / Math.log(2), 2) * (Math.log(T) / 1 / (T - 1) + Math.log(K / Z) / T) * 8);
                        M_F_HI = N * ((X / 8) / T + F / B);
                        if ((N / B) < (M_B * T / (B * E))) {
                            M_F_LO = (N / B) * F;
                        } else {
                            M_F_LO = (M_B * F * T) / (B * E);
                        }
                        M_F = M - M_B;
                        if (M_F < M_F_LO)
                            M_F = M_F_LO;
                        L = Math.ceil(Math.log(N * (E) / (M_B)) / Math.log(T));

                        if (M_F >= M_F_HI) {
                            Y = 0;
                            M_FP = N * F / B;
                        } else if (M_F > M_F_LO && M_F < M_F_HI) {
                            Y = L - 1;
                            M_FP = M_F_LO;
                            for (var i = L - 2; i >= 1; i--) {
                                var h = L - i;
                                var temp_M_FP = M_F_LO;
                                for (var j = 2; j <= h; j++) {
                                    temp_M_FP = temp_M_FP + (temp_M_FP * T);
                                }
                                if (temp_M_FP <= M_F) {
                                    Y = i;
                                    M_FP = temp_M_FP;
                                }
                            }
                        } else {
                            Y = L - 1;
                            M_FP = M_F_LO;
                        }
                        M_BF = 0;
                        var margin = 2;
                        if (M_F - M_FP > 0)
                            M_BF = M_F - M_FP - margin;
                        else
                            M_BF = 0.0;


                        var update_cost;
                        var read_cost;
                        var no_result_read_cost;
                        var short_scan_cost;
                        var long_scan_cost;
                        var FPR_sum;

                        if (write_percentage != 0) {
                            if(scenario=='A'){
                                update_cost=aggregateAvgCaseUpdate(B, E, workload_type, T, K, Z, L, Y, M_B, 1);
                            }else {
                                update_cost = analyzeUpdateCost(B, T, K, Z, L, Y, M, M_F, M_B, M_F_HI, M_F_LO);
                            }
                        }
                        if (read_percentage != 0) {
                            if (scenario == 'A') // Avg-case
                            {
                                read_cost=analyzeReadCostAvgCase(FPR_sum, T, K, Z, L, Y, M, M_B, M_F, M_BF, N, E, Math.ceil(M_B), Math.ceil(E));
                            } else // Worst-case
                            {
                                read_cost = analyzeReadCost(B, E, N, T, K, Z, L, Y, M, M_B, M_F, M_BF, FPR_sum);
                                //logReadCost(d_list, T, K, 0, L, Y, M, M_B, M_F, M_F_HI, M_F_LO, M_FP, M_BF, FPR_sum, update_cost, read_cost, "");
                            }
                        }
                        if (short_scan_percentage != 0) {
                            short_scan_cost = analyzeShortScanCost(B, T, K, Z, L, Y, M, M_B, M_F, M_BF);
                        }
                        long_scan_cost = analyzeLongScanCost(B, s);
                        if (scenario == 'A') // Avg-case
                        {
                            //logTotalCost(T, K, Z, L, Y, M, M_B, M_F, M_F_HI, M_F_LO, M_FP, M_BF, FPR_sum, update_cost, avg_read_cost, short_scan_cost, long_scan_cost);
                        } else // Worst-case
                        {
                            //logTotalCost(T, K, Z, L, Y, M/(1024*1024*1024), M_B/(1024*1024*1024), M_F/(1024*1024*1024), M_F_HI/(1024*1024*1024), M_F_LO/(1024*1024*1024), M_FP/(1024*1024*1024), M_BF/(1024*1024*1024), FPR_sum, update_cost, read_cost, short_scan_cost, long_scan_cost);
                            //logTotalCostSortByUpdateCost(d_list, T, K, 0, L, Y, M, M_B, M_F, M_F_HI, M_F_LO, update_cost, read_cost, "");
                        }
                        var total_cost = (w * update_cost + v * read_cost) / (v + w);
                        var total_latency= total_cost * query_count/ mem_sum / IOPS / 60 / 60;

                        if (best_latency < 0 || total_latency < best_latency) {
                            best_latency = total_latency;
                            Variables.K = K;
                            Variables.T = T;
                            Variables.L = L;
                            Variables.Z = Z;
                            Variables.Buffer = M_B;
                            Variables.M_BF = M_BF;
                            Variables.M_FP = M_FP;
                            Variables.read_cost = read_cost;
                            Variables.update_cost = update_cost;
                            Variables.short_scan_cost = short_scan_cost;
                            Variables.long_scan_cost = long_scan_cost;
                            Variables.no_result_read_cost = read_cost - 1;
                            Variables.total_cost = total_cost;
                            Variables.latency = total_latency;
                            Variables.VM_info= (mem_sum+" X "+VM_libraries[cloud_provider].name_of_instance[VM_index]);
                            Variables.VM_instance= VM_libraries[cloud_provider].name_of_instance[VM_index];
                            Variables.VM_instance_num=mem_sum;
                        }
                    }
                }
            }
        }
    }
    //return  max_RAM_purchased;
    //console.log(Variables.latency);
    return Variables;
}

function countContinuum(combination, cloud_provider, compression_style=0) {
    var Variables = parseInputVariables();
    console.log(global_input);
    var N = Variables.N;
    var E = Variables.E;
    var F = Variables.F;
    var B = Math.floor(Variables.B/E);
    var s = Variables.s;

    var insert = Variables.insert_percentage;
    var blind_update = Variables.blind_update_percentage;
    var read_modify_update = Variables.rmw_percentage;
    var r = Variables.r;
    var v = Variables.v;
    var qL = Variables.qL;
    var qS = Variables.qS;
    var scenario = 'A';//Variables.scenario;

    var query_count=Variables.query_count;

    var VM_libraries=initializeVMLibraries();
    //Variables.cost=cost;

    if(using_compression==true){
        console.log(E);
        console.log(compression_libraries);
        E=(1-compression_libraries[compression_style].space_reduction_ratio)*E;
        F=(1-compression_libraries[compression_style].space_reduction_ratio)*F;
        Variables.E=E;
        Variables.F=F;
    }
    var X;
    var Y;
    var L;
    var M_F_HI;
    var M_F; // = ((B*E + (M - M_F)) > 0 ? B*E + (M - M_F) : (B*E)); // byte
    var M_F_LO; // = (M_B*(F)*T)/((B)*(E));
    var M_BF;
    var M_FP;
    var FPR_sum;

    var Storage_Value=getStorageCost(Variables, cloud_provider);
    B=Storage_Value[0];
    var monthly_storage_cost=Storage_Value[1];

    var best_cost=-1;
    var best_latency=-1;

    var mem_sum;
    var monthly_mem_cost;

    var log_array=new Array();


    for(var i=0;i<VM_libraries[cloud_provider].no_of_instances;i++){
        if(combination[i]>0){
            mem_sum=combination[i];
            max_RAM_purchased=VM_libraries[cloud_provider].mem_of_instance[i];
            monthly_mem_cost=mem_sum*VM_libraries[cloud_provider].rate_of_instance[i]*24*30;
            Variables.VM_info= (mem_sum+" X "+VM_libraries[cloud_provider].name_of_instance[i]);
            Variables.VM_instance= VM_libraries[cloud_provider].name_of_instance[i];
            Variables.VM_instance_num=mem_sum;
            Variables.Vcpu_num=VM_libraries[cloud_provider].num_of_vcpu[i];
        }
    }


    N=Variables.N/mem_sum;
    M_BC=0;
    for (var T = 2; T <= 12; T++) {
        for (var K = 1; K <= T - 1; K++) {
            for (var Z = 1; Z <= T - 1; Z++) {
                for (var M_B_percent = 0.2; M_B_percent <= 1; M_B_percent += 0.2) {
                    var M_B = M_B_percent * max_RAM_purchased * 1024 * 1024 * 1024;
                    var M = max_RAM_purchased * 1024 * 1024 * 1024;
                    X = Math.max(Math.pow(1 / Math.log(2), 2) * (Math.log(T) / 1 / (T - 1) + Math.log(K / Z) / T) * 8);
                    M_F_HI = N * ((X / 8) / T + F / B);
                    if ((N / B) < (M_B * T / (B * E))) {
                        M_F_LO = (N / B) * F;
                    } else {
                        M_F_LO = (M_B * F * T) / (B * E);
                    }
                    M_F = M - M_B;
                    if (M_F < M_F_LO)
                        M_F = M_F_LO;

                    var universe_max = workload_type == 0 ? U : U_1 + U_2;
                    if (workload_type == 1) {
                        universe_max = U_1 + (1 - p_put) * (N);
                    }
                    var size = universe_max < N ? universe_max : N;
                    var multiplier_from_buffer = size*(E) / (M_B);
                    // handle case where data fits in buffer
                    if (multiplier_from_buffer < 1) multiplier_from_buffer = 1;
                    L = Math.ceil(Math.log(multiplier_from_buffer)/Math.log(T));

                    if (M_F >= M_F_HI) {
                        Y = 0;
                        M_FP = N * F / B;
                    } else if (M_F > M_F_LO && M_F < M_F_HI) {
                        Y = L - 1;
                        M_FP = M_F_LO;
                        for (var i = L - 2; i >= 1; i--) {
                            var h = L - i;
                            var temp_M_FP = M_F_LO;
                            for (var j = 2; j <= h; j++) {
                                temp_M_FP = temp_M_FP + (temp_M_FP * T);
                            }
                            if (temp_M_FP <= M_F) {
                                Y = i;
                                M_FP = temp_M_FP;
                            }
                        }
                    } else {
                        Y = L - 1;
                        M_FP = M_F_LO;
                    }
                    M_BF = 0;
                    var margin = 2;
                    if (M_F - M_FP > 0)
                        M_BF = M_F - M_FP - margin;
                    else
                        M_BF = 0.0;


                    var update_cost;
                    var read_cost;
                    var no_result_read_cost;
                    var short_scan_cost;
                    var long_scan_cost;


                    if (write_percentage != 0) {
                        if(scenario=='A'){
                            update_cost=aggregateAvgCaseUpdate(B, E, workload_type, T, K, Z, L, Y, M_B, 0);
                        }else {
                            update_cost = analyzeUpdateCost(B, T, K, Z, L, Y, M, M_F, M_B, M_F_HI, M_F_LO);
                        }
                    }
                    if (read_percentage != 0) {
                        if (scenario == 'A') // Avg-case
                        {
                            read_cost=analyzeReadCostAvgCase(FPR_sum, T, K, Z, L, Y, M, M_B, M_F, M_BF, N, E, Math.ceil(M_B), Math.ceil(E), compression_style);
                        } else // Worst-case
                        {
                            read_cost = analyzeReadCost(B, E, N, T, K, Z, L, Y, M, M_B, M_F, M_BF, FPR_sum);
                            //logReadCost(d_list, T, K, 0, L, Y, M, M_B, M_F, M_F_HI, M_F_LO, M_FP, M_BF, FPR_sum, update_cost, read_cost, "");
                        }

                    }
                    if (short_scan_percentage != 0) {
                        short_scan_cost = analyzeShortScanCost(B, T, K, Z, L, Y, M, M_B, M_F, M_BF);
                    }
                    long_scan_cost = analyzeLongScanCost(B, s);
                    no_result_read_cost=analyzeReadCost(B, E, N, T, K, Z, L, Y, M, M_B, M_F, M_BF, FPR_sum)-1;
                    if (scenario == 'A') // Avg-case
                    {
                        //logTotalCost(T, K, Z, L, Y, M, M_B, M_F, M_F_HI, M_F_LO, M_FP, M_BF, FPR_sum, update_cost, avg_read_cost, short_scan_cost, long_scan_cost);
                    } else // Worst-case
                    {
                        //logTotalCost(T, K, Z, L, Y, M/(1024*1024*1024), M_B/(1024*1024*1024), M_F/(1024*1024*1024), M_F_HI/(1024*1024*1024), M_F_LO/(1024*1024*1024), M_FP/(1024*1024*1024), M_BF/(1024*1024*1024), FPR_sum, update_cost, read_cost, short_scan_cost, long_scan_cost);
                        //logTotalCostSortByUpdateCost(d_list, T, K, 0, L, Y, M, M_B, M_F, M_F_HI, M_F_LO, update_cost, read_cost, "");
                    }
                    //logTotalCost(T, K, Z, L, Y, M/(1024*1024*1024), M_B/(1024*1024*1024), M_F/(1024*1024*1024), M_F_HI/(1024*1024*1024), M_F_LO/(1024*1024*1024), M_FP/(1024*1024*1024), M_BF/(1024*1024*1024), FPR_sum, update_cost, read_cost, short_scan_cost, long_scan_cost);
                    var total_cost = (w * update_cost + v * read_cost + r * no_result_read_cost) / (v + w + r);
                    var total_latency= total_cost * query_count/ mem_sum / IOPS / 60 / 60 / 24;
                    if(using_compression){
                        total_cost = (w * update_cost * (1+compression_libraries[compression_style].put_overhead/100) + v * read_cost * (1+compression_libraries[compression_style].get_overhead/100) + r * read_cost * (1+compression_libraries[compression_style].get_overhead/100)) / (v + w + r);
                    }

                    //log_array.push([T,K,Z,read_cost.toFixed(2),update_cost.toFixed(2),total_latency.toFixed(2)]);
                    if (best_latency < 0 || total_latency < best_latency) {
                        best_latency = total_latency;
                        Variables.K = K;
                        Variables.T = T;
                        Variables.L = L;
                        Variables.Z = Z;
                        Variables.Y = Y;
                        Variables.Buffer = M_B;
                        Variables.M_BF = M_BF;
                        Variables.M_FP = M_FP;
                        Variables.read_cost = read_cost;
                        Variables.update_cost = update_cost;
                        Variables.short_scan_cost = short_scan_cost;
                        Variables.long_scan_cost = long_scan_cost;
                        Variables.no_result_read_cost = no_result_read_cost;
                        Variables.total_cost = total_cost;
                        Variables.latency = total_latency;
                        Variables.cost = (monthly_storage_cost + monthly_mem_cost).toFixed(3);
                        Variables.memory_footprint=max_RAM_purchased*mem_sum;
                        Variables.cloud_provider=cloud_provider;
                        Variables.throughput=mem_sum*IOPS/total_cost;
                        Variables.compression_name=compression_libraries[compression_style].compression_name;
                        Variables.FPR=getFPR(T, K, Z, L, Y, M, M_B, M_F, M_BF, N);
                    }
                }
            }
        }
    }
    //console.log(Variables.VM_info,(monthly_storage_cost + monthly_mem_cost).toFixed(3),log_array);
    //return  max_RAM_purchased;
    //console.log(Variables.latency);
    return Variables;
}

function getFPR( T, K, Z, L, Y, M, M_B, M_F, M_BF, data) {
    var FPR_sum = Math.exp((-M_BF*8/data)*Math.pow((Math.log(2)/Math.log(2.7182)), 2) * Math.pow(T, Y)) * Math.pow(Z, (T-1)/T) * Math.pow(K, 1/T) * Math.pow(T, (T/(T-1)))/(T-1);
    var FPR=new Array();
    //FPR[0]=FPR_sum;
    for(var i = 1;i<=L-Y-1;i++)
    {
        FPR[i] = (FPR_sum)*(T-1)/(T*K*Math.pow(T, L-Y-i));
    }
    for(var i = L-Y;i<=L;i++)
    {
        if (i == L-Y) {
            FPR[i] = (FPR_sum)*(T-1)/(T*Z);
            if(FPR[i]>1)
                FPR[i]=1;
        }
        else {
            FPR[i] = 1;
        }
    }
    return FPR;
}

function countContinuumForExistingDesign(combination, cloud_provider, existing_system, compression_style=0) {
    var Variables = parseInputVariables();
    var N = Variables.N;
    var E = Variables.E;
    var F = Variables.F;
    var B = Math.floor(Variables.B/E);
    var s = Variables.s;

    var insert = Variables.insert_percentage;
    var blind_update = Variables.blind_update_percentage;
    var read_modify_update = Variables.rmw_percentage;
    var r = Variables.r;
    var v = Variables.v;
    var qL = Variables.qL;
    var qS = Variables.qS;
    var scenario = 'A';//Variables.scenario;

    var query_count=Variables.query_count;

    var VM_libraries=initializeVMLibraries();
    //Variables.cost=cost;

    var X;
    var Y;
    var L;
    var M_F_HI;
    var M_F; // = ((B*E + (M - M_F)) > 0 ? B*E + (M - M_F) : (B*E)); // byte
    var M_F_LO; // = (M_B*(F)*T)/((B)*(E));
    var M_BF;
    var M_FP;
    var FPR_sum;

    if(using_compression==true){
        E=(1-compression_libraries[compression_style].space_reduction_ratio)*E;
        F=(1-compression_libraries[compression_style].space_reduction_ratio)*F;
        Variables.E=E;
        Variables.F=F;
    }

    var Storage_Value=getStorageCost(Variables, cloud_provider);
    B=Storage_Value[0];
    var monthly_storage_cost=Storage_Value[1];

    var best_cost=-1;
    var best_latency=-1;

    var mem_sum;
    var monthly_mem_cost;


    for(var i=0;i<VM_libraries[cloud_provider].no_of_instances;i++){
        if(combination[i]>0){
            mem_sum=combination[i];
            max_RAM_purchased=VM_libraries[cloud_provider].mem_of_instance[i];
            monthly_mem_cost=mem_sum*VM_libraries[cloud_provider].rate_of_instance[i]*24*30;
            Variables.VM_info= (mem_sum+" X "+VM_libraries[cloud_provider].name_of_instance[i]);
            Variables.VM_instance= VM_libraries[cloud_provider].name_of_instance[i];
            Variables.VM_instance_num=mem_sum;
            Variables.Vcpu_num=VM_libraries[cloud_provider].num_of_vcpu[i];
        }
    }
    N=Variables.N/mem_sum;
    var M_B

    if(existing_system=="rocks") {
        var T = 10;
        var K = 1;
        var Z = 1;
        Y = 0;
        var M = max_RAM_purchased * 1024 * 1024 * 1024;
        M_FP = N * F / B;
        M_BF = N * 10.0 / 8.0; // 10 bits/entry in RocksDB is default and convert to byte because everything else is in byte
        M_F = M_FP + M_BF;
        if (M_F >= M) {
            //printf("System %s needs at least %f GB of memory\n", existing_system, ((M_F/(1024*1024*1024))+1.0));
            return -1;
        }
        M_BC=0;
        M_B = M - M_F;
        M_B = M_B < 0 ? 0.0 : M_B;
    }

    if(existing_system=="WT")
    {
        var T = 64;
        var K = 1;
        var Z = 1;
        var M = max_RAM_purchased * 1024 * 1024 * 1024;
        M_B = M * (B*E) / ( (F*T) + (B*E) );
        M_FP = M - M_B;
        M_BF = 0.0; // 10 bits/entry in RocksDB is default and convert to byte because everything else is in byte
        M_F = M_FP + M_BF;
        if(M_F >= M)
        {
            //printf("System %s needs at least %f GB of memory\n", existing_system, ((M_F/(1024*1024*1024))+1.0));
            return -1;
        }
        // WT uses 50% of memory to cache
        //M_BC = M_B/2.0;
        M_BC=0;
        M_B = M_B - M_BC;
        //scenario == 'A'? getNoOfLevelsAvgCase(&L, M_B, T, data) : getNoOfLevels(&L, M_B, T, data);
    }
    var universe_max = workload_type == 0 ? U : U_1 + U_2;
    if (workload_type == 1) {
        universe_max = U_1 + (1 - p_put) * (N);
    }
    var size = universe_max < N ? universe_max : N;
    var multiplier_from_buffer = size*(E) / (M_B);
    // handle case where data fits in buffer
    if (multiplier_from_buffer < 1) multiplier_from_buffer = 1;
    L = Math.ceil(Math.log(multiplier_from_buffer)/Math.log(T));



    if(existing_system=="WT")
        Y=L-1;

    var update_cost;
    var read_cost;
    var no_result_read_cost;
    var short_scan_cost;
    var long_scan_cost;

    if (write_percentage != 0) {
        if(scenario=='A'){
            update_cost=aggregateAvgCaseUpdate(B, E, workload_type, T, K, Z, L, Y, M_B, 0);
        }else {
            update_cost = analyzeUpdateCost(B, T, K, Z, L, Y, M, M_F, M_B, M_F_HI, M_F_LO);
        }
    }
    if (read_percentage != 0) {
        if (scenario == 'A') // Avg-case
        {
            read_cost=analyzeReadCostAvgCase(FPR_sum, T, K, Z, L, Y, M, M_B, M_F, M_BF, N, E,Math.ceil(M_B),Math.ceil(E), compression_style);
        } else // Worst-case
        {
            read_cost = analyzeReadCost(B, E, N, T, K, Z, L, Y, M, M_B, M_F, M_BF, FPR_sum);
            //logReadCost(d_list, T, K, 0, L, Y, M, M_B, M_F, M_F_HI, M_F_LO, M_FP, M_BF, FPR_sum, update_cost, read_cost, "");
        }

    }
    if (short_scan_percentage != 0) {
        short_scan_cost = analyzeShortScanCost(B, T, K, Z, L, Y, M, M_B, M_F, M_BF);
    }
    no_result_read_cost=analyzeReadCost(B, E, N, T, K, Z, L, Y, M, M_B, M_F, M_BF, FPR_sum)-1;
    long_scan_cost = analyzeLongScanCost(B, s);
    if (scenario == 'A') // Avg-case
    {
        //logTotalCost(T, K, Z, L, Y, M, M_B, M_F, M_F_HI, M_F_LO, M_FP, M_BF, FPR_sum, update_cost, avg_read_cost, short_scan_cost, long_scan_cost);
    } else // Worst-case
    {
        //logTotalCost(T, K, Z, L, Y, M/(1024*1024*1024), M_B/(1024*1024*1024), M_F/(1024*1024*1024), M_F_HI/(1024*1024*1024), M_F_LO/(1024*1024*1024), M_FP/(1024*1024*1024), M_BF/(1024*1024*1024), FPR_sum, update_cost, read_cost, short_scan_cost, long_scan_cost);
        //logTotalCostSortByUpdateCost(d_list, T, K, 0, L, Y, M, M_B, M_F, M_F_HI, M_F_LO, update_cost, read_cost, "");
    }
    var total_cost = (w * update_cost + v * read_cost + r * no_result_read_cost) / (v + w + r);
    var total_latency= total_cost * query_count/ mem_sum / IOPS / 60 / 60 / 24;
    if(using_compression){
        total_cost = (w * update_cost * (1+compression_libraries[compression_style].put_overhead/100) + v * read_cost * (1+compression_libraries[compression_style].get_overhead/100) + r * read_cost * (1+compression_libraries[compression_style].get_overhead/100)) / (v + w + r);
    }

    if (best_latency < 0 || total_latency < best_latency) {
        best_latency = total_latency;
        Variables.K = K;
        Variables.T = T;
        Variables.L = L;
        Variables.Z = Z;
        Variables.Y = Y;
        Variables.Buffer = M_B;
        Variables.M_BF = M_BF;
        Variables.M_FP = M_FP;
        Variables.read_cost = read_cost;
        Variables.update_cost = update_cost;
        Variables.short_scan_cost = short_scan_cost;
        Variables.long_scan_cost = long_scan_cost;
        Variables.no_result_read_cost = no_result_read_cost;
        Variables.total_cost = total_cost;
        Variables.latency = total_latency;
        Variables.cost = (monthly_storage_cost + monthly_mem_cost).toFixed(3);
        Variables.memory_footprint=max_RAM_purchased*mem_sum;
        Variables.cloud_provider=cloud_provider;
        Variables.compression_name=compression_libraries[compression_style].compression_name;
        Variables.FPR=getFPR(T, K, Z, L, Y, M, M_B, M_F, M_BF, N);
    }
    //return  max_RAM_purchased;
    //console.log(Variables.latency);
    return Variables;
}

function buildContinuums(cloud_mode){
    var result_array=new Array();

    var VM_libraries=initializeVMLibraries();
    var Variables=0;
    var rocks_Variables;
    var WT_Variables;
    var progress=0;
    cri_cache=new Array();
    for(var i=0;i<3;i++){
        cri_cache.push(new Array());
    }
    dri_cache=new Array();
    for(var i=0;i<3;i++){
        dri_cache.push(new Array());
    }
    console.log(cloud_mode);
    if(cloud_mode==0||cloud_mode==NaN) {
        for (var cloud_provider = 0; cloud_provider < 3; cloud_provider++) {
            var VMCombinations = getAllVMCombinations(cloud_provider, VM_libraries);
            for (var i = 0; i < VMCombinations.length; i++) {
                Variables=0;
                progress=(cloud_provider+i/VMCombinations.length)/3;
                global_progress=progress;

                var VMCombination = VMCombinations[i];
                if(using_compression==false) {
                     Variables = countContinuum(VMCombination, cloud_provider);
                     rocks_Variables = countContinuumForExistingDesign(VMCombination, cloud_provider, "rocks");
                     WT_Variables = countContinuumForExistingDesign(VMCombination, cloud_provider, "WT");
                }else{
                    for(var n=0;n<3;n++){
                        if(Variables==0) {
                            Variables = countContinuum(VMCombination, cloud_provider, n);
                            rocks_Variables = countContinuumForExistingDesign(VMCombination, cloud_provider, "rocks", 1);
                            WT_Variables = countContinuumForExistingDesign(VMCombination, cloud_provider, "WT", 1);
                        }else{
                            var temp;
                            temp=countContinuum(VMCombination, cloud_provider, n);
                            if(temp.latency<Variables.latency)
                                Variables=temp;
                            /*
                            temp=countContinuumForExistingDesign(VMCombination, cloud_provider, "rocks", n);
                            if(temp.latency<rocks_Variables.latency)
                                rocks_Variables=temp;
                            temp=countContinuumForExistingDesign(VMCombination, cloud_provider, "WT", n);
                            if(temp.latency<WT_Variables.latency)
                                WT_Variables=temp;*/
                        }
                    }
                }
                var info = ("<b>" + VM_libraries[cloud_provider].provider_name + " :</b><br>T=" + Variables.T + ", K=" + Variables.K + ", Z=" + Variables.Z + ", L=" + Variables.L + "<br>M_B=" + (Variables.Buffer / 1024 / 1024 / 1024).toFixed(2) + " GB, M_BF=" + (Variables.M_BF / 1024 / 1024 / 1024).toFixed(2) + " GB<br>M_FP=" + (Variables.M_FP / 1024 / 1024 / 1024).toFixed(2) + " GB, " + Variables.VM_info +"<br>Latency=" + fixTime(Variables.latency)+"<br>Cost="+Variables.cost);
                if(using_compression)
                    info+="<br>Compression: "+Variables.compression_name;
                var result = [Variables.cost, Variables.latency, VMCombination, VM_libraries[cloud_provider].provider_name, info, Variables, Variables.memory_footprint, rocks_Variables,WT_Variables];
                result_array.push(result);
            }
        }
    }else{
        cloud_provider=cloud_mode-1;
        var VMCombinations = getAllVMCombinations(cloud_provider, VM_libraries);
        for (var i = 0; i < VMCombinations.length; i++) {
            var VMCombination = VMCombinations[i];
            var Variables = countContinuum(VMCombination, cloud_provider);
            var rocks_Variables = countContinuumForExistingDesign(VMCombination, cloud_provider, "rocks");
            var WT_Variables = countContinuumForExistingDesign(VMCombination, cloud_provider, "WT");
            var info = ("<b>" + VM_libraries[cloud_provider].provider_name + " :</b><br>T=" + Variables.T + ", K=" + Variables.K + ", Z=" + Variables.Z + ", L=" + Variables.L + "<br>M_B=" + (Variables.Buffer / 1024 / 1024 / 1024).toFixed(2) + " GB, M_BF=" + (Variables.M_BF / 1024 / 1024 / 1024).toFixed(2) + " GB<br>M_FP=" + (Variables.M_FP / 1024 / 1024 / 1024).toFixed(2) + " GB, " + Variables.VM_info +"<br>Latency=" + fixTime(Variables.latency)+"<br>Cost="+Variables.cost);
            var result = [Variables.cost, Variables.latency, VMCombination, VM_libraries[cloud_provider].provider_name, info, Variables, Variables.memory_footprint, rocks_Variables,WT_Variables];
            result_array.push(result);
        }
    }

    result_array.sort(function (a,b) {
        return a[0]-b[0];
    })
    var log=result_array;
    for(var i=0;i<10;i++)
        //console.log(log[i]);
    return result_array;
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
function getCouponCollector( universe, number_of_entries) {
    if (number_of_entries == 1) return 1;
    if (number_of_entries > universe) return -1;
    var ratio = ( universe) /  (universe - number_of_entries + 1);
    // printf("ratio:%f, universe:%f, number_of_entries:%f\n", ratio, universe, number_of_entries);
    //console.log(universe,ratio,Math.log(ratio),Math.log(ratio)/Math.log(10));
    return universe * Math.log(ratio);
}

function getQ( type, level, EB, T, K, worst_case) {
    // uniform
    var size_run = EB;
    var worst_case_estimate = EB;
    if (level != 0) {
        size_run =  (EB * Math.pow(T, level))/K;
        worst_case_estimate = size_run * K;
    }
    if (worst_case) return worst_case_estimate;

    var avg_case_bound = 0;
    if (type == 0) {
        avg_case_bound = getCouponCollector(U, size_run);
        if (level != 0) avg_case_bound *= K;
    }
    // skew
    if (type == 1) {
        var bound_1 = 0;
        var bound_2 = getCouponCollector(U_2, size_run);
        // bound 1: some special key slots are not filled up
        if (level != 0) bound_2 *= K;

        // bound 2: all special key slots are filled up
        if (size_run > U_1) {
            bound_1 = getCouponCollector(U_2, size_run - U_1) / (1 - p_put);
            if (level != 0) bound_1 *= K;
        }

        // printf("bound 1: %f, bound 2:%f\n", bound_1, bound_2);
        avg_case_bound = (bound_2 >= bound_1) ? bound_2 : bound_1;
    }
    //console.log(worst_case_estimate,avg_case_bound);
    return (avg_case_bound <= worst_case_estimate) ? worst_case_estimate : avg_case_bound;
}

function aggregateAvgCaseUpdate( B, E, type, T, K, Z, L, Y, M_B, worst_case) {
    var EB = M_B / (E);
    var term1 = 0.0, term2 = 0.0, term3= 0.0, term3_2 = 0.0, term3_mult = 0.0;

    for(var i = 1;i<=L-Y-1;i++)
    {
        var numerator = ( (EB * Math.pow(T, i)))/K;
        var numerator_2 = EB * Math.pow(T, i - 1);
        var Q  = getQ(type, i - 1, EB, T, K, worst_case);
        if (Q > 0) {
            term1 += (numerator + numerator_2) / Q;
        }
    }
    term1 /=  B;

    term2 = EB * Math.pow(T, L - Y)/Z + EB * Math.pow(T, L - Y-1);
    term2 /=  B;
    var Q = getQ(type, L - Y - 1, EB, T, K, worst_case);
    if (Q < 0) {
        term2 = 0;
    }
    else {
        term2 /= Q;
        for(i = L - Y + 1; i <= L ;i++)
        {
            var num_blocks = ( (EB * Math.pow(T, i)))/ ( B);
            term3_2 = EB * Math.pow(T, L-Y-1) >= num_blocks ? num_blocks : EB * Math.pow(T, L-Y-1);
            term3 += term3_2;
        }
        term3 /= Q;
        term3_mult = 1.0;
        if (T < B) {
            term3_mult = T <= B-T ? T : B - T;
            term3_mult += 1;
            term3_mult /= ( (B - T));
        }
        term3 *= term3_mult;
    }
    //console.log(term1,term2,term3);
    // printf("term1:%f, term2:%f, term3:%f\n", term1, term2, term3);
    // printf("T:%d, K:%d, Z:%d, L:%d, Y:%d, MB:%f, EB:%f, N:%ld\n", T, K, Z, L, Y, M_B, EB, N);
    return term1 + term2 + term3;
}

function analyzeUpdateCost(B, T, K, Z, L, Y, M, M_F, M_B, M_F_HI, M_F_LO) {
    var update_cost;
    if (Y == 0) {
        update_cost = (((T * (L - 1)) / K) + (T / Z)) / B;
    } else {
        update_cost = (((T * (L - Y - 1)) / K) + (T / Z) * (Y + 1)) / B;
    }
    return update_cost;
}

function analyzeReadCostAvgCase(FPR_sum, T, K, Z, L, Y, M, M_B, M_F, M_BF, data, E, int_M_B, int_E, compression_style)
{

    // uniform
    var avg_read_cost;
    if (workload_type == 0) {
    avg_read_cost = aggregateAvgCase(0, FPR_sum, T, K, Z, L, Y, M, M_B, M_F, M_BF, data, E, int_M_B, int_E, compression_style);
        return avg_read_cost;
    }

    // skew
    if (workload_type == 1) {
        var skew_part =  aggregateAvgCase(1, FPR_sum, T, K, Z, L, Y, M, M_B, M_F, M_BF, data, E, int_M_B, int_E, compression_style);
        var non_skew_part =  aggregateAvgCase(2, FPR_sum, T, K, Z, L, Y, M, M_B, M_F, M_BF, data, E, int_M_B, int_E, compression_style);
    avg_read_cost = skew_part * p_get + non_skew_part * (1 - p_get);
    }
    return avg_read_cost;
}

function aggregateAvgCase(type, FPR_sum, T, K, Z, L, Y, M, M_B, M_F, M_BF, data, E, int_M_B, int_E, compression_style) {
    var term1 = 0.0, term2 = 0.0, term3= 0.0;
    var term2_2 = 0.0, term3_2 =0.0;
    var c, q;
    var p_i;
    var cq=getcq(type, T, K, Z, L, Y, M_B, E);
    c=cq[0];
    q=cq[1];
    term1 = c/q;
    FPR_sum = Math.exp((-M_BF*8/data)*Math.pow((Math.log(2)/Math.log(2.7182)), 2) * Math.pow(T, Y)) * Math.pow(Z, (T-1)/T) * Math.pow(K, 1/T) * Math.pow(T, (T/(T-1)))/(T-1);
    //console.log(FPR_sum+" T="+T+" K="+K+" Z= "+Z+" M_B="+M_B/1024/1024/1024);
    for(var i = 1;i<=L-Y-1;i++)
    {
        p_i = (FPR_sum)*(T-1)/(T*K*Math.pow(T, L-Y-i));
        term2_2 = 0.0;
        if(p_i>0) {
            for (var r = 1; r <= K; r++) {
                term2_2 = term2_2 + getC_ri(type, r, i, M_B, T, K, Z, L, Y, E, int_M_B, int_E, compression_style) / q;
            }
            term2 = term2 + (p_i * term2_2);
        }
    }
    for(var i = L-Y;i<=L;i++)
    {
        if (i == L-Y) {
            p_i = (FPR_sum)*(T-1)/(T*Z);
        }
        else {
            p_i = 1;
        }
        term3_2 = 0.0;
        if(p_i>0) {
            for (var r = 1; r <= Z; r++) {
                term3_2 = term3_2 + getD_ri(type, r, i, M_B, T, K, Z, L, Y, E, int_M_B, int_E, compression_style) / q;
                // printf("%f\n", getD_ri(type, r, i, M_B, T, K, Z, L, Y)/q);
            }
            term3 = term3 + (p_i * term3_2);
        }
    }
    //console.log(c,q);
    //console.log(T,K,Z,term1,term2,term3);
    //if((term1 + term2 + term3)==0)
        //console.log(T,K,Z,term1,term2,term3,cq);
    return term1 + term2 + term3;
}

function getcq(type, T, K, Z, L, Y, M_B, E)
{
    var c,q;
    q = 1.0;
    for(var i=1;i<=L-Y-1;i++)
    {
        q = q * Math.pow((1.0 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), K);
        //console.log((1.0 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), K);
    }
    for(var i=L-Y;i<=L;i++)
    {
        q = q * Math.pow((1.0 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), Z);
    }
    c = (1 - getAlpha_i(type, M_B, T, K, Z, L, Y, -1, E)) * (1 - (q))*(1 - getAlpha_i(type, M_B, T, K, Z, L, Y, 0, E));
    q = 1 - (q)*(1 - getAlpha_i(type, M_B, T, K, Z, L, Y, 0, E));
   // console.log( getAlpha_i(type, M_B, T, K, Z, L, Y, 0, E));
    return [c,q];
}

function getC_ri(type, r,  i, M_B, T, K, Z, L, Y, E, int_M_B, int_E, compression_style)
{
    //console.log(type, r,  i, M_B, T, K, Z, L, Y, E);
    var a=(type*1+r*5+i*40+int_M_B+T*400+K*6000+Z*90000+L*230000+Y*710000+int_E*190007+K*r+i*T*4000)%699999;
    //console.log(a);
    var cache=cri_cache[compression_style][a];
    //console.log(cache);

    if(cache===undefined) {
        cri_count += 1;
        var term1 = 1 - getAlpha_i(type, M_B, T, K, Z, L, Y, 0, E);

        term1 *= (1 - getAlpha_i(type, M_B, T, K, Z, L, Y, -1, E));
        var term2 = 1.0;
        for (var h = 1; h < i; h++) {
            term2 = term2 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), K);
        }
        var term3 = Math.pow((1.0 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), r);
        var term4 = 1;
        for (var h = i + 1; h <= L - Y - 1; h++) {
            term4 = term4 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), K);
        }
        for (var h = L - Y; h <= L; h++) {
            term4 = term4 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), Z);
        }
        term4 = term4 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), K - r);
        term4 = 1 - term4;
        cri_cache[compression_style][a]={};
        cri_cache[compression_style][a].result=term1 * term2 * term3 * term4;
        cri_cache[compression_style][a].parameter=[type, r,  i, int_M_B, T, K, Z, L, Y];;
        return term1 * term2 * term3 * term4;
    }else{
        var flag=true;
        var array=[type, r,  i, int_M_B, T, K, Z, L, Y];
        for(var j=0; j<array.length; j++){
            if(array[j]!=cache.parameter[j]){
                flag=false;
                //console.log(array[i],cache.parameter[i]);
                log.push([array,cache.parameter])
                break;
            }
        }
        if(flag) {
            return cache.result;
        }
        else {
            cri_miss_count+=1;
            var term1 = 1 - getAlpha_i(type, M_B, T, K, Z, L, Y, 0, E);

            term1 *= (1 - getAlpha_i(type, M_B, T, K, Z, L, Y, -1, E));
            var term2 = 1.0;
            for (var h = 1; h < i; h++) {
                term2 = term2 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), K);
            }
            var term3 = Math.pow((1.0 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), r);
            var term4 = 1;
            for (var h = i + 1; h <= L - Y - 1; h++) {
                term4 = term4 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), K);
            }
            for (var h = L - Y; h <= L; h++) {
                term4 = term4 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), Z);
            }
            term4 = term4 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), K - r);
            term4 = 1 - term4;
            cri_cache[compression_style][a]={};
            cri_cache[compression_style][a].result=term1 * term2 * term3 * term4;
            cri_cache[compression_style][a].parameter=[type, r,  i, int_M_B, T, K, Z, L, Y];
            return term1 * term2 * term3 * term4;
        }
    }
}

function compare_array(a,b){
    for(var j=0; j<a.length; j++){
        if(a[j]>b[j]){
            return 1;
        }
        if(b[j]>a[j]){
            return -1;
        }
    }
    return 0;
}

function bsearch_array(array,low,high,target)
{
    if(high<=0)return [0,0];
    while(low <= high)
    {
        var mid = Math.floor((low + high)/2);
        var flag=compare_array(array[mid].parameter ,target);
        if (flag==1){
            high = mid - 1;
        }else if (flag==-1){
            low = mid + 1;
        }else{
            return [1,mid];
        }
    }
    return [0,low];
}

function getC_ri_1(type, r,  i, M_B, T, K, Z, L, Y, E, int_M_B, int_E)
{
    //console.log(type, r,  i, M_B, T, K, Z, L, Y, E);
    var array=[type, r,  i, int_M_B, T, K, Z, L, Y, int_E];
    var flag_index= bsearch_array(cri_cache,0,cri_cache.length-1,array);
    //console.log(a);
    //console.log(cache);

    if(flag_index[0]==0) {
        cri_count += 1;
        var term1 = 1 - getAlpha_i(type, M_B, T, K, Z, L, Y, 0, E);

        term1 *= (1 - getAlpha_i(type, M_B, T, K, Z, L, Y, -1, E));
        var term2 = 1.0;
        for (var h = 1; h < i; h++) {
            term2 = term2 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), K);
        }
        var term3 = Math.pow((1.0 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), r);
        var term4 = 1;
        for (var h = i + 1; h <= L - Y - 1; h++) {
            term4 = term4 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), K);
        }
        for (var h = L - Y; h <= L; h++) {
            term4 = term4 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), Z);
        }
        term4 = term4 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), K - r);
        term4 = 1 - term4;
        var new_data={};
        new_data.result=term1 * term2 * term3 * term4;
        new_data.parameter=[type, r,  i, int_M_B, T, K, Z, L, Y, int_E];
        if(cri_cache.length==0)
            cri_cache[0]=new_data;
        else {
            for (var j = cri_cache.length-1; j >= flag_index[1]; j--) {
                cri_cache[j + 1] = cri_cache[j];
            }
            cri_cache[flag_index[1]] = new_data;
        }
        return term1 * term2 * term3 * term4;
    }else{
        return flag_index[1].result;
    }
}

function getD_ri( type, r, i, M_B, T, K, Z, L, Y, E, int_M_B, int_E, compression_style)
{
    var a=(type*1+r*5+i*40+int_M_B+T*400+K*6000+Z*90000+L*230000+Y*710000+int_E*190007+K*r+i*T*4000+(int_E%(L*Y*19+T))*50000)%999999;
    //console.log(a);
    //console.log(type, r, i, M_B, T, K, Z, L, Y, E, int_M_B, int_E, compression_style);
    var cache=dri_cache[compression_style][a];
    if(cache===undefined) {
        dri_count += 1;
        var term1 = 1 - getAlpha_i(type, M_B, T, K, Z, L, Y, 0, E);
        term1 *= (1 - getAlpha_i(type, M_B, T, K, Z, L, Y, -1, E));
        var term2 = 1.0;
        for (var h = 1; h <= L - Y - 1; h++) {
            term2 = term2 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), K);
            //term2 = term2 * Module._poow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), K);}
        }
        for (var h = L - Y; h < i; h++) {
            term2 = term2 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), Z);
        }
        var term3 = Math.pow((1.0 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), r);
        var term4 = 1.0;
        for (var h = i + 1; h <= L; h++) {
            term4 = term4 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), Z);
        }
        term4 = term4 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), Z - r);
        term4 = 1 - term4;
        //console.log(term1,term2,term3,term4);
        dri_cache[compression_style][a]={};
        dri_cache[compression_style][a].result=term1 * term2 * term3 * term4;
        dri_cache[compression_style][a].parameter=type+r+i+T+K+Z+L+Y;
        return term1 * term2 * term3 * term4;
    }else{
            var flag=true;
            var array=type+r+i+T+K+Z+L+Y;
            if(array!=cache.parameter)
                flag=false
            if(flag) {
                return cache.result;
            }else{
                dri_miss_count += 1;
                var term1 = 1 - getAlpha_i(type, M_B, T, K, Z, L, Y, 0, E);
                term1 *= (1 - getAlpha_i(type, M_B, T, K, Z, L, Y, -1, E));
                var term2 = 1.0;
                for (var h = 1; h <= L - Y - 1; h++) {
                    term2 = term2 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), K);
                    //term2 = term2 * Module._poow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), K);}
                }
                for (var h = L - Y; h < i; h++) {
                    term2 = term2 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), Z);
                }
                var term3 = Math.pow((1.0 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), r);
                var term4 = 1.0;
                for (var h = i + 1; h <= L; h++) {
                    term4 = term4 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), Z);
                }
                term4 = term4 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), Z - r);
                term4 = 1 - term4;
                //console.log(term1,term2,term3,term4);
                dri_cache[compression_style][a]={};
                dri_cache[compression_style][a].result=term1 * term2 * term3 * term4;
                dri_cache[compression_style][a].parameter=type+r+i+T+K+Z+L+Y;
                return term1 * term2 * term3 * term4;
            }
    }
}

function getAlpha_0( type, M_B, E)
{
    if (type == 0) {
        var val = M_B/(E*U);
        if(val < 1)
            return val;
        return 1;
    }
    if (type == 1) {
        var val = 1 - (p_put / U_1);
        var EB = M_B / E;
        val = pow(val, EB);
        val = 1 - val;
        return val;
    }
    if (type == 2) {
        var val = (1-p_put) * M_B/(E*U_2);
        if(val < 1)
            return val;
        return 1;
    }
    return -1;
}

function getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)
{
    // not a valid input
    if (i < -1) return -1;

    // set up run size
    var size_run = 0;
    var p_skew = p_put;
    // block cache
    if (i == -1) {
        size_run = M_BC / E;
        p_skew = p_get;
    }
    // buffer
    if (i == 0) {
        size_run = M_B / E;
    }
    // hot levels except last
    if (i <= L - Y - 1 && i > 0) {
        size_run = M_B*Math.pow(T,i)/(K*E);
    }
    // last level
    if (i == L) {
        size_run = M_B*Math.pow(T,i)/(Z*E);
    }
    // cold levels
    if (i > 0 && i < L && i > L - Y -1) {
        size_run = M_B*Math.pow(T,i)/(E);
        //size_run *= (B - T) / B;
    }

    // get alpha
    if (type == 0) {
        var val = size_run / U;
        if(val < 1){
            return val;
        }
        return 1;
    }
    if (type == 1) {
        var val = 1 - (p_skew / U_1);
        val = 1 - Math.pow(val, size_run);
        return val;
    }
    if (type == 2) {
        var val = (1 - p_skew) * size_run / U_2;
        if(val < 1){
            return val;
        }
        return 1;
    }

    return -1;
}

function analyzeReadCost(B, E, N, T, K, Z, L, Y, M, M_B, M_F, M_BF, FPR_sum){
    var entries_in_hot_level;
    var first = T*(M_B/E);
    var sum = first;
    for(var i = 2;i<=L-Y;i++)
    {
        sum = sum + first*Math.pow(T, i-1);
    }
    entries_in_hot_level = sum;
    var bits_per_entry = M_BF*8/entries_in_hot_level;
    FPR_sum = Math.exp(((-M_BF*8)/N)*Math.pow(Math.log(2),2)*Math.pow(T, Y)) * Math.pow(Z, (T-1)/T) * Math.pow(K, 1/T) * Math.pow(T, (T/(T-1)))/(T-1);
    //*FPR_sum = exp((-M_BF*8/N)*(2*log(2)/log(2.7182))*pow(T, Y)) * pow(Z, (T-1)/T) * pow(K, 1/T) * pow(T, (T/(T-1)))/(T-1);
    //console.log(Math.pow(K, 1/T));
    return (1.0 + (Y*Z) + FPR_sum);
}

function analyzeShortScanCost(B, T, K, Z, L, Y, M, M_B, M_F, M_BF){
    if(Y == 0)
    {
        return short_scan_cost = K*L;
    }
    else
    {
        return short_scan_cost = K*(L-Y-1) + Z*(Y+1);
    }
}

function analyzeLongScanCost(s,B) {
    return s/B;
}

function logTotalCost(T, K, Z, L, Y, M, M_B, M_F, M_F_HI, M_F_LO, M_FP, M_BF, FPR_sum, update_cost, read_cost, short_scan_cost, long_scan_cost){
    console.log("T="+T+",K="+K+",Z="+Z+",L="+L+",Y="+Y+",M="+M+",M_B="+M_B+",M_F="+M_F+",M_F_HI="+M_F_HI+",M_F_LO="+M_F_LO+",M_FP="+M_FP+",M_BF="+M_BF+",FPR_sum="+FPR_sum+",update_cost="+update_cost+",read_cost="+read_cost+",short_scan_cost="+short_scan_cost+",long_scan_cost="+long_scan_cost);
}


function setPricesBasedOnScheme(Variables, cloud_provider)
{
    total_budget = Variables.cost; //generateRandomBudget(MIN_BUDGET, MAX_BUDGET); for a month
    var storage, MBps, monthly_storage_cost;
    storage = (Variables.N*Variables.E)/(1024*1024*1024);
    if(cloud_provider==undefined) {
        cloud_provider = getCloudProvider("cloud-provider");
    }
    cloud_provider=2;
    var B;
    if(cloud_provider == 0)
    {
        MIN_RAM_SIZE = 16; // GB
        RAM_BLOCK_COST = 0.091; // per RAM block per hour
        MBps = 3500; // it is actually Mbps  for AWS
        B = Math.floor(256*1024/Variables.E); //https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/memory-optimized-instances.html
        IOPS = MBps*Math.pow(10,6)/(B*Variables.E);
        if(IOPS > 15000)
        {
            IOPS = 15000;
        }
        if(storage > 75)
        {
            monthly_storage_cost = (storage-75)*0.1; // $0.1 per GB-month https://aws.amazon.com/ebs/pricing/
            total_budget = total_budget - monthly_storage_cost;
        }
        else
        {
            monthly_storage_cost = storage*0.1; // $0.1 per GB-month https://aws.amazon.com/ebs/pricing/
        }
        network_bandwidth = 10.0*1024*1024*1024/8; //Gbps
    }
    if(cloud_provider == 1)
    {
        MIN_RAM_SIZE = 13; // GB
        RAM_BLOCK_COST = 0.0745; // per RAM block per hour
        MBps = read_percentage*720/100 + write_percentage*160/100; // taking average
        B = 16*1024/(Variables.E);
        IOPS = MBps*Math.pow(10,6)/(B*Variables.E);
        if(IOPS > 30000)
        {
            IOPS = 30000;
        }
        monthly_storage_cost = storage*0.24;
        total_budget = total_budget - monthly_storage_cost;
    }
    if(cloud_provider == 2)
    {
        MIN_RAM_SIZE = 16; // GB
        RAM_BLOCK_COST = 0.0782; // per RAM block per hour
        B = 8*1024/(Variables.E);
        if(storage <= 32)
        {
            IOPS = 120;
            monthly_storage_cost = 5.28;
        }
        else if(storage > 32 && storage <= 64)
        {
            IOPS = 240;
            monthly_storage_cost = 10.21;
        }
        else if(storage > 64 && storage <= 128)
        {
            IOPS = 500;
            monthly_storage_cost = 19.71;
        }
        else if(storage > 128 && storage <= 256)
        {
            IOPS = 1100;
            monthly_storage_cost = 38.02;
        }
        else if(storage > 256 && storage <= 512)
        {
            IOPS = 2300;
            monthly_storage_cost = 73.22;
        }
        else if(storage > 512 && storage <= 2000)
        {
            IOPS = 5000;
            monthly_storage_cost = 135.17;
        }
        else
        {
            IOPS = 7500;
            monthly_storage_cost = 259.05;
        }
        total_budget = total_budget - monthly_storage_cost;
    }

    //console.log(cloud_provider+"====="+total_budget)
    return B;
}

function getStorageCost(Variables, cloud_provider)
{
    var storage, MBps, monthly_storage_cost;
    storage = (Variables.N*Variables.E)/(1024*1024*1024);
    if(cloud_provider==undefined) {
        cloud_provider = getCloudProvider("cloud-provider");
    }
    var B;
    if(cloud_provider == 0)
    {
        MIN_RAM_SIZE = 16; // GB
        RAM_BLOCK_COST = 0.091; // per RAM block per hour
        MBps = 3500; // it is actually Mbps  for AWS
        B = Math.floor(256*1024/Variables.E); //https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/memory-optimized-instances.html
        IOPS = MBps*Math.pow(10,6)/(B*Variables.E);
        if(IOPS > 15000)
        {
            IOPS = 15000;
        }
        if(storage > 75)
        {
            monthly_storage_cost = (storage-75)*0.1; // $0.1 per GB-month https://aws.amazon.com/ebs/pricing/
        }
        else
        {
            monthly_storage_cost = storage*0.1; // $0.1 per GB-month https://aws.amazon.com/ebs/pricing/
        }
    }
    if(cloud_provider == 1)
    {
        MIN_RAM_SIZE = 13; // GB
        RAM_BLOCK_COST = 0.0745; // per RAM block per hour
        MBps = read_percentage*720/100 + write_percentage*160/100; // taking average
        B = 16*1024/(Variables.E);
        IOPS = MBps*Math.pow(10,6)/(B*Variables.E);
        if(IOPS > 30000)
        {
            IOPS = 30000;
        }
        monthly_storage_cost = storage*0.24;
    }
    if(cloud_provider == 2)
    {
        MIN_RAM_SIZE = 16; // GB
        RAM_BLOCK_COST = 0.0782; // per RAM block per hour
        B = 8*1024/(Variables.E);
        if(storage <= 32)
        {
            IOPS = 120;
            monthly_storage_cost = 5.28;
        }
        else if(storage > 32 && storage <= 64)
        {
            IOPS = 240;
            monthly_storage_cost = 10.21;
        }
        else if(storage > 64 && storage <= 128)
        {
            IOPS = 500;
            monthly_storage_cost = 19.71;
        }
        else if(storage > 128 && storage <= 256)
        {
            IOPS = 1100;
            monthly_storage_cost = 38.02;
        }
        else if(storage > 256 && storage <= 512)
        {
            IOPS = 2300;
            monthly_storage_cost = 73.22;
        }
        else if(storage > 512 && storage <= 2000)
        {
            IOPS = 5000;
            monthly_storage_cost = 135.17;
        }
        else
        {
            IOPS = 7500;
            monthly_storage_cost = 259.05;
        }
    }

    //console.log(cloud_provider+"====="+total_budget)
    return [B,monthly_storage_cost];
}

function setMaxRAMNeeded(Variables)
{
    if(total_budget <= 0)
    {
        console.log("\n************ INSUFFICIENT BUDGET FOR PRICING SCHEME *************\n");
        return 0;
    }
    //int i=0;
    var max_RAM_blocks = Math.floor((total_budget/(24*30*(RAM_BLOCK_COST))));
    if(max_RAM_blocks < 0)
    {
        console.log("\n************ INSUFFICIENT BUDGET FOR PRICING SCHEME *************\n");
        return 0;
    }
    var max_RAM_needed = ((Variables.N*Variables.E)/(1024.0*1024*1024)); // in GB
    if(MIN_RAM_SIZE*max_RAM_blocks <= max_RAM_needed) // what I can purchase is less than or equal to what I need
    {
        max_RAM_purchased = MIN_RAM_SIZE*max_RAM_blocks;
    }
    else // what I can purchase is more than what I need
    {
        max_RAM_purchased = Math.ceil(max_RAM_needed/MIN_RAM_SIZE)*MIN_RAM_SIZE;
    }
    //printf("\nmax_RAM_needed:%f \tmax_RAM_purchased:%f", max_RAM_needed, max_RAM_purchased);
    return 1;
}

function getCloudProvider(buttonName){
    var lsm_map = {
        "GCP":0,
        "AWS":1,
        "Azure":2
    }
    //var buttons = document.getElementsByName(buttonName);
    var buttons = document.getElementById(buttonName);
    var val=buttons.selectedIndex;
    //console.log("VAL="+val);
    /*
    for(var i = 0; i < buttons.length; i++){
        if(buttons[i].style.fontWeight=='bold'){
            val = lsm_map[buttons[i].id];
        }
    }*/
    return parseInt(val);
}

function initializeVMLibraries()
{
    var VM_libraries = new Array();
    for(var i=0;i<3;i++)
    VM_libraries.push(new VM_library());

    /* ********************************** initialize VMs of AWS *********************************  */

    VM_libraries[0].provider_name = "AWS";
    VM_libraries[0].no_of_instances = 6;
    VM_libraries[0].name_of_instance = new Array();
    VM_libraries[0].mem_of_instance = new Array();
    VM_libraries[0].rate_of_instance = new Array();

    VM_libraries[0].name_of_instance[0] = "r5d.large";
    VM_libraries[0].name_of_instance[1] = "r5d.xlarge";
    VM_libraries[0].name_of_instance[2] = "r5d.2xlarge";
    VM_libraries[0].name_of_instance[3] = "r5d.4xlarge";
    VM_libraries[0].name_of_instance[4] = "r5d.12xlarge";
    VM_libraries[0].name_of_instance[5] = "r5d.24xlarge";

    VM_libraries[0].mem_of_instance[0] = 16;
    VM_libraries[0].mem_of_instance[1] = 32;
    VM_libraries[0].mem_of_instance[2] = 64;
    VM_libraries[0].mem_of_instance[3] = 128;
    VM_libraries[0].mem_of_instance[4] = 384;
    VM_libraries[0].mem_of_instance[5] = 768;

    VM_libraries[0].rate_of_instance[0] = 0.091;
    VM_libraries[0].rate_of_instance[1] = 0.182;
    VM_libraries[0].rate_of_instance[2] = 0.364;
    VM_libraries[0].rate_of_instance[3] = 0.727;
    VM_libraries[0].rate_of_instance[4] = 2.181;
    VM_libraries[0].rate_of_instance[5] = 4.362;

    VM_libraries[0].num_of_vcpu = new Array();
    VM_libraries[0].num_of_vcpu[0] = 2;
    VM_libraries[0].num_of_vcpu[1] = 4;
    VM_libraries[0].num_of_vcpu[2] = 8;
    VM_libraries[0].num_of_vcpu[3] = 16;
    VM_libraries[0].num_of_vcpu[4] = 48;
    VM_libraries[0].num_of_vcpu[5] = 96;
    /* ********************************** initialize VMs of GCP *********************************  */

    VM_libraries[1].provider_name = "GCP";
    VM_libraries[1].no_of_instances = 7;
    VM_libraries[1].name_of_instance = new Array();
    VM_libraries[1].mem_of_instance = new Array();
    VM_libraries[1].rate_of_instance = new Array();

    VM_libraries[1].name_of_instance[0] = "n1-highmem-2";
    VM_libraries[1].name_of_instance[1] = "n1-highmem-4";
    VM_libraries[1].name_of_instance[2] = "n1-highmem-8";
    VM_libraries[1].name_of_instance[3] = "n1-highmem-16";
    VM_libraries[1].name_of_instance[4] = "n1-highmem-32";
    VM_libraries[1].name_of_instance[5] = "n1-highmem-64";
    VM_libraries[1].name_of_instance[6] = "n1-highmem-96";

    VM_libraries[1].mem_of_instance[0] = 13;
    VM_libraries[1].mem_of_instance[1] = 26;
    VM_libraries[1].mem_of_instance[2] = 52;
    VM_libraries[1].mem_of_instance[3] = 104;
    VM_libraries[1].mem_of_instance[4] = 208;
    VM_libraries[1].mem_of_instance[5] = 416;
    VM_libraries[1].mem_of_instance[6] = 624;

    VM_libraries[1].rate_of_instance[0] = 0.0745;
    VM_libraries[1].rate_of_instance[1] = 0.1491;
    VM_libraries[1].rate_of_instance[2] = 0.2981;
    VM_libraries[1].rate_of_instance[3] = 0.5962;
    VM_libraries[1].rate_of_instance[4] = 1.1924;
    VM_libraries[1].rate_of_instance[5] = 2.3849;
    VM_libraries[1].rate_of_instance[6] = 3.5773;

    VM_libraries[1].num_of_vcpu = new Array();
    VM_libraries[1].num_of_vcpu[0] = 2;
    VM_libraries[1].num_of_vcpu[1] = 4;
    VM_libraries[1].num_of_vcpu[2] = 8;
    VM_libraries[1].num_of_vcpu[3] = 16;
    VM_libraries[1].num_of_vcpu[4] = 32;
    VM_libraries[1].num_of_vcpu[5] = 64;
    VM_libraries[1].num_of_vcpu[6] = 96;

    /* ********************************** initialize VMs of AZURE *********************************  */

    VM_libraries[2].provider_name = "AZURE";
    VM_libraries[2].no_of_instances = 7;
    VM_libraries[2].name_of_instance = new Array();
    VM_libraries[2].mem_of_instance = new Array();
    VM_libraries[2].rate_of_instance = new Array();

    VM_libraries[2].name_of_instance[0] = "E2 v3";
    VM_libraries[2].name_of_instance[1] = "E4 v3";
    VM_libraries[2].name_of_instance[2] = "E8 v3";
    VM_libraries[2].name_of_instance[3] = "E16 v3";
    VM_libraries[2].name_of_instance[4] = "E20 v3";
    VM_libraries[2].name_of_instance[5] = "E32 v3";
    VM_libraries[2].name_of_instance[6] = "E64 v3";

    VM_libraries[2].mem_of_instance[0] = 16;
    VM_libraries[2].mem_of_instance[1] = 32;
    VM_libraries[2].mem_of_instance[2] = 64;
    VM_libraries[2].mem_of_instance[3] = 128;
    VM_libraries[2].mem_of_instance[4] = 160;
    VM_libraries[2].mem_of_instance[5] = 256;
    VM_libraries[2].mem_of_instance[6] = 512;

    VM_libraries[2].rate_of_instance[0] = 0.0782;
    VM_libraries[2].rate_of_instance[1] = 0.1564;
    VM_libraries[2].rate_of_instance[2] = 0.3128;
    VM_libraries[2].rate_of_instance[3] = 0.6256;
    VM_libraries[2].rate_of_instance[4] = 0.7409;
    VM_libraries[2].rate_of_instance[5] = 1.2512;
    VM_libraries[2].rate_of_instance[6] = 2.5024;

    VM_libraries[2].num_of_vcpu = new Array();
    VM_libraries[2].num_of_vcpu[0] = 2;
    VM_libraries[2].num_of_vcpu[1] = 4;
    VM_libraries[2].num_of_vcpu[2] = 8;
    VM_libraries[2].num_of_vcpu[3] = 16;
    VM_libraries[2].num_of_vcpu[4] = 20;
    VM_libraries[2].num_of_vcpu[5] = 32;
    VM_libraries[2].num_of_vcpu[6] = 64;

    //printVMLibraries();
   // console.log(VM_libraries)
    return VM_libraries;
}

function getAllVMCombinations(cloud_provider,VM_libraries)
{
    var no_of_instances=VM_libraries[cloud_provider].no_of_instances;
    var VMCombinations=new Array();
    for(var j = 0; j < no_of_instances; j++){
        for(var i = 1; i <= machines; i++){
            var VMCombination=new Array();
            for(var k = 0; k < no_of_instances; k++){
                if(k==j)
                    VMCombination[k]=i;
                else
                    VMCombination[k]=0;
            }
            VMCombinations.push(VMCombination);
        }
    }
    //console.log(VMCombinations);
    return VMCombinations;
}

function getBestDesignArray(result_array) {
    var last_x = result_array[0][0];
    var best_y = -1;
    var best_design_index;
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
            bestDesignArray.push(result_array[best_design_index]);
            best_design_index = i;
        }
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


