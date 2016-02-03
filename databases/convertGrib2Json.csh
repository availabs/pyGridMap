#!/bin/bash
# Convert grb2 files to JSON files
for fn_ext in ~/data/*.grb2; do
    fn=${fn_ext##*/}
    grib2json -d -o "~/data/converted/${fn%.*}.json" "$fn_ext"
done
