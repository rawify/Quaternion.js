/**
 * @license Quaternion.js v0.0.0 22/02/2016
 *
 * Copyright (c) 2016, Robert Eisele (robert@xarg.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 **/
(function(root) {

  'use strict';

  var EPSILON = 1e-16;

  /*
   * Default is the multiplicative one element
   * 
   * Proof: TODO
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
      dest.w = w;
      dest.x = x;
      dest.y = y;
      dest.z = z;
      return;
    }

    if (typeof w === 'object') {

      // Check for quats, for example when an object gets cloned
      if ('w' in w && 'x' in w && 'y' in w && 'z' in w) {
        dest.w = w.w;
        dest.x = w.x;
        dest.y = w.y;
        dest.z = w.z;
        return;
      }

      // Check for complex numbers
      if ('re' in w && 'im' in w) {
        dest.w = w.re;
        dest.x = w.im;
        dest.y = 0;
        dest.z = 0;
        return;
      }

      // Check for arrays
      if (w.length === 4) {
        dest.w = w[0];
        dest.x = w[1];
        dest.y = w[2];
        dest.z = w[3];
        return;
      }
      throw 'Invalid object';
    }

    // Parse string values
    if (typeof w === 'string') {

      var tokens = w.match(/\d+\.?\d*e[+-]?\d+|\d+\.?\d*|\.\d+|./g);
      var plus = 1;
      var minus = 0;

      var iMap = {'i': 'x', 'j': 'y', 'k': 'z'};

      if (tokens === null) {
        throw 'Parse error';
      }

      // Reset the current state
      dest.w =
              dest.x =
              dest.y =
              dest.z = 0;

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
            throw 'Parse error' + c;
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
              throw 'Parser error';
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
        throw 'Parser error';
      }
      return;
    }

    // If no single variable was given AND it was the constructor, set it to the identity
    if (w === undefined && dest !== P) {
      dest.w = 1;
      dest.x = 0;
      dest.y = 0;
      dest.z = 0;
    } else {

      dest.w = w || 0;

      if (x && x.length === 3) {
        dest.x = x[0];
        dest.y = x[1];
        dest.z = x[2];
      } else {
        dest.x = x || 0;
        dest.y = y || 0;
        dest.z = z || 0;
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
     * @param {number} w real
     * @param {number=} x imag
     * @param {number=} y imag
     * @param {number=} z imag
     * @returns {Quaternion}
     */
    'add': function(w, x, y, z) {

      parse(P, w, x, y, z);

      // Q1 + Q2 := [w1, v1] + [w2, v2] = [w1 + w2, v1 + v2]

      return new Quaternion(
              this.w + P.w,
              this.x + P.x,
              this.y + P.y,
              this.z + P.z);
    },
    /**
     * Subtracts a quaternions Q2 from Q1
     * 
     * @param {number} w real
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
              this.w - P.w,
              this.x - P.x,
              this.y - P.y,
              this.z - P.z);
    },
    /**
     * Calculates the additive inverse, or simply it negates the quaternion
     * 
     * @returns {Quaternion}
     */
    'neg': function() {

      // -Q := [-w, -v]

      return new Quaternion(-this.s, -this.x, -this.y, -this.z);
    },
    /**
     * Calculates the length/modulus or the norm of a quaternion
     * 
     * @returns {Quaternion}
     */
    'norm': function() {

      // |Q| := sqrt(|Q|^2)

      // The unit quaternion has |Q| = 1

      var w = this.w;
      var x = this.x;
      var y = this.y;
      var z = this.z;

      return Math.sqrt(w * w + x * x + y * y + z * z);
    },
    /**
     * Calculates the squared length/modulus or the norm of a quaternion
     * 
     * @returns {Quaternion}
     */
    'normSq': function() {

      // |Q|^2 := [w, v] * [w, -v]
      //        = [w^2 + dot(v, v), -w * v + w * v + cross(v, -v)]
      //        = [w^2 + |v|^2, 0]
      //        = [w^2 + dot(v, v), 0]
      //        = dot(Q, Q)
      //        = Q * Q'

      var w = this.w;
      var x = this.x;
      var y = this.y;
      var z = this.z;

      return w * w + x * x + y * y + z * z;
    },
    /**
     * Normalizes the quaternion to have |Q| = 1 as long as the norm is not zero
     * Alternative names are the signum or versor
     * 
     * @returns {Quaternion}
     */
    'normalize': function() {

      // Q* := Q / |Q|

      var w = this.w;
      var x = this.x;
      var y = this.y;
      var z = this.z;

      var norm = Math.sqrt(w * w + x * x + y * y + z * z);

      if (norm === 0) {
        return Quaternion.ZERO; // TODO: Is the result zero or one when the norm is zero? -> limes
      }

      norm = 1 / norm;

      return new Quaternion(w * norm, x * norm, y * norm, z * norm);
    },
    /**
     * Calculates the product of two quaternions
     * Leaving out the imaginary part results in just scaling the quat
     * 
     * @param {number} w real
     * @param {number=} x imag
     * @param {number=} y imag
     * @param {number=} z imag
     * @returns {Quaternion}
     */
    'mul': function(w, x, y, z) {

      parse(P, w, x, y, z);

      // Q1 * Q2 = [w1 * w2 - dot(v1, v2), w1 * v2 + w2 * v1 + cross(v1, v2)]

      // Not commutative because cross(v1, v2) != cross(v2, v1)!

      var w1 = this.w;
      var x1 = this.x;
      var y1 = this.y;
      var z1 = this.z;

      var w2 = P.w;
      var x2 = P.x;
      var y2 = P.y;
      var z2 = P.z;

      return new Quaternion(
              w2 * w1 - x1 * x2 - y1 * y2 - z1 * z2,
              //	
              w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2,
              w1 * y2 + y1 * w2 + z1 * x2 - x1 * z2,
              w1 * z2 + z1 * w2 + x1 * y2 - y1 * x2);
    },
    /**
     * Calculates the dot product of two quaternions
     * 
     * @param {number} w real
     * @param {number=} x imag
     * @param {number=} y imag
     * @param {number=} z imag
     * @returns {Quaternion}
     */
    dot: function(w, x, y, z) {

      parse(P, w, x, y, z);

      // dot(Q1, Q2) := w1 * w2 + dot(v1, v2)

      return this.w * P.w + this.x * P.x + this.y * P.y + this.z * P.z;
    },
    /**
     * Calculates the inverse of a quat such that 
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

      var w = this.w;
      var x = this.x;
      var y = this.y;
      var z = this.z;

      var normSq = w * w + x * x + y * y + z * z;

      if (normSq === 0) {
        return Quaternion.ZERO; // TODO: Is the result zero or one when the norm is zero?
      }

      normSq = 1 / normSq;

      return new Quaternion(w * normSq, -x * normSq, -y * normSq, -z * normSq);
    },
    /*
     * Multiplies a quaternion with the inverse of a second quaternion
     * 
     * @param {number} w real
     * @param {number=} x imag
     * @param {number=} y imag
     * @param {number=} z imag
     * @returns {undefined}
     */
    'div': function(w, x, y, z) {

      parse(P, w, x, y, z);

      // Q1 / Q2 := Q1 * Q2^-1

      var w1 = this.w;
      var x1 = this.x;
      var y1 = this.y;
      var z1 = this.z;

      var w2 = P.w;
      var x2 = P.x;
      var y2 = P.y;
      var z2 = P.z;

      var normSq = w2 * w2 + x2 * x2 + y2 * y2 + z2 * z2;

      if (normSq === 0) {
        return Quaternion.ZERO; // TODO: Is the result zero or one when the norm is zero?
      }

      normSq = 1 / normSq;

      return new Quaternion(
              (w2 * w1 + x1 * x2 + y1 * y2 + z1 * z2) * normSq,
              //	
                      (-w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2) * normSq,
                      (-w1 * y2 + y1 * w2 + z1 * x2 - x1 * z2) * normSq,
                      (-w1 * z2 + z1 * w2 + x1 * y2 - y1 * x2) * normSq);
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

      return new Quaternion(this.w, -this.x, -this.y, -this.z);
    },
    /**
     * Checks if two quats are the same
     * 
     * @param {number} w real
     * @param {number=} x imag
     * @param {number=} y imag
     * @param {number=} z imag
     * @returns {Boolean}
     */
    'equals': function(w, x, y, z) {

      parse(P, w, x, y, z);

      return Math.abs(P.w - this.w) < EPSILON && Math.abs(P.x - this.x) < EPSILON && Math.abs(P.y - this.y) < EPSILON && Math.abs(P.z - this.z) < EPSILON;
    },
    /**
     * Gets the Quaternion as a well formatted string
     * 
     * @returns {String}
     */
    'toString': function() {

      var w = this.w;
      var x = this.x;
      var y = this.y;
      var z = this.z;
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
     * Gets the actual quaternion as an array
     * 
     * @returns {Array}
     */
    'toArray': function() {

      return [this.w, this.x, this.y, this.z];
    },
    /**
     * Calculates the 3x3 rotation matrix for the current quat
     * 
     * @see https://en.wikipedia.org/wiki/Rotation_matrix#Quaternion
     * @returns {Array}
     */
    'toMatrix': function() {

      var w = this.w;
      var x = this.x;
      var y = this.y;
      var z = this.z;

      var n = w * w + x * x + y * y + z * z;
      var s = n === 0 ? 0 : 2 / n;
      var wx = s * w * x, wy = s * w * y, wz = s * w * z;
      var xx = s * x * x, xy = s * x * y, xz = s * x * z;
      var yy = s * y * y, yz = s * y * z, zz = s * z * z;

      return [
        1 - (yy + zz), xy - wz, xz + wy,
        xy + wz, 1 - (xx + zz), yz - wx,
        xz - wy, yz + wx, 1 - (xx + yy)];
    },
    /**
     * Calculates the 4x4 rotation matrix for the current quat
     * 
     * @returns {Array}
     */
    'toMatrix4': function() {

      var w = this.w;
      var x = this.x;
      var y = this.y;
      var z = this.z;

      var n = w * w + x * x + y * y + z * z;
      var s = n === 0 ? 0 : 2 / n;
      var wx = s * w * x, wy = s * w * y, wz = s * w * z;
      var xx = s * x * x, xy = s * x * y, xz = s * x * z;
      var yy = s * y * y, yz = s * y * z, zz = s * z * z;

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
     * Replaces the quaternion by a rotation given by axis and angle
     * 
     * @param {Array} axis
     * @param {number} angle
     * @returns {Quaternion}
     */
    'setFromAxisAngle': function(axis, angle) {

      var norm = 1 / Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);

      var sin = Math.sin(angle / 2);
      var cos = Math.cos(angle / 2);

      this.w = cos;
      this.x = axis[0] * sin * norm;
      this.y = axis[1] * sin * norm;
      this.z = axis[2] * sin * norm;

      return this;
    },
    /**
     * Replaces the quaternion by a rotation given by Euler angles
     * 
     * @param {number} alpha
     * @param {number} beta
     * @param {number} gamma
     * @returns {Quaternion}
     */
    'setFromEuler': function(alpha, beta, gamma, order) {

      var _x = beta;
      var _y = gamma;
      var _z = alpha;

      var cX = Math.cos(_x / 2);
      var cY = Math.cos(_y / 2);
      var cZ = Math.cos(_z / 2);

      var sX = Math.sin(_x / 2);
      var sY = Math.sin(_y / 2);
      var sZ = Math.sin(_z / 2);

      //
      // ZXY quaternion construction.
      //

      this.w = cX * cY * cZ - sX * sY * sZ;
      this.x = sX * cY * cZ - cX * sY * sZ;
      this.y = cX * sY * cZ + sX * cY * sZ;
      this.z = cX * cY * sZ + sX * sY * cZ;

      return this;
    },
  };

  Quaternion['ZERO'] = new Quaternion(0, 0, 0, 0); // This is the additive identity Quaternion
  Quaternion['ONE'] = new Quaternion(1, 0, 0, 0); // This is the multiplicative identity Quaternion
  Quaternion['I'] = new Quaternion(0, 1, 0, 0);
  Quaternion['J'] = new Quaternion(0, 0, 1, 0);
  Quaternion['K'] = new Quaternion(0, 0, 0, 1);

  if (typeof define === 'function' && define.amd) {
    define([], function() {
      return Quaternion;
    });
  } else if (typeof exports === 'object') {
    module.exports = Quaternion;
  } else {
    root['Quaternion'] = Quaternion;
  }

})(this);