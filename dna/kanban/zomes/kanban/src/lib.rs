use entries::card;
use hdk3::prelude::Path;
use hdk3::prelude::*;
use card::{CardEntry, Card, CardListInput, CardList};

mod entries;
mod error;

entry_defs![Path::entry_def(), CardEntry::entry_def()];

#[hdk_extern]
fn create_card(card_entry: CardEntry) -> ExternResult<Card> {
    Ok(card::handlers::create_card(card_entry)?)
}

#[hdk_extern]
fn delete_card(card: Card) -> ExternResult<()> {
    Ok(card::handlers::delete_card(card)?)
}

#[hdk_extern]
fn list_cards(parent: CardListInput) -> ExternResult<CardList> {
    Ok(card::handlers::list_cards(parent)?)
}
