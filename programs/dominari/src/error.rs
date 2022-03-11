use anchor_lang::prelude::*;

#[error]
pub enum CustomError {
    #[msg("The Space NFT you provided is not valid")]
    NFTNotValid,

    #[msg("Game is disabled")]
    GameDisabled,

    #[msg("Invalid Location")]
    InvalidLocation,

    #[msg("Unit Class Mismatch")]
    UnitClassMismatch,

    #[msg("Mod cannot be applied")]
    InvalidMod,

    #[msg("Invalid Move")]
    InvalidMove,

    #[msg("Invalid Attack")]
    InvalidAttack,
}