import { Config, InstallAgentsHapps } from '@holochain/tryorama'
import * as _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import * as path from 'path'

const delay = ms => new Promise(r => setTimeout(r, ms))
const kanbanDna = path.join(__dirname, '../../../kanban.dna.gz')
console.log('kanbanDna', kanbanDna)

const installation: InstallAgentsHapps = [
  [
    [kanbanDna]
  ]
]

const conductorConfig = Config.gen()
const cardData1 = { parentColumn: '/', name: 'Card 1', preview: '', uuid: uuidv4(), cardType: 'card', order: 0, parent: 'Cards' }
const cardData2 = { parentColumn: '/', name: 'Card 2', preview: '', uuid: uuidv4(), cardType: 'card', order: 0, parent: 'Cards' }

module.exports = (orchestrator) => {
  orchestrator.registerScenario('Create a card', async (s, t) => {
    const [alice] = await s.players([conductorConfig])
    const [[alice_kanban_happ]] = await alice.installAgentsHapps(installation)
    const card = await alice_kanban_happ.cells[0].call('kanban', 'create_card', { parentColumn: '/', name: 'Card 1', preview: '', uuid: uuidv4(), cardType: 'card', order: 0, parent: 'Cards' })
    console.log('card', card)
    t.notEqual(card.entryHash, null)
  })
  orchestrator.registerScenario('Create, then list cards', async (s, t) => {
    const [alice] = await s.players([conductorConfig])
    const [[alice_kanban_happ]] = await alice.installAgentsHapps(installation)
    const card1 = await alice_kanban_happ.cells[0].call('kanban', 'create_card', { parentColumn: '/', name: 'Card 1', preview: '', uuid: uuidv4(), cardType: 'card', order: 0, parent: 'Cards' });
    const card2 = await alice_kanban_happ.cells[0].call('kanban', 'create_card', { parentColumn: '/', name: 'Card 2', preview: '', uuid: uuidv4(), cardType: 'card', order: 0, parent: 'Cards' });
    console.log('card1', card1)
    console.log('card2', card2)
    const cardList = await alice_kanban_happ.cells[0].call('kanban', 'list_cards', { parent: 'Cards' });
    console.log('cardList', cardList)
    t.deepEqual(cardList.cards.length, 2)
  })
  orchestrator.registerScenario('Create then delete a card', async (s, t) => {
    const [alice] = await s.players([conductorConfig])
    const [[alice_kanban_happ]] = await alice.installAgentsHapps(installation)
    const card = await alice_kanban_happ.cells[0].call('kanban', 'create_card', { parentColumn: '/', name: 'Card 1', preview: '', uuid: uuidv4(), cardType: 'card', order: 0, parent: 'Cards' });
    console.log('card', card)
    const deletedClient = await alice_kanban_happ.cells[0].call('kanban', 'delete_card', card);
    console.log('deletedClient', deletedClient)
    const cardList = await alice_kanban_happ.cells[0].call('kanban', 'list_cards', { parent: 'Cards' });
    console.log('cardList', cardList)
    t.deepEqual(cardList.cards.length, 0)
  })
  orchestrator.registerScenario('Batch commit cards', async (s, t) => {
    const [alice] = await s.players([conductorConfig])
    const [[alice_kanban_happ]] = await alice.installAgentsHapps(installation)
    const card = await alice_kanban_happ.cells[0].call('kanban', 'batch_create_cards', { parentColumn: '/', name: 'Card 1', preview: '', uuid: uuidv4(), cardType: 'card', order: 0, parent: 'Cards' })
    console.log('card', card)
    t.notEqual(card.entryHash, null)
  })
}
