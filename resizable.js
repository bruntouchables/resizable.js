/**
 * Created by Henrikh Kantuni and Shahen Kosyan on 7/21/16.
 */


'use strict';

class Resizable {
  constructor(element, options, callback) {
    this.wrapper = '<div class="resizable"></div>';
    this._scale = (options && options.scale) ? options.scale : 1.0;
    this.handles = '';
    
    this.startAngle = 0;
    this.rotation = 0;
    this.angle = 0;

    // custom handles
    if (options && options.handles) {
      this.handles += '<span class="resize-handle resize-handle-rotate"></span>';
      options.handles.map(handle => {
        this.handles += '<span class="resize-handle resize-handle-' + handle + '"></span>';
      });
    } else {
      this.handles = '<span class="resize-handle resize-handle-rotate"></span> \
                      <span class="resize-handle resize-handle-n"></span>\
                      <span class="resize-handle resize-handle-ne"></span>\
                      <span class="resize-handle resize-handle-e"></span>\
                      <span class="resize-handle resize-handle-se"></span>\
                      <span class="resize-handle resize-handle-s"></span>\
                      <span class="resize-handle resize-handle-sw"></span>\
                      <span class="resize-handle resize-handle-w"></span>\
                      <span class="resize-handle resize-handle-nw"></span>';
    }

    // wrapper min height and min width
    this.wrapperMinHeight = 30;
    this.wrapperMinWidth = 30;

    // create necessary DOM elements
    this._createDOMElements(element);

    // style wrapper and element
    this._applyStyles(element);

    // attach events on init
    this._attachInitEvents(element);

    // track element mutations
    let elementObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        let elementHeight = element.offsetHeight;
        let wrapperHeight = this.wrapper.offsetHeight;
        let elementWidth = element.offsetWidth;
        let wrapperWidth = this.wrapper.offsetWidth;

        if (elementHeight !== wrapperHeight) {
          this.wrapper.style.height = element.style.height = elementHeight + 'px';
        }

        if (elementWidth !== wrapperWidth) {
          this.wrapper.style.width = element.style.width = elementWidth + 'px';
        }
      });
    });

    elementObserver.observe(element, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
      attributeFilter: ['style']
    });

    // track wrapper mutations
    let wrapperObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        let elementHeight = element.offsetHeight;
        let wrapperHeight = this.wrapper.offsetHeight;
        let elementWidth = element.offsetWidth;
        let wrapperWidth = this.wrapper.offsetWidth;

        if (wrapperHeight !== elementHeight) {
          this.wrapper.style.height = element.style.height = wrapperHeight + 'px';
        }

        if (wrapperWidth !== elementWidth) {
          this.wrapper.style.width = element.style.width = wrapperWidth + 'px';
        }
      });
    });

    wrapperObserver.observe(this.wrapper, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
      attributeFilter: ['style']
    });

    // callback call
    if (this.onInitCallback = callback) {
      this.onInitCallback();
    }
  }

  set scale(scale) {
    this._scale = scale;
  }

  get DOMElement() {
    return this.wrapper;
  }

  _createDOMElements(element) {
    // add wrapper before element
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
      // left: element.style.left,
      left: '200px',
      position: 'absolute',
      // top: element.style.top,
      top: '200px',
      width: (elementWidth > this.wrapperMinWidth) ? elementWidth + 'px' : this.wrapperMinWidth + 'px'
    });

    // style element
    Object.assign(element.style, {
      height: this.wrapper.style.height,
      left: '0',
      position: 'relative',
      top: '0',
      width: this.wrapper.style.width
    });

    this.wrapperOldHeight = this.wrapper.offsetHeight;
    this.wrapperOldWidth = this.wrapper.offsetWidth;
  }

  _attachInitEvents(element) {
    // allow resize after click
    document.addEventListener('mousedown', e => {
      let allowed = e.target === element;
      allowed = allowed || e.target === this.wrapper;

      // on click callback call
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
      // disable default drag start event handler
      this.handles[i].addEventListener('dragstart', {});

      // add custom mouse down event handler
      this._mouseDown = this._mouseDown.bind(this);
      this.handles[i].addEventListener('mousedown', this._mouseDown);
    }
  }

  _mouseDown(e) {
    // disable selection (Safari)
    e.preventDefault();

    // get handle direction
    this.handle = e.target.className.slice('resize-handle resize-handle-'.length);

    let wrapperClientRect = this.wrapper.getBoundingClientRect();
    this.center = {
      x: wrapperClientRect.left + wrapperClientRect.width / 2,
      y: wrapperClientRect.top + wrapperClientRect.height / 2
    };
    this.startAngle = Math.atan2(e.clientY - this.center.y, e.clientX - this.center.x) * (180 / Math.PI);

    // calculate ratio
    let {height, width} = this.wrapper.getBoundingClientRect();
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
    // let parentStyle = window.getComputedStyle(this.wrapper.parentElement);
    // if (parentStyle.position === 'static') {
    //   this.parent = {
    //     left: 0, 
    //     top: 0, 
    //     height: window.innerHeight,
    //     width: window.innerWidth
    //   };
    // } else {
    //   this.parent = this.wrapper.parentElement.getBoundingClientRect();
    // }
    //
    // let {height, width, left, top} = this.wrapper.getBoundingClientRect();
    // left = left - this.parent.left;
    // top = top - this.parent.top;
    // let right = this.parent.width - left - width;
    // let bottom = this.parent.height - top - height;
    //
    // this.wrapperOldHeight = height / this._scale;
    // this.wrapperOldWidth = width / this._scale;
    //
    // let wrapperNewHeight, wrapperNewWidth;
    // let keepRatio = false;

    // BTDT: styles are sorted in clockwise order
    switch (this.handle) {
      case 'rotate': {
        let angle = Math.atan2(e.pageY - this.center.y, e.pageX - this.center.x) * (180 / Math.PI);
        this.rotation = angle - this.startAngle;
        Object.assign(this.wrapper.style, {
          transform: 'rotate(' + (this.angle + this.rotation) + 'deg)',
          transformOrigin: 'center center'
        });
        break;
      }
      // case 'n': {
      //   Object.assign(this.wrapper.style, {
      //     left: left / this._scale + 'px',
      //     top: 'auto',
      //     right: right / this._scale + 'px',
      //     bottom: bottom / this._scale + 'px'
      //   });
      //   wrapperNewHeight = (this.parent.height - bottom + this.parent.top - e.pageY) / this._scale;
      //   break;
      // }
      // case 'ne': {
      //   Object.assign(this.wrapper.style, {
      //     left: left / this._scale + 'px',
      //     top: 'auto',
      //     right: 'auto',
      //     bottom: bottom / this._scale + 'px'
      //   });
      //   wrapperNewWidth = (e.pageX - left - this.parent.left) / this._scale;
      //   wrapperNewHeight = this.ratio * wrapperNewWidth;
      //   keepRatio = true;
      //   break;
      // }
      // case 'e': {
      //   Object.assign(this.wrapper.style, {
      //     left: left / this._scale + 'px',
      //     top: top / this._scale + 'px',
      //     right: 'auto',
      //     bottom: bottom / this._scale + 'px'
      //   });
      //   wrapperNewWidth = (e.pageX - left - this.parent.left) / this._scale;
      //   break;
      // }
      // case 'se': {
      //   Object.assign(this.wrapper.style, {
      //     left: left / this._scale + 'px',
      //     top: top / this._scale + 'px',
      //     right: 'auto',
      //     bottom: 'auto'
      //   });
      //   wrapperNewWidth = (e.pageX - left - this.parent.left) / this._scale;
      //   wrapperNewHeight = this.ratio * wrapperNewWidth;
      //   keepRatio = true;
      //   break;
      // }
      // case 's': {
      //   Object.assign(this.wrapper.style, {
      //     left: left / this._scale + 'px',
      //     top: top / this._scale + 'px',
      //     right: right / this._scale + 'px',
      //     bottom: 'auto'
      //   });
      //   wrapperNewHeight = (e.pageY - top - this.parent.top) / this._scale;
      //   break;
      // }
      // case 'sw': {
      //   Object.assign(this.wrapper.style, {
      //     left: 'auto',
      //     top: top / this._scale + 'px',
      //     right: right / this._scale + 'px',
      //     bottom: 'auto'
      //   });
      //   wrapperNewWidth = (this.parent.width - right + this.parent.left - e.pageX) / this._scale;
      //   wrapperNewHeight = this.ratio * wrapperNewWidth;
      //   keepRatio = true;
      //   break;
      // }
      // case 'w': {
      //   Object.assign(this.wrapper.style, {
      //     left: 'auto',
      //     top: top / this._scale + 'px',
      //     right: right / this._scale + 'px',
      //     bottom: bottom / this._scale + 'px'
      //   });
      //   wrapperNewWidth = (this.parent.width - right + this.parent.left - e.pageX) / this._scale;
      //   break;
      // }
      // case 'nw': {
      //   Object.assign(this.wrapper.style, {
      //     left: 'auto',
      //     top: 'auto',
      //     right: right / this._scale + 'px',
      //     bottom: bottom / this._scale + 'px'
      //   });
      //   wrapperNewWidth = (this.parent.width - right + this.parent.left - e.pageX) / this._scale;
      //   wrapperNewHeight = this.ratio * wrapperNewWidth;
      //   keepRatio = true;
      //   break;
      // }
    }

    // // don't let wrapper height become less than wrapper min height
    // if (wrapperNewHeight !== undefined && wrapperNewHeight < this.wrapperMinHeight) {
    //   wrapperNewHeight = this.wrapperMinHeight;
    //   if (keepRatio) {
    //     wrapperNewWidth = wrapperNewHeight / this.ratio;
    //   }
    // }
    //
    // // don't let wrapper width become less than wrapper min width
    // if (wrapperNewWidth !== undefined && wrapperNewWidth < this.wrapperMinWidth) {
    //   wrapperNewWidth = this.wrapperMinWidth;
    //   if (keepRatio) {
    //     wrapperNewHeight = this.ratio * wrapperNewWidth;
    //   }
    // }
    //
    // // set new wrapper height and width
    // Object.assign(this.wrapper.style, {
    //   height: (wrapperNewHeight !== undefined) ? wrapperNewHeight + 'px' : this.wrapperOldHeight + 'px',
    //   width: (wrapperNewWidth !== undefined) ? wrapperNewWidth + 'px' : this.wrapperOldWidth + 'px'
    // });
    //
    // // recalculate position
    // ({left, top} = this.wrapper.getBoundingClientRect());
    //
    // Object.assign(this.wrapper.style, {
    //   bottom: '',
    //   left: (left - this.parent.left) / this._scale + 'px',
    //   right: '',
    //   top: (top - this.parent.top) / this._scale + 'px'
    // });

    // on resize callback call
    if (this.onResizeCallback) {
      this.onResizeCallback();
    }
  }

  _mouseUp(e) {
    // remove mouse move and mouse up events
    document.removeEventListener('mousemove', this._mouseMove);
    document.removeEventListener('mouseup', this._mouseUp);

    // on resize end callback call
    if (this.onResizeEndCallback) {
      this.onResizeEndCallback();
    }

    this.angle += this.rotation;

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

  onResizeEnd(callback) {
    this.onResizeEndCallback = callback;
  }
}
