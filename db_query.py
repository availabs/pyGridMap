#!flask/bin/python
#==============================================================================
# Import modules
#==============================================================================
from flask import Flask, jsonify, abort
from flask.ext.cors import CORS
# import sys
# import numpy as np
# import scipy.io as sio
import sys
import sqlite3
import json
import simplejson


#==============================================================================
# Path to DB
#==============================================================================
db_path = './rmm_db/rmm_index.db'

#==============================================================================
# Start server
#==============================================================================
app = Flask(__name__)
CORS(app) # Allow restricted resource to be requested from outside domain

@app.route('/')
def index():
    return "Hello, World!"

@app.route('/db/', methods=['GET'])

#==============================================================================
# Connect to DB
#==============================================================================
def query():

    # Connect to the DB; enable column access by name: row['column_name']
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row

    # Fetch data from table and write to JSON
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM rmm")

    results = cursor.fetchall()

    # DB data as a list with a dict per DB record
    rows = [dict(res) for res in results]

    # DB data as a single JSON string
    rows_json = json.dumps(rows)

    return rows_json # Returns JSON formatted string

    conn.close() # Close connection

if __name__ == '__main__':
    app.run(debug=True)
