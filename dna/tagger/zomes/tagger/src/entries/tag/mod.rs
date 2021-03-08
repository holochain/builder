use hdk::prelude::*;
use crate::{
    error::TaggerResult
};
pub mod handlers;

/// The actual tag data that is saved into the DHT
/// This is the data that can change.
#[hdk_entry(id = "tag_entry")]
#[derive(Clone)]
#[serde(rename_all = "camelCase")]
pub struct TagEntry {
    organisation_uuid: String,
    uuid: String,
    tag_text: String,
    color: String,
    parent: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    organisation_uuid: String,
    uuid: String,
    tag_text: String,
    color: String,
    parent: String,
    entry_hash: EntryHash,
}

/// Input to the list tags call
#[derive(Debug, Serialize, Deserialize)]
pub struct TagListInput {
    parent: String,
}

/// The tags returned from list tags
#[derive(Debug, Serialize, Deserialize, derive_more::From)]
pub struct TagList {
    tags: Vec<Tag>,
}

impl Tag {
    pub fn new(entry: TagEntry, entry_hash: EntryHash) -> TaggerResult<Tag> {
        Ok(Tag{
            organisation_uuid: entry.organisation_uuid,
            uuid: entry.uuid,
            tag_text: entry.tag_text,
            color: entry.color,
            parent: entry.parent,
            entry_hash,
        })
    }
}
