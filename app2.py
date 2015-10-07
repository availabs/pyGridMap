#!flask/bin/python
#==============================================================================
# Import modules
#==============================================================================
from flask import Flask, jsonify, abort
from flask.ext.cors import CORS
import sys
import numpy as np
import scipy.io as sio
import simplejson

#==============================================================================
# Parameters
#==============================================================================
# General
lats = np.arange(90,-91,-2.5)
lons = np.arange(0,360,2.5)
numVals = lats.size*lons.size

#==============================================================================
# Load data
#==============================================================================
data = sio.loadmat('./pentad_composites.mat')
heightArray = data['height']

#==============================================================================
# Loop over lag to print x-grid, y-grid, and corresponding values
#==============================================================================
app = Flask(__name__)
CORS(app) # Allow restricted resource to be requested from outside domain

@app.route('/')
def index():
    return "Hello, World!"

@app.route('/heights/<int:lag>', methods=['GET'])
def get_lag(lag):

    print 'getting lag ' + str(lag)

    # Lags can only be between -15 and 15, inclusive
    if lag < 1 or lag > 6:
        abort(404)

    # Define grid and convert to vector
    lonArray, latArray = np.meshgrid(lons, lats)
    lonVector = lonArray.ravel(0)
    latVector = latArray.ravel(0)

    # Contour fill density
    tempValues = heightArray[lag-1,:,:]
    tempValues = tempValues.ravel(0)
    tempValues[np.isnan(tempValues)] = -999 # Missing value flag

    # Populate vectors
    lagNum = np.repeat(lag, numVals)
    lonGrid = lonVector
    latGrid = latVector
    values = tempValues

    # Concatenate vectors and write data
    printArray = np.concatenate((lagNum[:,None], latGrid[:,None], lonGrid[:,None],
                                 values[:,None]), 1)

    print printArray

    return simplejson.dumps(printArray.tolist()) # Returns JSON formatted string

if __name__ == '__main__':
    app.run(debug=True)
