#plot_density_printout.py
"""
Plots tropical cyclone density for a given RMM phase.
"""
#==============================================================================
# Import modules
#==============================================================================
import sys
import numpy as np
import numpy.ma as ma
import scipy.io as sio
import matplotlib.pyplot as plt
import matplotlib.colors as colors

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
# Set seaborn figure params
#==============================================================================
plt.rcParams['axes.linewidth'] = 2

#==============================================================================
# Loop over phase to print x-grid, y-grid, and corresponding values
#==============================================================================
def get_phase(phase):

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

    return printArray

print get_phase(0)

# # Write to csv
# np.savetxt('./grid_values.csv', printArray, fmt='%1.1f', delimiter=',')
