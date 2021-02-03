import { Config, InstallAgentsHapps } from '@holochain/tryorama'
import * as _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import * as path from 'path'

const delay = ms => new Promise(r => setTimeout(r, ms))
const ledgerDna = path.join(__dirname, '../../../ledger.dna.gz')

const installation: InstallAgentsHapps = [
  [
    [ledgerDna]
  ]
]

const conductorConfig = Config.gen()

const invoice1 =  {
  uuid: uuidv4(),
  invoiceId: '0001',
  timestamp: Date.now(),
	items: '',
  total: 4000,
  currency: 'AUD',
  consultantName: 'Philip Beadle',
  consultantEmail: 'testemail@test.com',
  consultantBillingContact: 'Billing Philip',
  consultantBillingAddress: 'Billing Address',
  consultantFinancialInstitution: 'Bank',
  consultantBsb: '000-000',
  consultantAccount: 'Consultant Account',
  clientName: 'Client',
  clientBillingContact: 'Client contact',
  clientBillingAddress: 'Client address',
  path: 'Invoices'
}

const invoice2 =  {
  uuid: uuidv4(),
  invoiceId: '0002',
  timestamp: Date.now(),
	items: '',
  total: 4000,
  currency: 'AUD',
  consultantName: 'Philip Beadle2',
  consultantEmail: 'testemail@test.com2',
  consultantBillingContact: 'Billing Philip2',
  consultantBillingAddress: 'Billing Address2',
  consultantFinancialInstitution: 'Bank2',
  consultantBsb: '000-0002',
  consultantAccount: 'Consultant Account2',
  clientName: 'Client2',
  clientBillingContact: 'Client contact2',
  clientBillingAddress: 'Client address2',
  path: 'Invoices'
}

module.exports = (orchestrator) => {
  orchestrator.registerScenario('Create a invoice', async (s, t) => {
    const [alice] = await s.players([conductorConfig])
    const [[alice_ledger_happ]] = await alice.installAgentsHapps(installation)
    const invoice = await alice_ledger_happ.cells[0].call('ledger', 'create_invoice', invoice1)
    console.log('invoice', invoice)
    t.notEqual(invoice.entryHash, null)
  })
  orchestrator.registerScenario('Create, then list invoices', async (s, t) => {
    const [alice] = await s.players([conductorConfig])
    const [[alice_ledger_happ]] = await alice.installAgentsHapps(installation)
    const invoice1result = await alice_ledger_happ.cells[0].call('ledger', 'create_invoice', invoice1);
    const invoice2result = await alice_ledger_happ.cells[0].call('ledger', 'create_invoice', invoice2);
    console.log('invoice1', invoice1result)
    console.log('invoice2', invoice2result)
    const invoiceList = await alice_ledger_happ.cells[0].call('ledger', 'list_invoices', { path: 'Invoices' });
    console.log('invoiceList', invoiceList)
    t.deepEqual(invoiceList.invoices.length, 2)
  })
  orchestrator.registerScenario('Create then delete a invoice', async (s, t) => {
    const [alice] = await s.players([conductorConfig])
    const [[alice_ledger_happ]] = await alice.installAgentsHapps(installation)
    const invoice1Result = await alice_ledger_happ.cells[0].call('ledger', 'create_invoice', invoice1);
    console.log('invoice', invoice1Result)
    delay(1000)
    const deletedInvoice = await alice_ledger_happ.cells[0].call('ledger', 'delete_invoice', invoice1Result);
    console.log('deletedInvoice', deletedInvoice)
    const invoiceList = await alice_ledger_happ.cells[0].call('ledger', 'list_invoices', { path: 'Invoices' });
    console.log('invoiceList', invoiceList)
    t.deepEqual(invoiceList.invoices.length, 0)
  })
}
