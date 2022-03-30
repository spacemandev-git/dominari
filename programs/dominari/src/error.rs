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

    #[msg("Invalid Move: Ownership Check")]
    InvalidMoveOwnershipCheck,

    #[msg("Invalid Move: Game Check")]
    InvalidMoveGameCheck,

    #[msg("Invalid Move: Range Check")]
    InvalidMoveRangeCheck,

    #[msg("Invalid Move: Recovery Check")]
    InvalidMoveRecoveryCheck,

    #[msg("Invalid Attack: Troops Check")]
    InvalidAttackTroopsCheck,

    #[msg("Invalid Attack: Ownership Check")]
    InvalidAttackOwnershipCheck,

    #[msg("Invalid Attack: Game Check")]
    InvalidAttackGameCheck,

    #[msg("Invalid Attack: Range Check")]
    InvalidAttackRangeCheck,

    #[msg("Invalid Attack: Recovery Check")]
    InvalidAttackRecoveryCheck,

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