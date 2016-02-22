# Quaternion.js - ℍ in JavaScript

[![NPM Package](https://img.shields.io/npm/v/quaternion.js.svg?style=flat)](https://npmjs.org/package/quaternion.js "View this project on npm")
[![Build Status](https://travis-ci.org/infusion/Quaternion.js.svg?branch=master)](https://travis-ci.org/infusion/Quaternion.js)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)



Example with HTML5 Device Orientation
---
In order to create a HTML element, which always rotates in 3D with your mobile device, all you need is the following snippet. Look at the examples folder for a complete version.

```
var q = new Quaternion;
var rad = Math.PI / 180;
window.addEventListener("deviceorientation", function(ev) {

  // Update the rotation object
  q.setFromEuler(ev.alpha * rad, ev.beta * rad, ev.gamma * rad, 'ZXY');

  // Set the CSS style to the element you want to rotate
  elm.style.transform = "matrix3d(" + q.conjugate().toMatrix4() + ")";

}, true);
```



