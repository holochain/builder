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
pub struct InvoiceEntry {
    uuid: String,
    invoice_id: String,
    timestamp: u64,
    items: String,
    total: u32,
    currency: String,
    consultant_name: String,
    consultant_email: String,
    consultant_billing_contact: String,
    consultant_billing_address: String,
    consultant_financial_institution: String,
    consultant_bsb: String,
    consultant_account: String,
    client_name: String,
    client_billing_contact: String,
    client_billing_address: String,
    path: String,
}

/// A channel is consists of the category it belongs to
/// and a unique id
#[derive(Debug, Clone, Serialize, Deserialize, SerializedBytes)]
#[serde(rename_all = "camelCase")]
pub struct Invoice {
    uuid: String,
    invoice_id: String,
    timestamp: u64,
		items: String,
    total: u32,
    currency: String,
    consultant_name: String,
    consultant_email: String,
    consultant_billing_contact: String,
    consultant_billing_address: String,
    consultant_financial_institution: String,
    consultant_bsb: String,
    consultant_account: String,
    client_name: String,
    client_billing_contact: String,
    client_billing_address: String,
    path: String,
    entry_hash: EntryHash,
}

/// Input to the list invoices call
#[derive(Serialize, Deserialize, SerializedBytes)]
pub struct InvoiceListInput {
    path: String,
}

/// The invoices returned from list invoices
#[derive(Serialize, Deserialize, SerializedBytes, derive_more::From)]
pub struct InvoiceList {
    invoices: Vec<Invoice>,
}

impl Invoice {
    pub fn new(entry: InvoiceEntry, entry_hash: EntryHash) -> LedgerResult<Invoice> {
        Ok(Invoice{
            uuid: entry.uuid,
            invoice_id: entry.invoice_id,
            timestamp: entry.timestamp,
            items: entry.items,
            total: entry.total,
            currency: entry.currency,
            consultant_name: entry.consultant_name,
            consultant_email: entry.consultant_email,
            consultant_billing_contact: entry.consultant_billing_contact,
            consultant_billing_address: entry.consultant_billing_address,
            consultant_financial_institution: entry.consultant_financial_institution,
            consultant_bsb: entry.consultant_bsb,
            consultant_account: entry.consultant_account,
            client_name: entry.client_name,
            client_billing_contact: entry.client_billing_contact,
            client_billing_address: entry.client_billing_address,
            path: entry.path,
            entry_hash: entry_hash
        })
    }
}
