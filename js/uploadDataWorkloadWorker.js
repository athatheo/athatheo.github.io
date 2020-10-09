var KeyHash = new Object();
var U_Parameters = {};

/**
 * Receive message from upload data and workload 
 */
onmessage = function(e) {
    if(e.data.from == "data") {
        loadDataFile(e);
    } else {
        loadWorkloadFile(e);
    }
}

/**
 * Read data from data file and call loadData
 * @param {*} e 
 */
function loadDataFile(e){
    var reader = new FileReader();
    reader.onload = function(evt) {
        var lines = evt.target.result.split('\n');
        loadData(e, lines);
    };
    reader.readAsText(e.data.selectedFile);
}

/**
 * Parse through data file and calculate data inputs
 * @param {*} e 
 * @param {*} lines 
 */
function loadData(e, lines) {
    var entries = 0;
    var maxKey = -2147483648;
    var maxValue = -2147483648;

    var isValid = true;
    var keySize = "";
    var valueSize = "";
    var entrySize = "";

    var keyHash = new Object();
    var frequencyKeys = [];
    var uParameters;

    var percentage = 0;
    
    // Parse through data file
    for(var i = 0; i < lines.length; i++){
        console.log("hi");
        var line = lines[i].trim();;

        if(line != "" && line.indexOf("//") != 0) {

            if(line.indexOf("//") > 0)    {
                line = line.split("//")[0].trim();;
            }

            entries += 1;

            var entry = line.split(" ");

            // Check if entry is correct format
            if(!(entry.length == 2 && !entry.some(isNaN)) &&
               !(entry.length == 3 && !(isNaN(entry[1]))  && !(isNaN(entry[2])))) {
                entries = "";
                isValid = false;
                break;
            }

            var key, value;

            if(entry.length == 2) {
                key = Number(entry[0]);
                value = Number(entry[1]);
            } else {
                key = Number(entry[1]);
                value = Number(entry[2]);
            }

            maxKey = Math.max(maxKey, key);
            maxValue = Math.max(maxValue, value);
            // Add key to hash
            if (undefined == keyHash["" + key]) {
                keyHash["" + key] = 1;
            } else {
                keyHash["" + key] += 1;
            }
        }         

        // Calculate and update loading percentage
        var per = Math.ceil((i+1) / lines.length * 1000) / 10;
        per = Math.max(0.1, per);
        per = Math.min(99.7, per);

        if(per != percentage) {
            percentage = per;
            postMessage({to: "data", msg: "percentage", percentage: percentage});
        }
    }

    if(isValid) {
        keySize = Math.ceil(Math.log2(maxKey)/8);
        valueSize = Math.ceil(Math.log2(maxValue)/8);
        entrySize = keySize + valueSize;
        
        // Turn hash into array
        for (const property in keyHash) {
            frequencyKeys.push({key: Number(property), frequency: keyHash[property]});
        }
        frequencyKeys.sort(function(a,b){return a.key - b.key;});
        
        // Calculate U, U1, U1, and pput
        uParameters = highestFrequencyPartitions(frequencyKeys);
        uParameters['U'] = maxKey * 100;

        var totalKeys = 0;
        for (var key of frequencyKeys) {
            totalKeys += key.frequency;
        }
        uParameters['p_put'] = Math.round(uParameters['specialKeys']/totalKeys*100)/100;

        KeyHash = keyHash;
        U_Parameters = uParameters;
    } else {
        postMessage({to: "data", msg: "invalid"});
    }

    // Update the inputs
    postMessage({to: "data", msg: "inputs", entries: entries, entrySize: entrySize, keySize: keySize, fileName: e.data.selectedFile.name, uParameters: uParameters});
}

/**
 * Divide entries into partitions to calculate U1 and U2 
 * @param {*} entries 
 */
function highestFrequencyPartitions(entries) {
    var min = entries[0].key;
    var max = entries[entries.length - 1].key;
    var PARTITION_RANGE = 1000;
    var numPartitions = Math.round((max - min)/PARTITION_RANGE);
    var partitions = [];
    var entriesIndex = 0;
    var thresholdValue = 1.5;

    // Partition:
    //  start point
    //  end point
    //  number of keys
    //  total frequency
    
    // Divide entries into n partitions
    const START_POINT = 0;
    const END_POINT = 1;
    const NUMBER_KEYS = 2;
    const TOTAL_FREQUENCY = 3;
    for(var i = 0; i < numPartitions - 1; i++) {
        if (i%10000==0) {
            console.log(i);
        }
        partitions[i] = [0, 0, 0, 0];
        var startPoint = i * PARTITION_RANGE + min;
        var endPoint = (i + 1) * PARTITION_RANGE + min;
        var numberKeys = 0;
        var totalFrequency = 0;
        while(entriesIndex < entries.length && startPoint <= entries[entriesIndex].key && entries[entriesIndex].key  < endPoint) {
            numberKeys++;
            totalFrequency += entries[entriesIndex].frequency;
            entriesIndex++; 
        }
        partitions[i][START_POINT] = startPoint;
        partitions[i][END_POINT] = endPoint;
        partitions[i][NUMBER_KEYS] = numberKeys;
        partitions[i][TOTAL_FREQUENCY] = totalFrequency;
    }
    partitions[numPartitions - 1] = [0, 0, 0, 0];
    var startPoint = (numPartitions - 1) * PARTITION_RANGE + min;
    var endPoint = numPartitions * PARTITION_RANGE + min;
    var numberKeys = 0;
    var totalFrequency = 0;
    while(entriesIndex < entries.length) {
        numberKeys++;
        totalFrequency += entries[entriesIndex].frequency;
        entriesIndex++; 
    }
    partitions[numPartitions - 1][START_POINT] = startPoint;
    partitions[numPartitions - 1][END_POINT] = endPoint;
    partitions[numPartitions - 1][NUMBER_KEYS] = numberKeys;
    partitions[numPartitions - 1][TOTAL_FREQUENCY] = totalFrequency;

    partitions = removeEmptyPartitions(partitions);

    // Sort array by average frequencies
    partitions.sort(function(a,b){return (b[TOTAL_FREQUENCY] / b[NUMBER_KEYS]) - (a[TOTAL_FREQUENCY] / a[NUMBER_KEYS]);});

    // Find the mean of the average frequencies
    var meanAvgFrequency = 0;
    for(var partition of partitions) {
        var avg = (partition[TOTAL_FREQUENCY] / partition[NUMBER_KEYS]);
        meanAvgFrequency += avg;
    }
    meanAvgFrequency /= partitions.length;

    // Find the partitions with the highest frequency
    // Calculate U1 and then U2
    var start = max;
    var end = min;
    var specialKeys = 0;
    var avgFrequency = partitions[0][TOTAL_FREQUENCY] / partitions[0][NUMBER_KEYS];
    var thresholdFrequency = thresholdValue * meanAvgFrequency;
    for(var i = 0; i+1 < partitions.length && avgFrequency > thresholdFrequency; i++) {
        start = Math.min(start, partitions[i][START_POINT]);
        end = Math.max(end, partitions[i][END_POINT]);
        specialKeys += partitions[i][TOTAL_FREQUENCY];
        avgFrequency = partitions[i+1][TOTAL_FREQUENCY] / partitions[i+1][NUMBER_KEYS];
    }
    U_1 = end - start;
    U_2 = (max - min) - U_1;

    return {U_1: U_1, U_2: U_2, specialKeys: specialKeys, start: start, end: end};
}

/**
 * Remove partitions with no keys
 * @param {*} partitions 
 */
function removeEmptyPartitions(partitions) {
    const NUMBER_KEYS = 2;
    var newPartitions = [];
    for(var partition of partitions) {
        if(partition[NUMBER_KEYS] != 0) {
            newPartitions.push(partition);
        }
    }
    return newPartitions;
}

/**
 * Read data from workload file and call loadWorkload
 * @param {*} e 
 */
function loadWorkloadFile(e){
    var reader = new FileReader();
    reader.onload = function(evt) {
        var lines = evt.target.result.split('\n');
        loadWorkload(e, lines);
    };
    reader.readAsText(e.data.selectedFile);
}

/**
 * Parse through workload file and calculate workload inputs
 * @param {*} e 
 * @param {*} lines 
 */
function loadWorkload(e, lines) {
    var queries = 0;
    var pointLookups = 0;
    var zeroResultPointLookups = 0;
    var writes = 0;
    
    var isValid = true;
    var pointLookupsPercent = "";
    var zeroResultPointLookupsPercent = "";
    var writesPercent = "";

    var keyHash = KeyHash;
    var specialGets = 0;
    var totalGets = 0;

    var percentage = 0;

    // Parse through workload file
    for(var i = 0; i < lines.length; i++){
        var line = lines[i].trim();

        if(line != "" && line.indexOf("//") != 0) {

            if(line.indexOf("//") > 0)    {
                line = line.split("//")[0].trim();
            }

            queries += 1;

            var query = line.split(" ");

            // Check if query is a put or a get
            if(query.length == 3 && query[0] == "p" && !isNaN(query[1]) && !isNaN(query[2])) {
                var key = query[1];
                if (undefined == keyHash["" + key]) {
                    keyHash["" + key] = 1;
                } else {
                    keyHash["" + key] += 1;
                }
                writes += 1;
            } else if(query.length == 2 && query[0] == "g" && !isNaN(query[1])) {
                var key = query[1];
                // Check if get is zero result or not
                if(undefined !== keyHash["" + key]) {
                    pointLookups += 1;
                    totalGets++;
                    if(U_Parameters['start'] <= key && key <= U_Parameters['end']) {
                        specialGets++;
                    }
                } else {
                    zeroResultPointLookups += 1;
                    totalGets++;
                }
            } else {
                queries = "";
                isValid = false;
                break;
            }
        }

        // Calculate and update loading percentage
        var per = Math.ceil((i+1) / lines.length * 1000) / 10;
        per = Math.max(0.1, per);
        per = Math.min(99.7, per);

        if(per != percentage) {
            percentage = per;
            postMessage({to: "workload", msg: "percentage", percentage: percentage});
        }          
    }

    if(isValid) {
        pointLookupsPercent = Math.round(pointLookups/queries*100)/100;
        zeroResultPointLookupsPercent = Math.round(zeroResultPointLookups/queries*100)/100;
        writesPercent = Math.round(writes/queries*100)/100;

        // Calculate pget
        U_Parameters['p_get'] = Math.round(specialGets/totalGets*100)/100;
    } else {
        postMessage({to: "workload", msg: "invalid"});
    }

    // Update the inputs
    postMessage({to: "workload", msg: "inputs", queries: queries, pointLookupsPercent: pointLookupsPercent, zeroResultPointLookupsPercent: zeroResultPointLookupsPercent, writesPercent: writesPercent, fileName: e.data.selectedFile.name, uParameters: U_Parameters});
}