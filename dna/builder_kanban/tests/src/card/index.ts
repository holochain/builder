import { Config, InstallAgentsHapps } from '@holochain/tryorama'
import * as _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import * as path from 'path'

const delay = ms => new Promise(r => setTimeout(r, ms))
const builderKanbanDna = path.join(__dirname, '../../../builder_kanban.dna.gz')
console.log('builderKanbanDna', builderKanbanDna)

const installation: InstallAgentsHapps = [
  [
    [builderKanbanDna]
  ]
]

const conductorConfig = Config.gen()
const cardData1 = { parentColumn: '/', name: 'Card 1', description: '', reactions: '', tags: '', uuid: uuidv4(), cardType: 'card', order: 0, parent: 'Cards' }
const cardData2 = { parentColumn: '/', name: 'Card 2', description: '', reactions: '', tags: '', uuid: uuidv4(), cardType: 'card', order: 0, parent: 'Cards' }

module.exports = (orchestrator) => {
  orchestrator.registerScenario('Create a card', async (s, t) => {
    const [alice] = await s.players([conductorConfig])
    const [[alice_kanban_happ]] = await alice.installAgentsHapps(installation)
    const card = await alice_kanban_happ.cells[0].call('builder_kanban', 'create_card', cardData1)
    console.log('card', card)
    t.notEqual(card.entryHash, null)
  })
  orchestrator.registerScenario('Create, then list cards', async (s, t) => {
    const [alice] = await s.players([conductorConfig])
    const [[alice_kanban_happ]] = await alice.installAgentsHapps(installation)
    const card1 = await alice_kanban_happ.cells[0].call('builder_kanban', 'create_card', cardData1);
    const card2 = await alice_kanban_happ.cells[0].call('builder_kanban', 'create_card', cardData2);
    console.log('card1', card1)
    console.log('card2', card2)
    const cardList = await alice_kanban_happ.cells[0].call('builder_kanban', 'list_cards', { parent: 'Cards' });
    console.log('cardList', cardList)
    t.deepEqual(cardList.cards.length, 2)
  })
  orchestrator.registerScenario('Create then delete a card', async (s, t) => {
    const [alice] = await s.players([conductorConfig])
    const [[alice_kanban_happ]] = await alice.installAgentsHapps(installation)
    const card = await alice_kanban_happ.cells[0].call('builder_kanban', 'create_card', cardData1);
    console.log('card', card)
    const deletedClient = await alice_kanban_happ.cells[0].call('builder_kanban', 'delete_card', card);
    console.log('deletedClient', deletedClient)
    const cardList = await alice_kanban_happ.cells[0].call('builder_kanban', 'list_cards', { parent: 'Cards' });
    console.log('cardList', cardList)
    t.deepEqual(cardList.cards.length, 0)
  })
}
