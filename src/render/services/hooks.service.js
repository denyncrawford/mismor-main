import nanoid from 'nanoid'
export const hookPipeline = ({name, hooks, description}) => {
  return {
    name,
    description,
    hooks//,
    // moveEntryToHook: (entry, fromHook , toHook) => {
    //   const fromHookIndex = hooks.findIndex(hook => hook.name === fromHook)
    //   const toHookIndex = hooks.findIndex(hook => hook.name === toHook)
    //   if (fromHookIndex === -1 || toHookIndex === -1) throw new Error('Hook not found')
    //   hooks[fromHookIndex].entries.splice(hooks[fromHookIndex].entries.indexOf(entry), 1)
    //   hooks[toHookIndex].entries.push(entry)
    // },
  }
}

export const hook = ({name, description}) => {
  return {
    name,
    id: nanoid(),
    description,
    list: []
  }
}