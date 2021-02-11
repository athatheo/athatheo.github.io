# Cosine

This a tool that does (...)

## Files

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


