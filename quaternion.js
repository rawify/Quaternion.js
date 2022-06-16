/**
 * @license Quaternion.js v1.4.0 27/03/2022
 *
 * Copyright (c) 2022, Robert Eisele (robert@xarg.org)
 * Licensed under the MIT license.
 **/
(function(root) {

  'use strict';

  /**
   * Calculates log(sqrt(a^2+b^2)) in a way to avoid overflows
   *
   * @param {number} a
   * @param {number} b
   * @returns {number}
   */
  function logHypot(a, b) {

    var _a = Math.abs(a);
    var _b = Math.abs(b);

    if (a === 0) {
      return Math.log(_b);
    }

    if (b === 0) {
      return Math.log(_a);
    }

    if (_a < 3000 && _b < 3000) {
      return 0.5 * Math.log(a * a + b * b);
    }

    a = a / 2;
    b = b / 2;

    return 0.5 * Math.log(a * a + b * b) + Math.LN2;
  }

  /*
   * Default is the multiplicative one element
   *
   */
  var P = {
    'w': 1,
    'x': 0,
    'y': 0,
    'z': 0
  };

  function parse(dest, w, x, y, z) {

    // Most common internal use case with 4 params
    if (z !== undefined) {
      dest['w'] = w;
      dest['x'] = x;
      dest['y'] = y;
      dest['z'] = z;
      return;
    }

    if (typeof w === 'object' && y === undefined) {

      // Check for quats, for example when an object gets cloned
      if ('w' in w || 'x' in w || 'y' in w || 'z' in w) {
        dest['w'] = w['w'] || 0;
        dest['x'] = w['x'] || 0;
        dest['y'] = w['y'] || 0;
        dest['z'] = w['z'] || 0;
        return;
      }

      // Check for complex numbers
      if ('re' in w && 'im' in w) {
        dest['w'] = w['re'];
        dest['x'] = w['im'];
        dest['y'] = 0;
        dest['z'] = 0;
        return;
      }

      // Check for array
      if (w.length === 4) {
        dest['w'] = w[0];
        dest['x'] = w[1];
        dest['y'] = w[2];
        dest['z'] = w[3];
        return;
      }

      // Check for augmented vector
      if (w.length === 3) {
        dest['w'] = 0;
        dest['x'] = w[0];
        dest['y'] = w[1];
        dest['z'] = w[2];
        return;
      }

      throw new Error('Invalid object');
    }

    // Parse string values
    if (typeof w === 'string' && y === undefined) {

      var tokens = w.match(/\d+\.?\d*e[+-]?\d+|\d+\.?\d*|\.\d+|./g);
      var plus = 1;
      var minus = 0;

      var iMap = { 'i': 'x', 'j': 'y', 'k': 'z' };

      if (tokens === null) {
        throw new Error('Parse error');
      }

      // Reset the current state
      dest['w'] =
        dest['x'] =
        dest['y'] =
        dest['z'] = 0;

      for (var i = 0; i < tokens.length; i++) {

        var c = tokens[i];
        var d = tokens[i + 1];

        if (c === ' ' || c === '\t' || c === '\n') {
          /* void */
        } else if (c === '+') {
          plus++;
        } else if (c === '-') {
          minus++;
        } else {

          if (plus + minus === 0) {
            throw new Error('Parse error' + c);
          }
          var g = iMap[c];

          // Is the current token an imaginary sign?
          if (g !== undefined) {

            // Is the following token a number?
            if (d !== ' ' && !isNaN(d)) {
              c = d;
              i++;
            } else {
              c = '1';
            }

          } else {

            if (isNaN(c)) {
              throw new Error('Parser error');
            }

            g = iMap[d];

            if (g !== undefined) {
              i++;
            }
          }

          dest[g || 'w'] += parseFloat((minus % 2 ? '-' : '') + c);
          plus = minus = 0;
        }
      }

      // Still something on the stack
      if (plus + minus > 0) {
        throw new Error('Parser error');
      }
      return;
    }

    // If no single variable was given AND it was the constructor, set it to the identity
    if (w === undefined && dest !== P) {
      dest['w'] = 1;
      dest['x'] =
      dest['y'] =
      dest['z'] = 0;
    } else {

      dest['w'] = w || 0;

      // Note: This isn't setFromAxis, it's just syntactic sugar!
      if (x && x.length === 3) {
        dest['x'] = x[0];
        dest['y'] = x[1];
        dest['z'] = x[2];
      } else {
        dest['x'] = x || 0;
        dest['y'] = y || 0;
        dest['z'] = z || 0;
      }
    }
  }

  function numToStr(n, char, prev) {

    var ret = '';

    if (n !== 0) {

      if (prev !== '') {
        ret += n < 0 ? ' - ' : ' + ';
      } else if (n < 0) {
        ret += '-';
      }

      n = Math.abs(n);

      if (1 !== n || char === '') {
        ret += n;
      }
      ret += char;
    }
    return ret;
  }

  /**
   * Quaternion constructor
   *
   * @constructor
   * @param {number|Object|string} w real
   * @param {number=} x imag
   * @param {number=} y imag
   * @param {number=} z imag
   * @returns {Quaternion}
   */
  function Quaternion(w, x, y, z) {

    if (!(this instanceof Quaternion)) {
      return new Quaternion(w, x, y, z);
    }

    parse(this, w, x, y, z);
  }

  Quaternion.prototype = {
    'w': 1,
    'x': 0,
    'y': 0,
    'z': 0,
    /**
     * Adds two quaternions Q1 and Q2
     *
     * @param {number|Object|string} w real
     * @param {number=} x imag
     * @param {number=} y imag
     * @param {number=} z imag
     * @returns {Quaternion}
     */
    'add': function(w, x, y, z) {

      parse(P, w, x, y, z);

      // Q1 + Q2 := [w1, v1] + [w2, v2] = [w1 + w2, v1 + v2]

      return new Quaternion(
        this['w'] + P['w'],
        this['x'] + P['x'],
        this['y'] + P['y'],
        this['z'] + P['z']);
    },
    /**
     * Subtracts a quaternions Q2 from Q1
     *
     * @param {number|Object|string} w real
     * @param {number=} x imag
     * @param {number=} y imag
     * @param {number=} z imag
     * @returns {Quaternion}
     */
    'sub': function(w, x, y, z) {

      parse(P, w, x, y, z);

      // Q1 - Q2 := Q1 + (-Q2)
      //          = [w1, v1] - [w2, v2] = [w1 - w2, v1 - v2]

      return new Quaternion(
        this['w'] - P['w'],
        this['x'] - P['x'],
        this['y'] - P['y'],
        this['z'] - P['z']);
    },
    /**
     * Calculates the additive inverse, or simply it negates the quaternion
     *
     * @returns {Quaternion}
     */
    'neg': function() {

      // -Q := [-w, -v]

      return new Quaternion(-this['w'], -this['x'], -this['y'], -this['z']);
    },
    /**
     * Calculates the length/modulus/magnitude or the norm of a quaternion
     *
     * @returns {number}
     */
    'norm': function() {

      // |Q| := sqrt(|Q|^2)

      // The unit quaternion has |Q| = 1

      var w = this['w'];
      var x = this['x'];
      var y = this['y'];
      var z = this['z'];

      return Math.sqrt(w * w + x * x + y * y + z * z);
    },
    /**
     * Calculates the squared length/modulus/magnitude or the norm of a quaternion
     *
     * @returns {number}
     */
    'normSq': function() {

      // |Q|^2 := [w, v] * [w, -v]
      //        = [w^2 + dot(v, v), -w * v + w * v + cross(v, -v)]
      //        = [w^2 + |v|^2, 0]
      //        = [w^2 + dot(v, v), 0]
      //        = dot(Q, Q)
      //        = Q * Q'

      var w = this['w'];
      var x = this['x'];
      var y = this['y'];
      var z = this['z'];

      return w * w + x * x + y * y + z * z;
    },
    /**
     * Normalizes the quaternion to have |Q| = 1 as long as the norm is not zero
     * Alternative names are the signum, unit or versor
     *
     * @returns {Quaternion}
     */
    'normalize': function() {

      // Q* := Q / |Q|

      // unrolled Q.scale(1 / Q.norm())

      var w = this['w'];
      var x = this['x'];
      var y = this['y'];
      var z = this['z'];

      var norm = Math.sqrt(w * w + x * x + y * y + z * z);

      if (norm < Quaternion['EPSILON']) {
        return Quaternion['ZERO'];
      }

      norm = 1 / norm;

      return new Quaternion(w * norm, x * norm, y * norm, z * norm);
    },
    /**
     * Calculates the Hamilton product of two quaternions
     * Leaving out the imaginary part results in just scaling the quat
     *
     * @param {number|Object|string} w real
     * @param {number=} x imag
     * @param {number=} y imag
     * @param {number=} z imag
     * @returns {Quaternion}
     */
    'mul': function(w, x, y, z) {

      parse(P, w, x, y, z);

      // Q1 * Q2 = [w1 * w2 - dot(v1, v2), w1 * v2 + w2 * v1 + cross(v1, v2)]

      // Not commutative because cross(v1, v2) != cross(v2, v1)!

      var w1 = this['w'];
      var x1 = this['x'];
      var y1 = this['y'];
      var z1 = this['z'];

      var w2 = P['w'];
      var x2 = P['x'];
      var y2 = P['y'];
      var z2 = P['z'];

      return new Quaternion(
        w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2,
        w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2,
        w1 * y2 + y1 * w2 + z1 * x2 - x1 * z2,
        w1 * z2 + z1 * w2 + x1 * y2 - y1 * x2);
    },
    /**
     * Scales a quaternion by a scalar, faster than using multiplication
     *
     * @param {number} s scaling factor
     * @returns {Quaternion}
     */
    'scale': function(s) {

      return new Quaternion(
        this['w'] * s,
        this['x'] * s,
        this['y'] * s,
        this['z'] * s);
    },
    /**
     * Calculates the dot product of two quaternions
     *
     * @param {number|Object|string} w real
     * @param {number=} x imag
     * @param {number=} y imag
     * @param {number=} z imag
     * @returns {number}
     */
    'dot': function(w, x, y, z) {

      parse(P, w, x, y, z);

      // dot(Q1, Q2) := w1 * w2 + dot(v1, v2)

      return this['w'] * P['w'] + this['x'] * P['x'] + this['y'] * P['y'] + this['z'] * P['z'];
    },
    /**
     * Calculates the inverse of a quat for non-normalized quats such that
     * Q^-1 * Q = 1 and Q * Q^-1 = 1
     *
     * @returns {Quaternion}
     */
    'inverse': function() {

      // Q^-1 := Q' / |Q|^2
      //       = [w / (w^2 + |v|^2), -v / (w^2 + |v|^2)]

      // Proof:
      // Q * Q^-1 = [w, v] * [w / (w^2 + |v|^2), -v / (w^2 + |v|^2)]
      //          = [1, 0]
      // Q^-1 * Q = [w / (w^2 + |v|^2), -v / (w^2 + |v|^2)] * [w, v]
      //          = [1, 0].

      var w = this['w'];
      var x = this['x'];
      var y = this['y'];
      var z = this['z'];

      var normSq = w * w + x * x + y * y + z * z;

      if (normSq === 0) {
        return Quaternion['ZERO']; // TODO: Is the result zero or one when the norm is zero?
      }

      normSq = 1 / normSq;

      return new Quaternion(w * normSq, -x * normSq, -y * normSq, -z * normSq);
    },
    /**
     * Multiplies a quaternion with the inverse of a second quaternion
     *
     * @param {number|Object|string} w real
     * @param {number=} x imag
     * @param {number=} y imag
     * @param {number=} z imag
     * @returns {Quaternion}
     */
    'div': function(w, x, y, z) {

      parse(P, w, x, y, z);

      // Q1 / Q2 := Q1 * Q2^-1

      var w1 = this['w'];
      var x1 = this['x'];
      var y1 = this['y'];
      var z1 = this['z'];

      var w2 = P['w'];
      var x2 = P['x'];
      var y2 = P['y'];
      var z2 = P['z'];

      var normSq = w2 * w2 + x2 * x2 + y2 * y2 + z2 * z2;

      if (normSq === 0) {
        return Quaternion['ZERO']; // TODO: Is the result zero or one when the norm is zero?
      }

      normSq = 1 / normSq;

      return new Quaternion(
        (w1 * w2 + x1 * x2 + y1 * y2 + z1 * z2) * normSq,
        (x1 * w2 - w1 * x2 - y1 * z2 + z1 * y2) * normSq,
        (y1 * w2 - w1 * y2 - z1 * x2 + x1 * z2) * normSq,
        (z1 * w2 - w1 * z2 - x1 * y2 + y1 * x2) * normSq);
    },
    /**
     * Calculates the conjugate of a quaternion
     *
     * @returns {Quaternion}
     */
    'conjugate': function() {

      // Q' = [s, -v]

      // If the quaternion is normalized,
      // the conjugate is the inverse of the quaternion - but faster
      // Q' * Q = Q * Q' = 1

      // Additionally, the conjugate of a unit quaternion is a rotation with the same
      // angle but the opposite axis.

      // Moreover the following property holds:
      // (Q1 * Q2)' = Q2' * Q1'

      return new Quaternion(this['w'], -this['x'], -this['y'], -this['z']);
    },
    /**
     * Calculates the natural exponentiation of the quaternion
     *
     * @returns {Quaternion}
     */
    'exp': function() {

      var w = this['w'];
      var x = this['x'];
      var y = this['y'];
      var z = this['z'];

      var vNorm = Math.sqrt(x * x + y * y + z * z);
      var wExp = Math.exp(w);
      var scale = wExp / vNorm * Math.sin(vNorm);

      if (vNorm === 0) {
        //return new Quaternion(wExp * Math.cos(vNorm), 0, 0, 0);
        return new Quaternion(wExp, 0, 0, 0);
      }

      return new Quaternion(
        wExp * Math.cos(vNorm),
        x * scale,
        y * scale,
        z * scale);
    },
    /**
     * Calculates the natural logarithm of the quaternion
     *
     * @returns {Quaternion}
     */
    'log': function() {

      var w = this['w'];
      var x = this['x'];
      var y = this['y'];
      var z = this['z'];

      if (y === 0 && z === 0) {
        return new Quaternion(
          logHypot(w, x),
          Math.atan2(x, w), 0, 0);
      }

      var qNorm2 = x * x + y * y + z * z + w * w;
      var vNorm = Math.sqrt(x * x + y * y + z * z);

      var scale = Math.atan2(vNorm, w) / vNorm;

      return new Quaternion(
        Math.log(qNorm2) * 0.5,
        x * scale,
        y * scale,
        z * scale);
    },
    /**
     * Calculates the power of a quaternion raised to a real number or another quaternion
     *
     * @param {number|Object|string} w real
     * @param {number=} x imag
     * @param {number=} y imag
     * @param {number=} z imag
     * @returns {Quaternion}
     */
    'pow': function(w, x, y, z) {

      parse(P, w, x, y, z);

      if (P['y'] === 0 && P['z'] === 0) {

        if (P['w'] === 1 && P['x'] === 0) {
          return this;
        }

        if (P['w'] === 0 && P['x'] === 0) {
          return Quaternion['ONE'];
        }

        // Check if we can operate in C
        // Borrowed from complex.js
        if (this['y'] === 0 && this['z'] === 0) {

          var a = this['w'];
          var b = this['x'];

          if (a === 0 && b === 0) {
            return Quaternion['ZERO'];
          }

          var arg = Math.atan2(b, a);
          var loh = logHypot(a, b);

          if (P['x'] === 0) {

            if (b === 0 && a >= 0) {

              return new Quaternion(Math.pow(a, P['w']), 0, 0, 0);

            } else if (a === 0) {

              switch (P['w'] % 4) {
                case 0:
                  return new Quaternion(Math.pow(b, P['w']), 0, 0, 0);
                case 1:
                  return new Quaternion(0, Math.pow(b, P['w']), 0, 0);
                case 2:
                  return new Quaternion(-Math.pow(b, P['w']), 0, 0, 0);
                case 3:
                  return new Quaternion(0, -Math.pow(b, P['w']), 0, 0);
              }
            }
          }

          a = Math.exp(P['w'] * loh - P['x'] * arg);
          b = P['x'] * loh + P['w'] * arg;
          return new Quaternion(
            a * Math.cos(b),
            a * Math.sin(b), 0, 0);
        }
      }

      // Normal quaternion behavior
      // q^p = e^ln(q^p) = e^(ln(q)*p)
      return this['log']()['mul'](P)['exp']();
    },
    /**
     * Checks if two quats are the same
     *
     * @param {number|Object|string} w real
     * @param {number=} x imag
     * @param {number=} y imag
     * @param {number=} z imag
     * @returns {boolean}
     */
    'equals': function(w, x, y, z) {

      parse(P, w, x, y, z);

      var eps = Quaternion['EPSILON'];

      // maybe check for NaN's here?
      return Math.abs(P['w'] - this['w']) < eps
        && Math.abs(P['x'] - this['x']) < eps
        && Math.abs(P['y'] - this['y']) < eps
        && Math.abs(P['z'] - this['z']) < eps;
    },
    /**
     * Checks if all parts of a quaternion are finite
     *
     * @returns {boolean}
     */
    'isFinite': function() {

      return isFinite(this['w']) && isFinite(this['x']) && isFinite(this['y']) && isFinite(this['z']);
    },
    /**
     * Checks if any of the parts of the quaternion is not a number
     *
     * @returns {boolean}
     */
    'isNaN': function() {

      return isNaN(this['w']) || isNaN(this['x']) || isNaN(this['y']) || isNaN(this['z']);
    },
    /**
     * Gets the Quaternion as a well formatted string
     *
     * @returns {string}
     */
    'toString': function() {

      var w = this['w'];
      var x = this['x'];
      var y = this['y'];
      var z = this['z'];
      var ret = '';

      if (isNaN(w) || isNaN(x) || isNaN(y) || isNaN(z)) {
        return 'NaN';
      }

      // Alternative design?
      // '(%f, [%f %f %f])'

      ret = numToStr(w, '', ret);
      ret += numToStr(x, 'i', ret);
      ret += numToStr(y, 'j', ret);
      ret += numToStr(z, 'k', ret);

      if ('' === ret)
        return '0';

      return ret;
    },
    /**
     * Returns the real part of the quaternion
     *
     * @returns {number}
     */
    'real': function() {

      return this['w'];
    },
    /**
     * Returns the imaginary part of the quaternion as a 3D vector / array
     *
     * @returns {Array}
     */
    'imag': function() {

      return [this['x'], this['y'], this['z']];
    },
    /**
     * Gets the actual quaternion as a 4D vector / array
     *
     * @returns {Array}
     */
    'toVector': function() {

      return [this['w'], this['x'], this['y'], this['z']];
    },
    /**
     * Calculates the 3x3 rotation matrix for the current quat
     *
     * @param {boolean=} twoD
     * @returns {Array}
     */
    'toMatrix': function(twoD) {

      var w = this['w'];
      var x = this['x'];
      var y = this['y'];
      var z = this['z'];

      var wx = w * x, wy = w * y, wz = w * z;
      var xx = x * x, xy = x * y, xz = x * z;
      var yy = y * y, yz = y * z, zz = z * z;

      if (twoD) {
        return [
          [1 - 2 * (yy + zz), 2 * (xy - wz), 2 * (xz + wy)],
          [2 * (xy + wz), 1 - 2 * (xx + zz), 2 * (yz - wx)],
          [2 * (xz - wy), 2 * (yz + wx), 1 - 2 * (xx + yy)]];
      }

      return [
        1 - 2 * (yy + zz), 2 * (xy - wz), 2 * (xz + wy),
        2 * (xy + wz), 1 - 2 * (xx + zz), 2 * (yz - wx),
        2 * (xz - wy), 2 * (yz + wx), 1 - 2 * (xx + yy)];
    },
    /**
     * Calculates the homogeneous 4x4 rotation matrix for the current quat
     *
     * @param {boolean=} twoD
     * @returns {Array}
     */
    'toMatrix4': function(twoD) {

      var w = this['w'];
      var x = this['x'];
      var y = this['y'];
      var z = this['z'];

      var wx = w * x, wy = w * y, wz = w * z;
      var xx = x * x, xy = x * y, xz = x * z;
      var yy = y * y, yz = y * z, zz = z * z;

      if (twoD) {
        return [
          [1 - 2 * (yy + zz), 2 * (xy - wz), 2 * (xz + wy), 0],
          [2 * (xy + wz), 1 - 2 * (xx + zz), 2 * (yz - wx), 0],
          [2 * (xz - wy), 2 * (yz + wx), 1 - 2 * (xx + yy), 0],
          [0, 0, 0, 1]];
      }

      return [
        1 - 2 * (yy + zz), 2 * (xy - wz), 2 * (xz + wy), 0,
        2 * (xy + wz), 1 - 2 * (xx + zz), 2 * (yz - wx), 0,
        2 * (xz - wy), 2 * (yz + wx), 1 - 2 * (xx + yy), 0,
        0, 0, 0, 1];
    },
    /**
     * Calculates the Euler angles represented by the current quat
     * 
     * @returns {Object}
     */
    'toEuler': function() {

      var w = this['w'];
      var x = this['x'];
      var y = this['y'];
      var z = this['z'];

      var t = 2 * (w * y - z * x);

      return {
        // X-axis rotation
        roll: Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y)),
        // Y-axis rotation
        pitch: t >= 1 ? Math.PI / 2 : (t <= -1 ? -Math.PI / 2 : Math.asin(t)),
        // Z-axis rotation
        yaw: Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z))
      };
    },
    /**
     * Clones the actual object
     *
     * @returns {Quaternion}
     */
    'clone': function() {

      return new Quaternion(this);
    },
    /**
     * Rotates a vector according to the current quaternion, assumes |q|=1
     * @link https://www.xarg.org/proof/vector-rotation-using-quaternions/
     *
     * @param {Array} v The vector to be rotated
     * @returns {Array}
     */
    'rotateVector': function(v) {

      var qw = this['w'];
      var qx = this['x'];
      var qy = this['y'];
      var qz = this['z'];

      var vx = v[0];
      var vy = v[1];
      var vz = v[2];

      // t = 2q x v
      var tx = 2 * (qy * vz - qz * vy);
      var ty = 2 * (qz * vx - qx * vz);
      var tz = 2 * (qx * vy - qy * vx);

      // v + w t + q x t
      return [
        vx + qw * tx + qy * tz - qz * ty,
        vy + qw * ty + qz * tx - qx * tz,
        vz + qw * tz + qx * ty - qy * tx];
    },

    /**
     * Gets a function to spherically interpolate between two quaternions
     * 
     * @returns Function
     */
    'slerp': function(w, x, y, z) {

      parse(P, w, x, y, z);

      // slerp(Q1, Q2, t) := Q1(Q1^-1 Q2)^t

      var w1 = this['w'];
      var x1 = this['x'];
      var y1 = this['y'];
      var z1 = this['z'];

      var w2 = P['w'];
      var x2 = P['x'];
      var y2 = P['y'];
      var z2 = P['z'];

      var cosTheta0 = w1 * w2 + x1 * x2 + y1 * y2 + z1 * z2;

      if (cosTheta0 < 0) {
        w1 = -w1;
        x1 = -x1;
        y1 = -y1;
        z1 = -z1;
        cosTheta0 = -cosTheta0;
      }

      if (cosTheta0 >= 1 - Quaternion['EPSILON']) {
        return function(pct) {
          return new Quaternion(
            w1 + pct * (w2 - w1),
            x1 + pct * (x2 - x1),
            y1 + pct * (y2 - y1),
            z1 + pct * (z2 - z1))['normalize']();
        };
      }

      var Theta0 = Math.acos(cosTheta0);
      var sinTheta0 = Math.sin(Theta0);

      return function(pct) {

        var Theta = Theta0 * pct;
        var sinTheta = Math.sin(Theta);
        var cosTheta = Math.cos(Theta);

        var s0 = cosTheta - cosTheta0 * sinTheta / sinTheta0;
        var s1 = sinTheta / sinTheta0;

        return new Quaternion(
          s0 * w1 + s1 * w2,
          s0 * x1 + s1 * x2,
          s0 * y1 + s1 * y2,
          s0 * z1 + s1 * z2);
      };
    }
  };

  Quaternion['ZERO'] = new Quaternion(0, 0, 0, 0); // This is the additive identity Quaternion
  Quaternion['ONE'] = new Quaternion(1, 0, 0, 0); // This is the multiplicative identity Quaternion
  Quaternion['I'] = new Quaternion(0, 1, 0, 0);
  Quaternion['J'] = new Quaternion(0, 0, 1, 0);
  Quaternion['K'] = new Quaternion(0, 0, 0, 1);
  Quaternion['EPSILON'] = 1e-16;

  /**
   * Creates quaternion by a rotation given as axis-angle orientation
   *
   * @param {Array} axis The axis around which to rotate
   * @param {number} angle The angle in radians
   * @returns {Quaternion}
   */
  Quaternion['fromAxisAngle'] = function(axis, angle) {

    // Q = [cos(angle / 2), v * sin(angle / 2)]

    var halfAngle = angle * 0.5;

    var a = axis[0];
    var b = axis[1];
    var c = axis[2];

    var sin_2 = Math.sin(halfAngle);
    var cos_2 = Math.cos(halfAngle);

    var sin_norm = sin_2 / Math.sqrt(a * a + b * b + c * c);

    return new Quaternion(cos_2, a * sin_norm, b * sin_norm, c * sin_norm);
  };

  /**
   * Calculates the quaternion to rotate one vector onto another
   * @link https://www.xarg.org/proof/quaternion-from-two-vectors/
   *
   * @param {Array} u
   * @param {Array} v
   */
  Quaternion['fromBetweenVectors'] = function(u, v) {

    var ux = u[0];
    var uy = u[1];
    var uz = u[2];

    var vx = v[0];
    var vy = v[1];
    var vz = v[2];

    var dot = ux * vx + uy * vy + uz * vz;

    // Parallel check (TODO must be normalized)
    if (dot >= 1 - Quaternion['EPSILON']) {
      //return Quaternion['ONE'];
    }

    // Close to PI @TODO
    //if (1 + dot <= Quaternion['EPSILON']) {
    // return Quaternion.fromAxisAngle(Math.abs(ux) > Math.abs(uz) ? [-uy,  ux, 0] : [0, -uz,  uy], 0) -> OR
    // return Quaternion.fromAxisAngle(Math.abs(ux) > Math.abs(uz) ? [ uy, -ux, 0] : [0,  uz, -uy], 0)
    //}

    var wx = uy * vz - uz * vy;
    var wy = uz * vx - ux * vz;
    var wz = ux * vy - uy * vx;

    return new Quaternion(
      dot + Math.sqrt(dot * dot + wx * wx + wy * wy + wz * wz),
      wx,
      wy,
      wz
    ).normalize();
  };

  /**
   * Gets a spherical random number
   * @link http://planning.cs.uiuc.edu/node198.html
   */
  Quaternion['random'] = function() {

    var u1 = Math.random();
    var u2 = Math.random();
    var u3 = Math.random();

    var s = Math.sqrt(1 - u1);
    var t = Math.sqrt(u1);

    return new Quaternion(
      t * Math.cos(2 * Math.PI * u3),
      s * Math.sin(2 * Math.PI * u2),
      s * Math.cos(2 * Math.PI * u2),
      t * Math.sin(2 * Math.PI * u3)
    );
  };

  /**
   * Creates a quaternion by a rotation given by Euler angles
   *
   * @param {number} phi
   * @param {number} theta
   * @param {number} psi
   * @param {string=} order
   * @returns {Quaternion}
   */
  Quaternion['fromEuler'] = function(phi, theta, psi, order) {

    var _x = phi * 0.5;
    var _y = theta * 0.5;
    var _z = psi * 0.5;

    var cX = Math.cos(_x);
    var cY = Math.cos(_y);
    var cZ = Math.cos(_z);

    var sX = Math.sin(_x);
    var sY = Math.sin(_y);
    var sZ = Math.sin(_z);

    if (order === undefined || order === 'ZXY') {
      // axisAngle([0, 0, 1], x) * axisAngle([1, 0, 0], y) * axisAngle([0, 1, 0], z)
      return new Quaternion(
        cX * cY * cZ - sX * sY * sZ,
        cX * cZ * sY - cY * sX * sZ,
        cX * cY * sZ + cZ * sX * sY,
        cY * cZ * sX + cX * sY * sZ);
    }

    if (order === 'XYZ' || order === 'RPY') {
      // axisAngle([1, 0, 0], x) * axisAngle([0, 1, 0], y) * axisAngle([0, 0, 1], z)
      return new Quaternion(
        cX * cY * cZ - sX * sY * sZ,
        cY * cZ * sX + cX * sY * sZ,
        cX * cZ * sY - cY * sX * sZ,
        cX * cY * sZ + cZ * sX * sY);
    }

    if (order === 'YXZ') {
      // axisAngle([0, 1, 0], x) * axisAngle([1, 0, 0], y) * axisAngle([0, 0, 1], z)
      return new Quaternion(
        cX * cY * cZ + sX * sY * sZ,
        cX * cZ * sY + cY * sX * sZ,
        cY * cZ * sX - cX * sY * sZ,
        cX * cY * sZ - cZ * sX * sY);
    }

    if (order === 'ZYX' || order === 'YPR') {
      // axisAngle([0, 0, 1], x) * axisAngle([0, 1, 0], y) * axisAngle([1, 0, 0], z)
      return new Quaternion(
        cX * cY * cZ + sX * sY * sZ,
        cX * cY * sZ - cZ * sX * sY,
        cX * cZ * sY + cY * sX * sZ,
        cY * cZ * sX - cX * sY * sZ);
    }

    if (order === 'YZX') {
      // axisAngle([0, 1, 0], x) * axisAngle([0, 0, 1], y) * axisAngle([1, 0, 0], z)
      return new Quaternion(
        cX * cY * cZ - sX * sY * sZ,
        cX * cY * sZ + cZ * sX * sY,
        cY * cZ * sX + cX * sY * sZ,
        cX * cZ * sY - cY * sX * sZ);
    }

    if (order === 'XZY') {
      // axisAngle([1, 0, 0], x) * axisAngle([0, 0, 1], z) * axisAngle([0, 1, 0], y)
      return new Quaternion(
        cX * cY * cZ + sX * sY * sZ,
        cY * cZ * sX - cX * sY * sZ,
        cX * cY * sZ - cZ * sX * sY,
        cX * cZ * sY + cY * sX * sZ);
    }
    return null;
  };

  /**
   * Creates a quaternion by a rotation matrix
   *
   * @param {Array} matrix
   * @returns {Quaternion}
   */
  Quaternion['fromMatrix'] = function(matrix) {

    if (matrix.length === 9) {

      var m00 = matrix[0];
      var m01 = matrix[1];
      var m02 = matrix[2];

      var m10 = matrix[3];
      var m11 = matrix[4];
      var m12 = matrix[5];

      var m20 = matrix[6];
      var m21 = matrix[7];
      var m22 = matrix[8];

    } else {
      var m00 = matrix[0][0];
      var m01 = matrix[0][1];
      var m02 = matrix[0][2];

      var m10 = matrix[1][0];
      var m11 = matrix[1][1];
      var m12 = matrix[1][2];

      var m20 = matrix[2][0];
      var m21 = matrix[2][1];
      var m22 = matrix[2][2];
    }

    var tr = m00 + m11 + m22;

    if (tr > 0) { 
      var S = Math.sqrt(tr+1.0) * 2; // S=4*qw

      return new Quaternion(
        0.25 * S,
        (m21 - m12) / S,
        (m02 - m20) / S,
        (m10 - m01) / S);
    } else if ((m00 > m11)&(m00 > m22)) { 
      var S = Math.sqrt(1.0 + m00 - m11 - m22) * 2; // S=4*qx

      return new Quaternion(
        (m21 - m12) / S,
        0.25 * S,
        (m01 + m10) / S,
        (m02 + m20) / S);
    } else if (m11 > m22) { 
      var S = Math.sqrt(1.0 + m11 - m00 - m22) * 2; // S=4*qy

      return new Quaternion(
        (m02 - m20) / S,
        (m01 + m10) / S,
        0.25 * S,
        (m12 + m21) / S);
    } else { 
      var S = Math.sqrt(1.0 + m22 - m00 - m11) * 2; // S=4*qz

      return new Quaternion(
        (m10 - m01) / S,
        (m02 + m20) / S,
        (m12 + m21) / S,
        0.25 * S);
    }
  };

  if (typeof define === 'function' && define['amd']) {
    define([], function() {
      return Quaternion;
    });
  } else if (typeof exports === 'object') {
    Object.defineProperty(Quaternion, "__esModule", { 'value': true });
    Quaternion['default'] = Quaternion;
    Quaternion['Quaternion'] = Quaternion;
    module['exports'] = Quaternion;
  } else {
    root['Quaternion'] = Quaternion;
  }

})(this);
