# convertGribJson2Postgres.py
"""
Populate a PostgreSQL database with data stored in JSON files.
"""
#---------------
# Import modules
#---------------
import glob
import re
import psycopg2
import json
import sys

#-----------
# Parameters
#-----------
path        = '/Users/Larry/data/converted/'
v1_files    = glob.glob(path + 'pgblnl*.json')
v2_files    = glob.glob(path + 'cdas1*.json')
files       = v1_files + v2_files
num_files   = len(files)

#-----------------------------------
# Connect to the server and database
#-----------------------------------
con = psycopg2.connect(host='mars.availabs.org', database='height', user='postgres',
    password='Jedi21funk')
cur = con.cursor()
cur.execute('SELECT version()')
ver = cur.fetchone()
print ver

#--------------------------------------------
# Loop over files to populate database tables
#--------------------------------------------
for n in xrange(num_files):

    print 'File number ' + str(n) + ': ' + files[n] # File number check

    with open(files[n]) as f:

        #----------
        # Load data
        #----------
        data = json.load(f)

        for d in xrange(len(data)):

            #-------------------------------------------------------
            # Execute SQL operations to populate header_values table
            #-------------------------------------------------------
            header_sql = "insert into header_values " + \
                "(\"refTime\", \"surface1Value\", nx, ny) " + \
                "values "
            header_sql += "(to_timestamp('" + data[d]['header']['refTime'] + \
                "', 'yyyy-mm-ddThh24:mi:ss.ms'), " + \
                str(int(data[d]['header']['surface1Value']) / 100) + ", " + \
                str(data[d]['header']['nx']) + ", " + \
                str(data[d]['header']['ny']) + ") " + \
                "returning id"

            cur.execute(header_sql)
            pg_index = cur.fetchone()[0]

            print pg_index # Index check

            #------------------------------------------------
            # Execute SQL operations to populate gph_* tables
            #------------------------------------------------
            data_sql = "insert into gph_" + \
                str(int(data[d]['header']['surface1Value']) / 100) + \
                " (header_id, index, value) values "

            for i in xrange(len(data[d]['data'])):
                data_sql += "(" + str(pg_index) + ", " + str(i) + ", " + \
                    str(data[d]['data'][i]) + "),"

            # Trim last character in data_sql
            data_sql = data_sql[:-1]
            cur.execute(data_sql)

            #---------------------------
            # Commit current transaction
            #---------------------------
            con.commit()
