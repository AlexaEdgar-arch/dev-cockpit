#!/bin/bash

cd "$1"
PROJECT=$(ls | grep "$2")

# add check for multiple results separated by empty space - if found send message

cd "$PROJECT"

cat package.json



#a=0
#while [ $a -lt 3 ]
#do
#    # Print the values
#    echo $a
#    # increment the value
#    a=`expr $a + 1`
#done