use anchor_lang::prelude::*;
use crate::state::*;

#[account]
pub struct Location {
    pub initalizer: Pubkey,
    pub coords: Coords,
    pub feature: Feature,
    pub troops: Option<Troop>,
    pub troop_owner: Option<Pubkey>
}