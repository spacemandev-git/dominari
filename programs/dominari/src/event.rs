use anchor_lang::prelude::*;
use crate::state::*;

#[event]
pub struct NewLocationInitalized {
    pub coords: Coords,
    pub initializer: Pubkey
}