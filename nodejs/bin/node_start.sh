#!bin/bash

if [ "$#" -lt 1 ]; then
    echo "Enter 'ROLE' as an option.[ NN / CN / DBN ]"
    exit 1
fi
echo "ROLE : $1"
if [ "$1" == "NN" ]; then
cd ../../NNA/ && ./bin/node
fi
if [ "$1" == "CN" ]; then
cd ../../CN/ && ./bin/node
fi
if [ "$1" == "SCA" ]; then
cd ../../SCA/ && node main.js
fi
if [ "$1" == "DN" ]; then
cd ../../DN/ && node main.js
fi
if [ "$1" == "DBN" ]; then
cd ../../DBN/ && node main.js
fi