import { ipcRenderer } from 'electron'
import React, { Component, PropTypes } from 'react'
import PhotoItem from './PhotoItem'
import PhotoSelectDate from './PhotoSelectDate'
import { formatDate } from '../../utils/datetime'

export default class PhotoListByDate extends Component {
  constructor(props) {
    super(props)

    this.addHoverToAllItem = () => {
      this.selectionRefs.forEach(refName =>
        this.refs[refName].addHoverIconButton()
      )
    }

    this.removeHoverToAllItem = () => {
      this.detectIsAllOffChecked() && this.selectionRefs.forEach(refName =>
        this.refs[refName].removeHoverIconButton()
      )
    }

    this.addCheckedToItem = (itemIndex) => {
      const photoItem = this.refs[`photoItem${itemIndex}`]

      this.props.addListToSelection(photoItem.props.path)
    }

    this.detectIsAllOffChecked = () => this.selectionRefs.every(refName => this.refs[refName].state.action !== 'on')

    this.addAllChecked = () => {
      const selectDate = this.refs.selectDate

      setTimeout(() =>
        this.selectionRefs.every(refName => this.refs[refName].state.action === 'on')
          && selectDate.onSelected(true)
      , 0)
    }

    this.removeCheckedToItem = (itemIndex) => {
      const photoItem = this.refs[`photoItem${itemIndex}`]

      this.props.removeListToSelection(photoItem.props.path)
    }

    this.removeAllChecked = () => {
      const selectDate = this.refs.selectDate
      selectDate.offSelected(true)
    }

    this.removeCheckToAllItem = () => {
      this.selectionRefs.forEach(refName =>
        this.refs[refName].offSelectIconButton(false)
      )
    }

    this.selectByDate = (action) => {
      this.selectionRefs.forEach((refName, index) => {
        this.refs[refName][`${action}SelectIconButton`](false)

        if (action === 'on') {
          this.addCheckedToItem(index)
          this.props.onGetPhotoListByDates()
        } else {
          this.removeCheckedToItem(index)

          // this.removeAllChecked();
          // this.removeHoverToAllItem();
          // this.props.onRemoveHoverToList();
          // this.removeCheckedToItem(index);
          // this.removeHoverToAllItem();
        }
      })

      // if (action !== 'on') {
      //   setTimeout(() => {
      //     if (this.props.onDetectAllOffChecked()) {
      //       this.removeCheckToAllItem();
      //     }
      //   }, 0);
      // }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.photos[0].path !== this.props.photos[0].path
  }
  render() {
    const { style, date, photos, lookPhotoDetail, first } = this.props
    // console.log('PhotoListByDate.jsx', this.props)
    return (
      <div style={{ padding: '0 6px 6px 6px' }}>
        {/* 日期 */}
        { first &&
        <div style={{ marginBottom: 15 }}>
          <PhotoSelectDate
            style={{ display: 'inline-block' }}
            primaryText={date}
          />
        </div>
        }

        {/* 照片 */}
        <div style={style}>
          { photos.map((photo, index) => (
            <PhotoItem
              ref={`photoItem${index}`}
              style={{ width: 150, height: 158, marginRight: 6, marginBottom: 6 }}
              width={photo.width}
              height={photo.height}
              lookPhotoDetail={lookPhotoDetail.bind(null, index)}
              detectIsAllOffChecked={this.detectIsAllOffChecked}
              exifOrientation={photo.exifOrientation}
              onDetectAllOffChecked={this.props.onDetectAllOffChecked}
              selected={() => { this.addCheckedToItem(index) }}
              unselected={() => { this.removeCheckedToItem(index) }}
              date={this.props.date}
              digest={photo.digest}
              path={photo.path}
              key={photo.digest}
            />
             ))
           }
        </div>
      </div>
    )
  }

  componentDidMount() {
    this.selectionRefs = Object
      .keys(this.refs)
      .filter(refName =>
        refName.indexOf('photoItem') >= 0
      )
    ipcRenderer.send('getThumb', this.props.photos.map(item => ({ digest: item.digest })))
  }
}

PhotoListByDate.propTypes = {
  style: PropTypes.object,
  date: PropTypes.string.isRequired,
  photos: PropTypes.array.isRequired,
  addListToSelection: PropTypes.func.isRequired,
  removeListToSelection: PropTypes.func.isRequired,
  lookPhotoDetail: PropTypes.func.isRequired,
  onAddHoverToList: PropTypes.func,
  onOffSelected: PropTypes.func
}
