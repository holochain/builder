import { Orchestrator } from '@holochain/tryorama'

const orchestrator = new Orchestrator()

require('./flowstate')(orchestrator)

orchestrator.run()

