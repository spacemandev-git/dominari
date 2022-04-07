#!/bin/bash

# Start up Solana Test validator locally
nohup solana-test-validator --reset --ledger dominari-ledger >/dev/null &
STLPID=$!
echo $STLPID
sleep 5
# Set Solana to localnet
solana config set -u localhost
# Fund Second Account for tests
solana airdrop 5000 83vu98TvDWstyexssmc3FmyN2KCjbSQf6sVYcger6Rxg
echo "Deploying Program"
solana program deploy target/deploy/dominari.so >/dev/null
solana account domeqWjkc4X3nn2G6GvAMwNN96wV5WgRvUWVnt6LnsG
sleep 15
# Run the Initalization Scripts
ts-node migrations/initondemand.ts game01 0 0
