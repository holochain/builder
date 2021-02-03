use crate::{
    error::LedgerResult,
    invoice::{Invoice, InvoiceEntry}
};
use hdk3::prelude::*;

use super::{InvoiceListInput, InvoiceList};

/// Create a new invoice
pub(crate) fn create_invoice(invoice_entry: InvoiceEntry) -> LedgerResult<Invoice> {
    let InvoiceEntry { path, uuid, .. } = invoice_entry.clone();
    let path: Path = Path::from(format!("{}.{}", path, uuid));
    path.ensure()?;
    create_entry(&invoice_entry)?;
    let entry_hash = hash_entry(&invoice_entry)?;
    let _invoice_link: HeaderHash = create_link(path.hash()?, entry_hash.clone(), ())?;
    Invoice::new(invoice_entry, entry_hash)
}

pub(crate) fn delete_invoice(invoice: Invoice) -> LedgerResult<()> {
    // This is a workaround for now
    if let Some(Details::Entry(metadata::EntryDetails{headers,..})) = get_details(invoice.entry_hash, GetOptions::default())?{
      if let Some(header) = headers.first(){
        delete_entry(header.header_address().clone())?;
      }
    }
    Ok(())
}

pub(crate) fn list_invoices(input: InvoiceListInput) -> LedgerResult<InvoiceList> {
    let path_path = Path::from(input.path);
    let invoice_path_links = path_path.children()?.into_inner();
    let mut invoices = Vec::with_capacity(invoice_path_links.len());
    for invoice_uuid in invoice_path_links.into_iter().map(|link| link.target) {
    let mut links = get_links(invoice_uuid, None)?.into_inner();
    links.sort_by_key(|l|l.timestamp);
    if let Some(invoice_link_last) = links.last() {
         if let Some(element) = get(invoice_link_last.target.clone(), GetOptions::default())? {
                if let Some(invoice) = element.into_inner().1.to_app_option::<InvoiceEntry>()? {
                    invoices.push(Invoice::new(invoice.clone(), hash_entry(&invoice)?)?);
                }
            }
        }
    }
    Ok(invoices.into())
}
