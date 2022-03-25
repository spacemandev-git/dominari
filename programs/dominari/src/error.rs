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

    #[msg("Feature already at max Rank")]
    FeatureMaxRank,

    #[msg("You can only activate buildings that you are occupying with a troop.")]
    NoTroopOnBuilding,

    #[msg("Out of range")]
    OutOfRange,

    #[msg("Invalid Drop Table")]
    InvalidDropTable,

    #[msg("Feature in cooldown")]
    FeatureInCooldown
}