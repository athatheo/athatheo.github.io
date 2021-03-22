# Cosine

This repository contains the code of the Cosine web tool, to calculate 
costs, latencies and other design related information, regarding using 
the Cosine design.

## Files
The four most imporant files in this repository are:
- index.html for obvious purposes contains the basic layout, that is getting enhanced
by functions run in the rest of the code, adding information and/or graphs
- autorerun.js initializes the whole design computation process
- draw_chart.js is responsible for calling functions related to drawing graphs, adding information, 
as well as connecting to worker.js where the main computations are done
- worker.js is responsible for the majority of computations. The various continuums
are built here. draw_chart.js is using data and arrays produced here to 
present the results to the users.

### worker.js 
For multithreading purposes a Web Worker has been implemented.
There are three main functions here: 
- `buildContinuum`
- `navigateDesignSpace`
- `navigateDesignSpaceForExistingSystem`

#### `buildContinuum`
This is the main function called for every VM combination that is to be tested. 

#### `navigateDesignSpace`
This finds out the optimal values for a specific setup.

#### `navigateDesignSpaceForExistingSystem`
This returns the result for an already existing configuration.

### draw_chart.js
It has a major functionality in the code. It contains the functions responsible for calling
the continuum building functions from `worker.js` as well as various functions that are responsible
for creating the necessary elements in the website for the user to see results.

### autoRerun.js
This file contains the necessary functions for initializing variables as well as drawing basic
elements on the website.

### uploadDataFile.js
This file contains the basic functionality for uploading files in the data and 
and workload categories. It's also responsible for calling functions in the
`uploadDataWorkloadWorker.js` and `uploadWorkloadFile.js`. They are also
connected through Listeners for any upload event.



