# write_rmm_db.py
"""
Write and update an RMM database.
"""
#---------------
# Import modules
#---------------
import sys
import sqlite3
import numpy as np
import datetime as dt

#------------
# Date method
#------------
def dateRange(first, last):

    # Type check, float --> int
    if isinstance(first[0], float):
        temp = np.zeros_like(first, dtype='int')
        for i in xrange(temp.size):
            temp[i] = first[i]
        first = tuple(temp)

    if isinstance(last[0], float):
        temp = np.zeros_like(last, dtype='int')
        for i in xrange(temp.size):
            temp[i] = last[i]
        last = tuple(temp)

    # Initialize date dictionary
    dateList = {}

    # Populate dictionary
    first = dt.datetime(*first[:6])
    last = dt.datetime(*last[:6])
    n = (last + dt.timedelta(days=1) - first).days
    dateList['year'] = np.array([(first + dt.timedelta(days=i)).year for i in xrange(n)])
    dateList['month'] = np.array([(first + dt.timedelta(days=i)).month for i in xrange(n)])
    dateList['day'] = np.array([(first + dt.timedelta(days=i)).day for i in xrange(n)])

    return dateList

#--------------
# Read RMM data
#--------------
fn = './rmmBom.txt'
rmm = np.genfromtxt(fn, delimiter=None)

#--------------------
# Create date strings
#--------------------
dates = dateRange((1974,6,1), (2015,10,5))
datestr = []

for i in xrange(dates['year'].size):
    datestr.append(dt.datetime(dates['year'][i], dates['month'][i],
        dates['day'][i]).strftime('%Y-%m-%d'))

#----------------------------
# Extract data from RMM array
#----------------------------
rmm1 = []
rmm2 = []
phase = []
amp = []

for i in xrange(rmm.shape[0]):
    rmm1.append(rmm[i,3])
    rmm2.append(rmm[i,4])
    phase.append(rmm[i,5])
    amp.append(rmm[i,6])

# Zip lists
db_list = zip(datestr, rmm1, rmm2, phase, amp)

#--------------
# Connect to DB
#--------------
connection = sqlite3.connect('./rmm_index.db')

#--------------
# Create cursor
#--------------
cursor = connection.cursor()

#---------
# Build DB
#---------
cmd = """
CREATE TABLE rmm (
date DATE,
rmm1 INTEGER,
rmm2 INTEGER,
phase INTEGER,
amp INTEGER
);
"""

#------------------------------------------------
# Execute the command to create a table in the DB
#------------------------------------------------
cursor.execute(cmd)

#------------
# Populate DB
#------------
cursor.executemany('INSERT INTO rmm VALUES (?,?,?,?,?)', db_list)

#-----------------------------------------------
# Save (commit) changes and close the connection
#-----------------------------------------------
connection.commit()
connection.close()
