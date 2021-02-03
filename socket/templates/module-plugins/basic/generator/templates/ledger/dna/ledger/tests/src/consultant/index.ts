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
const consultant1 = {
  uuid: uuidv4(),
  base64AgentPubKey: 'base64_agent_pub_key',
  name: 'Test Consultant 1',
  email: 'test@test.com',
  billingContact: 'Contact',
  billingAddress: 'Address',
  financialInstitution: 'Transferwise',
  bsb: '000-000',
  account: '111-222-333',
  path: 'Consultants'
}
const consultant2 = {
  uuid: uuidv4(),
  base64AgentPubKey: 'base64_agent_pub_key',
  name: 'Test Consultant 2',
  email: 'test@test.com',
  billingContact: 'Contact',
  billingAddress: 'Address',
  financialInstitution: 'Transferwise',
  bsb: '000-000',
  account: '111-222-333',
  path: 'Consultants'
}

module.exports = (orchestrator) => {
  orchestrator.registerScenario('Create a consultant', async (s, t) => {
    const [alice] = await s.players([conductorConfig])
    const [[alice_ledger_happ]] = await alice.installAgentsHapps(installation)
    const result = await alice_ledger_happ.cells[0].call('ledger', 'create_consultant', consultant1)
    console.log('consultant', result)
    t.notEqual(result.entryHash, null)
  })
  orchestrator.registerScenario('Create, then list consultants', async (s, t) => {
    const [alice] = await s.players([conductorConfig])
    const [[alice_ledger_happ]] = await alice.installAgentsHapps(installation)
    const result1 = await alice_ledger_happ.cells[0].call('ledger', 'create_consultant', consultant1);
    const result2 = await alice_ledger_happ.cells[0].call('ledger', 'create_consultant', consultant2);
    console.log('consultant1', result1)
    console.log('consultant2', result2)
    const result = await alice_ledger_happ.cells[0].call('ledger', 'list_consultants', { path: 'Consultants' });
    console.log('consultantList', result)
    t.deepEqual(result.consultants.length, 2)
  })
  orchestrator.registerScenario('Create then delete a consultant', async (s, t) => {
    const [alice] = await s.players([conductorConfig])
    const [[alice_ledger_happ]] = await alice.installAgentsHapps(installation)
    const consultant = await alice_ledger_happ.cells[0].call('ledger', 'create_consultant', consultant1);
    console.log('consultant', consultant)
    delay(1000)
    const deleteResult = await alice_ledger_happ.cells[0].call('ledger', 'delete_consultant', consultant);
    console.log('deletedConsultant', deleteResult)
    const result = await alice_ledger_happ.cells[0].call('ledger', 'list_consultants', { path: 'Consultants' })
    console.log('consultantList', result)
    t.deepEqual(result.consultants.length, 0)
  })
}
