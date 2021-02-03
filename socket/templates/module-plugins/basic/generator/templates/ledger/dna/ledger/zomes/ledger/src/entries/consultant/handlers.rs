use crate::{
    error::LedgerResult,
    consultant::{Consultant, ConsultantEntry}
};
use hdk3::prelude::*;

use super::{ConsultantListInput, ConsultantList};

/// Create a new consultant
pub(crate) fn create_consultant(consultant_entry: ConsultantEntry) -> LedgerResult<Consultant> {
    let ConsultantEntry { path, uuid, .. } = consultant_entry.clone();
    let path: Path = Path::from(format!("{}.{}", path, uuid));
    path.ensure()?;
    create_entry(&consultant_entry)?;
    let entry_hash = hash_entry(&consultant_entry)?;
    let _consultant_link: HeaderHash = create_link(path.hash()?, entry_hash.clone(), ())?;
    Consultant::new(consultant_entry, entry_hash)
}

pub(crate) fn delete_consultant(consultant: Consultant) -> LedgerResult<()> {
    // This is a workaround for now
    if let Some(Details::Entry(metadata::EntryDetails{headers,..})) = get_details(consultant.entry_hash, GetOptions::default())?{
      if let Some(header) = headers.first(){
        delete_entry(header.header_address().clone())?;
      }
    }
    Ok(())
}

pub(crate) fn list_consultants(input: ConsultantListInput) -> LedgerResult<ConsultantList> {
    let path_path = Path::from(input.path);
    let consultant_path_links = path_path.children()?.into_inner();
    let mut consultants = Vec::with_capacity(consultant_path_links.len());
    for consultant_uuid in consultant_path_links.into_iter().map(|link| link.target) {
    let mut links = get_links(consultant_uuid, None)?.into_inner();
    links.sort_by_key(|l|l.timestamp);
    if let Some(consultant_link_last) = links.last() {
         if let Some(element) = get(consultant_link_last.target.clone(), GetOptions::default())? {
                if let Some(consultant) = element.into_inner().1.to_app_option::<ConsultantEntry>()? {
                    consultants.push(Consultant::new(consultant.clone(), hash_entry(&consultant)?)?);
                }
            }
        }
    }
    Ok(consultants.into())
}
