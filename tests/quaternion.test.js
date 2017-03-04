
var assert = require("assert");

var Quaternion = require("../quaternion");

describe("Quaternions", function() {

  it("should work with different params", function() {

    assert.equal(Quaternion(), '1');
    assert.equal(Quaternion().add(), '1'); // constructor gets 1, all others get 0
    assert.equal(Quaternion(2), '2');
    assert.equal(Quaternion(2, 3), '2 + 3i');
    assert.equal(Quaternion(2, 3, 4), '2 + 3i + 4j');
    assert.equal(Quaternion(2, 3, 4, 5), '2 + 3i + 4j + 5k');
  });

  it("should work with arrays", function() {

    assert.equal(Quaternion(1, [2, 3, 4]).equals(1, 2, 3, 4), true);
    assert.equal(Quaternion([1, 2, 3, 4]).equals(1, 2, 3, 4), true);

  });

  it("should parse strings", function() {

    assert.equal(Quaternion("1").toString(), '1');
    assert.equal(Quaternion("1+1").toString(), '2');
    assert.equal(Quaternion("1-1").toString(), '0');
    assert.equal(Quaternion("1+i").toString(), '1 + i');
    assert.equal(Quaternion("1+ i +j - k").toString(), '1 + i + j - k');
    assert.equal(Quaternion(" -  13 + 55i - 1j - 5k").toString(), '-13 + 55i - j - 5k');
  });

  it("should add two quats", function() {

    assert.equal("10 + 10i + 10j - 2k", Quaternion(1, 2, 3, 4).add(9, 8, 7, -6).toString());
    assert.equal("10 + 6i + 10j + 2k", Quaternion(1, -2, 3, -4).add(9, 8, 7, 6).toString());
    assert.equal("6i + 10j + 2k", Quaternion(-9, -2, 3, -4).add(9, 8, 7, 6).toString());
    assert.equal("0", Quaternion(0, 0, 0, 0).add(0, 0, 0, 0).toString());
    assert.equal("1", Quaternion(2, 0, 0, 0).add(-1, 0, 0, 0).toString());
    assert.equal("-1 + k", Quaternion(0, 0, 0, 1).add(-1, 0, 0, 0).toString());
  });

  it("should subtract two quats", function() {

    assert.equal("-8 - 6i - j + 10k", Quaternion(1, 2, 3, 4).sub(9, 8, 4, -6).toString());
    assert.equal("-8 - 10i - 4j - 10k", Quaternion(1, -2, 3, -4).sub(9, 8, 7, 6).toString());
    assert.equal("-18 - 10i - 4j - 10k", Quaternion(-9, -2, 3, -4).sub(9, 8, 7, 6).toString());
    assert.equal("0", Quaternion(0, 0, 0, 0).sub(0, 0, 0, 0).toString());
    assert.equal("3", Quaternion(2, 0, 0, 0).sub(-1, 0, 0, 0).toString());
    assert.equal("1 + k", Quaternion(0, 0, 0, 1).sub(-1, 0, 0, 0).toString());
  });

  it("should calculate the norm of a quat", function() {

    assert.equal(Math.sqrt(1 + 4 + 9 + 16), Quaternion(1, 2, 3, 4).norm());
    assert.equal(1 + 4 + 9 + 16, Quaternion(1, 2, 3, 4).normSq());
  });

  it("should calculate the inverse of a quat", function() {

    assert.equal('0.03333333333333333 - 0.06666666666666667i - 0.1j - 0.13333333333333333k', Quaternion(1, 2, 3, 4).inverse().toString());
  });

  it("should calculate the conjugate of a quat", function() {

    assert.equal('1 - 2i - 3j - 4k', Quaternion(1, 2, 3, 4).conjugate().toString());
  });

  it("should return the real and imaginary part", function() {

    var q = new Quaternion(7, 2, 3, 4);

    assert.equal(q.imag().toString(), '2i + 3j + 4k');
    assert.equal(q.real(), 7);
  });

  it("should result in the same for the inverse of normalized quats", function() {

    var q = Quaternion(9, 8, 7, 6).normalize();

    assert.deepEqual(q.inverse(), q.conjugate());
  });

  it("should work to check if two quats are the same", function() {

    assert.equal(Quaternion(9, 8, 7, 6).equals(9, 8, 7, 6), true);
    assert.equal(Quaternion(8, 8, 7, 6).equals(9, 8, 7, 6), false);
    assert.equal(Quaternion(9, 7, 7, 6).equals(9, 8, 7, 6), false);
    assert.equal(Quaternion(9, 8, 6, 6).equals(9, 8, 7, 6), false);
    assert.equal(Quaternion(9, 8, 7, 5).equals(9, 8, 7, 6), false);
  });

  it("should calculate the dot product", function() {

    assert.equal(Quaternion(9, 8, 7, 6).dot(1, 2, 3, 4).toString(), '70');
    assert.deepEqual(Quaternion(9, 8, 7, 6).normSq(), Quaternion(9, 8, 7, 6).dot(9, 8, 7, 6));
  });

  it("should calculate the product", function() {

    assert.equal(Quaternion(5).mul(6).toString(), '30');
    assert.equal(Quaternion(1, 2, 3, 4).mul(6).toString(), '6 + 12i + 18j + 24k'); // scale
    assert.equal(Quaternion(6).mul(1, 2, 3, 4).toString(), '6 + 12i + 18j + 24k'); // scale
    assert.equal(Quaternion(5, 6).mul(6, 7).toString(), '-12 + 71i');
    assert.equal(Quaternion(1, 1, 1, 1).mul(2, 2, 2, 2).toString(), '-4 + 4i + 4j + 4k');
  });

  it("should scale a quaternion", function() {

    assert.deepEqual(Quaternion([3, 2, 5, 4]).scale(3).toArray(), [9, 6, 15, 12]);
  });

  it("should calculate the quotient", function() {

    assert.equal(Quaternion(6).div(2).toString(), '3');
    assert.equal(Quaternion(1).div(2).toString(), '0.5');
    assert.equal(Quaternion(1).div(2).toString(), '0.5');
    assert.equal(Quaternion(4, 2).div(1, 1).toString(), '3 - i');
    assert.equal(Quaternion(3, -2).div(Quaternion.I).toString(), '-2 - 3i');
    assert.equal(Quaternion(25).div(3, -4).toString(), '3 + 4i');
  });

  it("should result in norm=1 with fromAxisAngle", function() {

    var axis = [1, 1, 1];
    var angle = Math.PI;

    assert.equal(Quaternion.fromAxisAngle(axis, angle).norm(), 1);
  });

  it("should have no effect to rotate on axis parallel to vector direction", function() {

    var v = [1, 1, 1];

    var angle = Math.random();
    var axis = [1, 1, 1];

    var r = Quaternion.fromAxisAngle(axis, angle).rotateVector(v);

    assert(Math.abs(r[0] - 1) < 1e-13);
    assert(Math.abs(r[1] - 1) < 1e-13);
    assert(Math.abs(r[2] - 1) < 1e-13);
  });

});
