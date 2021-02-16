use crate::{
    tag::{Tag, TagEntry},
    error::TaggerResult,
};
use hdk3::prelude::*;

use super::{TagList, TagListInput};

pub(crate) fn create_tag(tag_entry: TagEntry) -> TaggerResult<Tag> {
    let TagEntry { parent, uuid, .. } = tag_entry.clone();
    let path: Path = Path::from(format!("{}.{}", parent, uuid));
    path.ensure()?;
    create_entry(&tag_entry)?;
    let entry_hash = hash_entry(&tag_entry)?;
    let _tag_link: HeaderHash = create_link(path.hash()?, entry_hash.clone(), ())?;
    Tag::new(tag_entry, entry_hash)
}

pub(crate) fn delete_tag(tag: Tag) -> TaggerResult<()> {
    if let Some(Details::Entry(metadata::EntryDetails{headers, ..})) =
        get_details(tag.entry_hash, GetOptions::default())?
    {
        if let Some(header) = headers.first() {
            delete_entry(header.header_address().clone())?;
        }
    }
    Ok(())
}

pub(crate) fn list_tags(input: TagListInput) -> TaggerResult<TagList> {
    let parent_path = Path::from(input.parent);
    parent_path.ensure()?;
    let tag_path_links = parent_path.children()?.into_inner();
    let mut tags = Vec::with_capacity(tag_path_links.len());
    for tag_path_link in tag_path_links.into_iter().map(|link| link.target) {
        let mut links = get_links(tag_path_link, None)?.into_inner();
        links.sort_by_key(|l| l.timestamp);
        if let Some(tag_link_last) = links.last() {
            if let Some(element) = get(tag_link_last.target.clone(), GetOptions::default())? {
                if let Some(tag) = element.into_inner().1.to_app_option::<TagEntry>()? {
                    tags.push(Tag::new(tag.clone(), hash_entry(&tag)?)?);
                }
            }
        }
    }
    Ok(tags.into())
}
