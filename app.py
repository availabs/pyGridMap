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
# Loop over phase to print x-grid, y-grid, and corresponding values
#==============================================================================
app = Flask(__name__)
CORS(app) # Allow restricted resource to be requested from outside domain

@app.route('/')
def index():
    return "Hello, World!"

@app.route('/grids/<int:phase>', methods=['GET'])
def get_phase(phase):
    return 'test123' # Returns JSON formatted string

if __name__ == '__main__':
    app.run(debug=True)
