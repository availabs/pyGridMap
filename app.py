#!flask/bin/python
from flask import Flask, jsonify, abort
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
mlats = np.squeeze(np.where(np.logical_and(lats >= -80, lats <= 80)))
maxLag = 15
lags = np.arange(-maxLag, maxLag+1)
numVals = mlats.size*lons.size

#==============================================================================
# Load data
#==============================================================================
data = sio.loadmat('./son_tc_counts.mat')
rmmCountArray = data['rmmCountArray']

#==============================================================================
# Loop over phase to print x-grid, y-grid, and corresponding values
#==============================================================================
app = Flask(__name__)

@app.route('/')
def index():
    return "Hello, World!"

@app.route('/grids/<int:phase>', methods=['GET'])
def get_phase(phase):
    print 'getting phase '+str(phase)
    if phase < 0 or phase > 8:
        abort(404)

    # Define grid and convert to vector
    X, Y = np.meshgrid(np.arange(0,360,2.5), np.arange(80,-81,-2.5))
    xVector = X.ravel(1)
    yVector = Y.ravel(1)

    # Contour fill density
    tempValues = rmmCountArray[phase,mlats,:]
    tempValues = tempValues.ravel(1)

    # Populate vectors
    phases = np.repeat(phase+1, numVals)
    xGrid = xVector
    yGrid = yVector
    values = tempValues

    #==============================================================================
    # Concatenate vectors and write data
    #==============================================================================
    printArray = np.concatenate((phases[:,None], xGrid[:,None], yGrid[:,None],
                                 values[:,None]), 1)

    print printArray
    return simplejson.dumps(printArray.tolist())

if __name__ == '__main__':
    app.run(debug=True)

# def get_task(task_id):
#     task = [task for task in tasks if task['id'] == task_id]
#     if len(task) == 0:
#         abort(404)
#     return jsonify({'task': task[0]})

# # Write to csv
# np.savetxt('./grid_values.csv', printArray, fmt='%1.1f', delimiter=',')
