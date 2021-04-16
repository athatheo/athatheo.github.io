# Cosine
This README is an overview containing contains two sections. The first one describes the flow of information in this demo - from user input to 
end results. The second one gives a more in-depth description of the most important functions found here. 

---
## Information flow

### Input
The code in `index.html` sets up the HTML/CSS part of the webpage and allows the user to enter values of parameters
related to design computation.
The `init()` function from the `autoRerun.js` runs and sets the default values to each parameter.
By clicking the `Design` button, the `LoadCharts()` function from `autoRerun.js` is called, which in turn,
calls the `drawContinuumsMultithread()` function from `draw_chart.js`. There, the input parameters are parsed by the
`parseInputVariables()` function and passed to any function that needs them.

### Internal computations
The `drawContinuumsMultithread()` is responsible for parsing the given variables and assigning
them to an object. Then a message is posted using a WebWorker, and the responding function in `worker.js`
is initiated. In turn the `buildContinuums()` function is called which is responsible to return various
designs (either Cosine or default ones).

### Output
Finally, using the returned designs, the `drawContinuumsNew()` function is called. The necessary HTML components
are created and filled with the computations. The results are split into 3 different subcategories:
- Cosine Configuration vs Existing Systems  
  Here the efficiency time/cost-wise of Cosine can be seen compared to 4 other existing systems, namely RocksDB, WiredTiger, 
  FASTER_A and FASTER_H. 
- Interactive What-If Design  
  The user can select to change multiple parameters and see how that affects the final design in terms of cost and latency.
  There is also a graph, where multiple continuum points are presented, that are the optimal points in terms of cost and efficiency.
- Statistical Analysis  
In this subcategory, multiple charts are shown, where comparison between interchangeable parameters is made (e.g. AWS vs GCP, operation types, etc.)
  

---
## Important files and functions

### Folder Structure
The `data` folder contains a generator written in C that can provided sample files for uploading in the application.
The `css`, `font-awesome`, `fonts`, `images` folders are resources used in UI, by the HTML elements.
The `js` folder contains all the business logic of this demo, meaning the JavaScript files. Finally, the only two
`.html` files containing the initial HTML elements and the popup window template are in the main directory.

### Files
The four most important files in this repository are:
- `index.html` for obvious purposes contains the basic layout, that is getting enhanced
by functions run in the rest of the code, adding information and/or graphs
- `autoRerun.js` initializes the whole design computation process
- `draw_chart.js` is responsible for calling functions related to drawing graphs, adding information, 
as well as connecting to worker.js where the main computations are done
- `worker.js` is responsible for the majority of computations. The various continuums
are built here. `draw_chart.js` is using data and arrays produced here to 
present the results to the users.

#### autoRerun.js
This file contains the necessary functions for initializing variables such as `init()` as well as drawing basic
elements on the website. Results regarding the `Interactive What-If Design` and `Statistical Analysis`
outputs are fed in the HTML elements by the `switchQuestions()` and `switchStatistics()` functions respectively.

#### draw_chart.js
It has a major functionality in the code. It contains the functions responsible for calling
the continuum building functions from `worker.js` as well as various functions that are responsible
for creating the necessary elements in the website for the user to see results. It uses the data returned
from `worker.js` to fill the content of the HTML elements and present these results to the user. The 
`parseInputVariables()` function is called and passed as part of the message posted in the Web Worker.


#### worker.js 
For multithreading purposes a Web Worker has been implemented.
There are three main functions here: 
- `buildContinuum()`
- `navigateDesignSpace()`
- `navigateDesignSpaceForExistingSystem()`

There are also functions dedicated to cleaning the list of designs and sorting them in order (`correctContinuumForVariables()`, 
`correctContinuumForEachProvider()`, `removeRedundantConfigurations()` and some others).

The rest of the file contains functions that perform the necessary computations, called by the `navigateDesignSpace()`
and `navigateDesignSpaceForExistingSystem()`, such calculating various read/write costs and specific parameters.

##### `buildContinuum()`
This is the main function called for every VM combination that is to be tested and the responding design structure to be
created.

##### `navigateDesignSpace()`
This finds out the optimal values for a specific setup.

##### `navigateDesignSpaceForExistingSystem()`
This returns the result for an already existing configuration.

#### uploadDataFile.js
This file contains the basic functionality for uploading files in the data
and workload categories. It's also responsible for calling functions in the
`uploadDataWorkloadWorker.js` and `uploadWorkloadFile.js`. They are also
connected through Listeners for any upload event. This is still Work-in-Progress.
The final goal is to be able to upload files containing data and autofill the input parameters
with the correct values.



