use entries::client;
use entries::invoice;
use entries::consultant;
use error::LedgerResult;
use hdk3::prelude::Path;
use hdk3::prelude::*;
use client::{ClientEntry, Client, ClientListInput, ClientList};
use invoice::{InvoiceEntry, Invoice, InvoiceListInput, InvoiceList};
use consultant::{ConsultantEntry, Consultant, ConsultantListInput, ConsultantList};

mod entries;
mod error;

entry_defs![Path::entry_def(), ClientEntry::entry_def(), InvoiceEntry::entry_def()];

#[hdk_extern]
fn create_consultant(consultant_entry: ConsultantEntry) -> LedgerResult<Consultant> {
    consultant::handlers::create_consultant(consultant_entry)
}

#[hdk_extern]
fn delete_consultant(consultant: Consultant) -> LedgerResult<()> {
    consultant::handlers::delete_consultant(consultant)
}

#[hdk_extern]
fn list_consultants(parent: ConsultantListInput) -> LedgerResult<ConsultantList> {
    consultant::handlers::list_consultants(parent)
}

#[hdk_extern]
fn create_client(client_entry: ClientEntry) -> LedgerResult<Client> {
    client::handlers::create_client(client_entry)
}

#[hdk_extern]
fn delete_client(client: Client) -> LedgerResult<()> {
    client::handlers::delete_client(client)
}

#[hdk_extern]
fn list_clients(parent: ClientListInput) -> LedgerResult<ClientList> {
    client::handlers::list_clients(parent)
}

#[hdk_extern]
fn create_invoice(invoice_entry: InvoiceEntry) -> LedgerResult<Invoice> {
    invoice::handlers::create_invoice(invoice_entry)
}

#[hdk_extern]
fn delete_invoice(invoice: Invoice) -> LedgerResult<()> {
    invoice::handlers::delete_invoice(invoice)
}

#[hdk_extern]
fn list_invoices(parent: InvoiceListInput) -> LedgerResult<InvoiceList> {
    invoice::handlers::list_invoices(parent)
}
