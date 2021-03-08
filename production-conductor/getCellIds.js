
const slots = {
    tagger: {
      base_cell_id: [],
      is_provisioned: true,
      clone_limit: 0,
      clones: []
    },
    builder_kanban: {
      base_cell_id: [],
      is_provisioned: true,
      clone_limit: 0,
      clones: []
    }
  }

  Object.keys(slots).forEach(key => {
    console.log(slots[key].base_cell_id)
  })