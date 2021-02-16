use entries::tag;
use hdk3::prelude::Path;
use hdk3::prelude::*;
use tag::{TagEntry, Tag, TagListInput, TagList};

mod entries;
mod error;

entry_defs![Path::entry_def(), TagEntry::entry_def()];

#[hdk_extern]
fn create_tag(tag_entry: TagEntry) -> ExternResult<Tag> {
    Ok(tag::handlers::create_tag(tag_entry)?)
}

#[hdk_extern]
fn delete_tag(tag: Tag) -> ExternResult<()> {
    Ok(tag::handlers::delete_tag(tag)?)
}

#[hdk_extern]
fn list_tags(parent: TagListInput) -> ExternResult<TagList> {
    Ok(tag::handlers::list_tags(parent)?)
}
