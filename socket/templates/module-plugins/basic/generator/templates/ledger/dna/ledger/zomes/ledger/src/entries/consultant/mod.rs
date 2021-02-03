use hdk3::prelude::*;
use crate::{
    error::LedgerResult
};
pub mod handlers;

/// The actual invoice data that is saved into the DHT
/// This is the data that can change.
#[hdk_entry(id = "invoice_entry")]
#[derive(Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ConsultantEntry {
    uuid: String,
    base64_agent_pub_key: String,
    name: String,
    email: String,
    billing_address: String,
    billing_contact: String,
    financial_institution: String,
    bsb: String,
    account: String,
    path: String,
}

/// A channel is consists of the category it belongs to
/// and a unique id
#[derive(Debug, Clone, Serialize, Deserialize, SerializedBytes)]
#[serde(rename_all = "camelCase")]
pub struct Consultant {
    uuid: String,
    base64_agent_pub_key: String,
    name: String,
    email: String,
    billing_contact: String,
    billing_address: String,
    financial_institution: String,
    bsb: String,
    account: String,
    path: String,
    entry_hash: EntryHash,
}

/// Input to the list invoices call
#[derive(Serialize, Deserialize, SerializedBytes)]
pub struct ConsultantListInput {
    path: String,
}

/// The invoices returned from list invoices
#[derive(Serialize, Deserialize, SerializedBytes, derive_more::From)]
pub struct ConsultantList {
    consultants: Vec<Consultant>,
}

impl Consultant {
    pub fn new(entry: ConsultantEntry, entry_hash: EntryHash) -> LedgerResult<Consultant> {
        Ok(Consultant{
            uuid: entry.uuid,
            base64_agent_pub_key: entry.base64_agent_pub_key,
            name: entry.name,
            email: entry.email,
            billing_contact: entry.billing_contact,
            billing_address: entry.billing_address,
            financial_institution: entry.financial_institution,
            bsb: entry.bsb,
            account: entry.account,
            path: entry.path,
            entry_hash: entry_hash
        })
    }
}
