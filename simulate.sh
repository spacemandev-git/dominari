#!/bin/bash

# Start up Solana Test validator locally
nohup solana-test-validator --reset --ledger dominari-ledger >/dev/null &
STLPID=$!
echo $STLPID
sleep 5
# Set Solana to localnet
solana config set -u localhost
# Deploy the program
solana program deploy target/deploy/dominari.so
solana account BGYHifTqRGUnJMfugZn5sbAZqjMR6bPZ98NmLcDeb7N7
sleep 15
# Run the Initalization Scripts
#ts-node migrations/init.ts
# Run the Test Game Simulation Scripts (will run init automatically)
ts-node migrations/simulate.ts
# Kill the ledger
kill -9 $STLPID