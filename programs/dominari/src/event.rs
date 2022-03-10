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