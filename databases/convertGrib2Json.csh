#!/bin/bash
# Convert grb2 files to JSON files

for fn_ext in ~/data/*.grb2; do
    fp=~/data/converted/
    fn=${fn_ext##*/}
    grib2json -d -o "$fp${fn%.*}.json" "$fn_ext"
    echo $fn
done

exit 0
