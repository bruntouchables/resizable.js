# resizable.js<sup>β</sup>
> Resize any DOM element with just one line of code.

### Getting started

- Add _resizable.css_ and _resizable.js_ to your project
- Create a DOM element
- Initialize a new Resizable instance with `new Resizable(...)`
- Enjoy!

### Usage

```html
<div id="example"></div>
```

```css
#example {
  background: #79589f;
  height: 200px;
  width: 200px;
}
```

```javascript
let element = document.getElementById('example');
let resizable = new Resizable(element, null, () => {
  // "on init" callback
  console.log("resizable.js has been successfully initialized.");
});

resizable.onClick(() => {
  // do something on click
});

resizable.onResize(() => {
  // do something on resize
});
```

### Demo
- [JSFiddle](https://jsfiddle.net/bruntouchables/6ba7v81m/)

### Authors

- Henrikh Kantuni ([@kantuni](https://github.com/kantuni))
- Shahen Kosyan ([@k0syan](https://github.com/k0syan))


Please feel free to open an issue or a pull request.  
If you like this project please leave us feedback. If you don't - please tell us how we can improve it.
