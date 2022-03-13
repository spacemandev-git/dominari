use anchor_lang::prelude::*;
use crate::state::*;

#[account] //NOT deriving default here cause manually allocating space
pub struct Location {
    pub initializer: Pubkey,
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

#[account]
#[derive(Default)]
pub struct Game {
    pub coords: Coords,
    pub authority: Pubkey,
    pub enabled: bool    
}

#[account]
pub struct Player {
    pub gamekey: Pubkey,
    pub authority: Pubkey,
    pub name: String,
    pub cards: Vec<Card>, //max u16 (65565 cards)
}

#[account]
pub struct DropTable {
    pub id: u8, //ID of the drop table
    pub cards: Vec<Card>,
}