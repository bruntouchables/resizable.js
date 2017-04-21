/**
 * Created by Henrikh Kantuni and Shahen Kosyan on 7/21/16.
 */


'use strict';

class Resizable {
  constructor(element, options, callback) {
    this.wrapper = '<div class="resizable"></div>';
    this.handles = '';

    if (options) {
      for (let i = 0; i < options.length; ++i) {
        this.handles += '<span class="resize-handle resize-handle-' + options[i] + '"></span>';
      }
    } else {
      this.handles = ' <span class="resize-handle resize-handle-n"></span>\
                       <span class="resize-handle resize-handle-ne"></span>\
                       <span class="resize-handle resize-handle-e"></span>\
                       <span class="resize-handle resize-handle-se"></span>\
                       <span class="resize-handle resize-handle-s"></span>\
                       <span class="resize-handle resize-handle-sw"></span>\
                       <span class="resize-handle resize-handle-w"></span>\
                       <span class="resize-handle resize-handle-nw"></span>';
    }

    // wrapper min height and min width
    this.wrapperMinHeight = 50;
    this.wrapperMinWidth = 50;

    // create necessary DOM elements
    this._createDOMElements(element);

    // style wrapper and element
    this._applyStyles(element);

    // attach events on init
    this._attachInitEvents(element);

    // callback call
    if (this.onInitCallback = callback) {
      this.onInitCallback();
    }
  }

  _createDOMElements(element) {
    // add wrapper near element
    element.insertAdjacentHTML('beforebegin', this.wrapper);
    this.wrapper = element.previousSibling;

    // insert handles into the wrapper
    this.wrapper.insertAdjacentHTML('beforeend', this.handles);

    // insert element into the wrapper
    this.wrapper.appendChild(element);
  }

  _applyStyles(element) {
    let elementHeight = parseInt(element.offsetHeight, 10);
    let elementWidth = parseInt(element.offsetWidth, 10);

    // set wrapper min height and min width
    Object.assign(this.wrapper.style, {
      height: (elementHeight > this.wrapperMinHeight) ? elementHeight + 'px' : this.wrapperMinHeight + 'px',
      left: element.style.left,
      position: 'absolute',
      top: element.style.top,
      width: (elementWidth > this.wrapperMinWidth) ? elementWidth + 'px' : this.wrapperMinWidth + 'px'
    });

    // style element
    Object.assign(element.style, {
      height: '100%',
      left: '0',
      position: 'relative',
      top: '0',
      width: '100%'
    });

    this.wrapperOldHeight = this.wrapper.offsetHeight;
    this.wrapperOldWidth = this.wrapper.offsetWidth;
  }

  _attachInitEvents(element) {
    // allow resize after click
    document.addEventListener('mousedown', (e) => {
      let allowed = e.target === element;
      allowed = allowed || e.target === this.wrapper;

      // "on click" callback call
      if (this.onClickCallback && allowed) {
        this.onClickCallback(e);
      }

      // show handles only on the active element
      allowed = allowed || (e.target.classList.contains('resize-handle') && this.wrapper.classList.contains('active'));

      if (allowed) {
        // add active class to wrapper
        this.wrapper.classList.add('active');
      } else {
        // remove active class from wrapper
        this.wrapper.classList.remove('active');
      }
    });

    this.handles = this.wrapper.querySelectorAll('.resize-handle');
    for (let i = 0; i < this.handles.length; ++i) {
      // disable default "drag start" event handler
      this.handles[i].addEventListener('dragstart', {});

      // add custom "mouse down" event handler
      this._mouseDown = this._mouseDown.bind(this);
      this.handles[i].addEventListener('mousedown', this._mouseDown);
    }
  }

  _mouseDown(e) {
    // disable selection (Safari)
    e.preventDefault();

    // get handle direction
    this.handle = e.target.className.slice('resize-handle resize-handle-'.length);

    // calculate ratio
    let height = parseInt(this.wrapper.style.height, 10);
    let width = parseInt(this.wrapper.style.width, 10);
    this.ratio = height / width;

    // add event listeners to mouse move and mouse up
    this._mouseMove = this._mouseMove.bind(this);
    this._mouseUp = this._mouseUp.bind(this);
    document.addEventListener('mousemove', this._mouseMove);
    document.addEventListener('mouseup', this._mouseUp);

    // disable selection
    return false;
  }

  _mouseMove(e) {
    let height = parseInt(this.wrapper.style.height, 10);
    let width = parseInt(this.wrapper.style.width, 10);
    
    let left = this.wrapper.getBoundingClientRect().left + document.body.scrollLeft;
    let top = this.wrapper.getBoundingClientRect().top + document.body.scrollTop;
    let right = parseInt(this.wrapper.style.right, 10);
    right = isNaN(right) ? window.innerWidth - left - width : right;
    let bottom = parseInt(this.wrapper.style.bottom, 10);
    bottom = isNaN(bottom) ? window.innerHeight - top - height : bottom;
    
    let wrapperNewHeight, wrapperNewWidth;

    // BTDT: styles are sorted in clockwise order
    switch (this.handle) {
      case 'n': {
        Object.assign(this.wrapper.style, {
          left: left + 'px',
          top: 'auto',
          right: right + 'px',
          bottom: bottom + 'px'
        });
        // adjust wrapper sizes
        wrapperNewHeight = window.innerHeight - bottom - e.pageY;
        break;
      }
      case 'ne': {
        Object.assign(this.wrapper.style, {
          left: left + 'px',
          top: 'auto',
          right: 'auto',
          bottom: bottom + 'px'
        });
        // adjust wrapper sizes
        wrapperNewWidth = e.pageX - left;
        wrapperNewHeight = this.ratio * wrapperNewWidth;
        break;
      }
      case 'e': {
        Object.assign(this.wrapper.style, {
          left: left + 'px',
          top: top + 'px',
          right: 'auto',
          bottom: bottom + 'px'
        });
        // adjust wrapper sizes
        wrapperNewWidth = e.pageX - left;
        break;
      }
      case 'se': {
        Object.assign(this.wrapper.style, {
          left: left + 'px',
          top: top + 'px',
          right: 'auto',
          bottom: 'auto'
        });
        // adjust wrapper sizes
        wrapperNewWidth = e.pageX - left;
        wrapperNewHeight = this.ratio * wrapperNewWidth;
        break;
      }
      case 's': {
        Object.assign(this.wrapper.style, {
          left: left + 'px',
          top: top + 'px',
          right: right + 'px',
          bottom: 'auto'
        });
        // adjust wrapper sizes
        wrapperNewHeight = e.pageY - top;
        break;
      }
      case 'sw': {
        Object.assign(this.wrapper.style, {
          left: 'auto',
          top: top + 'px',
          right: right + 'px',
          bottom: 'auto'
        });
        // adjust wrapper sizes
        wrapperNewWidth = window.innerWidth - right - e.pageX;
        wrapperNewHeight = this.ratio * wrapperNewWidth;
        break;
      }
      case 'w': {
        Object.assign(this.wrapper.style, {
          left: 'auto',
          top: top + 'px',
          right: right + 'px',
          bottom: bottom + 'px'
        });
        // adjust wrapper sizes
        wrapperNewWidth = window.innerWidth - right - e.pageX;
        break;
      }
      case 'nw': {
        Object.assign(this.wrapper.style, {
          left: 'auto',
          top: 'auto',
          right: right + 'px',
          bottom: bottom + 'px'
        });
        // adjust wrapper sizes
        wrapperNewWidth = window.innerWidth - right - e.pageX;
        wrapperNewHeight = this.ratio * wrapperNewWidth;
        break;
      }
    }

    // don't let wrapper height become less than wrapper min height
    if (wrapperNewHeight !== undefined && wrapperNewHeight < this.wrapperMinHeight) {
      wrapperNewHeight = this.wrapperMinHeight;
    }

    // don't let wrapper width become less than wrapper min width
    if (wrapperNewWidth !== undefined && wrapperNewWidth < this.wrapperMinWidth) {
      wrapperNewWidth = this.wrapperMinWidth;
    }

    // set new wrapper height
    Object.assign(this.wrapper.style, {
      height: (wrapperNewHeight !== undefined) ? wrapperNewHeight + 'px' : this.wrapperOldHeight + 'px',
      width: (wrapperNewWidth !== undefined) ? wrapperNewWidth + 'px' : this.wrapperOldWidth + 'px'
    });

    // "on click" callback call
    if (this.onResizeCallback) {
      this.onResizeCallback();
    }
  }

  _mouseUp(e) {
    // remove "mouse move" and "mouse up" events
    document.removeEventListener('mousemove', this._mouseMove);
    document.removeEventListener('mouseup', this._mouseUp);

    let wrapperNewHeight = this.wrapper.offsetHeight;
    let wrapperNewWidth = this.wrapper.offsetWidth;

    // if nothing has changed
    if (wrapperNewHeight === this.wrapperOldHeight && wrapperNewWidth === this.wrapperOldWidth) {
      return;
    }

    // set wrapper old height and old width
    this.wrapperOldHeight = wrapperNewHeight;
    this.wrapperOldWidth = wrapperNewWidth;
  }

  onClick(callback) {
    this.onClickCallback = callback;
  }

  onResize(callback) {
    this.onResizeCallback = callback;
  }
}
