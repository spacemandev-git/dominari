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
# Run the Initalization Scripts
#ts-node migrations/init.ts
# Run the Test Game Simulation Scripts (will run init automatically)
ts-node migrations/simulate.ts
# Kill the ledger
kill -9 $STLPID