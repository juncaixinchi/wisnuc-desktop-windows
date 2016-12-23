import React, { Component, PropTypes, Children } from 'react';
import { findDOMNode } from 'react-dom';
import { add, remove } from './utils/eventListeners';
import throttle from './utils/throttle';
import LazyloadBox from './LazyloadBox';
import PhotoListByDate from '../photo/PhotoListByDate';

const __DELAY__ = 300;
const __MUSTEXECTIME__ = 200;

export default class ScrollFlush extends Component {
	constructor(props) {
		super(props);

		this.isFirstLoad = true;
		this.isCallering = false;
		this.pageCount = Math.ceil(this.props.list.length / this.props.pageSize);
		this.currentPage = 0;
		this.singleItemHeight = 158;
		this.singleItemWidth = 150;
		this.state = {
			lazyloadBoxs: []
		};

		this.getStyle = () => ({
			position: 'absolute',
			left: 0,
			top: 0,
			width: '100%',
			height: 'calc(100% - 56px)',
			bottom: 0,
			overflow: 'auto'
		});
		this.callerChildScrollHandler = () => {
		  Object
			  .keys(this.refs)
				.filter(ref => ref.indexOf('lazyloadBox') >= 0)
				.forEach(ref => this.refs[ref].scrollHandler(this.node.getBoundingClientRect().width, this.node.scrollTop))
		}
	  this.scrollHandler = throttle(() => {
			// 调用子组件scrollHandler
			this.callerChildScrollHandler();

			if (this.isFirstLoad || (!this.isCallering && this.isToBottom())) {
				if (this.currentPage >= this.pageCount) {
					alert('没有更多了');
					return;
				}

				const skip = (this.currentPage++) * this.props.pageSize;

				this.isCallering = true;
			  this.setState({
					lazyloadBoxs: [
						...this.state.lazyloadBoxs,
						...this.props.list.slice(skip, skip + this.props.pageSize)
					]
				}, () => {
					this.isCallering = false;
					this.innerEl.style.height = `${this.state.lazyloadBoxs.length * this.singleItemHeight}px`;
				});
			}
			this.isFirstLoad = false;
	  }, __DELAY__, __MUSTEXECTIME__);
	}

	// getLazyloadHeight(itemCount) {
	// 	return Math
	// 	  .ceil(
	// 			itemCount / Math.floor(
	// 				document.documentElement.clientWidth / this.singleItemWidth
	// 			)
	// 		) * this.singleItemHeight;
	// }

	isToBottom() {
    const visualHeight = this.node.getBoundingClientRect().height;
		const artualHeight = this.node.scrollHeight;
		const artualScrollTop = this.node.scrollTop;

		return visualHeight + artualScrollTop >= artualHeight;
	}

	shouldComponentUpdate(nextProps, nextState) {
		return nextState.lazyloadBoxs.length !== this.state.lazyloadBoxs.length;
	}

	render() {
    return React.createElement(this.props.nodeName, {
			style: this.getStyle(this.state.height)
		}, (
			<div ref={innerEl => this.innerEl = innerEl}>
			  {this.state.lazyloadBoxs.map((lazyloadBox, index) => (
					<LazyloadBox
						ref={`lazyloadBox${index}`}
						key={index}
						height={this.singleItemHeight}
						date={lazyloadBox.date}
						list={lazyloadBox.photos}
						actualTop={index * this.singleItemHeight}
						allPhotos={this.props.allPhotos}
            addListToSelection={ this.props.addListToSelection }
            lookPhotoDetail={ this.props.lookPhotoDetail }
            removeListToSelection={ this.props.removeListToSelection }>
						<PhotoListByDate />
					</LazyloadBox>
				))}
			</div>
		));
	}

	componentDidMount() {
	  this.node = findDOMNode(this);
		this.scrollHandler();

	  add(this.node, 'scroll', this.scrollHandler);
	}

	componentWillUnmount() {
    remove(this.node, 'scroll', this.scrollHandler);
	}
}

ScrollFlush.propTypes = {
  nodeName: PropTypes.string,
	pageSize: PropTypes.number,
	list: PropTypes.array.isRequired
};

ScrollFlush.defaultProps = {
  nodeName: 'div',
	pageSize: 10
};