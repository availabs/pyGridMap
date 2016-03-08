#!flask/bin/python
#---------------
# Import modules
#---------------
from flask import Flask, jsonify, abort
from flask.ext.cors import CORS
import numpy as np
import simplejson
import psycopg2
import sys

months = {
    '1': '(12, 1, 2)',
    '2': '(1, 2, 3)',
    '3': '(2, 3, 4)',
    '4': '(3, 4, 5)',
    '5': '(4, 5, 6)',
    '6': '(5, 6, 7)',
    '7': '(6, 7, 8)',
    '8': '(7, 8, 9)',
    '9': '(8, 9, 10)',
    '10': '(9, 10, 11)',
    '11': '(10, 11, 12)',
    '12': '(11, 12, 1)'
}

#-----------------------------------
# Connect to the server and database
#-----------------------------------
con = psycopg2.connect(host='mars.availabs.org', database='height', user='postgres',
    password='Jedi21funk')
cur = con.cursor()
cur.execute('SELECT version()')
ver = cur.fetchone()

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

# Route 1
@app.route('/')
def index():
    return "Hello, World!"


# Route 2
@app.route('/grids/<int:height>/<int:year>/<int:month>/<int:day>/<int:hour>', methods=['GET'])
def get_field_by_datetime(height, year, month, day, hour):

    query = 'SELECT "surface1Value", nx, ny, id, "refTime" FROM public.header_values ' + \
        'WHERE "surface1Value" = ' + str(height) + ' AND "refTime" = timestamp ' + \
        '\'' + str(year) + '-' + str(month) + '-' + str(day) + ' ' + str(hour) + ':00\';'
    cur.execute(query)
    header = cur.fetchone()

    header_index = header[3]

    query = 'SELECT value FROM gph_' + str(height) + ' WHERE header_id = ' + str(header_index) + \
        'ORDER BY index ASC;'
    cur.execute(query)

    data = cur.fetchall()
    data = [i[0] for i in data]
    print data

    output = {
        "header": {
            "lo1": 0,
            "la1": 90,
            "dx": 2.5,
            "dy": 2.5,
            "nx": header[1],
            "ny": header[2]
        },
        "data": data
    }

    return simplejson.dumps(output)

# Route 3
@app.route('/phase/<int:phase>/amp/<int:amp>/season/<int:season>/lat/<int:lat>/lon/<int:lon>/radius/<int:radius>', methods=['GET'])
def get_field_by_phase_position(phase, amp, season, lat, lon, radius):

    query = 'select index, avg(value), count(1) from gph_500 where header_id in (' \
        'select id from header_values where "refTime" in' \
        ' (SELECT event_time' \
          ' FROM public.tropical_cyclone_index' \
          ' where phase = ' + str(phase) + ' and amplitude > ' + str(amp) + \
        	' and month in ' + months[str(season)] + \
        	' and ST_Distance( ST_MakePoint(lat,lon), ST_MakePoint(' + str(lat) + ',' + str(lon)+ ')) <= ' + str(radius) + \
          ' group by event_time,name,year,month,day' \
          ' order by year,month,day))' \
        ' group by index;'

    cur.execute(query)

    data = cur.fetchall()
    data = [i[1] for i in data]
    print data

    output = {
        "header": {
            "lo1": 0,
            "la1": 90,
            "dx": 2.5,
            "dy": 2.5,
            "nx": 144,
            "ny": 73
        },
        "data": data
    }

    return simplejson.dumps(output)

if __name__ == '__main__':
    app.run(debug=True)
