//define default state
const defaultState = {
	data: [],
	status: 'busy',
	map: null
}

const loginState = (state = defaultState, action) => {
	switch (action.type) {
		case 'SET_MEDIA':
			var m = new Map();
			action.data.forEach(item=>{
				m.set(item.hash,item);
			});
			return Object.assign({},state,{data:action.data,status:'ready',map:m});
		case 'SET_THUMB':
			var item = state.map.get(action.data.hash);
			item.status = action.status;
			item.path = action.data.path;
			return Object.assign({},state)
		default:
			return state
	}
};

module.exports = loginState