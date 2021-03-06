import React from 'react'
import Debug from 'debug'
import UUID from 'node-uuid'
import prettysize from 'prettysize'
import { CircularProgress, Divider } from 'material-ui'
import FileFolder from 'material-ui/svg-icons/file/folder'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import PhotoIcon from 'material-ui/svg-icons/image/photo'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
import { TXTIcon, WORDIcon, EXCELIcon, PPTIcon, PDFIcon } from '../common/Svg'

const debug = Debug('component:file:FileDetail:')

const phaseDate = (time) => {
  const a = new Date(time)
  const year = a.getFullYear()
  const month = a.getMonth() + 1
  const date = a.getDate()
  return `${year}年${month}月${date}日`
}

const phaseExifTime = (time) => {
  const a = time.replace(/\s+/g, ':').split(':')
  return `${a[0]}年${a[1]}月${a[2]}日 ${a[3]} : ${a[4]}`
}

const getType = (type, name, metadata) => {
  if (type === 'folder') return '文件夹'
  if (type === 'public') return '共享文件夹'
  if (type === 'directory') return '文件夹'
  if (metadata && metadata.format) return metadata.format
  let extension = name.replace(/^.*\./, '')
  if (!extension || extension === name) extension = '未知文件'
  return extension.toUpperCase()
}

const getPath = (path) => {
  const newPath = []
  path.map((item, index) => {
    if (!index) {
      newPath.push(item.type === 'publicRoot' ? '共享文件夹' : '我的文件')
    } else {
      newPath.push(item.name)
    }
    return null
  })
  return newPath.join('/')
}

const getResolution = (height, width) => {
  let res = height * width
  if (res > 100000000) {
    res = Math.ceil(res / 100000000)
    return `${res} 亿像素 ${height} x ${width}`
  } else if (res > 10000) {
    res = Math.ceil(res / 10000)
    return `${res} 万像素 ${height} x ${width}`
  }
  return `${res} 像素 ${height} x ${width}`
}

const renderFileIcon = (name, metadata) => {
  /* media */
  if (metadata) return <PhotoIcon style={{ color: '#FFFFFF' }} />

  /* PDF, TXT, Word, Excel, PPT */
  let extension = name.replace(/^.*\./, '')
  if (!extension || extension === name) extension = 'OTHER'
  switch (extension.toUpperCase()) {
    case 'PDF':
      return (<PDFIcon style={{ color: '#FFFFFF' }} />)
    case 'TXT':
      return (<TXTIcon style={{ color: '#FFFFFF' }} />)
    case 'DOCX':
      return (<WORDIcon style={{ color: '#FFFFFF' }} />)
    case 'DOC':
      return (<WORDIcon style={{ color: '#FFFFFF' }} />)
    case 'XLS':
      return (<EXCELIcon style={{ color: '#FFFFFF' }} />)
    case 'XLSX':
      return (<EXCELIcon style={{ color: '#FFFFFF' }} />)
    case 'PPT':
      return (<PPTIcon style={{ color: '#FFFFFF' }} />)
    case 'PPTX':
      return (<PPTIcon style={{ color: '#FFFFFF' }} />)
    case 'OTHER':
      return (<EditorInsertDriveFile style={{ color: '#FFFFFF' }} />)
    default:
      return (<EditorInsertDriveFile style={{ color: '#FFFFFF' }} />)
  }
}

class FileDetail extends React.PureComponent {

  constructor(props) {
    super(props)

    this.state = {
      thumbPath: ''
    }

    this.updateThumbPath = (event, session, path) => {
      if (this.session === session) {
        // debug('thumbPath got')
        this.setState({ thumbPath: path })
      }
    }

    /* handle detailFile in first render */
    if (this.props.detailFile && this.props.detailFile.digest) {
      this.session = UUID.v4()
      this.props.ipcRenderer.send('mediaShowThumb', this.session, this.props.detailFile.digest, 210, 210)
      this.props.ipcRenderer.on('getThumbSuccess', this.updateThumbPath)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.detailFile && nextProps.detailFile.digest &&
      (!this.props.detailFile || nextProps.detailFile.digest !== this.props.detailFile.digest)) {
      this.session = UUID.v4()
      this.props.ipcRenderer.send('mediaShowThumb', this.session, nextProps.detailFile.digest, 210, 210)
      this.props.ipcRenderer.on('getThumbSuccess', this.updateThumbPath)
      this.setState({ thumbPath: '' })
    }
  }

  componentWillUnmount() {
    this.props.ipcRenderer.removeListener('getThumbSuccess', this.updateThumbPath)
    this.props.ipcRenderer.send('mediaHideThumb', this.session)
  }

  renderList(titles, values) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
        {
          titles.map((title, index) => {
            if (!title) return <div key={`${title}+${index.toString()}`} />
            return (
              <div
                style={{
                  height: 32,
                  color: 'rgba(0, 0, 0, 0.54)',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%'
                }}
                key={title}
              >
                <div style={{ flex: '0 0 96px', fontSize: 14 }} > { title } </div>
                <div
                  style={{
                    fontSize: 14,
                    flex: '0 0 216px',
                    color: 'rgba(0, 0, 0, 0.54)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                > { values[index] }</div>
              </div>
            )
          })
        }
      </div>
    )
  }

  renderTitle(detailFile) {
    const { name, type, metadata } = detailFile
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 32,
          fontSize: 20,
          fontWeight: 500,
          color: '#FFFFFF'
        }}
      >
        <div style={{ flex: '0 0 24px', display: 'flex', alignItems: 'center' }}>
          {
            type === 'folder' || type === 'public' || type === 'directory'
            ? <FileFolder style={{ color: '#FFFFFF' }} />
            : type === 'file'
            ? renderFileIcon(name, metadata)
            : <ErrorIcon style={{ color: '#FFFFFF' }} />
          }
        </div>
        <div style={{ flex: '0 0 16px' }} />
        <div style={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          { name }
        </div>
        <div style={{ flex: '0 0 24px' }} />
      </div>
    )
  }


  render() {
    const { detailFile, path, primaryColor } = this.props
    // debug('detailFile', detailFile, this.state)
    if (!detailFile) return <div style={{ height: 128, backgroundColor: primaryColor, filter: 'brightness(0.9)' }} />

    const { metadata, digest } = detailFile
    let exifDateTime = ''
    let exifModel = ''
    let height = ''
    let width = ''
    if (metadata) {
      exifDateTime = metadata.exifDateTime
      exifModel = metadata.exifModel
      height = metadata.height
      width = metadata.width
    }

    let longPic = false
    if (height && width && (height / width > 2 || width / height > 2)) {
      longPic = true
    }

    const Titles = [
      '类型',
      detailFile.type === 'file' ? '大小' : '',
      detailFile.type !== 'public' ? '位置' : '',
      (detailFile.type !== 'public' && detailFile.type !== 'unsupported') ? '修改时间' : '',
      exifDateTime ? '拍摄时间' : '',
      exifModel ? '拍摄设备' : '',
      height && width ? '分辨率' : ''
    ]

    const Values = [
      getType(detailFile.type, detailFile.name, metadata),
      prettysize(detailFile.size),
      getPath(path),
      phaseDate(detailFile.mtime),
      exifDateTime ? phaseExifTime(exifDateTime) : '',
      exifModel,
      getResolution(height, width)
    ]

    return (
      <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ height: 128, backgroundColor: primaryColor, filter: 'brightness(0.9)' }}>
          <div style={{ height: 64 }} />
          {/* header */}
          <div style={{ height: 64, marginLeft: 24 }} >
            <div style={{ height: 16 }} />
            { this.renderTitle(detailFile) }
          </div>
        </div>

        {/* picture */}
        {
          digest &&
            <div
              style={{
                margin: 24,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {
                this.state.thumbPath &&
                  <img
                    width={312}
                    height={234}
                    style={{ objectFit: longPic ? 'contain' : 'cover' }}
                    alt="ThumbImage"
                    src={this.state.thumbPath}
                  />
              }
            </div>
        }
        { digest && <Divider /> }

        {/* data */}
        <div style={{ width: 312, padding: 24, display: 'flex', flexDirection: 'column' }}>
          { this.renderList(Titles, Values) }
        </div>
      </div>
    )
  }
}

export default FileDetail
