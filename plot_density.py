#plot_density.py
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
from mpl_toolkits.basemap import Basemap
import matplotlib.colors as colors
import seaborn as sb

#==============================================================================
# Parameters
#==============================================================================
lats = np.arange(90,-91,-2.5)
lons = np.arange(0,360,2.5)
mlats = np.squeeze(np.where(np.logical_and(lats >= -80, lats <= 80)))
tlats = np.squeeze(np.where(np.logical_and(lats >= -30, lats <= 30)))
maxLag = 15
lags = np.arange(-maxLag, maxLag+1)

#==============================================================================
# Load data
#==============================================================================
filePath = './'
data = sio.loadmat(filePath + 'son_tc_counts.mat')
rmmCountArray = data['rmmCountArray']

#==============================================================================
# Set colormaps
#==============================================================================
cmap = sb.cubehelix_palette(n_colors=10, dark=0.05, light=0.95, reverse=False,
                            as_cmap=True)

#==============================================================================
# Set seaborn figure params
#==============================================================================
sb.set(style="whitegrid", palette="deep", color_codes=True)
sb.set_style(rc={"axes.edgecolor": "0.3"})
plt.rcParams['axes.linewidth'] = 2

#==============================================================================
# Loop over phase to plot TC density
#==============================================================================
for phase in xrange(8):

    # Map data
    fig = plt.figure(figsize=(11.5, 8))

    # Draw map axis
    m = Basemap(projection='cyl', llcrnrlon=0, llcrnrlat=-80, urcrnrlon=360,
                urcrnrlat=80, resolution='l')

    # Draw boundaries
    m.drawcoastlines()
    m.fillcontinents(color='0.8', zorder=0)
    m.drawcountries()

    # Draw meridians and parallels [left, right, top, bottom]
    m.drawmeridians(np.arange(0,361,30), color='0.5', dashes=(None, None),
        labels=[False, False, False, True])
    m.drawparallels(np.arange(-80,81,20), color='0.5', dashes=(None, None),
        labels=[False, True, False, False])

    # Define grid
    X, Y = m(*np.meshgrid(np.arange(0,360,2.5), np.arange(80,-81,-2.5)))

    # Contour fill density
    Zm = ma.masked_where(np.isnan(rmmCountArray[phase,mlats,:]),
                         rmmCountArray[phase,mlats,:])
    ss = m.pcolormesh(X, Y, Zm, cmap=cmap,
        norm=colors.BoundaryNorm(np.arange(0,101,10),
        cmap.N))
    ss.cmap.set_over('w')

    # Set color bar
    cb = m.colorbar(ss, "bottom", size="5%", pad="10%", extend='max',
                    drawedges=True)
    cb.set_ticks(np.arange(0, 101, 10))
    cb.set_ticklabels(np.arange(0, 101, 10))
    cb.set_label(r'Count')

    # Set title
    plt.title('RMM ' + str(phase+1) + ' TC Density | SON 1979-2010', fontsize=16,
        fontweight='bold', ha='center', y=1.02)

    ## Save figures
    plt.savefig('./' + \
               str(phase+1) + '.png', bbox_inches='tight')

    plt.close()