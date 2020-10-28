var uploadDataWorkloadWorker = new Worker('js/uploadDataWorkloadWorker.js');

/**
 * Get selected data file, show indicator, and call worker to calculate data inputs
 * @param {*} event 
 */
function uploadDataFile(event) {
    // Clear data
    clearData();

    // Get selected file
    const selectedFile = event.target.files[0];
    document.getElementById("data-input-file-name").innerHTML = "loading... " + selectedFile.name;
    
    document.getElementById("data-input-file-invalid").innerHTML = "";
    document.getElementById("loading_data_percentage").innerHTML = "0.1%";

    // Show indicator
    document.getElementById("loading_indicator_1").style.opacity = 1;

    // Get uniform/skew
    let uniform;
    if (document.getElementById('data_radio_1').checked) {
        uniform = true;
    } else {
        uniform = false;
    }

    // Call worker
    uploadDataWorkloadWorker.addEventListener('message', onUploadDataFileWorkerMessage);
    uploadDataWorkloadWorker.postMessage({from: "data", selectedFile: selectedFile, uniform: uniform});
}

/**
 * Clear data inputs: N, E, F
 */
function clearData() {
    var entries = "";
    var keySize = "";
    var entrySize = "";
    document.getElementById("N").value = numberWithCommas(entries);
    document.getElementById("E").value = entrySize;
    document.getElementById("F").value = keySize;
}

/**
 * Receive data from worker and display data or error
 * @param {*} e 
 */
function onUploadDataFileWorkerMessage(e) {
    if(e.data.to == "data") {
        switch (e.data.msg) {
            case 'percentage':
                displayDataPercentage(e.data);
                break;
            case 'invalid':
                displayDataError();
                break;
            case 'inputs':
                displayDataInputs(e.data);
                break;
            default:
                break;
        }
    }
}

function displayDataPercentage(data) {
    var percentage = data.percentage;
    document.getElementById("loading_data_percentage").innerHTML = percentage + "%";
}

function displayDataError() {
    document.getElementById("data-input-file-invalid").innerHTML = "Invalid format";

    // Hide indicator
    document.getElementById("loading_indicator_1").style.opacity = 0;
}

function displayDataInputs(data) {

    // Update the inputs
    document.getElementById("N").value = numberWithCommas(data.entries);
    document.getElementById("E").value = data.entrySize;
    document.getElementById("F").value = data.keySize;
    document.getElementById("data-input-file-name").innerHTML = data.fileName;
    
    if(data.uParameters.p_put == 0) {
        U = data.uParameters.U;
    } else {
        U_1 = data.uParameters.U_1;
        U_2 = data.uParameters.U_2;
        p_put = data.uParameters.p_put;
    }

    // Hide indicator
    document.getElementById("loading_indicator_1").style.opacity = 0;
    
    // Clear input file
    document.getElementById("data-input").value = "";
}