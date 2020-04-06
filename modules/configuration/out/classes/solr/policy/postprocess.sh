#!/bin/bash

export LC_ALL=C # must use consistent collation order

if [[ ! $# -eq 2 || -z "$2" || "$1" != "-T" ]] ; then
  echo "usage: $0 -T tempDir"
  exit 1
elif [[ ! -d "$2" ]]; then
  echo "directory $2 does not exist"
  exit 2
fi

# NOTE: if XML output changes (e.g. because query is modified) these columns may change
urnField=7,8
sliceDateField=5,6r
termNumberField=9,10rn

tempDir=$2

sort -T $tempDir --stable --key=$urnField --key=$sliceDateField --key=$termNumberField "--field-separator=>" | \
sort -T $tempDir --unique --key=$urnField                                              "--field-separator=>"