#!/bin/bash

# Start up Solana Test validator locally
nohup solana-test-validator --reset --ledger dominari-ledger >/dev/null &
STLPID=$!
echo $STLPID
sleep 5
# Set Solana to localnet
solana config set -u localhost
# Fund Second Account for tests
solana transfer 7Tn83bS6TJquiCz9pXsCnYZpZmqPQrTjyeksPmJgURoS 50 --allow-unfunded-recipient
solana balance 83vu98TvDWstyexssmc3FmyN2KCjbSQf6sVYcger6Rxg
solana balance 7Tn83bS6TJquiCz9pXsCnYZpZmqPQrTjyeksPmJgURoS
# Deploy the program
echo "Deploying Program"
solana program deploy target/deploy/dominari.so >/dev/null
solana account BGYHifTqRGUnJMfugZn5sbAZqjMR6bPZ98NmLcDeb7N7
sleep 15
# Run the Initalization Scripts
# Clear Logs directory
rm -rf migrations/logs
mkdir migrations/logs
#ts-node migrations/init.ts
# Run the Test Game Simulation Scripts (will run init automatically)
ts-node migrations/simulate.ts
# Kill the ledger
kill -9 $STLPID