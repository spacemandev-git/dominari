use anchor_lang::prelude::*;
use crate::state::*;

#[account]
pub struct Location {
    pub initalizer: Pubkey,
    pub bump: u8,
    pub coords: Coords,
    pub lamports_invested: u64,
    pub feature: Option<Feature>,
    pub lamports_harvested: u64,
    pub troops: Option<Troop>,
    pub troop_owner: Option<Pubkey>
}

#[account]
#[derive(Default)]
pub struct SpaceMetadata {
    pub bump: u8,
    pub mint: Pubkey,
    pub price: u64,
    pub space_x: i64,
    pub space_y: i64,
}