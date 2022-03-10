use anchor_lang::prelude::*;
use crate::state::*;
use crate::account::*;

#[event]
pub struct NewLocationInitalized {
    pub coords: Coords,
    pub initializer: Pubkey
}

#[event]
pub struct FeatureModified {
    pub coords: Coords,
    pub feature: Option<Feature>
}

#[event]
pub struct NewPlayerRegistered {
    pub gamekey: Pubkey,
    pub playerkey: Pubkey,
    pub playername: String
}

#[event]
pub struct TroopsMoved {
    pub gamekey: Pubkey, 
    pub player: Pubkey,
    pub source: Coords, 
    pub target: Coords,
    pub troops: Troop
}