/**
 * @license Quaternion.js v1.0.4 22/02/2016
 *
 * Copyright (c) 2016, Robert Eisele (robert@xarg.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
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
      return Math.log(a * a + b * b) * 0.5;
    }

    return Math.log(a / Math.cos(Math.atan2(b, a)));
  }

  /*
   * Default is the multiplicative one element
   *
   */
  let P = {
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

      const tokens = w.match(/\d+\.?\d*e[+-]?\d+|\d+\.?\d*|\.\d+|./g);
      let plus = 1;
      let minus = 0;

      const iMap = {'i': 'x', 'j': 'y', 'k': 'z'};

      if (tokens === null) {
        throw new Error('Parse error');
      }

      // Reset the current state
      dest['w'] =
      dest['x'] =
      dest['y'] =
      dest['z'] = 0;

      for (let i = 0; i < tokens.length; i++) {

        let c = tokens[i];
        let d = tokens[i + 1];

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
          let g = iMap[c];

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

    let ret = '';

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

      const w = this['w'];
      const x = this['x'];
      const y = this['y'];
      const z = this['z'];

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

      const w = this['w'];
      const x = this['x'];
      const y = this['y'];
      const z = this['z'];

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

      const w = this['w'];
      const x = this['x'];
      const y = this['y'];
      const z = this['z'];

      let norm = Math.sqrt(w * w + x * x + y * y + z * z);

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

      const w1 = this['w'];
      const x1 = this['x'];
      const y1 = this['y'];
      const z1 = this['z'];

      const w2 = P['w'];
      const x2 = P['x'];
      const y2 = P['y'];
      const z2 = P['z'];

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

      const w = this['w'];
      const x = this['x'];
      const y = this['y'];
      const z = this['z'];

      let normSq = w * w + x * x + y * y + z * z;

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

      const w1 = this['w'];
      const x1 = this['x'];
      const y1 = this['y'];
      const z1 = this['z'];

      const w2 = P['w'];
      const x2 = P['x'];
      const y2 = P['y'];
      const z2 = P['z'];

      let normSq = w2 * w2 + x2 * x2 + y2 * y2 + z2 * z2;

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

      const w = this['w'];
      const x = this['x'];
      const y = this['y'];
      const z = this['z'];

      const vNorm = Math.sqrt(x * x + y * y + z * z);
      const wExp = Math.exp(w);
      const scale = wExp / vNorm * Math.sin(vNorm);

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

      const w = this['w'];
      const x = this['x'];
      const y = this['y'];
      const z = this['z'];

      if (y === 0 && z === 0) {
        return new Quaternion(
          logHypot(w, x),
          Math.atan2(x, w), 0, 0);
      }

      const qNorm2 = x * x + y * y + z * z + w * w;
      const vNorm = Math.sqrt(x * x + y * y + z * z);

      const scale = Math.atan2(vNorm, w) / vNorm;

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

          let a = this['w'];
          let b = this['x'];

          if (a === 0 && b === 0) {
            return Quaternion['ZERO'];
          }

          let arg = Math.atan2(b, a);
          let loh = logHypot(a, b);

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
      return this.log().mul(P).exp();
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

      const eps = Quaternion['EPSILON'];

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

      const w = this['w'];
      const x = this['x'];
      const y = this['y'];
      const z = this['z'];
      let ret = '';

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
     * @param {boolean=} d2
     * @see https://en.wikipedia.org/wiki/Rotation_matrix#Quaternion
     * @returns {Array}
     */
    'toMatrix': function(d2) {

      const w = this['w'];
      const x = this['x'];
      const y = this['y'];
      const z = this['z'];

      const n = w * w + x * x + y * y + z * z;
      const s = n === 0 ? 0 : 2 / n;
      const wx = s * w * x, wy = s * w * y, wz = s * w * z;
      const xx = s * x * x, xy = s * x * y, xz = s * x * z;
      const yy = s * y * y, yz = s * y * z, zz = s * z * z;

      if (d2) {
        return [
          [1 - (yy + zz), xy - wz, xz + wy],
          [xy + wz, 1 - (xx + zz), yz - wx],
          [xz - wy, yz + wx, 1 - (xx + yy)]];
      }

      return [
        1 - (yy + zz), xy - wz, xz + wy,
        xy + wz, 1 - (xx + zz), yz - wx,
        xz - wy, yz + wx, 1 - (xx + yy)];
    },
    /**
     * Calculates the homogeneous 4x4 rotation matrix for the current quat
     *
     * @param {boolean=} d2
     * @returns {Array}
     */
    'toMatrix4': function(d2) {

      const w = this['w'];
      const x = this['x'];
      const y = this['y'];
      const z = this['z'];

      const n = w * w + x * x + y * y + z * z;
      const s = n === 0 ? 0 : 2 / n;
      const wx = s * w * x, wy = s * w * y, wz = s * w * z;
      const xx = s * x * x, xy = s * x * y, xz = s * x * z;
      const yy = s * y * y, yz = s * y * z, zz = s * z * z;

      if (d2) {
        return [
          [1 - (yy + zz), xy - wz, xz + wy, 0],
          [xy + wz, 1 - (xx + zz), yz - wx, 0],
          [xz - wy, yz + wx, 1 - (xx + yy), 0],
          [0, 0, 0, 1]];
      }

      return [
        1 - (yy + zz), xy - wz, xz + wy, 0,
        xy + wz, 1 - (xx + zz), yz - wx, 0,
        xz - wy, yz + wx, 1 - (xx + yy), 0,
        0, 0, 0, 1];
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
     * Rotates a vector according to the current quaternion
     *
     * @param {Array} v The vector to be rotated
     * @returns {Array}
     */
    'rotateVector': function(v) {

      // [0, v'] = Q * [0, v] * Q'

      // Q
      const w1 = this['w'];
      const x1 = this['x'];
      const y1 = this['y'];
      const z1 = this['z'];

      // [0, v]
      const w2 = 0;
      const x2 = v[0];
      const y2 = v[1];
      const z2 = v[2];

      // Q * [0, v]
      const w3 = /*w1 * w2*/ -x1 * x2 - y1 * y2 - z1 * z2;
      const x3 = w1 * x2 + /*x1 * w2 +*/ y1 * z2 - z1 * y2;
      const y3 = w1 * y2 + /*y1 * w2 +*/ z1 * x2 - x1 * z2;
      const z3 = w1 * z2 + /*z1 * w2 +*/ x1 * y2 - y1 * x2;

      const w4 = w3 * w1 + x3 * x1 + y3 * y1 + z3 * z1;
      const x4 = x3 * w1 - w3 * x1 - y3 * z1 + z3 * y1;
      const y4 = y3 * w1 - w3 * y1 - z3 * x1 + x3 * z1;
      const z4 = z3 * w1 - w3 * z1 - x3 * y1 + y3 * x1;

      return [x4, y4, z4];
    }
  };

  Quaternion['ZERO'] = new Quaternion(0, 0, 0, 0); // This is the additive identity Quaternion
  Quaternion['ONE'] = new Quaternion(1, 0, 0, 0); // This is the multiplicative identity Quaternion
  Quaternion['I'] = new Quaternion(0, 1, 0, 0);
  Quaternion['J'] = new Quaternion(0, 0, 1, 0);
  Quaternion['K'] = new Quaternion(0, 0, 0, 1);
  Quaternion['EPSILON'] = 1e-16;

  /**
   * Creates quaternion by a rotation given as axis and angle
   *
   * @param {Array} axis The axis around which to rotate
   * @param {number} angle The angle in radians
   * @returns {Quaternion}
   */
  Quaternion['fromAxisAngle'] = function(axis, angle) {

    // Q = [cos(angle / 2), v * sin(angle / 2)]

    const halfAngle = angle * 0.5;

    const a = axis[0];
    const b = axis[1];
    const c = axis[2];

    const sin = Math.sin(halfAngle);
    const cos = Math.cos(halfAngle);

    const sin_norm = sin / Math.sqrt(a * a + b * b + c * c);

    return new Quaternion(cos, a * sin_norm, b * sin_norm, c * sin_norm);
  };

  /**
   * Calculates the quaternion to rotate one vector onto the other
   *
   * @param {Array} u
   * @param {Array} v
   */
  Quaternion['fromBetweenVectors'] = function(u, v) {

    const a = u[0];
    const b = u[1];
    const c = u[2];

    const x = v[0];
    const y = v[1];
    const z = v[2];

    const dot = a * x + b * y + c * z;
    const w1 = b * z - c * y;
    const w2 = c * x - a * z;
    const w3 = a * y - b * x;

    return new Quaternion(
      dot + Math.sqrt(dot * dot + w1 * w1 + w2 * w2 + w3 * w3),
      w1,
      w2,
      w3
    ).normalize();
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

    const _x = theta * 0.5;
    const _y = psi * 0.5;
    const _z = phi * 0.5;

    const cX = Math.cos(_x);
    const cY = Math.cos(_y);
    const cZ = Math.cos(_z);

    const sX = Math.sin(_x);
    const sY = Math.sin(_y);
    const sZ = Math.sin(_z);

    if (order === undefined || order === 'ZXY') {
      return new Quaternion(
        cX * cY * cZ - sX * sY * sZ,
        sX * cY * cZ - cX * sY * sZ,
        cX * sY * cZ + sX * cY * sZ,
        cX * cY * sZ + sX * sY * cZ);
    }

    if (order === 'XYZ') {
      return new Quaternion(
        cX * cY * cZ - sX * sY * sZ,
        sX * cY * cZ + cX * sY * sZ,
        cX * sY * cZ - sX * cY * sZ,
        cX * cY * sZ + sX * sY * cZ);
    }

    if (order === 'YXZ') {
      return new Quaternion(
        cX * cY * cZ + sX * sY * sZ,
        sX * cY * cZ + cX * sY * sZ,
        cX * sY * cZ - sX * cY * sZ,
        cX * cY * sZ - sX * sY * cZ);
    }

    if (order === 'ZYX') {
      return new Quaternion(
        cX * cY * cZ + sX * sY * sZ,
        sX * cY * cZ - cX * sY * sZ,
        cX * sY * cZ + sX * cY * sZ,
        cX * cY * sZ - sX * sY * cZ);
    }

    if (order === 'YZX') {
      return new Quaternion(
        cX * cY * cZ - sX * sY * sZ,
        sX * cY * cZ + cX * sY * sZ,
        cX * sY * cZ + sX * cY * sZ,
        cX * cY * sZ - sX * sY * cZ);
    }

    if (order === 'XZY') {
      return new Quaternion(
        cX * cY * cZ + sX * sY * sZ,
        sX * cY * cZ - cX * sY * sZ,
        cX * sY * cZ - sX * cY * sZ,
        cX * cY * sZ + sX * sY * cZ);
    }
    return null;
  };

  if (typeof define === 'function' && define['amd']) {
    define([], function() {
      return Quaternion;
    });
  } else if (typeof exports === 'object') {
    Object.defineProperty(exports, "__esModule", {'value': true});
    Quaternion['default'] = Quaternion;
    Quaternion['Quaternion'] = Quaternion;
    module['exports'] = Quaternion;
  } else {
    root['Quaternion'] = Quaternion;
  }

})(this);
