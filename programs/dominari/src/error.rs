use anchor_lang::prelude::*;

#[error]
pub enum CustomError {
    #[msg("The Space NFT you provided is not valid")]
    NFTNotValid,
}