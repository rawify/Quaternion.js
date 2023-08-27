# Quaternion.js - ℍ in JavaScript

[![NPM Package](https://img.shields.io/npm/v/quaternion.svg?style=flat)](https://npmjs.org/package/quaternion "View this project on npm")
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

Quaternion.js is a well tested JavaScript library for 3D rotations. Quaternions can be used everywhere, from the rotation calculation of your mobile phone over computer games to the rotation of satellites and all by avoiding the [Gimbal lock](https://en.wikipedia.org/wiki/Gimbal_lock). The library comes with examples to make you get started much quicker without worrying about the math behind.


# Examples

```js
var Quaternion = require('quaternion');

var q = new Quaternion("99.3+8i");
c.mul(1,2,3,4).div([3,4,1]).sub(7, [1, 2, 3]);
```


HTML5 Device Orientation
---
In order to create a HTML element, which always rotates in 3D with your mobile device, all you need is the following snippet. Look at the examples folder for a complete version.

```javascript
var deg = Math.PI / 180;
window.addEventListener("deviceorientation", function(ev) {

  // Update the rotation object
  var q = Quaternion.fromEulerLogical(ev.alpha * deg, ev.beta * deg, -ev.gamma * deg, 'ZXY');

  // Set the CSS style to the element you want to rotate
  elm.style.transform = q.toCSSTransform();

}, true);
```


Parser
===

Any function (see below) as well as the constructor of the *Quaternion* class parses its input like this.

You can pass either Objects, Doubles or Strings.


Arguments
---

Calling the constructor will create a quaternion 1-element.

```javascript
new Quaternion() // 1 + 0i + 0j + 0k
```

The typical use case contains all quaternion parameters

```javascript
new Quaternion(w, x, y, z)
```

Objects
---
Quaternion as angle and vector. **Note:** This is not equivalent to *Quaternion.fromAxisAngle()*!

```javascript
new Quaternion(w, [x, y, z])
```

Quaternion as an object (it's ok to leave components out)
```javascript
new Quaternion({w: w, x: x, y: y, z: z})
```

Quaternion out of a complex number, e.g. [Complex.js](https://github.com/infusion/Complex.js).
```javascript
new Quaternion({re: real, im: imaginary})
```

Quaternion out of a 4 elements vector
```javascript
new Quaternion([w, x, y, z])
```
Augmented Quaternion out of a 3 elements vector
```javascript
new Quaternion([x, y, z])
```

Doubles
---
```javascript
new Quaternion(55.4);
```

Strings
---
```javascript
new Quaternion('1 - 2i - 3j - 4k')
new Quaternion("123.45");
new Quaternion("15+3i");
new Quaternion("i");
```


Functions
===

Every stated parameter *n* in the following list of functions behaves in the same way as the constructor examples above

**Note:** Calling a method like *add()* without parameters passes a quaternion with all elements zero, not one!

Quaternion add(n)
---
Adds two quaternions Q1 and Q2

Quaternion sub(n)
---
Subtracts a quaternions Q2 from Q1

Quaternion neg()
---
Calculates the additive inverse, or simply it negates the quaternion

Quaternion norm()
---
Calculates the length/modulus/magnitude or the norm of a quaternion

Quaternion normSq()
---
Calculates the squared length/modulus/magnitude or the norm of a quaternion

Quaternion normalize()
---
Normalizes the quaternion to have |Q| = 1 as long as the norm is not zero. Alternative names are the signum, unit or versor

Quaternion mul(n)
---
Calculates the Hamilton product of two quaternions. Leaving out the imaginary part results in just scaling the quat.

**Note:** This function is not commutative, i.e. order matters!

Quaternion scale(s)
---
Scales a quaternion by a scalar, faster than using multiplication

Quaternion dot()
---
Calculates the dot product of two quaternions

Quaternion inverse()
---
Calculates the inverse of a quat for non-normalized quats such that *Q^-1 * Q = 1* and *Q * Q^-1 = 1*

Quaternion div(n)
---
Multiplies a quaternion with the inverse of a second quaternion

Quaternion conjugate()
---
Calculates the conjugate of a quaternion. If the quaternion is normalized, the conjugate is the inverse of the quaternion - but faster.

Quaternion pow(n)
---
Calculates the power of a quaternion raised to the quaternion n

Quaternion exp()
---
Calculates the natural exponentiation of the quaternion

Quaternion log()
---
Calculates the natural logarithm of the quaternion

double real()
---
Returns the real `w` part of the quaternion

Quaternion imag()
---
Returns the imaginary part `[x, y, z]` of the quaternion as a 3D vector / array

boolean equals(n)
---
Checks if two quats are the same

boolean isFinite
---
Checks if all parts of a quaternion are finite

boolean isNaN
---
Checks if any of the parts of the quaternion is not a number

String toString()
---
Gets the Quaternion as a well formatted string

Array toVector()
---
Gets the actual quaternion as a 4D vector / array

Array toMatrix(2D=false)
---
Calculates the 3x3 rotation matrix for the current quat as a 9 element array or alternatively as a 2D array

Array toMatrix4(2D=false)
---
Calculates the homogeneous 4x4 rotation matrix for the current quat as a 16 element array or alternatively as a 2D array

String toCSSTransform()
---
Determines the homogeneous rotation matrix string used for CSS 3D transforms

Array toAxisAngle()
---
Calculates the axis and angle representation of the current quaternion

Array toEuler(order="ZXY")
---
Calculates the Euler angles represented by the current quat in the given Tait-Bryan order

Quaternion clone()
---
Clones the actual object

Array rotateVector(v)
---
Rotates a 3 component vector, represented as an array by the current quaternion

Quaternion slerp(q)(pct)
---
Returns a function to spherically interpolate between two quaternions. Called with a percentage `[0-1]`, the function returns the interpolated Quaternion.

Quaternion.fromAxisAngle(axis, angle)
---
Gets a quaternion by a rotation given as an axis and angle


Quaternion.fromMatrix(matrix)
---
Gets a quaternion given a rotation matrix, either as a 1x9 array or a 3x3 array.


Quaternion.fromEuler(ϕ, θ, ψ[, order="ZXY"]) / Quaternion.fromEulerLogical(ψ, θ, ϕ[, order="YXZ"])
---
Euler angles are probably the reason to use quaternions. The definition is mostly sloppy and you can only decide how it was defined based on the matrix representation. A `ZXY` in one definition is the multiplication order read from right to left and in another the execution order from left to right. Quaternion.js provides two functions, `fromEulerLogical()`, where the angles and order are applied from left to right (logical application order) and `fromEuler()` which reverses the order of the argument list (technical multiplication order).

So for `fromEulerLogical(ϕ, θ, ψ, "ZXY")`, for example means first rotate around Z by ϕ then around X by θ and then around Y by ψ (`RotY(ψ)RotX(θ)RotZ(ϕ)`).

The order of `fromEuler()` can take the string value `ZXY (default), XYZ / RPY, YXZ, ZYX / YPR, YZX, XZY, ZYZ, ZXZ, YXY, YZY, XYX, XZX`.

### Relations

- `fromEulerLogical(ϕ, θ, ψ, 'ZYX') = axisAngle([1, 0, 0], ψ) axisAngle([0, 1, 0], θ) axisAngle([0, 0, 1], ϕ)`
- `fromEulerLogical(ϕ, θ, ψ, 'ZYX') = fromEuler(ψ, θ, ϕ, 'YXZ')`
- Mathematica `RollPitchYawMatrix[{α, β, γ}] = fromEulerLogical(α, β, γ, 'ZYX')`
- W3C devicemotion `fromEulerLogical(ev.alpha * DEG, anevgles.beta * DEG, -ev.gamma * DEG, 'ZXY')`
- Three.js chose a different argument format:
  - `fromEuler(x, y, z, 'XYZ') = ThreeJSfromEuler(x, y, z, 'XYZ')`
  - `fromEuler(x, y, z, 'YXZ') = ThreeJSfromEuler(y, x, z, 'YXZ')`
  - `fromEuler(x, y, z, 'ZXY') = ThreeJSfromEuler(y, z, x, 'ZXY')`
  - `fromEuler(x, y, z, 'ZYX') = ThreeJSfromEuler(z, y, x, 'ZYX')`
  - `fromEuler(x, y, z, 'YZX') = ThreeJSfromEuler(z, x, y, 'YZX')`
  - `fromEuler(x, y, z, 'XZY') = ThreeJSfromEuler(x, z, y, 'XZY')`




Quaternion.fromBetweenVectors(u, v)
---
Calculates the quaternion to rotate vector `u` onto vector `v`, represented as 3 element arrays.

Quaternion.random()
---
Gets a spherical random number

Constants
===

Quaternion.ZERO
---
A quaternion zero instance (additive identity)

Quaternion.ONE
---
A quaternion one instance (multiplicative identity)

Quaternion.I
---
An imaginary number i instance

Quaternion.J
---
An imaginary number j instance

Quaternion.K
---
An imaginary number k instance




Installation
===
Installing Quaternion.js is as easy as cloning this repo or use one of the following commands:

```
bower install quaternion
```
or

```
npm install quaternion
```

Using Quaternion.js with the browser
===
```html
<script src="quaternion.js"></script>
<script>
    console.log(Quaternion("1 + 2i - 3j + 4k"));
</script>
```

Using Quaternion.js with require.js
===
```html
<script src="require.js"></script>
<script>
requirejs(['quaternion.js'],
function(Quaternion) {
    console.log(Quaternion("1 + 2i - 3j + 4k"));
});
</script>
```
Coding Style
===
As every library I publish, Quaternion.js is also built to be as small as possible after compressing it with Google Closure Compiler in advanced mode. Thus the coding style orientates a little on maxing-out the compression rate. Please make sure you keep this style if you plan to extend the library.

Testing
===
If you plan to enhance the library, make sure you add test cases and all the previous tests are passing. You can test the library with

```
npm test
```


Copyright and licensing
===
Copyright (c) 2023, [Robert Eisele](https://raw.org/)
Licensed under the MIT license.
