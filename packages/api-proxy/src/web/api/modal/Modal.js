import { ToPromise, createDom, getRootElement, webHandleSuccess } from '../../../common/js'
import '../../../common/stylus/Modal.styl'
// import { forEach } from '@didi/mpx-fetch/src/util'
// 汉字为两个字符，字母/数字为一个字符
const _getLength = (t) => {
  let len = 0
  for (let i = 0; i < t.length; i++) {
    if (t.charCodeAt(i) > 127 || t.charCodeAt(i) === 94) {
      len += 2
    } else {
      len++
    }
  }
  return len
}
export default class Modal extends ToPromise {
  constructor () {
    super()
    this.defaultOpts = {
      title: '',
      content: '',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#576B95',
      success: (...args) => {},
      fail: (...args) => {},
      complete: (...args) => {}
    }

    this.hideTimer = null

    this.modal = createDom('div', { class: '__mpx_modal__' }, [
      this.mask = createDom('div', { class: '__mpx_mask__' }),
      this.box = createDom('div', { class: '__mpx_modal_box__' }, [
        this.title = createDom('div', { class: '__mpx_modal_title__' }),
        this.content = createDom('div', { class: '__mpx_modal_content__' }),
        this.btns = createDom('div', { class: '__mpx_modal_btns__' }, [
          this.cancelBtn = createDom('div', { class: '__mpx_modal_cancel__' }),
          this.confirmBtn = createDom('div', { class: '__mpx_modal_confirm__' })
        ])
      ])
    ])
  }

  show (options = {}) {
    getRootElement().appendChild(this.modal)
    if (options.confirmText && _getLength(options.confirmText) > 8) {
      // eslint-disable-next-line
      return Promise.reject({errMsg: 'showModal:fail confirmText length should not larger than 4 Chinese characters'})
    }
    if (options.cancelText && _getLength(options.cancelText) > 8) {
      // eslint-disable-next-line
      return Promise.reject({errMsg: 'showModal:fail cancelText length should not larger than 4 Chinese characters'})
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }
    const opts = Object.assign({}, this.defaultOpts, options)

    this.title.textContent = opts.title
    this.content.textContent = opts.content

    if (!opts.showCancel) {
      this.cancelBtn.classList.add('hide')
    } else {
      this.cancelBtn.classList.remove('hide')
    }
    this.cancelBtn.style.color = opts.cancelColor
    this.cancelBtn.textContent = opts.cancelText

    this.confirmBtn.style.color = opts.confirmColor
    this.confirmBtn.textContent = opts.confirmText

    this.cancelBtn.onclick = () => {
      this.hide()
      const result = {
        errMsg: 'showModal:ok',
        cancel: true,
        confirm: false
      }
      webHandleSuccess(result, opts.success, opts.complete)
      this.toPromiseResolve(result)
    }
    this.confirmBtn.onclick = () => {
      this.hide()
      const result = {
        errMsg: 'showModal:ok',
        cancel: false,
        confirm: true
      }
      webHandleSuccess(result, opts.success, opts.complete)
      this.toPromiseResolve(result)
    }

    this.modal.classList.add('show')

    return this.toPromiseInitPromise()
  }

  hide () {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }

    this.hideTimer = setTimeout(() => {
      this.modal.classList.remove('show')
      this.modal.remove()
    }, 0)
  }
}
