const defaultState = {}

module.exports = (state = defaultState, action) => {
  switch (action.type) {
    case 'CONFIG_INIT':
      return action.data

    default:
      return state
  }
}

