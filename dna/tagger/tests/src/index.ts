import { Orchestrator } from '@holochain/tryorama'

const orchestrator = new Orchestrator()

require('./tag')(orchestrator)

orchestrator.run()
