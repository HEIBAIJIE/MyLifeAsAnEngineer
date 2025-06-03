#!/bin/bash
kubectl scale deployment tcog-frontend -n tcog --replicas=0
git pull origin main
chmod u+x build.sh
./build.sh --all
kubectl scale deployment tcog-frontend -n tcog --replicas=3