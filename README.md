# Dominari

## Description

## TODO
### Smart Contracts     DONE
### TS Library          DONE
### Deployment Scripts
### Win Condition Server
    - Don't rely on Events as server could fail, come up with points and store them with player object
    - Keep a track of all players registered per game
    ## Win Scenarios
        - Every card you play is X points (Upgrade or Spawn) (each card has a points field it grants you)
        - Every Unit you kill while attacking is X points (It's max power)
            - Hard to do for defending player kills cause you lack the player account
        - Lootable feature that gives you X points every time you activate it
            - Use the Server to create and destroy random point value features on empty initalized spaces
        - Holding a Location for X Seconds
    ## TODO
        - Game Disable function

## Future Features
    - Set Game DAO Fee for initalization and builder harvests
    - Close Player Account? (Will lose points information...)