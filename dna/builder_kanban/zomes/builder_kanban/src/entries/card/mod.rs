use hdk::prelude::*;
use crate::{
    error::BuilderKanbanResult
};
pub mod handlers;

/// The actual card data that is saved into the DHT
/// This is the data that can change.
#[hdk_entry(id = "card_entry")]
#[derive(Clone)]
#[serde(rename_all = "camelCase")]
pub struct CardEntry {
    uuid: String,
    name: String,
    parent_column: String,
    card_data: String,
    card_type: String,
    order: u32,
    parent: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Card {
    uuid: String,
    name: String,
    parent_column: String,
    card_data: String,
    card_type: String,
    order: u32,
    parent: String,
    entry_hash: EntryHash,
}

/// Input to the list cards call
#[derive(Debug, Serialize, Deserialize)]
pub struct CardListInput {
    parent: String,
}

/// The cards returned from list cards
#[derive(Debug, Serialize, Deserialize, derive_more::From)]
pub struct CardList {
    cards: Vec<Card>,
}

impl Card {
    pub fn new(entry: CardEntry, entry_hash: EntryHash) -> BuilderKanbanResult<Card> {
        Ok(Card{
            uuid: entry.uuid,
            name: entry.name,
            parent_column: entry.parent_column,
            card_data: entry.card_data,
            card_type: entry.card_type,
            order: entry.order,
            parent: entry.parent,
            entry_hash,
        })
    }
}
