var input;
var cost;
var existing_systems;
var query_count = 10000000;
var read_percentage = 50;
var write_percentage = 100 - read_percentage;
var short_scan_percentage = 0;
var s = 64;
var head ;
var total_budget;
var max_RAM_purchased; // in GB
var U = 100000000000000;
// static double U = 300000000;
var p_put = 0.2; // fraction of the time that you call get on elements in U_1
var U_1 = 100000;
var U_2 = 1000000000000;
// NOTE: it must always be true that (p_put / U_1) > (1 / U_2)
var p_get = 0.05;
var B_;

var MIN_RAM_SIZE;
var RAM_BLOCK_COST;
var IOPS;
var network_bandwidth;

var machines = 30;
var workload_type = 0;

var time_unit;
var M_BC;

var global_continuums_array;
var global_progress;
var global_input=0;
var if_display = 0;

var compression_libraries;
var using_compression=false;

var SLA_factors;
var enable_SLA=false;
var enable_DB_migration = true;
var enable_dev_ops = true;
var enable_backup = true;
var enable_availability = false;
var enable_durability = false;
var enable_CLL = false;
var enable_Rosetta = true;
var enable_parallelism = true;

var cri_count=0;
var cri_miss_count=0;
var dri_count=0;
var dri_miss_count=0;
var cri_cache;
var dri_cache;
var log=new Array();

var cloud_provider_num=3;
var cloud_provider_enable=[1,1,1];

var B_TREE_CACHE_DISCOUNT_FACTOR = 0.1 // B-Tree cache discounting factor (set empirically)

var prop_of_parallelizable_code_reads_Cosine = 0.9647;
var prop_of_parallelizable_code_writes_Cosine = 0.797;

var prop_of_parallelizable_code_reads_Cosine_LSH = 0.97;
var prop_of_parallelizable_code_writes_Cosine_LSH = 0.9;

var prop_of_parallelizable_code_reads_rocks = 0.9609;
var prop_of_parallelizable_code_writes_rocks = 0.8017;

var prop_of_parallelizable_code_reads_FASTER = 0.9922;
var prop_of_parallelizable_code_writes_FASTER = 0.9761;

var prop_of_parallelizable_code_reads_WT = 0.94;
var prop_of_parallelizable_code_writes_WT = 0.25;

var overall_prop_parallelizable_code = 1;

/**
 * Variables is an object that contains information related to each design entry. Each design is made of
 * an array of such objects.
 * @constructor
 */
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
    var qEL;

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
    var empty_long_scan_cost;
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

/**
 * @returns the input given by the posted message from the worker in an object format.
 * For the input variable check the onmessage function that is activated on the case of MessageEvent
 */
function parseInputVariables()
{
    return Object.assign({},input);
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
    SLA_factors[1].dev_ops=new Array();

    SLA_factors[1].dev_ops[0]=0.1184;
    SLA_factors[1].dev_ops[1]=0.2368;
    SLA_factors[1].dev_ops[2]=0.4736;
    SLA_factors[1].dev_ops[3]=0.9472;
    SLA_factors[1].dev_ops[4]=1.8944;
    SLA_factors[1].dev_ops[5]=3.7888;
    SLA_factors[1].dev_ops[6]=5.6832;


    SLA_factors[0].backup = 0.05; // $0.05 per GB-Month
    SLA_factors[1].backup = 0.17; // $0.170 per GB/month for SSD storage capacity
    SLA_factors[2].backup = 0.0448; // $0.0448 per GB

    /******************** Other Factors ********************/
}

function computeSLARelatedCost(cloud_provider,N,E)
{
    if(enable_DB_migration && enable_backup)
    {
        return (SLA_factors[cloud_provider].DB_migration_cost + SLA_factors[cloud_provider].backup)*(N*E)/(1024*1024*1024);
    }
    else if(enable_DB_migration && !enable_backup)
    {
        return (SLA_factors[cloud_provider].DB_migration_cost)*(N*E)/(1024*1024*1024);
    }
    else if(!enable_DB_migration && enable_backup)
    {
        return (SLA_factors[cloud_provider].backup)*(N*E)/(1024*1024*1024);
    }
    return 0;
}

/**
 * This function creates the Cosine continuum. It tries to find the best latency between LSM, BTREE and
 * LSH configurations and returns the best one.
 * @param combination
 * @param cloud_provider
 * @param compression_style
 * @returns a Variables Object, updated with optimized parameters in regards to the initial input
 */

function navigateDesignSpace(combination, cloud_provider, compression_style=0) {
    var Variables = parseInputVariables();
    var data;
    var E = Variables.E;
    var F = Variables.F;
    var N = Variables.N;

    var B = Math.floor(Variables.B/E);
    var s = Variables.s;

    var insert_percentage = Variables.insert_percentage;
    var blind_update_percentage = Variables.blind_update_percentage;
    var rmw_percentage = Variables.rmw_percentage;
    var r = Variables.r;
    var v = Variables.v;
    var qL = Variables.qL;
    var qEL = Variables.qEL;
    var qS = Variables.qS;
    var scenario = 'A';//Variables.scenario;

    var query_count=Variables.query_count;

    var VM_libraries=initializeVMLibraries();
    write_percentage = insert_percentage;
    read_percentage = v;
    //Variables.cost=cost;

    if(using_compression==true){
        E=(1-compression_libraries[compression_style].space_reduction_ratio)*E;
        F=(1-compression_libraries[compression_style].space_reduction_ratio)*F;
        Variables.E=E;
        Variables.F=F;
    }

    var SLA_cost=computeSLARelatedCost(cloud_provider,Variables.N,Variables.E);

    var X;
    var Y = 0;
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

    var best_IO=-1;
    var best_latency=-1;

    var mem_sum;
    var monthly_mem_cost;

    var log_array=new Array();
    var total_IO = 0;
    var update_cost;
    var blind_update_cost;
    var rmw_cost;
    var read_cost;
    var no_result_read_cost;
    var short_scan_cost;
    var long_scan_cost;
    var empty_long_scan_cost;

    for(var i=0;i<VM_libraries[cloud_provider].no_of_instances;i++){
        if(combination[i]>0){
            mem_sum=combination[i]*VM_libraries[cloud_provider].mem_of_instance[i];
            max_RAM_purchased=VM_libraries[cloud_provider].mem_of_instance[i];
            monthly_mem_cost=combination[i]*VM_libraries[cloud_provider].rate_of_instance[i]*24*30;
            Variables.VM_info= (mem_sum+" X "+VM_libraries[cloud_provider].name_of_instance[i]);
            Variables.VM_instance= VM_libraries[cloud_provider].name_of_instance[i];
            Variables.VM_instance_num=mem_sum;
            Variables.Vcpu_num=VM_libraries[cloud_provider].num_of_vcpu[i];

            if(enable_SLA == 1 && enable_dev_ops) // for AWS and Azure
            {
                var dev_ops_cost;

                if(cloud_provider != 1){
                    dev_ops_cost = SLA_factors[cloud_provider].dev_ops * combination[i];
                } else {
                    dev_ops_cost = SLA_factors[cloud_provider].dev_ops[i] * combination[i];
                }
                SLA_cost += dev_ops_cost;
            }
        }
    }

    B_=B;
    data=max_RAM_purchased*Variables.N/mem_sum;
    M_BC=0;
    var M_B;


    var M = max_RAM_purchased*1024*1024*1024;
    var workload = max_RAM_purchased*query_count/mem_sum;

    if (fitsInMemory(M, data, E)){
        Variables.total_cost = 0;
        Variables.latency = 0;
        Variables.cost = (monthly_storage_cost + monthly_mem_cost).toFixed(3);
        Variables.cloud_provider = cloud_provider;
        Variables.memory_footprint=max_RAM_purchased*mem_sum;
        return Variables;
    }
    // **********************************************************************
    // BTREE design space
    // **********************************************************************
    var M_B_percent = 20;
    while(M_B_percent < 100) {
        M_B = M_B_percent*M/100;
        M_FP = M - M_B;
        M_B = M_B - M_BC;
        M_BF = 0.0;
        M_F = M_FP + M_BF;
        for (var T = 32; T<=128; T = T*2) {
            var K = 1;
            var Z = 1;
            if (scenario == 'A') {
                L = getNoOfLevelsAvgCase(M_B, T, data, E)
            } else {
                L = getNoOfLevels(M_B, T, data, E)
            }
            if(scenario=='A'){
                update_cost = analyzeUpdateCostAvgCase(T, K, Z, L, Y, M, M_F, M_B, E, B);
                read_cost = analyzeReadCostAvgCase(FPR_sum, T, K, Z, L, Y, M, M_B, M_F, M_BF, data, E, Math.ceil(M_B), Math.ceil(E), compression_style);
                long_scan_cost = analyzeLongScanCostAvgCase(T, K, Z, L, Y, M, M_B, M_F, M_BF, data, s, B, E);
                empty_long_scan_cost = 1; //1 I/O to figure out that the query is empty
            }else {
                update_cost = analyzeUpdateCost(B, T, K, Z, L, Y, M, M_F, M_B, M_F_HI, M_F_LO);
                read_cost = analyzeReadCost(B, E, data, T, K, Z, L, Y, M, M_B, M_F, M_BF, FPR_sum);
                long_scan_cost = analyzeLongScanCost(s, B, Z);
                empty_long_scan_cost = analyzeLongScanCost(s, B, Z);

            }
            no_result_read_cost = analyzeReadCost(B, E, data, T, K, Z, L, Y, M, M_B, M_F, M_BF, FPR_sum) - 1;
            rmw_cost = read_cost + 1.0/B;
            blind_update_cost = read_cost + 1.0/B;

            total_IO = workload*(insert_percentage*update_cost + v*read_cost + r*no_result_read_cost + rmw_percentage*rmw_cost + blind_update_percentage*blind_update_cost + qL*long_scan_cost + qEL*empty_long_scan_cost);

            var total_latency= total_IO / IOPS / 60 / 60 / 24; // Maybe divide this by 1024*1024*1024

            if(L==0)
                total_latency=0;

            if (total_latency < best_latency || best_latency < 0) {
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
                Variables.rmw_cost = rmw_cost;
                Variables.blind_update_cost = blind_update_cost;
                Variables.short_scan_cost = short_scan_cost;
                Variables.long_scan_cost = long_scan_cost;
                Variables.empty_long_scan_cost = empty_long_scan_cost;
                Variables.no_result_read_cost = no_result_read_cost;
                Variables.total_cost = total_IO;
                Variables.latency = total_latency;
                Variables.cost = (monthly_storage_cost + monthly_mem_cost).toFixed(3);
                if(enable_SLA){
                    Variables.cost = (monthly_storage_cost + monthly_mem_cost + SLA_cost).toFixed(3);
                }
                Variables.memory_footprint=max_RAM_purchased*mem_sum;
                Variables.cloud_provider=cloud_provider;
                Variables.throughput=mem_sum*IOPS/total_IO;
                Variables.compression_name=compression_libraries[compression_style].compression_name;
                Variables.FPR=getFPR(T, K, Z, L, Y, M, M_B, M_F, M_BF, data);
                Variables.SLA_cost=SLA_cost;
                Variables.data_structure="B-tree";
            }
        }
        M_B_percent += 0.5;
    }

    // **********************************************************************
    // LSM design space
    // **********************************************************************
    var break_from_loop = false;
    M_B_percent = 20;
    while (M_B < M) {
        M_B = M_B_percent*M/100;
        for (T=2; T<=15; T++) {
            for (K=1; K<=T-1; K++) {
                for (Z=1; Z<=T-1; Z++) {
                    break_from_loop = false;
                    for (var C=1; C<=T-1 && !break_from_loop; C++){
                        X = getX(T, K, Z);
                        M_F_HI = data*((X/8)/T + F/B);
                        M_F_LO = getM_F_LO(M_B, M, T, data, B, E, F);
                        if (M_B + M_F_LO > M) {
                            continue;
                        }
                        M_F = set_M_F(M_F, M_B, M, M_F_HI, M_F_LO)
                        if (scenario == 'A') {
                            L = getNoOfLevelsAvgCase(M_B, T, data, E);
                        } else {
                            L = getNoOfLevels(M_B, T, data, E);
                        }
                        var temp = getY(M_FP, M_F, M_F_HI, M_F_LO, X, T, L, data, F, B);
                        Y = temp.Y;
                        M_FP = temp.M_FP;

                        if (Y == 0 && enable_CLL && C!= -1) {
                            L = getNoOfLevelsWacky(M_B, T, data, C, E);
                        } else {
                            break_from_loop = true;
                        }

                        M_BF = getM_BF(M_F, M_FP);
                        if(scenario=='A'){
                            update_cost = analyzeUpdateCostAvgCase(T, K, Z, L, Y, M, M_F, M_B, E, B);
                            read_cost = analyzeReadCostAvgCase(FPR_sum, T, K, Z, L, Y, M, M_B, M_F, M_BF, data, E, Math.ceil(M_B), Math.ceil(E), compression_style);
                            long_scan_cost = analyzeLongScanCostAvgCase(T, K, Z, L, Y, M, M_B, M_F, M_BF, data, s, B, E);
                            empty_long_scan_cost = analyzeEmptyLongScanCost(K, Z, L, Y, N, M_BF, data, U);
                        }else {
                            update_cost = analyzeUpdateCost(B, T, K, Z, L, Y, M, M_F, M_B, M_F_HI, M_F_LO);
                            read_cost = analyzeReadCost(B, E, data, T, K, Z, L, Y, M, M_B, M_F, M_BF, FPR_sum);
                            long_scan_cost = analyzeLongScanCost(s, B, Z);
                            empty_long_scan_cost = long_scan_cost;

                        }

                        rmw_cost = update_cost + read_cost;
                        blind_update_cost = update_cost;
                        short_scan_cost = analyzeShortScanCost(B, T, K, Z, L, Y)
                        no_result_read_cost = read_cost - 1;
                        total_IO = workload*(insert_percentage*update_cost + v*read_cost + r*no_result_read_cost + rmw_percentage*rmw_cost + blind_update_percentage*blind_update_cost + qL*long_scan_cost + qEL*empty_long_scan_cost);


                        total_latency= total_IO / IOPS / 60 / 60 / 24; // Maybe divide this by 1024*1024*1024

                        if(L==0)
                            total_latency=0;
                        if (total_latency < best_latency || best_latency < 0) {
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
                            Variables.rmw_cost = rmw_cost;
                            Variables.blind_update_cost = blind_update_cost;
                            Variables.short_scan_cost = short_scan_cost;
                            Variables.long_scan_cost = long_scan_cost;
                            Variables.empty_long_scan_cost = empty_long_scan_cost;

                            Variables.no_result_read_cost = no_result_read_cost;
                            Variables.total_cost = total_IO;
                            Variables.latency = total_latency;
                            Variables.cost = (monthly_storage_cost + monthly_mem_cost).toFixed(3);
                            if(enable_SLA){
                                Variables.cost = (monthly_storage_cost + monthly_mem_cost + SLA_cost).toFixed(3);
                            }
                            Variables.memory_footprint=max_RAM_purchased*mem_sum;
                            Variables.cloud_provider=cloud_provider;
                            Variables.throughput=mem_sum*IOPS/total_IO;
                            Variables.compression_name=compression_libraries[compression_style].compression_name;
                            Variables.FPR=getFPR(T, K, Z, L, Y, M, M_B, M_F, M_BF, data);
                            Variables.SLA_cost=SLA_cost;
                            Variables.data_structure="LSM";
                        }
                    }
                }
            }
        }
        M_B_percent = M_B_percent + 20;
    }

    // **********************************************************************
    // LSH design space
    // **********************************************************************
    M_B = 0.0;
    M_B_percent = 20;
    var scale_factor = 8;
    M_F = data / scale_factor * F * (1.0 + (1.0 / B));
//    for (var T = 2; T <= 32; T++)
    {
        for (Z = -1; Z <= 0; Z++) {
            if (M_F > M) {
                continue;
            }
            M_B = M - M_F;
            T = Math.ceil(data*E/M_B);
            K = T - 1;
            L = 1;
            Y = 0;
            M_BF = 0.0;
            if (scenario == 'A') {
                update_cost = analyzeUpdateCostAvgCase(T, K, Z, L, Y, M, M_F, M_B, E, B);
                read_cost = analyzeReadCostAvgCase(FPR_sum, T, K, Z, L, Y, M, M_B, M_F, M_BF, data, E, Math.ceil(M_B), Math.ceil(E), compression_style);
            } else {
                update_cost = analyzeUpdateCost(B, T, K, Z, L, Y, M, M_F, M_B, M_F_HI, M_F_LO);
                read_cost = analyzeReadCost(B, E, data, T, K, Z, L, Y, M, M_B, M_F, M_BF, FPR_sum);
            }
            rmw_cost = read_cost + 1.0 / B;
            blind_update_cost = read_cost + 1.0 / B;
            short_scan_cost = analyzeShortScanCost(B, T, K, Z, L, Y)
            long_scan_cost = analyzeLongScanCostAvgCase(T, K, Z, L, Y, M, M_B, M_F, M_BF, data, s, B, E);
            empty_long_scan_cost = 1;
            no_result_read_cost = read_cost - 1;
            total_IO = workload*(insert_percentage*update_cost + v*read_cost + r*no_result_read_cost + rmw_percentage*rmw_cost + blind_update_percentage*blind_update_cost + qL*long_scan_cost + qEL*empty_long_scan_cost);


            total_latency = total_IO / IOPS / 60 / 60/ 24; // Maybe divide this by 1024*1024*1024

            if (L == 0)
                total_latency = 0;

            if (total_latency < best_latency || best_latency < 0) {
                best_latency = total_latency;
                Variables.K = K;
                Variables.T = T;
                Variables.L = L;
                Variables.Z = T-1; // Z was set to 0 or -1 for engineering purposes, in reality it's this
                Variables.Y = Y;
                Variables.Buffer = M_B;
                Variables.M_BF = M_BF;
                Variables.M_FP = 0;
                Variables.M_F = M_F;
                Variables.read_cost = read_cost;
                Variables.update_cost = update_cost;
                Variables.rmw_cost = rmw_cost;
                Variables.blind_update_cost = blind_update_cost;
                Variables.short_scan_cost = short_scan_cost;
                Variables.long_scan_cost = long_scan_cost;
                Variables.empty_long_scan_cost = empty_long_scan_cost;
                Variables.no_result_read_cost = no_result_read_cost;
                Variables.total_cost = total_IO;
                Variables.latency = total_latency;
                Variables.cost = (monthly_storage_cost + monthly_mem_cost).toFixed(3);

                if (enable_SLA) {
                    Variables.cost = (monthly_storage_cost + monthly_mem_cost + SLA_cost).toFixed(3);
                }
                Variables.memory_footprint = max_RAM_purchased * mem_sum;
                Variables.cloud_provider = cloud_provider;
                Variables.throughput = mem_sum * IOPS / total_IO;
                Variables.compression_name = compression_libraries[compression_style].compression_name;
                Variables.FPR = getFPR(T, K, Z, L, Y, M, M_B, M_F, M_BF, data);
                Variables.SLA_cost = SLA_cost;
                Variables.data_structure = "LSH";
            }
            if (Variables.total_cost == 0) {
                Variables.total_cost = 0.1;
            }
        }
    }

    scale_factor = 8;
    M_F = data / scale_factor * F * (1.0 + (1.0 / B));
    if (M_F < M){
        M_B = M - M_F;
        T = Math.ceil(data*E/M_B);
        K=T-1;
        Z=-1;
        M_BF=0;
        Y=0;
        M_BC=0;
        L=1;
        if (scenario == 'A') {
            update_cost = analyzeUpdateCostAvgCase(T, K, Z, L, Y, M, M_F, M_B, E, B);
            read_cost = analyzeReadCostAvgCase(FPR_sum, T, K, Z, L, Y, M, M_B, M_F, M_BF, data, E, Math.ceil(M_B), Math.ceil(E), compression_style);
        } else {
            update_cost = analyzeUpdateCost(B, T, K, Z, L, Y, M, M_F, M_B, M_F_HI, M_F_LO);
            read_cost = analyzeReadCost(B, E, data, T, K, Z, L, Y, M, M_B, M_F, M_BF, FPR_sum);
        }
        rmw_cost = read_cost + 1.0 / B;
        blind_update_cost = read_cost + 1.0 / B;
        short_scan_cost = analyzeShortScanCost(B, T, K, Z, L, Y)
        long_scan_cost = analyzeLongScanCostAvgCase(T, K, Z, L, Y, M, M_B, M_F, M_BF, data, s, B, E);
        empty_long_scan_cost = 1;
        no_result_read_cost = read_cost - 1;
        total_IO = workload*(insert_percentage*update_cost + v*read_cost + r*no_result_read_cost + rmw_percentage*rmw_cost + blind_update_percentage*blind_update_cost + qL*long_scan_cost + qEL*empty_long_scan_cost);


        total_latency = total_IO / IOPS / 60 / 60/ 24; // Maybe divide this by 1024*1024*1024

        if (L == 0)
            total_latency = 0;

        if (total_latency < best_latency || best_latency < 0) {
            best_latency = total_latency;
            Variables.K = K;
            Variables.T = T;
            Variables.L = L;
            Variables.Z = T-1; // Z was set to 0 or -1 for engineering purposes, in reality it's this
            Variables.Y = Y;
            Variables.Buffer = M_B;
            Variables.M_F = M_F;
            Variables.M_BF = M_BF;
            Variables.M_FP = 0;
            Variables.read_cost = read_cost;
            Variables.update_cost = update_cost;
            Variables.rmw_cost = rmw_cost;
            Variables.blind_update_cost = blind_update_cost;
            Variables.short_scan_cost = short_scan_cost;
            Variables.long_scan_cost = long_scan_cost;
            Variables.empty_long_scan_cost = empty_long_scan_cost;

            Variables.no_result_read_cost = no_result_read_cost;
            Variables.total_cost = total_IO;
            Variables.latency = total_latency;

            Variables.cost = (monthly_storage_cost + monthly_mem_cost).toFixed(3);
            if (enable_SLA) {
                Variables.cost = (monthly_storage_cost + monthly_mem_cost + SLA_cost).toFixed(3);
            }
            Variables.memory_footprint = max_RAM_purchased * mem_sum;
            Variables.cloud_provider = cloud_provider;
            Variables.throughput = mem_sum * IOPS / total_IO;
            Variables.compression_name = compression_libraries[compression_style].compression_name;
            Variables.FPR = getFPR(T, K, Z, L, Y, M, M_B, M_F, M_BF, data);
            Variables.SLA_cost = SLA_cost;
            Variables.data_structure = "LSH";
        }
        if (Variables.total_cost == 0) {
            Variables.total_cost = 0.1;
        }
    }

    Variables.if_classic=false;
    if(Variables.K==1&&Variables.Z==1)
        Variables.if_classic=true;
    if(Variables.K==(Variables.T-1)&&Variables.Z==(Variables.T-1))
        Variables.if_classic=true;
    if(Variables.K==(Variables.T-1)&&Variables.Z==1)
        Variables.if_classic=true;
    if(Variables.data_structure=="LSH"||Variables.data_structure=="B-tree")
        Variables.if_classic=true;
    if(enable_parallelism){
        setOverallPropParallelizableCode(Variables);
        Variables.latency  = speedup(Variables);
    }
    return Variables;
}

/**
 * Function to compute the parallelization speed up parameter for Cosine
 * @param Variables
 */
function setOverallPropParallelizableCodeForExistingSystem(Variables, existing_system) {
    if(enable_parallelism)
    {
            if(existing_system == "rocks") // RocksDB
            {
                overall_prop_parallelizable_code = ((Variables.v + Variables.rmw_percentage + Variables.qL + Variables.qEL)*prop_of_parallelizable_code_reads_rocks) + ((Variables.insert_percentage + Variables.blind_update_percentage)*prop_of_parallelizable_code_writes_rocks);
            }
            else if (existing_system == "FASTER" && existing_system == "FASTER_H") // Any FASTER version
            {
                overall_prop_parallelizable_code = ((Variables.v + Variables.rmw_percentage + Variables.blind_update_percentage + Variables.qL + Variables.qEL)*prop_of_parallelizable_code_reads_FASTER) + (Variables.insert_percentage*prop_of_parallelizable_code_writes_FASTER);
            }
            else if(existing_system=="WT") // WiredTiger
            {

                overall_prop_parallelizable_code = ((Variables.v + Variables.rmw_percentage + Variables.blind_update_percentage + Variables.qL + Variables.qEL)*prop_of_parallelizable_code_reads_WT) + (Variables.insert_percentage*prop_of_parallelizable_code_writes_WT);
            }
    }
    else
    {
        overall_prop_parallelizable_code = 1.0;
    }
}

/**
 * Function to compute the parallelization speed up parameter for Cosine
 * @param Variables
 */
function setOverallPropParallelizableCode(Variables){
    if (enable_parallelism){
        if(Variables.data_structure=="LSH")
        {
            overall_prop_parallelizable_code = (Variables.v + Variables.rmw_percentage + Variables.blind_update_percentage + Variables.qL + Variables.qEL)*prop_of_parallelizable_code_reads_Cosine_LSH + Variables.insert_percentage*prop_of_parallelizable_code_writes_Cosine_LSH;
        }
        else
        {
            overall_prop_parallelizable_code = (Variables.v + Variables.rmw_percentage + Variables.blind_update_percentage + Variables.qL + Variables.qEL)*prop_of_parallelizable_code_reads_Cosine + Variables.insert_percentage*prop_of_parallelizable_code_writes_Cosine;
        }
    } else {
        overall_prop_parallelizable_code = 1;
    }
}

/**
 * Function to return the latency after taking into account the parallelization factor
 * @param Variables
 * @returns the sped up latency after parallelization
 */
function speedup(Variables){
    var speedup_factor;
    speedup_factor = 1.0 / (1.0 - (overall_prop_parallelizable_code * (1.0 - (1.0/Variables.Vcpu_num))));
    return Variables.latency/speedup_factor;
}

/**
 * A check created to ensure that the data don't fit in memory. If they do, there is no point of continuing
 * with the continuum.
 * @param M
 * @param data
 * @param E
 * @returns {boolean}
 */
function fitsInMemory(M, data, E){
    if (M >= data*E){
        return true;
    }
    return false;
}

function getM_F_LO(M_B, M, T, data, B, E, F){
    var M_F_LO;
    if (data/B < M_B*T/(B*E)) {
        M_F_LO = data/B*F;
    } else {
        M_F_LO = M_B*F*T/(B*E);
    }
    return M_F_LO;
}

function getM_BF(M_F, M_FP){
    var MARGIN = 2;
    var M_BF = 0;
    if ((M_F - M_FP) > 0){
        M_BF = M_F - M_FP - MARGIN;
    } else {
        M_BF = 0;
    }
    return M_BF;
}

function set_M_F(M_F, M_B, M, M_F_HI, M_F_LO) {
    M_F = M - M_B;
    if (M_F < M_F_LO) {
        M_F = M_F_LO;
    }
    return M_F;
}

function getX(T, K, Z){
    var x = Math.pow(1 / Math.log(2), 2) * (Math.log(T) / 1 / (T - 1) + Math.log(K / Z) / T) * 8;
    if (x < 0) {
        return 0;
    }
    return x;
}

function getY(M_FP, M_F, M_F_HI, M_F_LO, X, T, L, data, F, B) {
    var Y, i, h, c, temp_M_FP, act_M_FP;
    if (M_F >= M_F_HI) {
        c = 1;
        Y = 0;
        M_FP = data*F/B;
    } else if (M_F > M_F_LO && M_F < M_F_HI) {
        c = 2;
        Y = L - 1;
        M_FP = M_F_LO;
        for(i=L-2;i>=1;i--)
        {
            h = L - i;
            temp_M_FP = M_F_LO;
            for(var j = 2; j <= h; j++) {
                temp_M_FP = temp_M_FP + (temp_M_FP*T);
            }
            if(temp_M_FP <= M_F) {
                Y = i;
                M_FP = temp_M_FP;
            }
        }
    } else {
        c = 3;
        Y = L-1;
        M_FP = M_F_LO;
    }
    return {
        Y,
        M_FP
    };
}

function getNoOfLevelsWacky(L, M_B, T, data, C, E)
{
    if(M_B == 0)
    {
        console.log("ERROR!!!! Buffer memory should never be set to 0.");
        L = 0; // This is not really true. If
    }
    else
    {
        var multiplier_from_buffer = data*(E) / (M_B);
        // handle case where data fits in buffer
        if (multiplier_from_buffer < 1){
            multiplier_from_buffer = 1;
        }
        L = Math.ceil(Math.log(multiplier_from_buffer * (T-1) / (C+1))/Math.log(T));
    }
    return L;
}

function getNoOfLevels(M_B, T, data, E)
{
    var L;
    if(M_B == 0)
    {
        console.log("ERROR!!!! Buffer memory should never be set to 0.");
        L = 0; // This is not really true. If
    }
    else
    {
        var multiplier_from_buffer = data*(E / M_B);
        // handle case where data fits in buffer
        if (multiplier_from_buffer < 1){
            multiplier_from_buffer = 1;
        }
        L = Math.ceil(Math.log(multiplier_from_buffer)/Math.log(T));
    }
    return L;
}

function getNoOfLevelsAvgCase(M_B, T, data, E)
{
    var universe_max = workload_type == 0 ? U : U_1 + U_2;
    if (workload_type == 1) {
        universe_max = U_1 + (1 - p_put) * (data);
    }
    var size = universe_max < data ? universe_max : data;
    return getNoOfLevels(M_B, T, size, E);
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

/**
 * This creates the continuum for existing designs (rocks, WT, FASTER, FASTER_H)
 * @param combination
 * @param cloud_provider
 * @param existing_system rocks, WT, FASTER, FASTER_H
 * @param compression_style
 * @returns Variables object
 */
function navigateDesignSpaceForExistingDesign(combination, cloud_provider, existing_system, compression_style=0) {
    var Variables = parseInputVariables();
    var data;
    var N = Variables.N;

    var E = Variables.E;
    var F = Variables.F;

    var B = Math.floor(Variables.B/E);
    var s = Variables.s;

    var insert_percentage = Variables.insert_percentage;
    var blind_update_percentage = Variables.blind_update_percentage;
    var rmw_percentage = Variables.rmw_percentage;
    var r = Variables.r;
    var v = Variables.v;
    var qL = Variables.qL;
    var qS = Variables.qS;
    var qEL = Variables.qEL;
    var scenario = 'A';//Variables.scenario;

    var query_count=Variables.query_count;

    var VM_libraries=initializeVMLibraries();
    write_percentage = insert_percentage;
    read_percentage = v;
    //Variables.cost=cost;

    if(using_compression==true){
        E=(1-compression_libraries[compression_style].space_reduction_ratio)*E;
        F=(1-compression_libraries[compression_style].space_reduction_ratio)*F;
        Variables.E=E;
        Variables.F=F;
    }

    var SLA_cost=computeSLARelatedCost(cloud_provider,Variables.N,Variables.E);

    var X;
    var Y = 0;
    var L;
    var M_F_HI;
    var M_F; // = ((B*E + (M - M_F)) > 0 ? B*E + (M - M_F) : (B*E)); // byte
    var M_F_LO; // = (M_B*(F)*T)/((B)*(E));
    var M_BF;
    var M_FP;
    var FPR_sum = 1

    var Storage_Value=getStorageCost(Variables, cloud_provider);
    B=Storage_Value[0];
    var monthly_storage_cost=Storage_Value[1];

    var best_IO=-1;
    var best_latency=-1;

    var mem_sum;
    var monthly_mem_cost;

    var log_array=new Array();

    var total_IO = 0;
    var update_cost;
    var blind_update_cost;
    var rmw_cost;
    var read_cost;
    var no_result_read_cost;
    var short_scan_cost;
    var long_scan_cost;
    var empty_long_scan_cost;

    for(var i=0;i<VM_libraries[cloud_provider].no_of_instances;i++){
        if(combination[i]>0){
            mem_sum=combination[i]*VM_libraries[cloud_provider].mem_of_instance[i];
            max_RAM_purchased=VM_libraries[cloud_provider].mem_of_instance[i];
            monthly_mem_cost=combination[i]*VM_libraries[cloud_provider].rate_of_instance[i]*24*30;
            Variables.VM_info= (mem_sum+" X "+VM_libraries[cloud_provider].name_of_instance[i]);
            Variables.VM_instance= VM_libraries[cloud_provider].name_of_instance[i];
            Variables.VM_instance_num=mem_sum;
            Variables.Vcpu_num=VM_libraries[cloud_provider].num_of_vcpu[i];

            if(enable_SLA == 1 && enable_dev_ops) // for AWS and Azure
            {
                var dev_ops_cost;

                if(cloud_provider != 1){
                    dev_ops_cost = SLA_factors[cloud_provider].dev_ops * combination[i];
                } else {
                    dev_ops_cost = SLA_factors[cloud_provider].dev_ops[i] * combination[i];
                }
                SLA_cost += dev_ops_cost;
            }
        }
    }

    B_=B;
    data=max_RAM_purchased*Variables.N/mem_sum;
    M_BC=0;
    var M_B;

    var M = max_RAM_purchased * 1024 * 1024 * 1024;
    var workload = max_RAM_purchased*query_count/mem_sum;

    if (fitsInMemory(M, data, E)){
        Variables.total_cost = 0;
        Variables.latency = 0;

        Variables.cost = (monthly_storage_cost + monthly_mem_cost).toFixed(3);
        Variables.cloud_provider = cloud_provider;
        Variables.memory_footprint=max_RAM_purchased*mem_sum;
        return Variables;
    }
    if(existing_system=="rocks") {
        var T = 10;
        var K = 1;
        var Z = 1;
        Y = 0;
        M_FP = data * F / B;
        M_BF = data * 10.0 / 8.0; // 10 bits/entry in RocksDB is default and convert to byte because everything else is in byte
        M_F = M_FP + M_BF;
        if (M_F >= M) {
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
        M_B = M * (B*E) / ( (F*T) + (B*E) );
        M_FP = M - M_B;
        M_BF = 0.0; // 10 bits/entry in RocksDB is default and convert to byte because everything else is in byte
        M_F = M_FP + M_BF;
        if(M_F >= M)
        {
            return -1;
        }
        // WT uses 50% of memory to cache
        //M_BC = M_B/2.0;
        M_BC=0;
        //M_B = M_B - M_BC;
        //scenario == 'A'? getNoOfLevelsAvgCase(&L, M_B, T, data) : getNoOfLevels(&L, M_B, T, data);
    }
    if(existing_system=="FASTER")
    {
        var scale_factor = 8; // We assume about 1000 keys fit in the in-memory hash table
        M_F = (data/scale_factor)*(F)*(1.0 + (1.0/B));
        if(M_F >= M)
        {
            //printf("M: %f M_F: %f\n", M/(1024*1024*1024), M_F/(1024*1024*1024));
            return -1;
        }
        M_B = M - M_F;
        T = Math.ceil((data*E)/M_B);
        K = T-1;
        Z = 0;
        L=1;
        M_BF = 0.0;
        Y = 0;
        M_BC = 0.0;
        //printf("T:%d, K:%d, Z:%d, M_B:%f, M_F:%f\n", T, K, Z, M_B/(1024*1024*1024), M_F/(1024*1024*1024));
    }
    if(existing_system=="FASTER_H")
    {
        var scale_factor = 8; // We assume about 1000 keys fit in the in-memory hash table
        M_F = (data/scale_factor)*(F)*(1.0 + (1.0/B));
        if(M_F >= M)
        {
            //printf("M: %f M_F: %f\n", M/(1024*1024*1024), M_F/(1024*1024*1024));
            return -1;
        }
        M_B = M - M_F;
        T = Math.ceil((data*E)/M_B);
        K = T-1;
        Z = -1;
        L=1;
        M_BF = 0.0;
        Y = -1;
        M_BC = 0.0;
        //printf("T:%d, K:%d, Z:%d, M_B:%f, M_F:%f\n", T, K, Z, M_B/(1024*1024*1024), M_F/(1024*1024*1024));
    }
    if (existing_system != "FASTER" && existing_system != "FASTER_H"){
        if (scenario == 'A') {
            L = getNoOfLevelsAvgCase(M_B, T, data, E);
        } else {
            L = getNoOfLevels(M_B, T, data, E);
        }
    }

    if (L<=0) {
        //return -1;
    }

    if(existing_system=="WT")
        Y = L;

    cost = (monthly_storage_cost + monthly_mem_cost).toFixed(3);
    existing_systems = existing_system;

    if(scenario=='A'){
        update_cost = analyzeUpdateCostAvgCase(T, K, Z, L, Y, M, M_F, M_B, E, B);
        read_cost = analyzeReadCostAvgCase(FPR_sum, T, K, Z, L, Y, M, M_B, M_F, M_BF, data, E, Math.ceil(M_B), Math.ceil(E), compression_style);
        long_scan_cost = analyzeLongScanCostAvgCase(T, K, Z, L, Y, M, M_B, M_F, M_BF, data, s, B, E);

        if (existing_system == "WT") {
            read_cost = read_cost * B_TREE_CACHE_DISCOUNT_FACTOR;
        }
    }else {
        update_cost = analyzeUpdateCost(B, T, K, Z, L, Y, M, M_F, M_B, M_F_HI, M_F_LO);
        read_cost = analyzeReadCost(B, E, data, T, K, Z, L, Y, M, M_B, M_F, M_BF, FPR_sum);
        long_scan_cost = analyzeLongScanCost(s, B, Z);
    }

    if(existing_system == "rocks") {
        rmw_cost = read_cost + update_cost;
    } else {
        rmw_cost = read_cost + 1.0/B;
    }
    if(existing_system=="rocks") {
        blind_update_cost = update_cost;
    } else {
        blind_update_cost = read_cost + 1.0/B;
    }
    if (short_scan_percentage != 0) {
        short_scan_cost = analyzeShortScanCost(B, T, K, Z, L, Y, M, M_B, M_F, M_BF);
    }

    if (existing_system == "rocks") {
        empty_long_scan_cost = analyzeEmptyLongScanCost(K, Z, L, Y, N, M_BF, data, U);
    } else {
        empty_long_scan_cost = 1;
    }

    no_result_read_cost=0;//analyzeReadCost(B, E, data, T, K, Z, L, Y, M, M_B, M_F, M_BF, FPR_sum)-1;

    total_IO = workload*(insert_percentage*update_cost + v*read_cost + r*no_result_read_cost + rmw_percentage*rmw_cost + blind_update_percentage*blind_update_cost + qL*long_scan_cost + qEL*empty_long_scan_cost);


    if(using_compression){
        total_IO = (insert_percentage * update_cost * (1+compression_libraries[compression_style].put_overhead/100) + v * read_cost * (1+compression_libraries[compression_style].get_overhead/100) + r * read_cost * (1+compression_libraries[compression_style].get_overhead/100)) / (v + insert_percentage + r);
    }

    var total_latency = total_IO / IOPS / 60 / 60 / 24;
    if(L==0)
        total_latency=0;


    if (total_latency < best_latency || best_latency < 0) {
        best_latency = total_latency;
        Variables.K = K;
        Variables.T = T;
        Variables.L = L;
        if (Z<=0) {
            Variables.Z = T-1; // Z was set to 0 or -1 for engineering purposes, in reality it's this
        } else {
            Variables.Z = Z;
        }
        Variables.Y = Y;
        Variables.Buffer = M_B;
        Variables.M_BF = M_BF;
        Variables.M_FP = M_FP;
        Variables.read_cost = read_cost;
        Variables.update_cost = update_cost;
        Variables.rmw_cost = rmw_cost;
        Variables.blind_update_cost = blind_update_cost;
        Variables.short_scan_cost = short_scan_cost;
        Variables.long_scan_cost = long_scan_cost;
        Variables.empty_long_scan_cost = empty_long_scan_cost;
        Variables.no_result_read_cost = no_result_read_cost;
        Variables.total_cost = total_IO;
        Variables.latency = total_latency;
        Variables.cost = (monthly_storage_cost + monthly_mem_cost).toFixed(3);

        if (enable_SLA) {
            Variables.cost = parseFloat((monthly_storage_cost + monthly_mem_cost + SLA_cost).toFixed(3));
        }
        Variables.memory_footprint = max_RAM_purchased * mem_sum;
        Variables.cloud_provider = cloud_provider;
        Variables.compression_name = compression_libraries[compression_style].compression_name;
        Variables.FPR = getFPR(T, K, Z, L, Y, M, M_B, M_F, M_BF, data);
        Variables.SLA_cost = SLA_cost;
        Variables.M_F = M_F;
        if ((existing_system == 'FASTER' || existing_system == 'FASTER_H') && total_IO == 0) {
            Variables.total_cost = 0.1;
        }
    }
    if(enable_parallelism){
        setOverallPropParallelizableCodeForExistingSystem(Variables,existing_system);
        Variables.latency  = speedup(Variables);
    }

    return Variables;
}

/**
 * This loops over each cloud provider
 * @param cloud_mode
 * @returns {(Buffer|any[]|string)[]}
 */
function buildContinuums(cloud_mode){
    var result_array=new Array();
    var rocks_result_array = new Array();
    var WT_result_array = new Array();
    var faster_result_array = new Array();
    var faster_h_result_array = new Array();
    var VM_libraries=initializeVMLibraries();
    var Variables=0;
    var rocks_Variables;
    var WT_Variables;
    var faster_Variables;
    var fasterh_Variables;
    var progress=0;
    cri_cache=new Array();
    for(var i=0;i<3;i++){
        cri_cache.push(new Array());
    }
    dri_cache=new Array();
    for(var i=0;i<3;i++){
        dri_cache.push(new Array());
    }
    if(cloud_mode==0||cloud_mode==NaN) {
        for (var cloud_provider = 0; cloud_provider < 3; cloud_provider++) {
            if(cloud_provider_enable[cloud_provider]) {
                var VMCombinations = getAllVMCombinations(cloud_provider, VM_libraries);
                for (var i = 0; i < VMCombinations.length; i++) {
                    Variables = 0;
                    progress = (cloud_provider + i / VMCombinations.length) / 3;
                    postMessage((progress * 100).toFixed(1) + "%");
                    var VMCombination = VMCombinations[i];
                    if (using_compression == false) {
                        Variables = navigateDesignSpace(VMCombination, cloud_provider);
                        rocks_Variables = navigateDesignSpaceForExistingDesign(VMCombination, cloud_provider, "rocks");
                        WT_Variables = navigateDesignSpaceForExistingDesign(VMCombination, cloud_provider, "WT");
                        faster_Variables = navigateDesignSpaceForExistingDesign(VMCombination, cloud_provider, "FASTER");
                        fasterh_Variables = navigateDesignSpaceForExistingDesign(VMCombination, cloud_provider, "FASTER_H");
                    } else {
                        for (var n = 0; n < 3; n++) {
                            if (Variables == 0) {
                                Variables = navigateDesignSpace(VMCombination, cloud_provider, n);
                                rocks_Variables = navigateDesignSpaceForExistingDesign(VMCombination, cloud_provider, "rocks", 1);
                                WT_Variables = navigateDesignSpaceForExistingDesign(VMCombination, cloud_provider, "WT", 1);
                                faster_Variables = navigateDesignSpaceForExistingDesign(VMCombination, cloud_provider, "FASTER",1);
                                fasterh_Variables = navigateDesignSpaceForExistingDesign(VMCombination, cloud_provider, "FASTER_H",1);
                            } else {
                                var temp;
                                temp = navigateDesignSpace(VMCombination, cloud_provider, n);
                                if (temp.total_cost < Variables.total_cost)
                                    Variables = temp;
                            }
                        }
                    }
                    var info = ("<b>" + VM_libraries[cloud_provider].provider_name + " :</b><br>T=" + Variables.T + ", K=" + Variables.K + ", Z=" + Variables.Z + ", L=" + Variables.L + "<br>M_B=" + (Variables.Buffer / 1024 / 1024 / 1024).toFixed(2) + " GB, M_BF=" + (Variables.M_BF / 1024 / 1024 / 1024).toFixed(2) + " GB<br>M_FP=" + (Variables.M_FP / 1024 / 1024 / 1024).toFixed(2) + " GB, " + Variables.VM_info + "<br>Latency=" + fixTime(Variables.latency) + "<br>Cost=" + Variables.cost);
                    if (using_compression)
                        info += "<br>Compression: " + Variables.compression_name;
                    var result = [Variables.cost, Variables.latency, VMCombination, VM_libraries[cloud_provider].provider_name, info, Variables, Variables.memory_footprint];
                    result_array.push(result);
                    rocks_result_array.push(rocks_Variables);
                    WT_result_array.push(WT_Variables);
                    faster_result_array.push(faster_Variables);
                    faster_h_result_array.push(fasterh_Variables);
                }
            }
        }
    }else{
        if(cloud_provider_enable[cloud_mode-1]) {
            cloud_provider = cloud_mode - 1;
            var VMCombinations = getAllVMCombinations(cloud_provider, VM_libraries);
            for (var i = 0; i < VMCombinations.length; i++) {
                var VMCombination = VMCombinations[i];
                var Variables = navigateDesignSpace(VMCombination, cloud_provider);
                var rocks_Variables = navigateDesignSpaceForExistingDesign(VMCombination, cloud_provider, "rocks");
                var WT_Variables = navigateDesignSpaceForExistingDesign(VMCombination, cloud_provider, "WT");
                var info = ("<b>" + VM_libraries[cloud_provider].provider_name + " :</b><br>T=" + Variables.T + ", K=" + Variables.K + ", Z=" + Variables.Z + ", L=" + Variables.L + "<br>M_B=" + (Variables.Buffer / 1024 / 1024 / 1024).toFixed(2) + " GB, M_BF=" + (Variables.M_BF / 1024 / 1024 / 1024).toFixed(2) + " GB<br>M_FP=" + (Variables.M_FP / 1024 / 1024 / 1024).toFixed(2) + " GB, " + Variables.VM_info + "<br>Latency=" + fixTime(Variables.latency) + "<br>Cost=" + Variables.cost);
                var result = [Variables.cost, Variables.latency, VMCombination, VM_libraries[cloud_provider].provider_name, info, Variables, Variables.memory_footprint, rocks_Variables, WT_Variables];
                result_array.push(result);
                rocks_result_array.push(rocks_Variables);
                WT_result_array.push(WT_Variables);
            }
        }
    }
    //Sorting each array by cost
    rocks_result_array = removeEmptyEntries(rocks_result_array);
    WT_result_array = removeEmptyEntries(WT_result_array);
    faster_result_array = removeEmptyEntries(faster_result_array);
    faster_h_result_array = removeEmptyEntries(faster_h_result_array);

    result_array.sort(function (a,b) {
        return a[0]-b[0];
    })
    rocks_result_array.sort(function (a,b) {
        return a.cost - b.cost;
    })
    WT_result_array.sort(function (a,b) {
        return a.cost - b.cost;
    })
    faster_result_array.sort(function (a,b) {
        return a.cost - b.cost;
    })
    faster_h_result_array.sort(function (a,b) {
        return a.cost - b.cost;
    })

    result_array = correctContinuum(result_array);
    rocks_result_array = correctContinuumForVariables(rocks_result_array);
    WT_result_array = correctContinuumForVariables(WT_result_array);
    faster_result_array = correctContinuumForVariables(faster_result_array);
    faster_h_result_array = correctContinuumForVariables(faster_h_result_array);

    return [result_array, rocks_result_array, WT_result_array, faster_result_array, faster_h_result_array];

}

/**
 * To create the triple point per cost as the C code.
 * @param result_array
 * @returns {any[]}
 */
function correctContinuum(result_array) {
    var provider, cost, latency, bestAWS, bestGCP, bestAzure, temp;
    var result_array_with_new_points = new Array();
    result_array = correctContinuumForEachProvider(result_array);
    for (var i = 0; i < result_array.length; i++) {
        provider = result_array[i][3];
        latency = result_array[i][1];
        cost = result_array[i][0];
        if (provider == "AWS") {
            if (bestAWS == null){
                bestAWS = [...result_array[i]];
            } else if (latency < bestAWS[1]) {
                bestAWS = [...result_array[i]];
            }
            if (bestGCP!=null) {
                temp = [...bestGCP];
                temp[0] = cost;
                result_array_with_new_points.push(temp);
            }
            if (bestAzure!=null) {
                temp = [...bestAzure];
                temp[0] = cost;
                result_array_with_new_points.push(temp);
            }
        } else if (provider == "GCP") {
            if (bestGCP == null){
                bestGCP = [...result_array[i]];
            } else if (latency < bestGCP[1]) {
                bestGCP = [...result_array[i]];
            }
            if (bestAWS!=null) {
                temp = [...bestAWS];
                temp[0] = cost;
                result_array_with_new_points.push(temp);
            }
            if (bestAzure!=null) {
                temp = [...bestAzure];
                temp[0] = cost;
                result_array_with_new_points.push(temp);
            }
        } else {
            if (bestAzure == null){
                bestAzure = [...result_array[i]];
            } else if (latency < bestAzure[1]) {
                bestAzure = [...result_array[i]];
            }
            if (bestAWS!=null) {
                temp = [...bestAWS];
                temp[0] = cost;
                result_array_with_new_points.push(temp);
            }
            if (bestGCP!=null) {
                temp = [...bestGCP];
                temp[0] = cost;
                result_array_with_new_points.push(temp);
            }
        }
    }
    var final_array = result_array.concat(result_array_with_new_points);
    final_array.sort(function (a,b) {
        return a[0]-b[0];
    })
    return final_array;
}

/**
 * To create the triple point per cost as the C code. The difference with correctContinuum is on
 * the array passed.
 * @param result_array
 * @returns {any[]}
 */
function correctContinuumForVariables(result_array) {
    var provider, cost, latency, bestAWS, bestGCP, bestAzure, temp;
    var result_array_with_new_points = new Array();

    result_array = correctContinuumForEachProviderForVariables(result_array);

    for (var i = 0; i < result_array.length; i++) {
        provider = result_array[i].cloud_provider;
        latency = result_array[i].latency;
        cost = result_array[i].cost;
        if (provider == 0) {
            if (bestAWS == null){
                bestAWS = Object.assign({}, result_array[i]);
            } else if (latency < bestAWS.latency) {
                bestAWS = Object.assign({}, result_array[i]);
            }
            if (bestGCP!=null) {
                temp = Object.assign({},bestGCP);
                temp.cost = cost;
                result_array_with_new_points.push(temp);
            }
            if (bestAzure!=null) {
                temp = Object.assign({},bestAzure);
                temp.cost = cost;
                result_array_with_new_points.push(temp);
            }
        } else if (provider == 1) {
            if (bestGCP == null){
                bestGCP = Object.assign({}, result_array[i]);
            } else if (latency < bestGCP.latency) {
                bestGCP = Object.assign({}, result_array[i]);
            }
            if (bestAWS!=null) {
                temp = Object.assign({},bestAWS);
                temp.cost = cost;
                result_array_with_new_points.push(temp);
            }
            if (bestAzure!=null) {
                temp = Object.assign({},bestAzure);
                temp.cost = cost;
                result_array_with_new_points.push(temp);
            }
        } else {
            if (bestAzure == null){
                bestAzure = Object.assign({}, result_array[i]);
            } else if (latency < bestAzure.latency) {
                bestAzure = Object.assign({}, result_array[i]);
            }
            if (bestAWS!=null) {
                temp = Object.assign({},bestAWS);
                temp.cost = cost;
                result_array_with_new_points.push(temp);
            }
            if (bestGCP!=null) {
                temp = Object.assign({},bestGCP);
                temp.cost = cost;
                result_array_with_new_points.push(temp);
            }
        }
    }
    var final_array = result_array.concat(result_array_with_new_points);
    final_array.sort(function (a,b) {
        return a.cost - b.cost;
    })
    return final_array;
}

function correctContinuumForEachProviderForVariables(array) {
    var bestAWS, bestGCP, bestAzure, latency, provider, cost;
    for (var i = 0; i < array.length; i++) {
        provider = array[i].cloud_provider;
        latency = array[i].latency;
        cost = array[i].cost;
        if(provider == 0) {
            if(bestAWS == null) {
                bestAWS = Object.assign({},array[i]);
            } else if(latency > bestAWS.latency) {
                cost = array[i].cost;
                array[i] = Object.assign({},bestAWS);
                array[i].cost = cost;
            } else {
                bestAWS = Object.assign({},array[i]);
            }
        } else if(provider == 1) {
            if(bestGCP == null) {
                bestGCP = Object.assign({},array[i]);
            } else if(latency > bestGCP.latency) {
                cost = array[i].cost;
                array[i] = Object.assign({},bestGCP);
                array[i].cost = cost;
            } else {
                bestGCP = Object.assign({},array[i]);
            }
        } else {
            if(bestAzure == null) {
                bestAzure = Object.assign({},array[i]);
            } else if(latency > bestAzure.latency) {
                cost = array[i].cost;
                array[i] = Object.assign({},bestAzure);
                array[i].cost = cost;
            } else {
                bestAzure = Object.assign({},array[i]);
            }
        }
    }

    array = removeRedundantConfigurationsForVariables(array);
    return array;
}

function correctContinuumForEachProvider(array) {
    var bestAWS, bestGCP, bestAzure, latency, provider, cost;
    for (var i = 0; i < array.length; i++) {
        provider = array[i][3];
        latency = array[i][1];
        cost = array[i][0];
        if(provider == "AWS") {
            if(bestAWS == null) {
                bestAWS = [...array[i]];
            } else if(latency > bestAWS[1]) {
                cost = array[i][0];
                array[i] = [...bestAWS];
                array[i][0] = cost;
            } else {
                bestAWS = [...array[i]];
            }
        } else if(provider == "GCP") {
            if(bestGCP == null) {
                bestGCP = [...array[i]];
            } else if(latency > bestGCP[1]) {
                cost = array[i][0];
                array[i] = [...bestGCP];
                array[i][0] = cost;
            } else {
                bestGCP = [...array[i]];
            }
        } else {
            if(bestAzure == null) {
                bestAzure = [...array[i]];
            } else if(latency > bestAzure[1]) {
                cost = array[i][0];
                array[i] = [...bestAzure];
                array[i][0] = cost;
            } else {
                bestAzure = [...array[i]];
            }
        }
    }
    array = removeRedundantConfigurations(array);
    return array;
}

function removeEmptyEntries(array){
    return array.filter(function(ele){
        return ele != -1;
    });
}

function removeRedundantConfigurationsForVariables(array) {
    var cleanedArray = new Array();
    var current, last;
    array.sort(function (a,b) {
        return a.cost - b.cost;
    })
    last = array[0];
    cleanedArray.push(last);
    for (var i = 1; i < array.length; i++) {
        current = array[i];
        if (!(current.cost == last.cost) && current.latency < last.latency) {
            cleanedArray.push(array[i]);
            last = current;
        }
    }
    return cleanedArray;
}

function removeRedundantConfigurations(array) {
    var cleanedArray = new Array();
    var last_cost, current_cost;
    for (var i = 0; i < array.length; i++) {
        current_cost = array[i][0];
        if (!(current_cost == last_cost)) {
            cleanedArray.push(array[i]);
            last_cost = current_cost;
        }
    }
    return cleanedArray;
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
        avg_case_bound = (bound_2 >= bound_1) ? bound_2 : bound_1;
    }
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
        if (Y >= 1){
            term3_mult = 1.0;
            if (T < B) {
                term3_mult = T <= B-T? T : B - T;
                term3_mult /=(B-T);
            }
            for(i = L - Y + 1; i <= L ;i++)
            {
                var num_blocks = ( (EB * Math.pow(T, i)))/ ( B);
                term3_2 = EB * Math.pow(T, L-Y-1)*term3_mult >= num_blocks ? num_blocks : EB * Math.pow(T, L-Y-1)*term3_mult;
                term3 += term3_2;
            }
            term3 /= Q;
        }
    }
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

function analyzeUpdateCostAvgCase(T, K, Z, L, Y, M, M_F, M_B, E, B){
    var update_cost;
    if(Z == 0) // LSH-table append-only
    {
        var scale_up = 1.5;
        var term1;
        var q = Math.pow((1.0 - getAlpha_i(workload_type, M_B, T, K, Z, L, Y, 1, E)), K);
        var c = (1 - q)*(1 - getAlpha_i(workload_type, M_B, T, K, Z, L, Y, 0, E));
        q = 1 - q*(1 - getAlpha_i(workload_type, M_B, T, K, Z, L, Y, 0, E));
        term1 = c/q;
        update_cost = term1 * scale_up;
    }
    else if (Z == -1) // LSH-table hybrid logs
    {
        //printf("Hybrid log in FASTER\n");
        var term1;
        var c, q;
        var alpha_mutable = getAlpha_i(workload_type, 0.9*M_B,  T, K, Z, L, Y, 0, E);
        var alpha_read_only = getAlpha_i(workload_type, 0.1*M_B, T, K, Z, L, Y, 0, E);
        var alpha_0 = 1 - ((1 - alpha_mutable) * (1 - alpha_read_only));
        q = Math.pow((1.0 - getAlpha_i(workload_type, M_B, T, K, 1, L, Y, 1, E)), K);
        c = (1 - q)*(1 - alpha_0);
        q = 1 - q*(1 - alpha_0);
        term1 = c/q;
        //printf("in DS: %f on disk: %f\n", q, c);
        update_cost = term1;
        if (update_cost > 1.0/B) {
            update_cost = 1.0/B;
        }
    }else {
        update_cost = aggregateAvgCaseUpdate(B, E, workload_type, T, K, Z, L, Y, M_B, 0);
    }
    return update_cost;
}

function analyzeReadCostAvgCase(FPR_sum, T, K, Z, L, Y, M, M_B, M_F, M_BF, data, E, int_M_B, int_E, compression_style)
{
    // uniform
    var avg_read_cost;
    if(Z == 0) // LSH-table append-only
    {
        var scale_up = 1.8;
        var term1;
        var q = Math.pow((1.0 - getAlpha_i(workload_type, M_B, T, K, Z, L, Y, 1, E)), K);
        var c = (1 - q)*(1 - getAlpha_i(workload_type, M_B, T, K, Z, L, Y, 0, E));
        term1 = c;
        avg_read_cost = term1 * scale_up;
        return avg_read_cost;
    }
    else if (Z == -1) // LSH-table hybrid logs
    {
        var term1;
        var c, q;
        var alpha_mutable = getAlpha_i(workload_type, 0.9*M_B,  T, K, Z, L, Y, 0, E);
        var alpha_read_only = getAlpha_i(workload_type, 0.1*M_B, T, K, Z, L, Y, 0, E);
        var alpha_0 = 1 - ((1 - alpha_mutable) * (1 - alpha_read_only));
        q = Math.pow((1.0 - getAlpha_i(workload_type, M_B, T, K, 1, L, Y, 1, E)), K);
        c = (1 - q)*(1 - alpha_0);
        term1 = c;
        avg_read_cost = term1;
        return avg_read_cost;
    }


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
    var hot_level_boundary = L - Y > 1 ? L - Y : 1;
    for(var i = hot_level_boundary; i<=L; i++)
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
            }

            term3 = term3 + (p_i * term3_2);
        }

    }

    return term1 + term2 + term3;
}

function getcq(type, T, K, Z, L, Y, M_B, E)
{
    var c,q;
    q = 1.0;
    for(var i=1;i<=L-Y-1;i++)
    {
        q = q * Math.pow((1.0 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), K);
    }
    var hot_level_boundary = L - Y > 1 ? L - Y : 1
    for(var i=hot_level_boundary;i<=L;i++)
    {
        q = q * Math.pow((1.0 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), Z);
    }
    c = (1 - getAlpha_i(type, M_B, T, K, Z, L, Y, -1, E)) * (1 - (q))*(1 - getAlpha_i(type, M_B, T, K, Z, L, Y, 0, E));

    q = 1 - (q)*(1 - getAlpha_i(type, M_B, T, K, Z, L, Y, 0, E));
    return [c,q];
}

function getC_ri(type, r,  i, M_B, T, K, Z, L, Y, E, int_M_B, int_E, compression_style)
{
    var a=(type*1+r*5+i*40+int_M_B+T*400+K*6000+Z*90000+L*230000+Y*710000+int_E*190007+K*r+i*T*4000)%699999;
    var cache=cri_cache[compression_style][a];

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

function getD_ri( type, r, i, M_B, T, K, Z, L, Y, E, int_M_B, int_E, compression_style)
{
    var a=(type*1+r*5+i*40+int_M_B+T*400+K*6000+Z*90000+L*230000+Y*710000+int_E*190007+K*r+i*T*4000+(int_E%(L*Y*19+T))*50000)%999999;

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
            if(h!=0)
                term2 = term2 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), Z);
        }
        var term3 = Math.pow((1.0 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), r);
        var term4 = 1.0;
        for (var h = i + 1; h <= L; h++) {
            term4 = term4 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, h, E)), Z);
        }
        term4 = term4 * Math.pow((1 - getAlpha_i(type, M_B, T, K, Z, L, Y, i, E)), Z - r);
        term4 = 1 - term4;
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
            dri_cache[compression_style][a]={};
            dri_cache[compression_style][a].result=term1 * term2 * term3 * term4;
            dri_cache[compression_style][a].parameter=type+r+i+T+K+Z+L+Y;

            return term1 * term2 * term3 * term4;
        }
    }
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
        if (type == 1)
            size_run /= B_;
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
        if (Z > 0) {
            size_run = M_B*Math.pow(T,i)/(Z*E);
        } else {
            size_run = M_B*Math.pow(T,i)/(K*E);
        }
    }
    // cold levels
    if (i > 0 && i < L && i > L - Y -1) {
        size_run = M_B*Math.pow(T,i)/(E);
        // size_run *= (B - T) / (double)B; // USE THIS LIN IF YOU WANT INTERNAL NODES TO STORE DATA
        size_run *= 0; // USE THIS LINE IF YOU DON'T WANT INTERNAL NODES TO STORE DATA
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

function analyzeReadCost(B, E, data, T, K, Z, L, Y, M, M_B, M_F, M_BF, FPR_sum){
    var entries_in_hot_level;
    var first = T*(M_B/E);
    var sum = first;
    for(var i = 2;i<=L-Y;i++)
    {
        sum = sum + first*Math.pow(T, i-1);
    }
    entries_in_hot_level = sum;
    var bits_per_entry = M_BF*8/entries_in_hot_level;
    if (Z<=0){
        Z = T-1;
    }
    FPR_sum = Math.exp(((-M_BF*8)/data)*Math.pow(Math.log(2),2)*Math.pow(T, Y)) * Math.pow(Z, (T-1)/T) * Math.pow(K, 1/T) * Math.pow(T, (T/(T-1)))/(T-1);

    return (1.0 + (Y*Z) + FPR_sum);
}

function analyzeShortScanCost(B, T, K, Z, L, Y){
    var short_scan_cost;
    if(Y == 0)
    {
        return short_scan_cost = K*L;
    }
    else
    {
        return short_scan_cost = K*(L-Y-1) + Z*(Y+1);
    }
}

function analyzeLongScanCost(s, B, Z) {
    var long_scan_cost;
    if (Z <= 0) { // LSH
        long_scan_cost = s;
    } else {
        long_scan_cost = s/B;
    }
    return long_scan_cost;
}

function analyzeLongScanCostAvgCase(T, K, Z, L, Y, M, M_B, M_F, M_BF, data, s, B, E){
    var long_scan_cost, selectivity, term1, term2, term3, EB;
    if (Z<=0) { // LSH tables
        long_scan_cost = s;
    } else if (T%16 == 0) { // B-trees
        long_scan_cost = Y - 1 + s/B;
    } else { //LSM data structures
        selectivity = s/data;
        EB = M_B/E;
        term1 = 0;
        term2 = 0;
        term3 = 0;
        for (var i = 1; i < L - Y + 1; i++){
            term1 += EB*Math.pow(T,i);
        }
        if (T < B){
            for (var i =L - Y +1; i < L-1; i++){
                term2 += EB*Math.pow(T,i);
            }
        }
        term3 = EB * Math.pow(T, L);
        long_scan_cost = 2*selectivity*(term1 + term2 + term3)/B;
        if (T == B && Y > 0){
            long_scan_cost += Y - 1;
        }
    }
    return long_scan_cost;
}

function analyzeEmptyLongScanCost(K, Z, L, Y, N, M_BF, data, U) {
    var R = 64;
    var FPR1 = (N / Math.pow(2, M_BF/(1.44 * data)))/U; // FPR for last level
    if (FPR1 > 1) {
        FPR1 = 1;
    }
    var FPR2 = 1/(2-FPR1);
    if (!enable_Rosetta) {
        FPR1 = 1;
        FPR2 = 1;
    }
    var empty_long_scan_cost;
    empty_long_scan_cost = FPR1 * Z * (Y+1) + FPR2 * K * (L-Y-1);
    return empty_long_scan_cost;
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
        if(enable_SLA == 1)
        {
            total_budget = total_budget - SLA_factors[0].DB_migration_cost*storage;
        }
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
        if(enable_SLA == 1)
        {
            total_budget = total_budget - SLA_factors[1].DB_migration_cost*storage;
        }
        MIN_RAM_SIZE = 13; // GB
        RAM_BLOCK_COST = 0.0745; // per RAM block per hour
        MBps = read_percentage*720 + write_percentage*160; // taking average
        B = 16*1024/(Variables.E);
        IOPS = MBps*Math.pow(10,6)/(B*Variables.E);
        if(IOPS > 30000)
        {
            IOPS = 30000;
        }
        monthly_storage_cost = storage*0.17;
    }
    if(cloud_provider == 2)
    {
        if(enable_SLA == 1)
        {
            total_budget = total_budget - SLA_factors[2].DB_migration_cost*storage;
        }
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
    return [B,monthly_storage_cost];
}

function getCloudProvider(buttonName){
    var lsm_map = {
        "GCP":0,
        "AWS":1,
        "Azure":2
    }
    var buttons = document.getElementById(buttonName);
    var val=buttons.selectedIndex;
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
    return VMCombinations;
}

/**
 * This is the function that connects this file to the draw_chart.js, drawContinuumsMultithread function.
 * It utilizes the Web Worker scheme.
 * The basic use of this is to call the buildContinuums function, where the 5 continuums (cosine, rocks,
 * WiredTiger, FASTER and FASTER_H are built.
 * @param e which is an object passed that contains necesary information
 */
onmessage = function(e) {
    input=e.data.input;
    initializeCompressionLibraries();
    initializeSLAFactors();
    U = e.data.U;
    p_put = e.data.p_put;
    U_1 = e.data.U_1;
    U_2 = e.data.U_2;
    p_get = e.data.p_get;
    enable_SLA=e.data.SLA.enable_SLA;
    enable_DB_migration=e.data.SLA.enable_DB_migration;
    enable_dev_ops=e.data.SLA.enable_dev_ops;
    enable_backup=e.data.SLA.enable_backup;
    workload_type=e.data.workload_type;
    cloud_provider_enable=e.data.SLA.cloud_provider_enable;
    var result=buildContinuums(e.data.cloud_provider);
    console.log('Message received from main script');
    postMessage(result);
}
