import { Orchestrator } from '@holochain/tryorama'

const orchestrator = new Orchestrator()

require('./client')(orchestrator)
require('./consultant')(orchestrator)
require('./invoice')(orchestrator)

orchestrator.run()
