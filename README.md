# Dominari

## Description
Dominari is a real time strategy wargame built on top of the Solana blockchain and the Extend.xyz NFT project. Games take place in Extend neighborhoods as layers on top of the (X,Y) coordinate grid. Builders who own the (X,Y) NFT on Extend can upgrade their coresponding (X,Y) location in Dominari, building Features that player troops can use when the traverse over them. Players can register for games and start with a simple Scout. They move around to loot buildings that Builders have put on their locations for more cards, all the while attacking and defending against other players trying to do the same. Players earn points by playing more cards to the table and defeating enemy troops. 

## JS Library
To build the JS library to connect to the game, clone this repository and navigate to js/ folder. There run 
```
npm run build
```

This will create a dist/ folder with dominari.js and dominari.d.ts files. You can them import these files into your front end to instantiate a game and interact with existing games. 

To see an example of how to interact with an existing game, check out migrations/simulate.ts file as it walks through connecting to a game and how to use each function. 
