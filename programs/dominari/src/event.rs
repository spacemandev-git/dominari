use anchor_lang::prelude::*;
use crate::state::*;

#[event]
pub struct NewLocationInitialized {
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

#[event] 
pub struct Combat {
    pub gamekey: Pubkey,
    pub source: Coords,
    pub target: Coords,
    pub attacking_player: Pubkey,
    pub defending_player: Pubkey,
    pub attacking_troops: Troop,
    pub defending_troops: Troop,
    pub attacking_dmg: u8,
    pub defending_dmg: u8
}

#[event]
pub struct LocationHarvested {
    pub location: Coords,
    pub harvest_amount: u64,
    pub initializer_key: Pubkey,
    pub total_harvested: u64
}

#[event]
pub struct LocationBuilderHarvested {
    pub location: Coords,
    pub harvest_amount: u64,
    pub builder_key: Pubkey,
    pub total_harvested: u64
}

#[event]
pub struct HealerActivated {
    pub gamekey: Pubkey,
    pub location: Coords, 
    pub troops: Troop,
    pub player: Pubkey,
}

#[event]
pub struct PortalActivated {
    pub gamekey: Pubkey,
    pub location: Coords,
    pub destination: Coords,
    pub troops: Troop,
    pub player: Pubkey,
}

#[event]
pub struct LocationLooted {
    pub gamekey: Pubkey,
    pub location: Coords,
    pub player: Pubkey,
    pub drop_table: u64,
    pub card: Card
}