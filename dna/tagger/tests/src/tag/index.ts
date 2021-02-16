import { Config, InstallAgentsHapps } from '@holochain/tryorama'
import * as _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import * as path from 'path'

const delay = ms => new Promise(r => setTimeout(r, ms))
const taggerDna = path.join(__dirname, '../../../tagger.dna.gz')
console.log('taggerDna', taggerDna)

const installation: InstallAgentsHapps = [
  [
    [taggerDna]
  ]
]

const conductorConfig = Config.gen()
const tagData1 = { uuid: uuidv4(), tagText: 'A Tag 1', color: '#963147', parent: 'Tags' }
const tagData2 = { uuid: uuidv4(), tagText: 'A Tag 2', color: '#963147', parent: 'Tags' }

module.exports = (orchestrator) => {
  orchestrator.registerScenario('Create a tag', async (s, t) => {
    const [alice] = await s.players([conductorConfig])
    const [[alice_kanban_happ]] = await alice.installAgentsHapps(installation)
    const tag = await alice_kanban_happ.cells[0].call('tagger', 'create_tag', tagData1)
    console.log('tag', tag)
    t.notEqual(tag.entryHash, null)
  })
  orchestrator.registerScenario('Create, then list tags', async (s, t) => {
    const [alice] = await s.players([conductorConfig])
    const [[alice_kanban_happ]] = await alice.installAgentsHapps(installation)
    const tag1 = await alice_kanban_happ.cells[0].call('tagger', 'create_tag', tagData1);
    const tag2 = await alice_kanban_happ.cells[0].call('tagger', 'create_tag', tagData2);
    console.log('tag1', tag1)
    console.log('tag2', tag2)
    const tagList = await alice_kanban_happ.cells[0].call('tagger', 'list_tags', { parent: 'Tags' });
    console.log('tagList', tagList)
    t.deepEqual(tagList.tags.length, 2)
  })
}
