var assert = require("assert");

var Quaternion = require("../quaternion");
var EPS = 1e-4;

assert.matrixEqual = function(mat1, mat2) {

  assert.equal(mat1.length, mat2.length)

  // 2 dimension matrices
  if (mat1.length <= 4) {
    mat1.forEach((array, idx1) => {
      array.forEach((value, idx2) => {
        if (Math.abs(value - mat2[idx1][idx2]) > EPS) {
          assert.equal(String(mat1), String(mat2));
        }
      })
    });
  } else {
    mat1.forEach((value, idx1) => {
      if (Math.abs(value - mat2[idx1]) > EPS) {
        assert.equal(String(mat1), String(mat2));
      }
    });
  }
};

assert.q = function(a, b) {

  if ('w' in a && 'w' in b) {

  } else {
    assert(false);
  }

  var e = EPS;
  if (Math.abs(a.w - b.w) < e &&
    Math.abs(a.x - b.x) < e &&
    Math.abs(a.y - b.y) < e &&
    Math.abs(a.z - b.z) < e) {
  } else {
    assert.equal(a.toString(), b.toString());
  }
};

assert.v = function(a, b) {
  var e = EPS;
  if (Math.abs(a[0] - b[0]) < e &&
    Math.abs(a[1] - b[1]) < e &&
    Math.abs(a[2] - b[2]) < e) {
  } else {
    assert.equal(a.toString(), b.toString());
  }
};

assert.approx = function(is, should) {
  if (Math.abs(is - should) > EPS)
    assert.equal(is, should);
};

function CQ(a, b) {
  assert.q(a, b);
  return true;
}

function RollPitchYaw1(γ, β, α) { // XYZ

  var { sin, cos } = Math;

  //https://msl.cs.uiuc.edu/planning/node102.html
  return [
    [cos(β) * cos(α), sin(γ) * sin(β) * cos(α) - sin(α) * cos(γ), sin(γ) * sin(α) + sin(β) * cos(γ) * cos(α)],
    [sin(α) * cos(β), sin(γ) * sin(β) * sin(α) + cos(γ) * cos(α), -sin(γ) * cos(α) + sin(β) * sin(α) * cos(γ)],
    [-sin(β), sin(γ) * cos(β), cos(γ) * cos(β)]
  ];
}

function RollPitchYaw2(α, β, γ) { // ZYX

  var { sin, cos } = Math;

  // https://reference.wolfram.com/language/ref/RollPitchYawMatrix.html
  return [
    [cos(α) * cos(β), -cos(β) * sin(α), sin(β)],
    [cos(γ) * sin(α) + cos(α) * sin(β) * sin(γ), cos(α) * cos(γ) - sin(α) * sin(β) * sin(γ), -cos(β) * sin(γ)],
    [-cos(α) * cos(γ) * sin(β) + sin(α) * sin(γ), cos(γ) * sin(α) * sin(β) + cos(α) * sin(γ), cos(β) * cos(γ)]];
}

function ThreeFromEuler(x, y, z, order) {

  // https://github.com/mrdoob/three.js/blob/master/src/math/Quaternion.js

  var { sin, cos } = Math;

  const cX = cos(x / 2);
  const cY = cos(y / 2);
  const cZ = cos(z / 2);

  const sX = sin(x / 2);
  const sY = sin(y / 2);
  const sZ = sin(z / 2);

  switch (order) {

    case 'XYZ':
      return Quaternion(
        cX * cY * cZ - sX * sY * sZ,
        sX * cY * cZ + cX * sY * sZ,
        cX * sY * cZ - sX * cY * sZ,
        cX * cY * sZ + sX * sY * cZ
      );

    case 'YXZ':
      return Quaternion(
        cX * cY * cZ + sX * sY * sZ,
        sX * cY * cZ + cX * sY * sZ,
        cX * sY * cZ - sX * cY * sZ,
        cX * cY * sZ - sX * sY * cZ
      );

    case 'ZXY':
      return Quaternion(
        cX * cY * cZ - sX * sY * sZ,
        sX * cY * cZ - cX * sY * sZ,
        cX * sY * cZ + sX * cY * sZ,
        cX * cY * sZ + sX * sY * cZ
      );

    case 'ZYX':
      return Quaternion(
        cX * cY * cZ + sX * sY * sZ,
        sX * cY * cZ - cX * sY * sZ,
        cX * sY * cZ + sX * cY * sZ,
        cX * cY * sZ - sX * sY * cZ
      );

    case 'YZX':
      return Quaternion(
        cX * cY * cZ - sX * sY * sZ,
        sX * cY * cZ + cX * sY * sZ,
        cX * sY * cZ + sX * cY * sZ,
        cX * cY * sZ - sX * sY * cZ
      );

    case 'XZY':
      return Quaternion(
        cX * cY * cZ + sX * sY * sZ,
        sX * cY * cZ - cX * sY * sZ,
        cX * sY * cZ - sX * cY * sZ,
        cX * cY * sZ + sX * sY * cZ
      );
  }
}

function TestFromEuler(roll, pitch, yaw) {
  const cy = Math.cos(0.5 * yaw);
  const cr = Math.cos(0.5 * roll);
  const cp = Math.cos(0.5 * pitch);
  const sy = Math.sin(0.5 * yaw);
  const sr = Math.sin(0.5 * roll);
  const sp = Math.sin(0.5 * pitch);

  return Quaternion(
    cp * cr * cy - sp * sr * sy,
    cp * cy * sr - sp * cr * sy,
    cp * sr * sy + cr * cy * sp,
    cp * cr * sy + sp * cy * sr)
}

function getBaseQuaternion(alpha, beta, gamma) {

  // https://dev.opera.com/articles/w3c-device-orientation-usage/
  var degtorad = Math.PI / 180;
  var _x = beta ? beta * degtorad : 0; // beta value
  var _y = gamma ? gamma * degtorad : 0; // gamma value
  var _z = alpha ? alpha * degtorad : 0; // alpha value

  var cX = Math.cos(_x / 2);
  var cY = Math.cos(_y / 2);
  var cZ = Math.cos(_z / 2);
  var sX = Math.sin(_x / 2);
  var sY = Math.sin(_y / 2);
  var sZ = Math.sin(_z / 2);

  //
  // ZXY quaternion construction.
  //

  var w = cX * cY * cZ - sX * sY * sZ;
  var x = sX * cY * cZ - cX * sY * sZ;
  var y = cX * sY * cZ + sX * cY * sZ;
  var z = cX * cY * sZ + sX * sY * cZ;

  return Quaternion([w, x, y, z]);
}

function eulerToQuaternion(heading, attitude, bank) { // YZX
  // http://www.euclideanspace.com/maths/geometry/rotations/conversions/eulerToQuaternion/index.htm
  var c1 = Math.cos(heading / 2);
  var s1 = Math.sin(heading / 2);
  var c2 = Math.cos(attitude / 2);
  var s2 = Math.sin(attitude / 2);
  var c3 = Math.cos(bank / 2);
  var s3 = Math.sin(bank / 2);
  var c1c2 = c1 * c2;
  var s1s2 = s1 * s2;
  return Quaternion(
    c1c2 * c3 - s1s2 * s3,
    c1c2 * s3 + s1s2 * c3,
    s1 * c2 * c3 + c1 * s2 * s3,
    c1 * s2 * c3 - s1 * c2 * s3);
}

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
    assert.equal(Quaternion([1, 2, 3]).equals(0, 1, 2, 3), true);

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

    assert.q(Quaternion(1).add("i"), Quaternion(1, 1, 0, 0));
    assert.q(Quaternion(1, 2, 3, 4).add(Quaternion(5, 6, 7, 8)), Quaternion(6, 8, 10, 12));
    assert.q(Quaternion(-1, 2, 3, 4).add(Quaternion(5, 6, 7, 8)), Quaternion(4, 8, 10, 12));
    assert.q(Quaternion(1, -2, 3, 4).add(Quaternion(5, 6, 7, 8)), Quaternion(6, 4, 10, 12));
    assert.q(Quaternion(1, 2, -3, 4).add(Quaternion(5, 6, 7, 8)), Quaternion(6, 8, 4, 12));
    assert.q(Quaternion(1, 2, 3, -4).add(Quaternion(5, 6, 7, 8)), Quaternion(6, 8, 10, 4));

    assert.q(Quaternion(0, 0, 0, 0).add(Quaternion(0, 0, 0, 0)), Quaternion(0, 0, 0, 0));
    assert.q(Quaternion(1, 0, 0, 0).add(Quaternion(-1, 0, 0, 0)), Quaternion(0, 0, 0, 0));
    assert.q(Quaternion(0, 1, 0, 0).add(Quaternion(0, -1, 0, 0)), Quaternion(0, 0, 0, 0));
    assert.q(Quaternion(0, 0, 1, 0).add(Quaternion(0, 0, -1, 0)), Quaternion(0, 0, 0, 0));
    assert.q(Quaternion(0, 0, 0, 1).add(Quaternion(0, 0, 0, -1)), Quaternion(0, 0, 0, 0));

    assert.q(Quaternion(1, 0, 0, 0).add(Quaternion(0, 0, 0, 0)), Quaternion(1, 0, 0, 0));
    assert.q(Quaternion(0, 1, 0, 0).add(Quaternion(0, 0, 0, 0)), Quaternion(0, 1, 0, 0));
    assert.q(Quaternion(0, 0, 1, 0).add(Quaternion(0, 0, 0, 0)), Quaternion(0, 0, 1, 0));
    assert.q(Quaternion(0, 0, 0, 1).add(Quaternion(0, 0, 0, 0)), Quaternion(0, 0, 0, 1));
  });

  it("should subtract two quats", function() {

    assert.equal("-8 - 6i - j + 10k", Quaternion(1, 2, 3, 4).sub(9, 8, 4, -6).toString());
    assert.equal("-8 - 10i - 4j - 10k", Quaternion(1, -2, 3, -4).sub(9, 8, 7, 6).toString());
    assert.equal("-18 - 10i - 4j - 10k", Quaternion(-9, -2, 3, -4).sub(9, 8, 7, 6).toString());
    assert.equal("0", Quaternion(0, 0, 0, 0).sub(0, 0, 0, 0).toString());
    assert.equal("3", Quaternion(2, 0, 0, 0).sub(-1, 0, 0, 0).toString());
    assert.equal("1 + k", Quaternion(0, 0, 0, 1).sub(-1, 0, 0, 0).toString());

    assert.q(Quaternion(0).sub(Quaternion(0)), Quaternion(0));
    assert.q(Quaternion(0).sub(Quaternion(1, 2, 3, 4)), Quaternion(-1, -2, -3, -4));
    assert.q(Quaternion(0).sub(Quaternion(-1, -2, -3, -4)), Quaternion(1, 2, 3, 4));
    assert.q(Quaternion(10, 9, 8, 7).sub(Quaternion(1, 2, 3, 4)), Quaternion(9, 7, 5, 3));
  });

  it("should calculate the norm of a quat", function() {

    assert.equal(1, Quaternion().norm());
    assert.equal(2, Quaternion(1, 1, 1, 1).norm());
    assert.equal(1, Quaternion([3, 2, 5, 4]).normalize().norm());
    assert.equal(Math.sqrt(1 + 4 + 9 + 16), Quaternion(1, 2, 3, 4).norm());
    assert.equal(1 + 4 + 9 + 16, Quaternion(1, 2, 3, 4).normSq());

    assert.equal(Quaternion({ w: 5 }).norm(), 5);
    assert.equal(Quaternion({ w: -5 }).norm(), 5);
    assert.equal(Quaternion(1, 1, 1, 1).norm(), 2);

    assert.equal(Quaternion(0, 0, 0, 0).norm(), 0);
    assert.equal(Quaternion(3, 4, 0, 0).norm(), 5);
    assert.equal(Quaternion(0, 3, 4, 0).norm(), 5);
    assert.equal(Quaternion(0, 0, 3, 4).norm(), 5);

    assert.equal(Quaternion(-3, 4, 0, 0).norm(), 5);
    assert.equal(Quaternion(0, -3, 4, 0).norm(), 5);
    assert.equal(Quaternion(0, 0, -3, 4).norm(), 5);

    assert.equal(Quaternion(1, 2, 2, 0).norm(), 3);
    assert.equal(Quaternion(0, 1, 2, 2).norm(), 3);

    assert.equal(Quaternion(1, 2, 6, 20).norm(), 21);
    assert.equal(Quaternion(20, 1, 2, 6).norm(), 21);
    assert.equal(Quaternion(6, 20, 1, 2).norm(), 21);
    assert.equal(Quaternion(2, 6, 20, 1).norm(), 21);

    assert.equal(Quaternion(1).norm(), 1);
    assert.equal(Quaternion("i").norm(), 1);
    assert.equal(Quaternion([3, 2, 5, 4]).norm(), 7.3484692283495345);
  });

  it("should calculate the inverse of a quat", function() {

    assert.equal('0.03333333333333333 - 0.06666666666666667i - 0.1j - 0.13333333333333333k', Quaternion(1, 2, 3, 4).inverse().toString());

    var p = Quaternion([3, 2, 5, 4]);
    var p_ = Quaternion(p).conjugate();
    var l = p.norm();
    var r = 1 / (l * l);

    assert.approx(l, p_.norm());
    assert.q(p.inverse(), p_.scale(r));
  });

  it("should calculate the conjugate of a quat", function() {

    assert.equal('1 - 2i - 3j - 4k', Quaternion(1, 2, 3, 4).conjugate().toString());

    assert.q(Quaternion(1, 2, 3, 4).conjugate(), Quaternion(1, -2, -3, -4));
    assert.q(Quaternion(-1, -2, -3, -4).conjugate(), Quaternion(-1, 2, 3, 4));

    assert.q(Quaternion(0, 0, 0, 0).conjugate(), Quaternion(0, 0, 0, 0));
    assert.q(Quaternion(1, 0, 0, 0).conjugate(), Quaternion(1, 0, 0, 0));
    assert.q(Quaternion(0, 1, 0, 0).conjugate(), Quaternion(0, -1, 0, 0));
    assert.q(Quaternion(0, 0, 1, 0).conjugate(), Quaternion(0, 0, -1, 0));
    assert.q(Quaternion(0, 0, 0, 1).conjugate(), Quaternion(0, 0, 0, -1));

    assert.q(Quaternion(-1, 0, 0, 0).conjugate(), Quaternion(-1, 0, 0, 0));
    assert.q(Quaternion(0, -1, 0, 0).conjugate(), Quaternion(0, 1, 0, 0));
    assert.q(Quaternion(0, 0, -1, 0).conjugate(), Quaternion(0, 0, 1, 0));
    assert.q(Quaternion(0, 0, 0, -1).conjugate(), Quaternion(0, 0, 0, 1));

    assert.q(Quaternion(1).conjugate(), Quaternion([1, -0, -0, -0]));
    assert.q(Quaternion("i").conjugate(), Quaternion([0, -1, -0, -0]));
    assert.q(Quaternion("j").conjugate(), Quaternion([0, -0, -1, -0]));
    assert.q(Quaternion("k").conjugate(), Quaternion([0, -0, -0, -1]));
    assert.q(Quaternion([3, 2, 5, 4]).conjugate(), Quaternion([3, -2, -5, -4]));
  });

  it('should pass conjugate properties', function() {

    var p1 = new Quaternion(8, 1, 2, 3);
    var p2 = new Quaternion(6, 9, 8, 7);

    // Test multiplicative property
    assert.q(p1.mul(p2).conjugate(), p2.conjugate().mul(p1.conjugate()));

    var p = new Quaternion(Math.random(), Math.random(), Math.random(), Math.random()).normalize();

    // Test unit quaternion property as inverse
    assert.q(p.conjugate().mul(p), p.mul(p.conjugate()));

    var q = Quaternion(1);

    // Test one element
    assert.q(q, q.conjugate());

    var q = Quaternion(0);

    // Test zero element
    assert.q(q, q.conjugate());

    // Test pure quats
    var q1 = new Quaternion(0, 1, 2, 3);
    var q2 = new Quaternion(0, 9, 8, 7);

    assert.q(q2.mul(q1), q1.mul(q2).conjugate());
  });

  it('should pass hamilton rules', function() {

    var i2 = Quaternion("i").mul("i");
    var j2 = Quaternion("j").mul("j");
    var k2 = Quaternion("k").mul("k");
    var ijk = Quaternion("i").mul("j").mul("k");

    assert.q(i2, j2);
    assert.q(j2, k2);
    assert.q(k2, ijk);
    assert.q(ijk, Quaternion([-1, 0, 0, 0]));

    var q = Quaternion(1, 0, 0, 0);
    var qI = Quaternion(0, 1, 0, 0);
    var qJ = Quaternion(0, 0, 1, 0);
    var qK = Quaternion(0, 0, 0, 1);

    var qTip = Quaternion(2, 3, 5, 7);

    assert.q(qI.mul(qI), Quaternion(-1));
    assert.q(qJ.mul(qJ), Quaternion(-1));
    assert.q(qK.mul(qK), Quaternion(-1));

    assert.q(qI.mul(qJ), Quaternion("k"));
    assert.q(qJ.mul(qI), Quaternion("-k"));
    assert.q(qJ.mul(qK), Quaternion("i"));
    assert.q(qK.mul(qJ), Quaternion("-i"));
    assert.q(qK.mul(qI), Quaternion("j"));
    assert.q(qI.mul(qK), Quaternion("-j"));

  });

  it('should add a number to a Quaternion', function() {
    assert.q(Quaternion(1, 2, 3, 4).add(5), Quaternion(6, 2, 3, 4));
    assert.q(Quaternion(1, 2, 3, 4).add(-5), Quaternion(-4, 2, 3, 4));
    assert.q(Quaternion(1, 2, 3, 4).add(0), Quaternion(1, 2, 3, 4));
    assert.q(Quaternion(0, 0, 0, 0).add(5), Quaternion(5, 0, 0, 0));
  });

  it("should return the real and imaginary part", function() {

    var q = new Quaternion(7, 2, 3, 4);

    assert.equal(Quaternion(q.imag()).toString(), '2i + 3j + 4k');
    assert.equal(q.real(), 7);
  });

  it("should result in the same for the inverse of normalized quats", function() {

    var q = Quaternion(9, 8, 7, 6).normalize();

    assert.q(q.inverse(), q.conjugate());
  });

  it("should normalize quaternion", function() {

    var q = Quaternion(Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000).normalize();

    assert(CQ(Quaternion(q.norm()), Quaternion(1, 0, 0, 0)));
  });

  it("should invert quaternion", function() {

    var q = Quaternion(Math.random() * 1000, Math.random() * 1000, Math.random() * 1000, Math.random() * 1000);

    assert(CQ(q.mul(q.inverse()), Quaternion(1, 0, 0, 0)));
    assert(CQ(q.inverse().mul(q), Quaternion(1, 0, 0, 0)));
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
    assert.equal(Quaternion(9, 8, 7, 6).normSq(), Quaternion(9, 8, 7, 6).dot(9, 8, 7, 6));
  });

  it('should pass trivial cases', function() {

    var q0 = new Quaternion(0);
    var q1 = Quaternion(Math.random(), Math.random(), Math.random(), Math.random());
    var q2 = Quaternion(Math.random(), Math.random(), Math.random(), Math.random());
    var l = Math.random() * 2.0 - 1.0;
    var lp = Math.random();

    assert.q(q1.add(q2), (q2.add(q1)));
    assert.q(q0.sub(q1), (q1.neg()));
    assert.q(q1.conjugate().conjugate(), (q1));
    assert.approx(q1.normalize().norm(), 1);
    assert.q(q1.inverse(), (q1.conjugate().scale(1 / Math.pow(q1.norm(), 2))));
    assert.q(q1.div(q2), q1.mul(q2.inverse()));
    assert.approx(q1.scale(l).norm(), Math.abs(q1.norm() * l));
    assert.approx(q1.mul(q2).norm(), q1.norm() * q2.norm());
    assert.q((new Quaternion(l)).exp(), (new Quaternion(Math.exp(l))));
    assert.q((new Quaternion(lp)).log(), (new Quaternion(Math.log(lp))));
    assert.q(q1.exp().log(), q1);
    assert.q(q1.log().exp(), q1);
    // TODO: assert.q(q1.add(q2).exp(), q1.exp().mul(q2.exp()));
    assert.q(q1.pow(2.0), q1.mul(q1));
    assert.q(q1.mul(q1.inverse()), (Quaternion.ONE));
    assert.q(q1.inverse().mul(q1), Quaternion.ONE);
    assert.q(q1.add(q1.conjugate()), Quaternion(2 * q1.w));
  });

  it('should pass other trivial cases', function() {

    var x = Quaternion(1, 2, -0.5, -1);
    var y = Quaternion(-3, 4, 0, 2);
    var z = Quaternion(-2, 1, 2, -4);

    assert.approx(y.normSq(), 29);
    assert.approx(z.normSq(), 25);
    assert.q(z.normalize(), Quaternion(-0.4, 0.2, 0.4, -0.8));
    assert.q(x.exp().log(), x);
    assert.q(x.mul(y), Quaternion(-9.0, -3.0, -6.5, 7.0));
    assert.approx(y.dot(y), 29);
  });

  it("should calculate the product", function() {

    assert.equal(Quaternion(5).mul(6).toString(), '30');
    assert.equal(Quaternion(1, 2, 3, 4).mul(6).toString(), '6 + 12i + 18j + 24k'); // scale
    assert.equal(Quaternion(6).mul(1, 2, 3, 4).toString(), '6 + 12i + 18j + 24k'); // scale
    assert.equal(Quaternion(5, 6).mul(6, 7).toString(), '-12 + 71i');
    assert.equal(Quaternion(1, 1, 1, 1).mul(2, 2, 2, 2).toString(), '-4 + 4i + 4j + 4k');

    assert.q(Quaternion(1, 2, 3, 4).mul(5, 6, 7, 8), Quaternion(-60, 12, 30, 24));
    assert.q(Quaternion(3, 2, 5, 4).mul(4, 5, 3, 1), Quaternion(-17, 16, 47, 0));
    assert.q(Quaternion().mul(Quaternion(1, 2, 3, 4)), Quaternion(1, 2, 3, 4));
    assert.q(Quaternion().mul(Quaternion()), Quaternion());

    assert.q(Quaternion(1, 0, 0, 0).mul(Quaternion(1, 0, 0, 0)), Quaternion(1, 0, 0, 0));
    assert.q(Quaternion(0, 1, 0, 0).mul(Quaternion(1, 0, 0, 0)), Quaternion(0, 1, 0, 0));
    assert.q(Quaternion(0, 0, 1, 0).mul(Quaternion(1, 0, 0, 0)), Quaternion(0, 0, 1, 0));
    assert.q(Quaternion(0, 0, 0, 1).mul(Quaternion(1, 0, 0, 0)), Quaternion(0, 0, 0, 1));

    assert.q(Quaternion(1, 0, 0, 0).mul(Quaternion(0, 1, 0, 0)), Quaternion(0, 1, 0, 0));
    assert.q(Quaternion(0, 1, 0, 0).mul(Quaternion(0, 1, 0, 0)), Quaternion(-1, 0, 0, 0));
    assert.q(Quaternion(0, 0, 1, 0).mul(Quaternion(0, 1, 0, 0)), Quaternion(0, 0, 0, -1));
    assert.q(Quaternion(0, 0, 0, 1).mul(Quaternion(0, 1, 0, 0)), Quaternion(0, 0, 1, 0));

    assert.q(Quaternion(1, 0, 0, 0).mul(Quaternion(0, 0, 1, 0)), Quaternion(0, 0, 1, 0));
    assert.q(Quaternion(0, 1, 0, 0).mul(Quaternion(0, 0, 1, 0)), Quaternion(0, 0, 0, 1));
    assert.q(Quaternion(0, 0, 1, 0).mul(Quaternion(0, 0, 1, 0)), Quaternion(-1, 0, 0, 0));
    assert.q(Quaternion(0, 0, 0, 1).mul(Quaternion(0, 0, 1, 0)), Quaternion(0, -1, 0, 0));

    assert.q(Quaternion(1, 0, 0, 0).mul(Quaternion(0, 0, 0, 1)), Quaternion(0, 0, 0, 1));
    assert.q(Quaternion(0, 1, 0, 0).mul(Quaternion(0, 0, 0, 1)), Quaternion(0, 0, -1, 0));
    assert.q(Quaternion(0, 0, 1, 0).mul(Quaternion(0, 0, 0, 1)), Quaternion(0, 1, 0, 0));
    assert.q(Quaternion(0, 0, 0, 1).mul(Quaternion(0, 0, 0, 1)), Quaternion(-1, 0, 0, 0));

    assert.q(Quaternion(1, 0, 0, 0).mul(Quaternion(-1, 0, 0, 0)), Quaternion(-1, 0, 0, 0));
    assert.q(Quaternion(0, 1, 0, 0).mul(Quaternion(-1, 0, 0, 0)), Quaternion(0, -1, 0, 0));
    assert.q(Quaternion(0, 0, 1, 0).mul(Quaternion(-1, 0, 0, 0)), Quaternion(0, 0, -1, 0));
    assert.q(Quaternion(0, 0, 0, 1).mul(Quaternion(-1, 0, 0, 0)), Quaternion(0, 0, 0, -1));

    assert.q(Quaternion(1, 0, 0, 0).mul(Quaternion(0, -1, 0, 0)), Quaternion(0, -1, 0, 0));
    assert.q(Quaternion(0, 1, 0, 0).mul(Quaternion(0, -1, 0, 0)), Quaternion(1, 0, 0, 0));
    assert.q(Quaternion(0, 0, 1, 0).mul(Quaternion(0, -1, 0, 0)), Quaternion(0, 0, 0, 1));
    assert.q(Quaternion(0, 0, 0, 1).mul(Quaternion(0, -1, 0, 0)), Quaternion(0, 0, -1, 0));

    assert.q(Quaternion(1, 0, 0, 0).mul(Quaternion(0, 0, -1, 0)), Quaternion(0, 0, -1, 0));
    assert.q(Quaternion(0, 1, 0, 0).mul(Quaternion(0, 0, -1, 0)), Quaternion(0, 0, 0, -1));
    assert.q(Quaternion(0, 0, 1, 0).mul(Quaternion(0, 0, -1, 0)), Quaternion(1, 0, 0, 0));
    assert.q(Quaternion(0, 0, 0, 1).mul(Quaternion(0, 0, -1, 0)), Quaternion(0, 1, 0, 0));

    assert.q(Quaternion(1, 0, 0, 0).mul(Quaternion(0, 0, 0, -1)), Quaternion(0, 0, 0, -1));
    assert.q(Quaternion(0, 1, 0, 0).mul(Quaternion(0, 0, 0, -1)), Quaternion(0, 0, 1, 0));
    assert.q(Quaternion(0, 0, 1, 0).mul(Quaternion(0, 0, 0, -1)), Quaternion(0, -1, 0, 0));
    assert.q(Quaternion(0, 0, 0, 1).mul(Quaternion(0, 0, 0, -1)), Quaternion(1, 0, 0, 0));
  });

  it("should scale a quaternion", function() {

    assert.q(Quaternion([3, 2, 5, 4]).scale(3), Quaternion([9, 6, 15, 12]));
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

    assert.v(r, [1, 1, 1]);
  });

  it("should work with fromAxisAngle -> toAxisAngle", function() {

    var angle = Math.random();
    var axis = [Math.random(), Math.random(), Math.random()];
    var axisNorm = Math.hypot(...axis);

    var [v, a] = Quaternion.fromAxisAngle(axis, angle).toAxisAngle();

    assert((a - angle) < EPS);
    assert.v(v, axis.map(x => x / axisNorm));
  });

  it("should generate a unit quaternion from euler angle", function() {

    var n = Quaternion.fromEuler(Math.PI, Math.PI, Math.PI).norm();

    assert.equal(n, 1);
  });

  it("should rotate a vector in direct and indirect manner", function() {

    var v = [1, 9, 3];

    var q = Quaternion("1+2i+3j+4k").normalize();

    var a = q.mul(v).mul(q.conjugate()).toVector();
    var b = q.rotateVector(v);

    assert.v(a.slice(1), b);
  });

  it("should rotate a vector correctly", function() {

    var theta = 2 * Math.PI / 3.0;
    var axis = [1.0, 1.0, 1.0];
    var vector = [3.0, 4.0, 5.0];

    var p = Quaternion.fromAxisAngle(axis, theta).rotateVector(vector);

    assert.v(p, [5.0, 3.0, 4.0]);
  });

  it("should rotate a vector correctly", function() {

    var v = [1.0, 1.0, 1.0];
    var q = Quaternion.fromAxisAngle([0.0, 1.0, 0.0], Math.PI);
    var p = q.rotateVector(v);

    assert.v(p, [-1, 1, -1]);
  });

  it("should rotate a vector correctly based on Euler angles I", function() {

    var v = [1.0, 2.0, 3.0];

    var q = Quaternion.fromEulerLogical(0.0, Math.PI, 0.0, 'ZXY');
    var p = q.rotateVector(v);
    assert.v(p, [1, -2, -3]);

    var q = Quaternion.fromEulerLogical(Math.PI, 0.0, 0.0, 'ZXY');
    var p = q.rotateVector(v);
    assert.v(p, [-1, -2, 3]);

    var q = Quaternion.fromEulerLogical(0.0, 0.0, Math.PI, 'ZXY');
    var p = q.rotateVector(v);
    assert.v(p, [-1, 2, -3]);
  });

  it("should rotate a vector correctly based on Euler angles II", function() {

    var v = [1.0, 2.0, 3.0];

    var q = Quaternion.fromEulerLogical(0.0, Math.PI, 0.0, 'XYZ');
    var p = q.rotateVector(v);
    assert.v(p, [-1, 2, -3]);

    var q = Quaternion.fromEulerLogical(Math.PI, 0.0, 0.0, 'XYZ');
    var p = q.rotateVector(v);
    assert.v(p, [1, -2, -3]);

    var q = Quaternion.fromEulerLogical(0, 0, Math.PI, 'XYZ');
    var p = q.rotateVector(v);
    assert.v(p, [-1, -2, 3]);
  });

  it("should rotate a vector correctly based on Euler angles III", function() {

    var v = [1.0, 2.0, 3.0];

    var q = Quaternion.fromEulerLogical(0.0, Math.PI, 0.0, 'XZY');
    var p = q.rotateVector(v);
    assert.v(p, [-1, -2, 3]);

    var q = Quaternion.fromEulerLogical(Math.PI, 0.0, 0.0, 'XZY');
    var p = q.rotateVector(v);
    assert.v(p, [1, -2, -3]);

    var q = Quaternion.fromEulerLogical(0, 0, Math.PI, 'XZY');
    var p = q.rotateVector(v);
    assert.v(p, [-1, 2, -3]);
  });

  it("should create a rotation matrix correctly based on Euler angles", function() {

    // https://de.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors

    var a = -Math.PI / 3;
    var b = Math.PI / 4;
    var c = -Math.PI / 5;

    var q = Quaternion.fromEuler(a, b, c, 'ZYX');
    assert.matrixEqual(q.toMatrix(false), [ // fromEuler(a, b, c, 'ZYX')
      0.3536, 0.4928, 0.7951,
      -0.6124, 0.7645, -0.2015,
      -0.7071, -0.4156, 0.5721
    ]);
  });

  it("should test against Three.js implementation XYZ", function() {

    var x = Math.random();
    var y = Math.random();
    var z = Math.random();

    assert.q(Quaternion.fromEuler(x, y, z, 'XYZ'), ThreeFromEuler(x, y, z, 'XYZ'));
  });

  it("should test against Three.js implementation YXZ", function() {

    var x = Math.random();
    var y = Math.random();
    var z = Math.random();

    assert.q(Quaternion.fromEuler(x, y, z, 'YXZ'), ThreeFromEuler(y, x, z, 'YXZ'));
  });

  it("should test against Three.js implementation ZXY", function() {

    var x = Math.random();
    var y = Math.random();
    var z = Math.random();

    assert.q(Quaternion.fromEuler(x, y, z, 'ZXY'), ThreeFromEuler(y, z, x, 'ZXY')); // Bug in three.js?
  });

  it("should test against Three.js implementation ZYX", function() {

    var x = Math.random();
    var y = Math.random();
    var z = Math.random();

    assert.q(Quaternion.fromEuler(x, y, z, 'ZYX'), ThreeFromEuler(z, y, x, 'ZYX'));
  });

  it("should test against Three.js implementation YZX", function() {

    var x = Math.random();
    var y = Math.random();
    var z = Math.random();

    assert.q(Quaternion.fromEuler(x, y, z, 'YZX'), ThreeFromEuler(z, x, y, 'YZX')); // Bug in thre.js?
  });

  it("should test against Three.js implementation XZY", function() {

    var x = Math.random();
    var y = Math.random();
    var z = Math.random();

    assert.q(Quaternion.fromEuler(x, y, z, 'XZY'), ThreeFromEuler(x, z, y, 'XZY'));
  });

  it("should test against a fromEuler implementation with ZXY", function() {

    var x = Math.random();
    var y = Math.random();
    var z = Math.random();

    assert.q(Quaternion.fromEulerLogical(x, y, z, 'YXZ'), TestFromEuler(y, x, z));
  });

  it("should exp and log a quaternion", function() {

    var q = new Quaternion(Math.random() * 10, Math.random() * 10, Math.random() * 10, Math.random() * 10);

    assert(CQ(q, q.log().exp()));
  });

  it("should exp and log real numbers", function() {

    var n = Math.random() * 10;
    var q = Quaternion(n);

    assert.v(q.exp().toVector(), [Math.exp(n), 0, 0, 0]);
    assert.v(q.log().toVector(), [Math.log(n), 0, 0, 0]);
  });

  it("should work with scalar powers", function() {

    var q = new Quaternion(Math.random() * 10, Math.random() * 10, Math.random() * 10, Math.random() * 10);

    assert(CQ(q.pow(3), q.mul(q).mul(q)));
  });

  it('should compare 2 quaternions correctly', function() {
    assert.equal(!Quaternion().equals(Quaternion(1, 0, 0, 0)), false);
    assert.equal(!Quaternion(1, 1, 1, 1).equals(Quaternion(1, 1, 1, 1)), false);
    assert.equal(!Quaternion(1, 1, 1, 0).equals(Quaternion(1, 1, 1, 0)), false);
    assert.equal(!Quaternion(1, 1, 0, 1).equals(Quaternion(1, 1, 0, 1)), false);
    assert.equal(!Quaternion(1, 0, 1, 1).equals(Quaternion(1, 0, 1, 1)), false);
    assert.equal(!Quaternion(0, 1, 1, 1).equals(Quaternion(0, 1, 1, 1)), false);
    assert.equal(!Quaternion(1, 1, 1, 1).equals(Quaternion(-1, 1, 1, 1)), true);
    assert.equal(!Quaternion(1, 1, 1, 1).equals(Quaternion(1, -1, 1, 1)), true);
    assert.equal(!Quaternion(1, 1, 1, 1).equals(Quaternion(1, 1, -1, 1)), true);
    assert.equal(!Quaternion(1, 1, 1, 1).equals(Quaternion(1, 1, 1, -1)), true);
  });

  it('should square Quaternions', function() {

    assert(CQ(Quaternion("i").pow(2), Quaternion(-1)));
    assert(CQ(Quaternion("j").pow(2), Quaternion(-1)));
    assert(CQ(Quaternion("k").pow(2), Quaternion(-1)));
    assert(CQ(Quaternion(1).pow(2), Quaternion({ w: 1 })));

    assert(CQ(Quaternion(3, -2, -3, 4).pow(2), Quaternion(-20, -12, -18, 24)));

    assert(CQ(Quaternion(1, 2, 3, 4).pow(2), Quaternion(-28, 4, 6, 8)));
    assert(CQ(Quaternion(-1, 2, 3, 4).pow(2), Quaternion(-28, -4, -6, -8)));
    assert(CQ(Quaternion(1, -2, 3, 4).pow(2), Quaternion(-28, -4, 6, 8)));
    assert(CQ(Quaternion(1, 2, -3, 4).pow(2), Quaternion(-28, 4, -6, 8)));
    assert(CQ(Quaternion(1, 2, 3, -4).pow(2), Quaternion(-28, 4, 6, -8)));

    assert(CQ(Quaternion(5, 4, 3, 2).pow(2), Quaternion(-4, 40, 30, 20)));
    assert(CQ(Quaternion(-5, 4, 3, 2).pow(2), Quaternion(-4, -40, -30, -20)));
    assert(CQ(Quaternion(5, -4, 3, 2).pow(2), Quaternion(-4, -40, 30, 20)));
    assert(CQ(Quaternion(5, 4, -3, 2).pow(2), Quaternion(-4, 40, -30, 20)));
    assert(CQ(Quaternion(5, 4, 3, -2).pow(2), Quaternion(-4, 40, 30, -20)));
  });

  it('should raise Quaternion to a Quaternion power', function() {
    assert(CQ(Quaternion(1, 4, 0, 0).pow(Quaternion(-2, 3, 0, 0)), Quaternion(-0.000030177061938851806, 0.0011015451057806702, 0, 0)));
    assert(CQ(Quaternion(1, 4, -3, 2).pow(Quaternion(4, 2, -3, 2)), Quaternion(4.023822744421112, -0.08808649248602358, 0.10799947333843203, -0.045858528052467734)));
    assert(CQ(Quaternion(-1, -1, 0, 4).pow(Quaternion(-4, 5, 1, 1.5)), Quaternion(0.00009562614911354535, 0.0010196374737841477, 0.0015348157881126755, -0.0007464390363321687)));

    assert(CQ(Quaternion(0, 2, 0, 0).pow(Quaternion(1, 0, 0, 0)), Quaternion(0, 2, 0, 0)));
    assert(CQ(Quaternion(0, 2, 0, 0).pow(Quaternion(0, 1, 0, 0)), Quaternion(0.15990905692806803, 0.13282699942462048, 0, 0)));
    assert(CQ(Quaternion(0, 2, 0, 0).pow(Quaternion(0, 0, 1, 0)), Quaternion(-0.145615694487965, 0, 0.399409670603132, 0.905134235650981)));
    assert(CQ(Quaternion(0, 2, 0, 0).pow(Quaternion(0, 0, 0, 1)), Quaternion(-0.145615694487965, 0, -0.905134235650981, 0.399409670603132)));

    assert(CQ(Quaternion(0, 0, 2, 0).pow(Quaternion(1, 0, 0, 0)), Quaternion(0, 0, 2, 0)));
    assert(CQ(Quaternion(0, 0, 2, 0).pow(Quaternion(0, 1, 0, 0)), Quaternion(-0.145615694487965, 0.399409670603132, 0, -0.905134235650981)));
    assert(CQ(Quaternion(0, 0, 2, 0).pow(Quaternion(0, 0, 1, 0)), Quaternion(0.159909056928068, 0, 0.13282699942462, 0)));
    assert(CQ(Quaternion(0, 0, 2, 0).pow(Quaternion(0, 0, 0, 1)), Quaternion(-0.145615694487965, 0.905134235650981, 0, 0.399409670603132)));

    assert(CQ(Quaternion(0, 0, 0, 2).pow(Quaternion(1, 0, 0, 0)), Quaternion(0, 0, 0, 2)));
    assert(CQ(Quaternion(0, 0, 0, 2).pow(Quaternion(0, 1, 0, 0)), Quaternion(-0.145615694487965, 0.399409670603132, 0.905134235650981, 0)));
    assert(CQ(Quaternion(0, 0, 0, 2).pow(Quaternion(0, 0, 1, 0)), Quaternion(-0.145615694487965, -0.905134235650981, 0.399409670603132, 0)));
    assert(CQ(Quaternion(0, 0, 0, 2).pow(Quaternion(0, 0, 0, 1)), Quaternion(0.159909056928068, 0, 0, 0.13282699942462)));

  });

  it('should raise reals to quaternion powers', function() {
    assert(CQ(Quaternion(1).pow(Quaternion(3, 4, 5, 9)), Quaternion(1)));
    assert(CQ(Quaternion(-2).pow(Quaternion(4, 2, 1, 1.5)), Quaternion(-0.024695944127665907, 0.015530441791896946, -0.004473740387907085, 0.004654139181719533)));
    assert(CQ(Quaternion(2, 0, 0, 0).pow(Quaternion(1, 0, 0, 0)), Quaternion(2, 0, 0, 0)));
    assert(CQ(Quaternion(2, 0, 0, 0).pow(Quaternion(0, 1, 0, 0)), Quaternion(0.7692389013639721, 0.6389612763136348, 0, 0)));
    assert(CQ(Quaternion(2, 0, 0, 0).pow(Quaternion(0, 0, 1, 0)), Quaternion(0.769238901363972, 0, 0.638961276313635, 0)));
    assert(CQ(Quaternion(2, 0, 0, 0).pow(Quaternion(0, 0, 0, 1)), Quaternion(0.769238901363972, 0, 0, 0.638961276313635)));
  });

  it('should return the square root of a Quaternion', function() {
    assert(CQ(Quaternion(1, 2, 3, 4).pow(1 / 2), Quaternion(1.7996146219471072, 0.5556745248702426, 0.8335117873053639, 1.1113490497404852)));
    assert(CQ(Quaternion(-1, -2, -3, -4).pow(1 / 2).pow(2), Quaternion(-1, -2, -3, -4)));
    assert(CQ(Quaternion().pow(1 / 2), Quaternion()));
    assert(CQ(Quaternion(1, 0, 0, 0).pow(1 / 2), Quaternion(1, 0, 0, 0)));
    assert(CQ(Quaternion(0, 1, 0, 0).pow(1 / 2), Quaternion(0.7071067811865476, 0.7071067811865475, 0, 0)));
    assert(CQ(Quaternion("1-2i").pow(1 / 2), Quaternion("1.272019649514069 - 0.7861513777574233i")))
    assert(CQ(Quaternion(0, 0, 1, 0).pow(1 / 2), Quaternion(0.7071067811865476, 0, 0.7071067811865475, 0)));
    assert(CQ(Quaternion(0, 0, 0, 1).pow(1 / 2), Quaternion(0.7071067811865476, 0, 0, 0.7071067811865475)));
    assert(CQ(Quaternion(-1).pow(1 / 2), Quaternion("i")));
  });

  it('should return the log base e of a quaternion', function() {
    assert(CQ(Quaternion(1, 2, 3, 4).log(), Quaternion(1.7005986908310777, 0.515190292664085, 0.7727854389961275, 1.03038058532817)));
    assert(CQ(Quaternion(-1, 2, 3, 4).log(), Quaternion(1.7005986908310777, 0.6515679277817118, 0.9773518916725678, 1.3031358555634236)));
    assert(CQ(Quaternion(1, -2, 3, 4).log(), Quaternion(1.7005986908310777, -0.515190292664085, 0.7727854389961275, 1.03038058532817)));
    assert(CQ(Quaternion(1, 2, -3, 4).log(), Quaternion(1.7005986908310777, 0.515190292664085, -0.7727854389961275, 1.03038058532817)));
    assert(CQ(Quaternion(1, 2, 3, -4).log(), Quaternion(1.7005986908310777, 0.515190292664085, 0.7727854389961275, -1.03038058532817)));

    assert(CQ(Quaternion(2, 3, 4, 5).log(), Quaternion(1.9944920232821373, 0.549487105217117, 0.7326494736228226, 0.9158118420285283)));
    assert(CQ(Quaternion(5, 2, 3, 4).log(), Quaternion(1.9944920232821373, 0.30545737557546476, 0.45818606336319717, 0.6109147511509295)));
    assert(CQ(Quaternion(4, 5, 2, 3).log(), Quaternion(1.9944920232821373, 0.8072177296195943, 0.3228870918478377, 0.48433063777175656)));
    assert(CQ(Quaternion(3, 4, 5, 2).log(), Quaternion(1.9944920232821373, 0.685883734654061, 0.8573546683175763, 0.3429418673270305)));
  });

  it('should return the exp of a quaternion', function() {
    assert(CQ(Quaternion(0, 0, 0, 0).exp(), Quaternion(1, 0, 0, 0)));
    assert(CQ(Quaternion(1, 0, 0, 0).exp(), Quaternion(2.718281828459045, 0, 0, 0)));
    assert(CQ(Quaternion(0, 1, 0, 0).exp(), Quaternion(0.5403023058681398, 0.8414709848078965, 0, 0)));
    assert(CQ(Quaternion(0, 0, 1, 0).exp(), Quaternion(0.5403023058681398, 0, 0.8414709848078965, 0)));
    assert(CQ(Quaternion(0, 0, 0, 1).exp(), Quaternion(0.5403023058681398, 0, 0, 0.8414709848078965)));

    assert(CQ(Quaternion(-1, 0, 0, 0).exp(), Quaternion(0.3678794411714424, 0, 0, 0)));
    assert(CQ(Quaternion(0, -1, 0, 0).exp(), Quaternion(0.5403023058681398, -0.8414709848078965, 0, 0)));
    assert(CQ(Quaternion(0, 0, -1, 0).exp(), Quaternion(0.5403023058681398, 0, -0.8414709848078965, 0)));
    assert(CQ(Quaternion(0, 0, 0, -1).exp(), Quaternion(0.5403023058681398, 0, 0, -0.8414709848078965)));

    assert(CQ(Quaternion(1, 2, 3, 4).exp(), Quaternion(1.6939227236832994, -0.7895596245415588, -1.184339436812338, -1.5791192490831176)));
    assert(CQ(Quaternion(4, 1, 2, 3).exp(), Quaternion(-45.05980201339819, -8.240025266756877, -16.480050533513754, -24.720075800270628)));
    assert(CQ(Quaternion(3, 4, 1, 2).exp(), Quaternion(-2.6000526954284027, -17.384580348249628, -4.346145087062407, -8.692290174124814)));
    assert(CQ(Quaternion(2, 3, 4, 1).exp(), Quaternion(2.786189997492657, -4.026439818820405, -5.3685864250938735, -1.3421466062734684)));
  });

  it('should divide quaternions by each other', function() {

    assert(CQ(Quaternion({ z: 1 }).div(Quaternion({ y: 1 })), Quaternion({ x: 1 })));
    assert(CQ(Quaternion({ x: 1 }).div(Quaternion({ z: 1 })), Quaternion({ y: 1 })));
    assert(CQ(Quaternion(3, -2, -3, 4).div(Quaternion(3, -2, -3, 4)), Quaternion(1, 0, 0, 0)));
    assert(CQ(Quaternion(1, 2, 3, 4).div(Quaternion(-1, 1, 2, 3)), Quaternion(19 / 15, -4 / 15, -1 / 5, -8 / 15)));

    assert(CQ(Quaternion(1, 0, 0, 0).div(Quaternion(1, 0, 0, 0)), Quaternion(1, 0, 0, 0)));
    assert(CQ(Quaternion(1, 0, 0, 0).div(Quaternion(0, 1, 0, 0)), Quaternion(0, -1, 0, 0)));
    assert(CQ(Quaternion(1, 0, 0, 0).div(Quaternion(0, 0, 1, 0)), Quaternion(0, 0, -1, 0)));
    assert(CQ(Quaternion(1, 0, 0, 0).div(Quaternion(0, 0, 0, 1)), Quaternion(0, 0, 0, -1)));
  });

  it('should raise Quaternion to real powers', function() {
    assert(CQ(Quaternion(1, 2, 3, 4).pow(2), Quaternion(-28, 4, 6, 8)));
    assert(CQ(Quaternion(1, 2, 3, 4).pow(0), Quaternion({ w: 1 })));
    assert(CQ(Quaternion(1, 2, 3, 4).pow(2.5), Quaternion(-66.50377063575604, -8.360428208578368, -12.54064231286755, -16.720856417156735)));
    assert(CQ(Quaternion(1, 2, 3, 4).pow(-2.5), Quaternion(-0.0134909686430938, 0.0016959981926818065, 0.0025439972890227095, 0.003391996385363613)));
  });

  it('should rotate the optimized function', function() {

    var v = [Math.random() * 100, Math.random() * 50, Math.random() * 20];
    var q = Quaternion.random();

    assert.v(q.rotateVector(v), q.mul(0, v).mul(q.conjugate()).toVector().slice(1));
  });

  it('should rotate one vector onto the other', function() {

    var u = [Math.random() * 100, Math.random() * 100, Math.random() * 100];
    var v = [Math.random() * 100, Math.random() * 100, Math.random() * 100];

    var q = Quaternion.fromBetweenVectors(u, v);
    var vPrime = q.rotateVector(u);

    // Is the length of rotated equal to the original?
    assert.approx(Quaternion(u).norm(), Quaternion(vPrime).norm());

    // Do they look in the same direction?
    assert.q(Quaternion(v).normalize(), Quaternion(vPrime).normalize());
  });

  it('should rotate one vector onto the other around PI', function() {

    var u = [10, 0, 0];
    var v = [-12, 0, 0];

    var q = Quaternion.fromBetweenVectors(u, v);
    var vPrime = q.rotateVector(u);

    // Is the length of rotated equal to the original?
    assert.approx(Quaternion(u).norm(), Quaternion(vPrime).norm());

    // Do they look in the same direction?
    assert.q(Quaternion(v).normalize(), Quaternion(vPrime).normalize());

    var u = [0, 10, 0];
    var v = [0, -12, 0];

    var q = Quaternion.fromBetweenVectors(u, v);
    var vPrime = q.rotateVector(u);

    // Is the length of rotated equal to the original?
    assert.approx(Quaternion(u).norm(), Quaternion(vPrime).norm());

    // Do they look in the same direction?
    assert.q(Quaternion(v).normalize(), Quaternion(vPrime).normalize());

    var u = [0, 0, 10];
    var v = [0, 0, 150];

    var q = Quaternion.fromBetweenVectors(u, v);
    var vPrime = q.rotateVector(u);

    // Is the length of rotated equal to the original?
    assert.approx(Quaternion(u).norm(), Quaternion(vPrime).norm());

    // Do they look in the same direction?
    assert.q(Quaternion(v).normalize(), Quaternion(vPrime).normalize());
  });

  it('should rotate additive inverse to the same point', function() {

    var q1 = Quaternion(Math.random(), Math.random(), Math.random(), Math.random()).normalize();
    var q2 = Quaternion(Math.random(), Math.random(), Math.random(), Math.random()).normalize();

    var v = [Math.random(), Math.random(), Math.random()];

    assert.v(q1.neg().rotateVector(v), q1.rotateVector(v));
    assert.v(q1.conjugate().neg().rotateVector(v), q1.conjugate().rotateVector(v));
  });

  it('should slerp around', function() {

    var q1 = Quaternion(Math.random(), Math.random(), Math.random(), Math.random()).normalize();
    var q2 = Quaternion(Math.random(), Math.random(), Math.random(), Math.random()).normalize();

    assert.q(q1.slerp(q2)(0), q1);
    assert.q(q1.slerp(q2)(1), q2);

  });

  it("should work with fromEuler -> toEuler ZXY", function() {

    let t = [
      Math.PI * 2 * Math.random() - Math.PI,
      Math.PI * 2 * Math.random() - Math.PI,
      Math.PI * 2 * Math.random() - Math.PI
    ];

    let r = Quaternion.fromEuler(...t, 'ZXY');
    let s = Quaternion.fromEuler(...r.toEuler('ZXY'), 'ZXY');

    assert.matrixEqual(r.toMatrix(), s.toMatrix());
  });

  it("should work with fromEuler -> toEuler XYZ", function() {

    let t = [
      Math.PI * 2 * Math.random() - Math.PI,
      Math.PI * 2 * Math.random() - Math.PI,
      Math.PI * 2 * Math.random() - Math.PI
    ];

    let r = Quaternion.fromEuler(...t, 'XYZ');
    let s = Quaternion.fromEuler(...r.toEuler('XYZ'), 'XYZ');

    assert.matrixEqual(r.toMatrix(), s.toMatrix());
  });

  it("should work with fromEuler -> toEuler YXZ", function() {

    let t = [
      Math.PI * 2 * Math.random() - Math.PI,
      Math.PI * 2 * Math.random() - Math.PI,
      Math.PI * 2 * Math.random() - Math.PI
    ];

    let r = Quaternion.fromEuler(...t, 'YXZ');
    let s = Quaternion.fromEuler(...r.toEuler('YXZ'), 'YXZ');

    assert.matrixEqual(r.toMatrix(), s.toMatrix());
  });

  it("should work with fromEuler -> toEuler ZYX", function() {

    let t = [
      Math.PI * 2 * Math.random() - Math.PI,
      Math.PI * 2 * Math.random() - Math.PI,
      Math.PI * 2 * Math.random() - Math.PI
    ];

    let r = Quaternion.fromEuler(...t, 'ZYX');
    let s = Quaternion.fromEuler(...r.toEuler('ZYX'), 'ZYX');

    assert.matrixEqual(r.toMatrix(), s.toMatrix());
  });

  it("should work with fromEuler -> toEuler YZX", function() {

    let t = [
      Math.PI * 2 * Math.random() - Math.PI,
      Math.PI * 2 * Math.random() - Math.PI,
      Math.PI * 2 * Math.random() - Math.PI
    ];

    let r = Quaternion.fromEuler(...t, 'YZX');
    let s = Quaternion.fromEuler(...r.toEuler('YZX'), 'YZX');

    assert.matrixEqual(r.toMatrix(), s.toMatrix());
  });

  it("should work with fromEuler -> toEuler XZY", function() {

    let t = [
      Math.PI * 2 * Math.random() - Math.PI,
      Math.PI * 2 * Math.random() - Math.PI,
      Math.PI * 2 * Math.random() - Math.PI
    ];

    let r = Quaternion.fromEuler(...t, 'XZY');
    let s = Quaternion.fromEuler(...r.toEuler('XZY'), 'XZY');

    assert.matrixEqual(r.toMatrix(), s.toMatrix());
  });

  it("should work with fromEuler -> toEuler RPY", function() {

    let t = [
      Math.PI * 2 * Math.random() - Math.PI,
      Math.PI * 2 * Math.random() - Math.PI,
      Math.PI * 2 * Math.random() - Math.PI
    ];

    let r = Quaternion.fromEuler(...t, 'RPY');
    let s = Quaternion.fromEuler(...r.toEuler('RPY'), 'RPY');

    assert.matrixEqual(r.toMatrix(), s.toMatrix());
  });

  it("should work with fromEuler -> toEuler YPR", function() {

    let t = [
      Math.PI * 2 * Math.random() - Math.PI,
      Math.PI * 2 * Math.random() - Math.PI,
      Math.PI * 2 * Math.random() - Math.PI
    ];

    let r = Quaternion.fromEuler(...t, 'YPR');
    let s = Quaternion.fromEuler(...r.toEuler('YPR'), 'YPR');

    assert.matrixEqual(r.toMatrix(), s.toMatrix());
  });

  it("should work with deviceorientation from Opera Site", function() {

    var alpha = Math.random() * 360;
    var beta = Math.random() * 360;
    var gamma = Math.random() * 360;

    let r = getBaseQuaternion(alpha, beta, gamma); // Bug: Wrong order on Opera site!
    let s = Quaternion.fromEuler(alpha * Math.PI / 180, beta * Math.PI / 180, gamma * Math.PI / 180, 'ZXY');

    assert.q(r, s);
  });

  it("should work with euclideanspace.com", function() {

    var alpha = Math.random() * 360;
    var beta = Math.random() * 360;
    var gamma = Math.random() * 360;

    let r = eulerToQuaternion(alpha * Math.PI / 180, beta * Math.PI / 180, gamma * Math.PI / 180);
    let s = Quaternion.fromEuler(alpha * Math.PI / 180, beta * Math.PI / 180, gamma * Math.PI / 180, 'YZX');

    assert.q(r, s);
  });

  describe('fromMatrix', function() {
    it('Should create a quaternion from a matrix with m22 positive and m00 < -m11', function() {
      const q = Quaternion.fromMatrix([
        -0.14040120936120104, -0.03817338250185204, 0.9893585261563572,
        -0.2992237727316569, -0.9508943214366381, -0.0791525318090902,
        0.9437969242597403, -0.3071527019707341, 0.12208432917426992])
      assert.q(q, new Quaternion(-0.08773368562933877, 0.6496939246485931, -0.12982927130494584, 0.7438716051799714))
    })

    it('Should create a quaternion from a matrix with m22 positive and m00 >= -m11', function() {
      const q = Quaternion.fromMatrix([
        0.7441469599075261, -0.6679403460655629, 0.010049684482756005,
        0.4879070091702578, 0.5331745589946937, -0.6911379312722953,
        0.4562806729009248, 0.5192115019321414, 0.7226530037289329])
      assert.q(q, new Quaternion(0.8660217264351906, 0.34939926916920544, -0.12881633762671046, 0.3336658076679094))
    })

    it('Should create a quaternion from a matrix with m22 negative and m00 > m11', function() {
      const q = Quaternion.fromMatrix([
        0.060549599475538174, 0.13230044593141155, 0.9893585487626324,
        0.14484523930352894, -0.981850454507192, 0.12243178359856144,
        0.9875999203394337, 0.13589068029254686, -0.07861374151618494])
      assert.q(q, new Quaternion(0.004620699410323448, 0.7281850375246176, 0.09514947127211848, 0.6787280592246553))
    })

    it('Should create a quaternion from a matrix with m22 negative and m00 <= m11', function() {
      const q = Quaternion.fromMatrix([
        -0.9899924978109478, -0.13532339494964624, -0.04003040166351807,
        -0.00000000597024110, 0.28366218433821, -0.9589242749959328,
        0.14111999956788723, -0.9493278379757846, -0.2808234352154073])
      assert.q(q, new Quaternion(-0.05667065226343984, -0.04233424460838274, 0.7991367400771543, -0.5969729638470511))
    })
  })

  describe('toMatrix', function() {

    it('Should create a matrix from a quaternion with m22 positive and m00 < -m11', function() {
      assert.matrixEqual(
        new Quaternion(-0.08773368562933877, 0.6496939246485931, -0.12982927130494584, 0.7438716051799714).toMatrix(true),
        [[-0.14040120936120104, -0.03817338250185204, 0.9893585261563572],
        [-0.2992237727316569, -0.9508943214366381, -0.0791525318090902],
        [0.9437969242597403, -0.3071527019707341, 0.12208432917426992]])
      assert.matrixEqual(
        new Quaternion(-0.08773368562933877, 0.6496939246485931, -0.12982927130494584, 0.7438716051799714).toMatrix(false),
        [-0.14040120936120104, -0.03817338250185204, 0.9893585261563572,
        -0.2992237727316569, -0.9508943214366381, -0.0791525318090902,
          0.9437969242597403, -0.3071527019707341, 0.12208432917426992])
    })

    it('Should create a matrix from a quaternion with m22 positive and m00 >= -m11', function() {
      assert.matrixEqual(
        new Quaternion(-0.08773368562933877, 0.6496939246485931, -0.12982927130494584, 0.7438716051799714).toMatrix(true),
        [[-0.14040120936120104, -0.03817338250185204, 0.9893585261563572],
        [-0.2992237727316569, -0.9508943214366381, -0.0791525318090902],
        [0.9437969242597403, -0.3071527019707341, 0.12208432917426992]])
      assert.matrixEqual(
        new Quaternion(-0.08773368562933877, 0.6496939246485931, -0.12982927130494584, 0.7438716051799714).toMatrix(false),
        [-0.14040120936120104, -0.03817338250185204, 0.9893585261563572,
        -0.2992237727316569, -0.9508943214366381, -0.0791525318090902,
          0.9437969242597403, -0.3071527019707341, 0.12208432917426992])
    })

    it('Should create a matrix from a quaternion with m22 negative and m00 > m11', function() {
      assert.matrixEqual(
        new Quaternion(-0.08773368562933877, 0.6496939246485931, -0.12982927130494584, 0.7438716051799714).toMatrix(true),
        [[-0.14040120936120104, -0.03817338250185204, 0.9893585261563572],
        [-0.2992237727316569, -0.9508943214366381, -0.0791525318090902],
        [0.9437969242597403, -0.3071527019707341, 0.12208432917426992]])
      assert.matrixEqual(
        new Quaternion(-0.08773368562933877, 0.6496939246485931, -0.12982927130494584, 0.7438716051799714).toMatrix(false),
        [-0.14040120936120104, -0.03817338250185204, 0.9893585261563572,
        -0.2992237727316569, -0.9508943214366381, -0.0791525318090902,
          0.9437969242597403, -0.3071527019707341, 0.12208432917426992])
    })

    it('Should create a matrix from a quaternion with m22 negative and m00 <= m11', function() {
      assert.matrixEqual(
        new Quaternion(-0.08773368562933877, 0.6496939246485931, -0.12982927130494584, 0.7438716051799714).toMatrix(true),
        [[-0.14040120936120104, -0.03817338250185204, 0.9893585261563572],
        [-0.2992237727316569, -0.9508943214366381, -0.0791525318090902],
        [0.9437969242597403, -0.3071527019707341, 0.12208432917426992]])
      assert.matrixEqual(
        new Quaternion(-0.08773368562933877, 0.6496939246485931, -0.12982927130494584, 0.7438716051799714).toMatrix(false),
        [-0.14040120936120104, -0.03817338250185204, 0.9893585261563572,
        -0.2992237727316569, -0.9508943214366381, -0.0791525318090902,
          0.9437969242597403, -0.3071527019707341, 0.12208432917426992])
    })
  })

  it('should convert from and to matrix', function() {

    var initialQuat = Quaternion.random().normalize();

    let m1 = initialQuat.toMatrix(true);
    let m2 = initialQuat.toMatrix(false);

    let q1 = Quaternion.fromMatrix(m1)
    let q2 = Quaternion.fromMatrix(m2)

    assert.matrixEqual(q1.toMatrix(true), m1);
    assert.matrixEqual(q2.toMatrix(false), m2);
  });

  it('should work with standard definition of RPY', function() {

    var α = Math.random() * 2 * Math.PI;
    var γ = Math.random() * 2 * Math.PI;
    var β = Math.random() * 2 * Math.PI;

    var quat = Quaternion.fromEulerLogical(α, β, γ, "XYZ");
    assert.matrixEqual(quat.toMatrix(true), RollPitchYaw1(α, β, γ));
  });

  it('should work with robotics definition of RPY', function() {

    var α = Math.random() * 2 * Math.PI;
    var β = Math.random() * 2 * Math.PI;
    var γ = Math.random() * 2 * Math.PI;

    var quat = Quaternion.fromEulerLogical(α, β, γ, "ZYX");
    assert.matrixEqual(quat.toMatrix(true), RollPitchYaw2(α, β, γ));
  });

  it('Should fuzz 0# ZXY', function() { assert.v(Quaternion.fromEuler(0.7560671181764893, -0.13546265539440805, 3.0647447738212223, 'ZXY').rotateVector([2, 3, 5]), [-2.73473153490426, 0.552994141668246, -5.49685736683069]) });
  it('Should fuzz 1# ZXY', function() { assert.v(Quaternion.fromEuler(-0.9380873336181326, -1.5456730703056945, -3.0597760267130223, 'ZXY').rotateVector([2, 3, 5]), [-5.24518381954551, -0.867660165532979, -3.12013021143754]) });
  it('Should fuzz 2# ZXY', function() { assert.v(Quaternion.fromEuler(-1.1348507711853153, -0.4115641368061649, 0.9705915513821521, 'ZXY').rotateVector([2, 3, 5]), [5.13724048032114, -3.40488714700346, -0.124514109724319]) });
  it('Should fuzz 3# ZXY', function() { assert.v(Quaternion.fromEuler(1.4089894888325434, 0.8042682209887531, -0.7023692389520657, 'ZXY').rotateVector([2, 3, 5]), [1.30362097726652, -1.93885362106741, 5.70450865401259]) });
  it('Should fuzz 4# ZXY', function() { assert.v(Quaternion.fromEuler(-0.0344911398695098, -0.6950067407079987, -2.4174145744101403, 'ZXY').rotateVector([2, 3, 5]), [-4.78181622048923, 0.919731535018256, -3.77999041492953]) });
  it('Should fuzz 5# ZXY', function() { assert.v(Quaternion.fromEuler(-0.3993324281430666, -0.8686914211519521, -2.1443171860341117, 'ZXY').rotateVector([2, 3, 5]), [-4.42266701817088, 3.11332137523277, -2.95757442187043]) });
  it('Should fuzz 6# ZXY', function() { assert.v(Quaternion.fromEuler(0.7842113974343352, 1.729805218326823, -2.180977197459205, 'ZXY').rotateVector([2, 3, 5]), [-4.23175395401849, -3.18279350186644, 3.15627692022193]) });
  it('Should fuzz 7# ZXY', function() { assert.v(Quaternion.fromEuler(-0.028137277945027517, 2.559355041887808, 0.7286830611984181, 'ZXY').rotateVector([2, 3, 5]), [4.71203393180756, -3.95874898470177, -0.353613774642442]) });
  it('Should fuzz 8# ZXY', function() { assert.v(Quaternion.fromEuler(-3.0680638615270226, 0.24400957228642461, -2.5937427905734074, 'ZXY').rotateVector([2, 3, 5]), [4.57103196205473, -3.36393470288412, -2.40616086673481]) });
  it('Should fuzz 9# ZXY', function() { assert.v(Quaternion.fromEuler(-2.6316946431369574, -1.9757245652714845, -0.4350628450289924, 'ZXY').rotateVector([2, 3, 5]), [2.09172605948023, -3.13877002139904, -4.87573633873469]) });
  it('Should fuzz 10# ZXY', function() { assert.v(Quaternion.fromEuler(-0.058132427889624694, 1.6446132037760925, -0.6053880104987908, 'ZXY').rotateVector([2, 3, 5]), [-1.51583698019482, -5.37753704154801, 2.60467533797456]) });
  it('Should fuzz 11# ZXY', function() { assert.v(Quaternion.fromEuler(-1.3717044853059401, 2.346223855318967, -1.625263027398635, 'ZXY').rotateVector([2, 3, 5]), [-4.27495589642530, 4.34173147193671, 0.934943800029096]) });
  it('Should fuzz 12# ZXY', function() { assert.v(Quaternion.fromEuler(-2.136153911916934, -3.0469933985518165, -2.168077538374105, 'ZXY').rotateVector([2, 3, 5]), [0.203163319626470, 6.09937355367697, 0.869693577223777]) });
  it('Should fuzz 13# ZXY', function() { assert.v(Quaternion.fromEuler(-1.2390267792983087, 2.7403172024470397, -0.8737483297522668, 'ZXY').rotateVector([2, 3, 5]), [-5.19325120188206, 0.907763380126653, -3.19469992328725]) });
  it('Should fuzz 14# ZXY', function() { assert.v(Quaternion.fromEuler(-2.4121660766570083, -2.9606900564953826, 2.7723257221377615, 'ZXY').rotateVector([2, 3, 5]), [-2.56724165535188, 2.96282120048026, 4.75720094351824]) });
  it('Should fuzz 15# ZXY', function() { assert.v(Quaternion.fromEuler(1.145474980871895, -1.2627955037307874, 2.9762064272189708, 'ZXY').rotateVector([2, 3, 5]), [3.26404363325144, -2.74049265516050, -4.45373092667733]) });
  it('Should fuzz 16# ZXY', function() { assert.v(Quaternion.fromEuler(-1.0043874805974085, 0.8144531945597815, 0.49544063042485664, 'ZXY').rotateVector([2, 3, 5]), [1.84078466286096, -3.73159038727377, 4.54826835252515]) });
  it('Should fuzz 17# ZXY', function() { assert.v(Quaternion.fromEuler(-1.2587875647322428, 0.8726772725308951, -2.4996817429148575, 'ZXY').rotateVector([2, 3, 5]), [2.47125063464454, 5.62576220689445, 0.493679949205044]) });
  it('Should fuzz 18# ZXY', function() { assert.v(Quaternion.fromEuler(1.8652933645245282, 1.5891439509814171, -1.8668843704756535, 'ZXY').rotateVector([2, 3, 5]), [2.04463953269764, -4.98722209587062, 2.99116448023003]) });
  it('Should fuzz 19# ZXY', function() { assert.v(Quaternion.fromEuler(-0.6904474402816247, -2.5364982509874663, -2.6157446183334834, 'ZXY').rotateVector([2, 3, 5]), [-6.04292116064851, -0.658405713471119, 1.02450269040890]) });
  it('Should fuzz 20# ZXY', function() { assert.v(Quaternion.fromEuler(1.5458696450351175, 2.332588615383294, 0.09317199546346622, 'ZXY').rotateVector([2, 3, 5]), [5.59782856750084, 2.31771066728775, -1.13689603377445]) });
  it('Should fuzz 21# ZXY', function() { assert.v(Quaternion.fromEuler(-1.7550375805101102, -0.6962004914580713, -1.7951806632516676, 'ZXY').rotateVector([2, 3, 5]), [3.76536090296171, 4.70955882680709, -1.28144954145326]) });
  it('Should fuzz 22# ZXY', function() { assert.v(Quaternion.fromEuler(2.167415156727067, -2.5401849506282907, 0.9735767912111468, 'ZXY').rotateVector([2, 3, 5]), [-1.45057072442685, 5.37232418471793, -2.65216466829089]) });
  it('Should fuzz 23# ZXY', function() { assert.v(Quaternion.fromEuler(0.27789163529790084, 1.5966265250300964, -2.625883482524779, 'ZXY').rotateVector([2, 3, 5]), [-4.94541786436298, 2.00506003968667, 3.08586720130521]) });
  it('Should fuzz 24# ZXY', function() { assert.v(Quaternion.fromEuler(-0.4211493584539441, 2.798704244259226, -1.4827940625575193, 'ZXY').rotateVector([2, 3, 5]), [-5.87428455335419, -1.36032405903465, -1.28152231374872]) });
  it('Should fuzz 25# ZXY', function() { assert.v(Quaternion.fromEuler(0.8322490778018805, -1.7372668908845599, -2.6009566647301723, 'ZXY').rotateVector([2, 3, 5]), [-0.143789062691052, -5.66824544764093, -2.41874311383998]) });
  it('Should fuzz 26# ZXY', function() { assert.v(Quaternion.fromEuler(1.96887965632067, -1.3150956988151299, 0.152587992081052, 'ZXY').rotateVector([2, 3, 5]), [-5.89659324090874, 0.489167264283484, -1.72942289184075]) });
  it('Should fuzz 27# ZXY', function() { assert.v(Quaternion.fromEuler(-1.1251137477309539, -2.5480822098931903, -1.5161877005074766, 'ZXY').rotateVector([2, 3, 5]), [-3.20361149338918, 3.88155359503202, -3.55955265283698]) });
  it('Should fuzz 28# ZXY', function() { assert.v(Quaternion.fromEuler(2.3856431836101137, -0.6016758517545151, 2.8935335477345925, 'ZXY').rotateVector([2, 3, 5]), [0.893565753010776, -0.0889094134030044, -6.09865848865590]) });
  it('Should fuzz 29# ZXY', function() { assert.v(Quaternion.fromEuler(-1.9933056845258472, -2.6475509059885116, -2.1922466433694052, 'ZXY').rotateVector([2, 3, 5]), [-0.820354164329139, 6.10263977278541, -0.291216154575068]) });
  it('Should fuzz 30# ZXY', function() { assert.v(Quaternion.fromEuler(0.6225260220320035, 0.1128988048041486, 1.6405391590378828, 'ZXY').rotateVector([2, 3, 5]), [2.04685733214606, 5.46329563723737, -1.99067220857253]) });
  it('Should fuzz 31# ZXY', function() { assert.v(Quaternion.fromEuler(1.8872971477923386, 1.3428619940638988, -0.9263736045590512, 'ZXY').rotateVector([2, 3, 5]), [4.48677277403878, -1.47241679361193, 3.96243092810889]) });
  it('Should fuzz 32# ZXY', function() { assert.v(Quaternion.fromEuler(-0.37746008249180374, -0.15574481229414028, -0.7594543432016589, 'ZXY').rotateVector([2, 3, 5]), [-0.473637036270484, 4.21073492946301, 4.47720664160960]) });
  it('Should fuzz 33# ZXY', function() { assert.v(Quaternion.fromEuler(0.0013736793508885015, -1.32801741337273, 2.645619569148809, 'ZXY').rotateVector([2, 3, 5]), [0.626567900944953, -4.47037076189846, -4.19799927544882]) });
  it('Should fuzz 34# ZXY', function() { assert.v(Quaternion.fromEuler(-2.9474212756240497, 0.8633224655668146, -1.8590759140273707, 'ZXY').rotateVector([2, 3, 5]), [5.56499136935395, -0.508593541220544, 2.60234580116571]) });
  it('Should fuzz 35# ZXY', function() { assert.v(Quaternion.fromEuler(1.452819040753364, 1.3801535379370717, 2.2355341594658613, 'ZXY').rotateVector([2, 3, 5]), [-4.78874743716935, 3.28819788091197, 2.06292333327489]) });
  it('Should fuzz 36# ZXY', function() { assert.v(Quaternion.fromEuler(-1.315978204247554, 1.7036219017171126, -0.469178687286286, 'ZXY').rotateVector([2, 3, 5]), [-5.64976273677700, -0.978850782472969, 2.26319070424437]) });
  it('Should fuzz 37# ZXY', function() { assert.v(Quaternion.fromEuler(-1.9244474585822604, 2.389058986626308, 0.8900861677025436, 'ZXY').rotateVector([2, 3, 5]), [-4.85704641770444, -3.69059647884358, 0.888030250955384]) });
  it('Should fuzz 38# ZXY', function() { assert.v(Quaternion.fromEuler(-1.221235251872881, -1.1198503174908598, -0.30055362242643957, 'ZXY').rotateVector([2, 3, 5]), [5.91485344645870, 1.69836278503082, -0.360655732434626]) });
  it('Should fuzz 39# ZXY', function() { assert.v(Quaternion.fromEuler(-0.11907208267471825, -1.6921999230467688, 0.15047844144744227, 'ZXY').rotateVector([2, 3, 5]), [3.21205356178809, 3.89217562019317, -3.54029389426618]) });
  it('Should fuzz 40# ZXY', function() { assert.v(Quaternion.fromEuler(-2.1318220270746115, 0.3994660895394171, 1.5085155564606083, 'ZXY').rotateVector([2, 3, 5]), [0.173651700481123, -6.14989811679064, -0.385484422532204]) });
  it('Should fuzz 41# ZXY', function() { assert.v(Quaternion.fromEuler(2.068097279657117, -1.9370619446320907, -2.301250287538201, 'ZXY').rotateVector([2, 3, 5]), [4.87260148266066, -3.11111261484021, -2.13979744110400]) });
  it('Should fuzz 42# ZXY', function() { assert.v(Quaternion.fromEuler(-2.5858552882994803, -2.355632211603387, 2.629724979119618, 'ZXY').rotateVector([2, 3, 5]), [-3.71047258131154, 4.63771806176647, 1.65044369879747]) });
  it('Should fuzz 43# ZXY', function() { assert.v(Quaternion.fromEuler(1.4636663724055818, -3.1229324267516594, 2.5335110784980026, 'ZXY').rotateVector([2, 3, 5]), [3.20952427002312, 0.876826754014333, 5.18942470834458]) });
  it('Should fuzz 44# ZXY', function() { assert.v(Quaternion.fromEuler(2.2531589144119577, -3.0946192865647837, 1.9154546862821995, 'ZXY').rotateVector([2, 3, 5]), [-0.0857127106239477, 5.12334561555445, 3.42694952323733]) });
  it('Should fuzz 45# ZXY', function() { assert.v(Quaternion.fromEuler(-1.3941520624551733, 0.8578740640628268, -0.0026329606824839757, 'ZXY').rotateVector([2, 3, 5]), [-1.44657361780150, -2.27645446873858, 5.54302984116456]) });
  it('Should fuzz 46# ZXY', function() { assert.v(Quaternion.fromEuler(-0.3057199137498299, -2.3316819432604525, 0.016386622537455597, 'ZXY').rotateVector([2, 3, 5]), [2.44509824196461, 0.830817850578375, -5.59743122211447]) });
  it('Should fuzz 47# ZXY', function() { assert.v(Quaternion.fromEuler(-2.6045480235991536, -0.7357912639504134, 0.2362721975270512, 'ZXY').rotateVector([2, 3, 5]), [-0.0301900646305628, -6.03772748203413, 1.24295430836671]) });
  it('Should fuzz 48# ZXY', function() { assert.v(Quaternion.fromEuler(-1.4632800529816021, -1.625163820317357, 0.0868856381762031, 'ZXY').rotateVector([2, 3, 5]), [4.87105109945042, -1.91468457968660, -3.25681503110834]) });
  it('Should fuzz 49# ZXY', function() { assert.v(Quaternion.fromEuler(2.3725431324047275, -0.520585161112646, -1.0631999921513784, 'ZXY').rotateVector([2, 3, 5]), [-0.813969805952579, -5.72622348344437, 2.13256131744147]) });
  it('Should fuzz 50# ZXY', function() { assert.v(Quaternion.fromEuler(-0.9382796675476555, -1.594943689822076, 2.0658488769134475, 'ZXY').rotateVector([2, 3, 5]), [-1.35342499637139, -5.26900575575523, -2.89927906987502]) });
  it('Should fuzz 51# ZXY', function() { assert.v(Quaternion.fromEuler(-0.19529482433431022, -1.368364895799924, 1.4646864099289854, 'ZXY').rotateVector([2, 3, 5]), [4.92482264393144, -1.81646604100088, -3.23211587782845]) });
  it('Should fuzz 52# ZXY', function() { assert.v(Quaternion.fromEuler(-0.07771332587697888, -2.946075513237868, 1.3455995491881456, 'ZXY').rotateVector([2, 3, 5]), [5.06325785986474, -3.50834938910710, 0.234316897533543]) });
  it('Should fuzz 53# ZXY', function() { assert.v(Quaternion.fromEuler(2.2922396235191433, 1.806163562626744, 1.7164500601351858, 'ZXY').rotateVector([2, 3, 5]), [-4.52506833205012, 2.22161916181532, 3.54798039596220]) });
  it('Should fuzz 54# ZXY', function() { assert.v(Quaternion.fromEuler(-1.497719831610113, 2.939783704421707, -1.438696165855707, 'ZXY').rotateVector([2, 3, 5]), [-3.80190123162312, 4.42723812863276, -1.98622999105414]) });
  it('Should fuzz 55# ZXY', function() { assert.v(Quaternion.fromEuler(-2.4323715836048496, -1.5902208571189418, 2.290807360506089, 'ZXY').rotateVector([2, 3, 5]), [-5.01548752627606, 2.09736435976779, -2.90619125594739]) });
  it('Should fuzz 56# ZXY', function() { assert.v(Quaternion.fromEuler(-0.7305303937383192, -1.4158822412209444, 0.29225100934783743, 'ZXY').rotateVector([2, 3, 5]), [5.58500237876598, 1.20504889397709, -2.31421813844393]) });
  it('Should fuzz 57# ZXY', function() { assert.v(Quaternion.fromEuler(-2.2645803993147884, -2.3210857370155002, -2.2626241249500736, 'ZXY').rotateVector([2, 3, 5]), [0.777625438306482, 6.02088068630225, -1.06971699014795]) });
  it('Should fuzz 58# ZXY', function() { assert.v(Quaternion.fromEuler(0.6774342684668735, 0.8446523825489356, 2.7332842202695504, 'ZXY').rotateVector([2, 3, 5]), [-3.65486458362359, 4.78227342765724, -1.33109944726060]) });
  it('Should fuzz 59# ZXY', function() { assert.v(Quaternion.fromEuler(-2.9866884819614214, 1.6665546866828969, -1.9786846993502805, 'ZXY').rotateVector([2, 3, 5]), [5.29707872800101, 0.968937331794066, 3.00035287864861]) });
  it('Should fuzz 60# ZXY', function() { assert.v(Quaternion.fromEuler(-0.9383687666091749, -0.14823616625806935, -2.263522480682246, 'ZXY').rotateVector([2, 3, 5]), [-0.833113486888518, 5.74310168702713, -2.07911157238629]) });
  it('Should fuzz 61# ZXY', function() { assert.v(Quaternion.fromEuler(-0.2407342013446785, 1.7020861076747398, -2.57856757148398, 'ZXY').rotateVector([2, 3, 5]), [-3.58084658025169, 3.70125013603125, 3.38796180604629]) });
  it('Should fuzz 62# ZXY', function() { assert.v(Quaternion.fromEuler(0.2353083035764416, 1.4580211685338886, -0.0336697296916344, 'ZXY').rotateVector([2, 3, 5]), [2.87464269782691, -4.13855853917720, 3.55088194363511]) });
  it('Should fuzz 63# ZXY', function() { assert.v(Quaternion.fromEuler(0.4867389384743963, -2.1256635802670116, 0.4552013296508113, 'ZXY').rotateVector([2, 3, 5]), [2.83405729358441, 3.18472537873094, -4.45259963602703]) });
  it('Should fuzz 64# ZXY', function() { assert.v(Quaternion.fromEuler(-1.895221975235589, 2.525327280477744, -1.5921523111218787, 'ZXY').rotateVector([2, 3, 5]), [-1.75028260143959, 5.90767649368400, 0.189391818913593]) });
  it('Should fuzz 65# ZXY', function() { assert.v(Quaternion.fromEuler(0.35875262422869003, -1.5194164600908044, 1.0134308627959951, 'ZXY').rotateVector([2, 3, 5]), [4.57735136056891, 2.89150354811384, -2.94738218647380]) });
  it('Should fuzz 66# ZXY', function() { assert.v(Quaternion.fromEuler(2.1116631168685487, 1.3052374953274022, -1.3673722908326904, 'ZXY').rotateVector([2, 3, 5]), [4.09421028956953, -2.78191395460984, 3.67401644715018]) });
  it('Should fuzz 67# ZXY', function() { assert.v(Quaternion.fromEuler(0.2872686908650457, 1.8660960488165461, 0.47986678558680174, 'ZXY').rotateVector([2, 3, 5]), [5.11448521767269, -2.90287348563305, 1.84807101720041]) });
  it('Should fuzz 68# ZXY', function() { assert.v(Quaternion.fromEuler(-1.847648022559868, 1.5604486386307004, -1.9779495433168715, 'ZXY').rotateVector([2, 3, 5]), [1.63926700545513, 5.13056260460091, 2.99835472302676]) });
  it('Should fuzz 69# ZXY', function() { assert.v(Quaternion.fromEuler(-2.0354812115640097, 2.2716293620772285, -1.8358162392766293, 'ZXY').rotateVector([2, 3, 5]), [0.243825114614393, 5.86156961418164, 1.89276278798631]) });
  it('Should fuzz 70# ZXY', function() { assert.v(Quaternion.fromEuler(-1.7533168690571204, 0.12128407313050005, -0.19504951055389963, 'ZXY').rotateVector([2, 3, 5]), [2.11853258278437, -1.40080123393685, 5.61690088916317]) });
  it('Should fuzz 71# ZXY', function() { assert.v(Quaternion.fromEuler(1.2080511830476572, -0.15213074966954077, 0.11742633935721924, 'ZXY').rotateVector([2, 3, 5]), [-2.53006574614607, 3.71129161853350, 4.22197605895407]) });
  it('Should fuzz 72# ZXY', function() { assert.v(Quaternion.fromEuler(-2.0043340156908145, -0.6451596477957899, -2.7528716083819758, 'ZXY').rotateVector([2, 3, 5]), [1.63753733281658, 3.36965465653874, -4.89529355394533]) });
  it('Should fuzz 73# ZXY', function() { assert.v(Quaternion.fromEuler(2.2544510841496797, 0.15263030073739525, 2.6803283723840794, 'ZXY').rotateVector([2, 3, 5]), [-3.20584858956951, -2.05153215544622, -4.84909791981203]) });
  it('Should fuzz 74# ZXY', function() { assert.v(Quaternion.fromEuler(-0.5876563761701172, 1.1771347099068565, 0.10783926539382138, 'ZXY').rotateVector([2, 3, 5]), [0.305718347319343, -4.09821888350146, 4.59468587337854]) });
  it('Should fuzz 75# ZXY', function() { assert.v(Quaternion.fromEuler(1.1900959226627474, -1.4847205252989624, 0.8783598904514509, 'ZXY').rotateVector([2, 3, 5]), [0.136284782397869, 5.46599345653583, -2.84681260205063]) });
  it('Should fuzz 76# ZXY', function() { assert.v(Quaternion.fromEuler(-0.16280356443914057, 2.4746190209891, -3.0207745960300234, 'ZXY').rotateVector([2, 3, 5]), [-2.46235531258465, 0.976322100494893, 5.56629153662215]) });
  it('Should fuzz 77# ZXY', function() { assert.v(Quaternion.fromEuler(0.9315292648802185, -2.818896318951217, 0.0334394272072398, 'ZXY').rotateVector([2, 3, 5]), [2.32082161003007, 0.973702402150209, -5.62722761992656]) });
  it('Should fuzz 78# ZXY', function() { assert.v(Quaternion.fromEuler(1.9264747416645802, 2.990323789440171, 0.3006429834931543, 'ZXY').rotateVector([2, 3, 5]), [2.19025364425144, 4.43100318787258, -3.68361231984398]) });
  it('Should fuzz 79# ZXY', function() { assert.v(Quaternion.fromEuler(-2.280212873654684, 1.0159614539521264, 0.8918975199016543, 'ZXY').rotateVector([2, 3, 5]), [-3.17472424396201, -4.05830764883655, 3.38397177916639]) });
  it('Should fuzz 80# ZXY', function() { assert.v(Quaternion.fromEuler(0.33908549763069074, -0.14490001480257853, 2.053623460506836, 'ZXY').rotateVector([2, 3, 5]), [2.50973006579896, 3.40634622883092, -4.48308603153610]) });
  it('Should fuzz 81# ZXY', function() { assert.v(Quaternion.fromEuler(2.949151067963969, 2.7646181243133583, -1.365193747647213, 'ZXY').rotateVector([2, 3, 5]), [5.14674526106856, 2.95604252198297, -1.66518041842225]) });
  it('Should fuzz 82# ZXY', function() { assert.v(Quaternion.fromEuler(-1.1820175674957638, 2.865149931164546, -1.7055042517561114, 'ZXY').rotateVector([2, 3, 5]), [-4.98161171937754, 3.60393399782113, -0.441819439035133]) });
  it('Should fuzz 83# ZXY', function() { assert.v(Quaternion.fromEuler(2.411122171918696, 2.353189127622601, -0.34827328676222, 'ZXY').rotateVector([2, 3, 5]), [3.82885583443706, 4.53450660537839, -1.66676718376534]) });
  it('Should fuzz 84# ZXY', function() { assert.v(Quaternion.fromEuler(2.114845610175461, 2.730758983607396, -0.05783379104760655, 'ZXY').rotateVector([2, 3, 5]), [3.21458606833734, 3.94045804120998, -3.48413932481396]) });
  it('Should fuzz 85# ZXY', function() { assert.v(Quaternion.fromEuler(1.762985953035197, 2.7416779884151072, -2.878479729202785, 'ZXY').rotateVector([2, 3, 5]), [1.68337257879557, -2.96465346538243, 5.13586278936219]) });
  it('Should fuzz 86# ZXY', function() { assert.v(Quaternion.fromEuler(-1.0876357820335074, -2.6933210067476963, -1.0530209290832961, 'ZXY').rotateVector([2, 3, 5]), [-2.33587250547767, 2.56288594587645, -5.09659840154023]) });
  it('Should fuzz 87# ZXY', function() { assert.v(Quaternion.fromEuler(1.8191660199712558, 2.3880533945494573, 2.4547935365210085, 'ZXY').rotateVector([2, 3, 5]), [-1.68384450033068, 1.24813755413525, 5.79713897924342]) });
  it('Should fuzz 88# ZXY', function() { assert.v(Quaternion.fromEuler(-0.5035438625218056, 2.152803997400772, -2.1158966959426833, 'ZXY').rotateVector([2, 3, 5]), [-5.09307509596176, 1.76458868546641, 2.99112233752116]) });
  it('Should fuzz 89# ZXY', function() { assert.v(Quaternion.fromEuler(1.4646421178738889, -1.3619904071849982, -1.4892635611182108, 'ZXY').rotateVector([2, 3, 5]), [-3.46433806413556, -4.47865217128551, -2.43721901068021]) });
  it('Should fuzz 90# ZXY', function() { assert.v(Quaternion.fromEuler(0.8184623091610703, 0.08884313676373212, 0.2634738212993053, 'ZXY').rotateVector([2, 3, 5]), [0.306689956209446, 4.14135658211196, 4.55577731353917]) });
  it('Should fuzz 91# ZXY', function() { assert.v(Quaternion.fromEuler(-2.869140131153739, -0.3933702979582301, -1.8759662308070548, 'ZXY').rotateVector([2, 3, 5]), [5.95924621739209, -1.37328220017800, -0.775551751446881]) });
  it('Should fuzz 92# ZXY', function() { assert.v(Quaternion.fromEuler(-2.0289100267109124, -0.29651513625216097, 2.468702442907597, 'ZXY').rotateVector([2, 3, 5]), [0.535427464143144, -1.99466680685201, -5.80815132036727]) });
  it('Should fuzz 93# ZXY', function() { assert.v(Quaternion.fromEuler(1.660213774015312, -0.680414339412982, -1.3915803815465246, 'ZXY').rotateVector([2, 3, 5]), [-3.70673210092454, -4.91403952022047, 0.335190581142929]) });
  it('Should fuzz 94# ZXY', function() { assert.v(Quaternion.fromEuler(0.8908023096027851, 1.6216950368894336, -2.1056761460893574, 'ZXY').rotateVector([2, 3, 5]), [-3.87020134074515, -3.71357319608600, 3.03824220552049]) });
  it('Should fuzz 95# ZXY', function() { assert.v(Quaternion.fromEuler(2.1845617487861686, 1.5498017786134604, -1.2553116428344921, 'ZXY').rotateVector([2, 3, 5]), [5.15062047684585, -1.42654289695868, 3.07182096917007]) });
  it('Should fuzz 96# ZXY', function() { assert.v(Quaternion.fromEuler(-2.121465671458961, -0.04114144766585914, 2.703005669989728, 'ZXY').rotateVector([2, 3, 5]), [2.20236019552216, -1.71913134319096, -5.49492465772171]) });
  it('Should fuzz 97# ZXY', function() { assert.v(Quaternion.fromEuler(2.3660442450237156, -1.5525196677397084, -1.8455182666304952, 'ZXY').rotateVector([2, 3, 5]), [3.38731055116108, -4.19420606594702, -2.98910734273062]) });
  it('Should fuzz 98# ZXY', function() { assert.v(Quaternion.fromEuler(-1.5834531503750122, -2.77363611723799, 1.847094873115969, 'ZXY').rotateVector([2, 3, 5]), [-4.03562115529171, -4.21402667499642, 1.98890449076386]) });
  it('Should fuzz 99# ZXY', function() { assert.v(Quaternion.fromEuler(-2.9859504690264984, -2.2129395219529266, -1.9856259879579112, 'ZXY').rotateVector([2, 3, 5]), [5.01547504356516, 2.75550968893390, -2.29176273675231]) });
  it('Should fuzz 100# XYZ', function() { assert.v(Quaternion.fromEuler(1.7368679959967572, -2.9984643494424414, -0.5863256995713235, 'XYZ').rotateVector([2, 3, 5]), [-4.00506336874312, 4.18274451316190, 2.11284541553944]) });
  it('Should fuzz 101# XYZ', function() { assert.v(Quaternion.fromEuler(-0.3329734494684482, -0.9786703900159193, 1.6903679221182122, 'XYZ').rotateVector([2, 3, 5]), [-5.94435787409080, 1.57805627783704, -0.417549815846999]) });
  it('Should fuzz 102# XYZ', function() { assert.v(Quaternion.fromEuler(-2.4730971749067376, -2.5602057002520517, -0.36591053467101187, 'XYZ').rotateVector([2, 3, 5]), [-5.20371310367051, -3.22562608389334, 0.718822858286196]) });
  it('Should fuzz 103# XYZ', function() { assert.v(Quaternion.fromEuler(2.5979487622078272, -1.8242929625739712, 2.935636688379403, 'XYZ').rotateVector([2, 3, 5]), [-4.19536462418661, 4.09929439197332, 1.89596971443628]) });
  it('Should fuzz 104# XYZ', function() { assert.v(Quaternion.fromEuler(2.710678164003398, 2.205556479654592, 2.054694398057457, 'XYZ').rotateVector([2, 3, 5]), [6.15253010525126, -0.308095113846526, 0.226827478055163]) });
  it('Should fuzz 105# XYZ', function() { assert.v(Quaternion.fromEuler(-1.3496927969636376, -1.1026224650513043, -0.0594490015216973, 'XYZ').rotateVector([2, 3, 5]), [-3.48061570987999, 4.72550979783212, -1.88543666844826]) });
  it('Should fuzz 106# XYZ', function() { assert.v(Quaternion.fromEuler(-0.46335342031213766, 3.0524058758259427, -0.4280831633095632, 'XYZ').rotateVector([2, 3, 5]), [-2.60738496003823, -0.649084452072119, -5.54799360528153]) });
  it('Should fuzz 107# XYZ', function() { assert.v(Quaternion.fromEuler(-0.548287375026244, -2.6546411123852907, -0.7230893888395862, 'XYZ').rotateVector([2, 3, 5]), [-5.41926941538940, -0.663132616199000, -2.86212755424319]) });
  it('Should fuzz 108# XYZ', function() { assert.v(Quaternion.fromEuler(0.8764292303295225, 0.810969930568302, 1.6610833270964305, 'XYZ').rotateVector([2, 3, 5]), [1.44259813880688, -3.31000723939349, 4.99627488085610]) });
  it('Should fuzz 109# XYZ', function() { assert.v(Quaternion.fromEuler(2.903630773879617, 1.5705593262896889, -0.8116698052841769, 'XYZ').rotateVector([2, 3, 5]), [5.00084189595839, 0.240528955188401, 3.59634900327308]) });
  it('Should fuzz 110# XYZ', function() { assert.v(Quaternion.fromEuler(0.7302615760441746, -2.6607975972887714, -0.13442674105677677, 'XYZ').rotateVector([2, 3, 5]), [-4.42616190036817, 4.23684453687614, -0.676933676272642]) });
  it('Should fuzz 111# XYZ', function() { assert.v(Quaternion.fromEuler(-1.619731739279386, 0.30148569379877177, 1.3578248558064452, 'XYZ').rotateVector([2, 3, 5]), [-0.911607947010136, 5.38640187956807, -2.85580912225126]) });
  it('Should fuzz 112# XYZ', function() { assert.v(Quaternion.fromEuler(-2.9698274392942365, 1.3265897425983049, 0.28760038470102556, 'XYZ').rotateVector([2, 3, 5]), [5.10960904940691, -3.36371738354246, -0.759803083616604]) });
  it('Should fuzz 113# XYZ', function() { assert.v(Quaternion.fromEuler(-1.442810023572527, 0.23183344301873765, -1.8026546389853988, 'XYZ').rotateVector([2, 3, 5]), [3.54314472682124, 3.92937466371463, 3.16324836156702]) });
  it('Should fuzz 114# XYZ', function() { assert.v(Quaternion.fromEuler(2.3875405052679897, -0.18833009017370106, -0.8478311246171271, 'XYZ').rotateVector([2, 3, 5]), [2.57349709712249, -4.17401321942192, -3.73560253977764]) });
  it('Should fuzz 115# XYZ', function() { assert.v(Quaternion.fromEuler(-1.25341400108395, 1.6456202669455697, -1.4023031180919427, 'XYZ').rotateVector([2, 3, 5]), [4.73985132331947, -3.93311431303571, 0.253813383059830]) });
  it('Should fuzz 116# XYZ', function() { assert.v(Quaternion.fromEuler(2.7302018663797725, -0.23234031066482563, -0.2355667867862854, 'XYZ').rotateVector([2, 3, 5]), [1.42259978151851, -4.43514740052623, -4.03802889999922]) });
  it('Should fuzz 117# XYZ', function() { assert.v(Quaternion.fromEuler(0.25986158952814087, 1.324646639438246, 2.1158190515037107, 'XYZ').rotateVector([2, 3, 5]), [3.97153029731992, -1.06101622169927, 4.59360334321118]) });
  it('Should fuzz 118# XYZ', function() { assert.v(Quaternion.fromEuler(2.3427670005044368, 2.409050666220044, 2.86207621180871, 'XYZ').rotateVector([2, 3, 5]), [5.38840738585258, 2.97237397943554, -0.360636618306914]) });
  it('Should fuzz 119# XYZ', function() { assert.v(Quaternion.fromEuler(2.4775076032480383, 0.08717262719895258, -1.8226344148302138, 'XYZ').rotateVector([2, 3, 5]), [2.83317076791173, -0.826867914480388, -5.41197125379037]) });
  it('Should fuzz 120# XYZ', function() { assert.v(Quaternion.fromEuler(0.14737700028874734, -1.7676798945978174, 0.34758989533198514, 'XYZ').rotateVector([2, 3, 5]), [-5.07133834572931, 3.48388801491250, 0.379541411027191]) });
  it('Should fuzz 121# XYZ', function() { assert.v(Quaternion.fromEuler(1.9727178567596093, 0.12882024317122998, 2.3138264359990757, 'XYZ').rotateVector([2, 3, 5]), [-2.89047286130469, -4.76680560392818, -2.63110831636024]) });
  it('Should fuzz 122# XYZ', function() { assert.v(Quaternion.fromEuler(-2.396504754052767, 0.9056156328686962, 1.6438170850833576, 'XYZ').rotateVector([2, 3, 5]), [1.99729970290446, 2.46118397870161, -5.28709441184478]) });
  it('Should fuzz 123# XYZ', function() { assert.v(Quaternion.fromEuler(1.657772212518477, 1.6452917828693412, 3.0847832315765604, 'XYZ').rotateVector([2, 3, 5]), [5.14742306390837, -1.53189042797456, -3.02611095596710]) });
  it('Should fuzz 124# XYZ', function() { assert.v(Quaternion.fromEuler(2.080185466907615, -1.0853788049374118, 1.3571724859844734, 'XYZ').rotateVector([2, 3, 5]), [-5.59248542486814, -1.36347881229294, 2.20568182226395]) });
  it('Should fuzz 125# XYZ', function() { assert.v(Quaternion.fromEuler(1.704115965049243, -2.2204605168984086, 2.504715323052637, 'XYZ').rotateVector([2, 3, 5]), [-1.92956347728228, 5.83727410556113, -0.450572750711559]) });
  it('Should fuzz 126# XYZ', function() { assert.v(Quaternion.fromEuler(1.1949606076192794, 0.4208440729059433, 1.3572428247402426, 'XYZ').rotateVector([2, 3, 5]), [-0.246493254609567, -4.24745853529723, 4.46075521255792]) });
  it('Should fuzz 127# XYZ', function() { assert.v(Quaternion.fromEuler(2.750196507778548, 1.606417119314898, -0.0914963328793088, 'XYZ').rotateVector([2, 3, 5]), [4.91613782973817, -1.66090055050098, 3.32761148579020]) });
  it('Should fuzz 128# XYZ', function() { assert.v(Quaternion.fromEuler(0.4331452681018768, 0.3935787649092424, -3.1199481360815238, 'XYZ').rotateVector([2, 3, 5]), [0.130791822180876, -5.01118371871588, 3.58760801043362]) });
  it('Should fuzz 129# XYZ', function() { assert.v(Quaternion.fromEuler(-0.012868633938987628, -0.7429559975051583, -0.029320790241341932, 'XYZ').rotateVector([2, 3, 5]), [-1.84525563729211, 3.00538762925293, 5.05595459146689]) });
  it('Should fuzz 130# XYZ', function() { assert.v(Quaternion.fromEuler(1.5426691505910997, 1.1345984212765803, 0.38702393557866754, 'XYZ').rotateVector([2, 3, 5]), [4.83592334998855, -1.36017068974136, 3.57264342578489]) });
  it('Should fuzz 131# XYZ', function() { assert.v(Quaternion.fromEuler(-2.5646651106791225, 1.237083614785984, -2.147314456738627, 'XYZ').rotateVector([2, 3, 5]), [5.19088797329282, 2.93496936523094, 1.56225378024183]) });
  it('Should fuzz 132# XYZ', function() { assert.v(Quaternion.fromEuler(-0.6100974489884132, -0.42539953156535004, -2.6240692134668007, 'XYZ').rotateVector([2, 3, 5]), [-2.29469996125960, -0.398366563292126, 5.70750875330437]) });
  it('Should fuzz 133# XYZ', function() { assert.v(Quaternion.fromEuler(-0.07676403530014309, 1.249106441892886, -1.4686939248232382, 'XYZ').rotateVector([2, 3, 5]), [5.75153462157334, -1.78957539144530, -1.31044626565786]) });
  it('Should fuzz 134# XYZ', function() { assert.v(Quaternion.fromEuler(0.08793925223642063, 1.2876537857325259, 0.21104421790867267, 'XYZ').rotateVector([2, 3, 5]), [5.17169195891830, 3.32868422450179, 0.416489634460186]) });
  it('Should fuzz 135# XYZ', function() { assert.v(Quaternion.fromEuler(-3.0926887208984364, -3.1112260230230504, -2.337656131245838, 'XYZ').rotateVector([2, 3, 5]), [-0.923978182535126, 3.27444508174083, 5.14045462239113]) });
  it('Should fuzz 136# XYZ', function() { assert.v(Quaternion.fromEuler(2.062384385039227, -2.602741144490044, -0.9669357592273573, 'XYZ').rotateVector([2, 3, 5]), [-5.66000340452714, 2.12543118790330, 1.20287311310427]) });
  it('Should fuzz 137# XYZ', function() { assert.v(Quaternion.fromEuler(1.674617750912076, 1.4203032670511089, 2.5858780436289495, 'XYZ').rotateVector([2, 3, 5]), [4.45147558430902, -3.81795176445956, -1.89937080280833]) });
  it('Should fuzz 138# XYZ', function() { assert.v(Quaternion.fromEuler(1.8542668712562458, 1.7707506550390457, -1.6978287296568315, 'XYZ').rotateVector([2, 3, 5]), [4.35963385673847, 4.17637686981302, -1.24557973509143]) });
  it('Should fuzz 139# XYZ', function() { assert.v(Quaternion.fromEuler(2.264278257670223, 1.6526196165732285, 1.809516607458769, 'XYZ').rotateVector([2, 3, 5]), [5.26016694789267, -3.07108432143601, -0.948200807280562]) });
  it('Should fuzz 140# XYZ', function() { assert.v(Quaternion.fromEuler(-1.4577032335348719, 0.2807361658364811, 2.8744609524765403, 'XYZ').rotateVector([2, 3, 5]), [-1.22912558605257, 5.25565984956163, 2.97779949617443]) });
  it('Should fuzz 141# XYZ', function() { assert.v(Quaternion.fromEuler(-2.1932009566341555, 0.000643071409868412, -1.4314210455635452, 'XYZ').rotateVector([2, 3, 5]), [3.25197258150051, 4.97239598058525, -1.64315323126864]) });
  it('Should fuzz 142# XYZ', function() { assert.v(Quaternion.fromEuler(-1.8604736201551662, -0.3058669527708626, 2.0929293746683237, 'XYZ').rotateVector([2, 3, 5]), [-4.93634800668453, 3.46327805278177, -1.27991151491880]) });
  it('Should fuzz 143# XYZ', function() { assert.v(Quaternion.fromEuler(0.6590186072496449, 2.493330723379751, -2.792541175456367, 'XYZ').rotateVector([2, 3, 5]), [3.69926395540307, -0.644462133813400, -4.88877436034189]) });
  it('Should fuzz 144# XYZ', function() { assert.v(Quaternion.fromEuler(2.6762204195765147, -3.0470598265266142, -1.9989660884749336, 'XYZ').rotateVector([2, 3, 5]), [-2.36225128201438, 4.89244657501167, 2.91268525441353]) });
  it('Should fuzz 145# XYZ', function() { assert.v(Quaternion.fromEuler(-2.231680931528527, -2.3188693287622266, 1.1088795806766312, 'XYZ').rotateVector([2, 3, 5]), [-2.44449316896731, -5.64295501597815, 0.426042057218785]) });
  it('Should fuzz 146# XYZ', function() { assert.v(Quaternion.fromEuler(0.10153398344480857, 2.1667388442058266, 1.1102365616606775, 'XYZ').rotateVector([2, 3, 5]), [5.14758447956347, 3.24245056146149, -0.994428671265741]) });
  it('Should fuzz 147# XYZ', function() { assert.v(Quaternion.fromEuler(2.1999104295124994, -2.9475188277047217, -2.6138264503852424, 'XYZ').rotateVector([2, 3, 5]), [-0.751309861126015, 6.11845822468357, 0.00156377005500197]) });
  it('Should fuzz 148# XYZ', function() { assert.v(Quaternion.fromEuler(0.8991731269017551, -2.86475121602268, 1.7617082446105563, 'XYZ').rotateVector([2, 3, 5]), [1.83180545248643, 5.34411442862926, -2.46676503906584]) });
  it('Should fuzz 149# XYZ', function() { assert.v(Quaternion.fromEuler(-1.7293210517626632, 2.9469214267709933, 1.0848176041913549, 'XYZ').rotateVector([2, 3, 5]), [2.65326632653652, -5.01614793640709, -2.40799453499096]) });
  it('Should fuzz 150# XYZ', function() { assert.v(Quaternion.fromEuler(-0.1973746713427178, 1.8701873334546342, 0.7075343715383005, 'XYZ').rotateVector([2, 3, 5]), [4.90439085239369, 3.30170168922412, -1.74519807538620]) });
  it('Should fuzz 151# XYZ', function() { assert.v(Quaternion.fromEuler(0.26255405165922374, -2.3069928961545854, -1.4365875087357154, 'XYZ').rotateVector([2, 3, 5]), [-5.88114236012284, -1.27830923355100, -1.33345042779514]) });
  it('Should fuzz 152# XYZ', function() { assert.v(Quaternion.fromEuler(0.1377458649754173, 2.45482566116013, -1.8178851807741307, 'XYZ').rotateVector([2, 3, 5]), [1.29903197399532, -1.90611141287932, -5.71657722874703]) });
  it('Should fuzz 153# XYZ', function() { assert.v(Quaternion.fromEuler(2.731631933602622, -1.9323475653202475, -2.3854568004379737, 'XYZ').rotateVector([2, 3, 5]), [-4.89017039617410, 3.74014503920069, -0.312327683891386]) });
  it('Should fuzz 154# XYZ', function() { assert.v(Quaternion.fromEuler(0.609070539869021, 0.5847251892553613, -1.094513757128294, 'XYZ').rotateVector([2, 3, 5]), [5.74764659935948, -1.58350024654528, 1.56750934225682]) });
  it('Should fuzz 155# XYZ', function() { assert.v(Quaternion.fromEuler(-0.5791254937227714, -1.2198788656126716, -2.004011420150813, 'XYZ').rotateVector([2, 3, 5]), [-4.04789314136060, -0.664697210804548, 4.60138443667495]) });
  it('Should fuzz 156# XYZ', function() { assert.v(Quaternion.fromEuler(-0.04215540284647723, 1.8706521315486935, 2.6304257144940317, 'XYZ').rotateVector([2, 3, 5]), [5.72564454901369, -1.56959768090018, 1.65932444641262]) });
  it('Should fuzz 157# XYZ', function() { assert.v(Quaternion.fromEuler(2.570944574425498, -2.468119492631211, -2.385652996867338, 'XYZ').rotateVector([2, 3, 5]), [-3.58960092353411, 4.89970095229043, 1.05247127651413]) });
  it('Should fuzz 158# XYZ', function() { assert.v(Quaternion.fromEuler(2.311566277365703, -1.631588648709697, 0.6057034303427558, 'XYZ').rotateVector([2, 3, 5]), [-4.98688632965192, -2.16167034522704, 2.90828919705328]) });
  it('Should fuzz 159# XYZ', function() { assert.v(Quaternion.fromEuler(-2.6891027675447203, 2.2208715332118354, 0.04029601194529775, 'XYZ').rotateVector([2, 3, 5]), [2.84382874351047, -4.74488155495792, 2.72006196749334]) });
  it('Should fuzz 160# XYZ', function() { assert.v(Quaternion.fromEuler(2.233650669789961, -1.2810944423901724, -1.238326005631529, 'XYZ').rotateVector([2, 3, 5]), [-3.79510478872371, -3.20022371251089, -3.65455165957322]) });
  it('Should fuzz 161# XYZ', function() { assert.v(Quaternion.fromEuler(-2.619589738010177, 1.397923611846954, 2.819469078895505, 'XYZ').rotateVector([2, 3, 5]), [4.43577399955354, 3.74505884009467, -2.07326874985215]) });
  it('Should fuzz 162# XYZ', function() { assert.v(Quaternion.fromEuler(0.406722028845381, 1.8999619915951085, -2.192971545862437, 'XYZ').rotateVector([2, 3, 5]), [4.32030905584003, -1.98275335734778, -3.92474442301059]) });
  it('Should fuzz 163# XYZ', function() { assert.v(Quaternion.fromEuler(2.6619710805433305, -1.9150491275396755, 2.2468493297108036, 'XYZ').rotateVector([2, 3, 5]), [-3.49450364284474, 2.62003161902688, 4.35015845750982]) });
  it('Should fuzz 164# XYZ', function() { assert.v(Quaternion.fromEuler(2.6351805949126588, 1.7096680411857106, -1.075088385361926, 'XYZ').rotateVector([2, 3, 5]), [4.45488704538649, 2.35094445030163, 3.55345488284902]) });
  it('Should fuzz 165# XYZ', function() { assert.v(Quaternion.fromEuler(0.5710009474391811, -3.0713913729346465, 1.0051677724021095, 'XYZ').rotateVector([2, 3, 5]), [1.10654611085704, 5.52451165290706, -2.50106511339495]) });
  it('Should fuzz 166# XYZ', function() { assert.v(Quaternion.fromEuler(-0.2951081617585385, 0.5440605240585796, -2.6259916800565577, 'XYZ').rotateVector([2, 3, 5]), [2.36491140766057, -2.15713497556507, 5.26820298879142]) });
  it('Should fuzz 167# XYZ', function() { assert.v(Quaternion.fromEuler(0.6516863901680807, 1.7371191496485023, 0.9064053876765588, 'XYZ').rotateVector([2, 3, 5]), [5.11786828024239, 2.54947349414216, 2.30382489976027]) });
  it('Should fuzz 168# XYZ', function() { assert.v(Quaternion.fromEuler(1.9279630002446844, 1.7018315449084547, -0.05060282316173437, 'XYZ').rotateVector([2, 3, 5]), [4.67632229158489, 1.59621066330666, 3.68566430152996]) });
  it('Should fuzz 169# XYZ', function() { assert.v(Quaternion.fromEuler(2.1944401676188967, 2.251371205265454, -1.9661189119039004, 'XYZ').rotateVector([2, 3, 5]), [2.62857912919782, 5.56736257214196, 0.308294910529614]) });
  it('Should fuzz 170# XYZ', function() { assert.v(Quaternion.fromEuler(-2.035233991361551, 1.2040142478270885, -2.9765461268184885, 'XYZ').rotateVector([2, 3, 5]), [4.13670925580598, 4.31097315320843, 1.51761227105124]) });
  it('Should fuzz 171# XYZ', function() { assert.v(Quaternion.fromEuler(-0.49427960803435855, -1.6848110333951314, 1.5175841757251645, 'XYZ').rotateVector([2, 3, 5]), [-4.63881830651987, 0.266921518042336, -4.05094033803290]) });
  it('Should fuzz 172# XYZ', function() { assert.v(Quaternion.fromEuler(-2.00336075225958, -2.4658636674351664, 0.8713225225803161, 'XYZ').rotateVector([2, 3, 5]), [-2.34090611199434, -5.56546730187601, -1.24327482343064]) });
  it('Should fuzz 173# XYZ', function() { assert.v(Quaternion.fromEuler(-2.030950743369564, 1.9127917836685242, -2.939260513630939, 'XYZ').rotateVector([2, 3, 5]), [5.16530849262478, 1.12602239504531, 3.17043557604862]) });
  it('Should fuzz 174# XYZ', function() { assert.v(Quaternion.fromEuler(0.43110779219417417, 0.048618041002517653, -0.29597083492813114, 'XYZ').rotateVector([2, 3, 5]), [3.02774472119841, 0.0467416760461079, 5.36941124509713]) });
  it('Should fuzz 175# XYZ', function() { assert.v(Quaternion.fromEuler(2.42431823776918, 0.745860151932451, 0.8939139505311857, 'XYZ').rotateVector([2, 3, 5]), [2.59545296705796, -5.48943193677096, -1.06290211560096]) });
  it('Should fuzz 176# XYZ', function() { assert.v(Quaternion.fromEuler(-0.7692898329512912, 3.0363714492092004, -1.581535693136046, 'XYZ').rotateVector([2, 3, 5]), [-2.43674072860092, -5.13635868556279, -2.38329898980827]) });
  it('Should fuzz 177# XYZ', function() { assert.v(Quaternion.fromEuler(-1.7480893261889123, 0.9157212685250125, -1.1412739632329, 'XYZ').rotateVector([2, 3, 5]), [6.13405369854636, 0.319579001230039, 0.520820972429584]) });
  it('Should fuzz 178# XYZ', function() { assert.v(Quaternion.fromEuler(-1.2529692558437988, 0.46286429840883647, -1.832003122410504, 'XYZ').rotateVector([2, 3, 5]), [4.36369440881299, 2.39368823418095, 3.63709056032951]) });
  it('Should fuzz 179# XYZ', function() { assert.v(Quaternion.fromEuler(-1.0936499086170879, 1.5981710591910492, 0.9975839981368706, 'XYZ').rotateVector([2, 3, 5]), [5.03742701205479, 2.67228242379119, -2.34163100118645]) });
  it('Should fuzz 180# XYZ', function() { assert.v(Quaternion.fromEuler(-0.5517727252813942, 1.1445152136653256, -2.1357978019131245, 'XYZ').rotateVector([2, 3, 5]), [5.15745188873781, -2.42086537860170, 2.35374187923026]) });
  it('Should fuzz 181# XYZ', function() { assert.v(Quaternion.fromEuler(1.995797161097836, -1.5311070189546836, 2.969767041782748, 'XYZ').rotateVector([2, 3, 5]), [-5.09460464073167, 3.15778116375381, -1.43993808077880]) });
  it('Should fuzz 182# XYZ', function() { assert.v(Quaternion.fromEuler(-0.4138768409370508, 1.3088595167565877, 1.2462733328163198, 'XYZ').rotateVector([2, 3, 5]), [4.25828250267225, 3.98885501128160, 1.98898613027063]) });
  it('Should fuzz 183# XYZ', function() { assert.v(Quaternion.fromEuler(2.736282033312973, 2.1605328340101098, -3.1388417050427773, 'XYZ').rotateVector([2, 3, 5]), [5.26312639281447, 3.20573592344840, -0.150856761108549]) });
  it('Should fuzz 184# XYZ', function() { assert.v(Quaternion.fromEuler(-0.8564861711271292, 3.111764034433431, 2.2179496218945864, 'XYZ').rotateVector([2, 3, 5]), [3.74676544594036, -3.83457397888146, -3.04266184345098]) });
  it('Should fuzz 185# XYZ', function() { assert.v(Quaternion.fromEuler(3.0680657409356114, 1.8655969056619437, 2.1838113896908293, 'XYZ').rotateVector([2, 3, 5]), [5.83156228755899, -0.0567103612538039, -1.99741463428258]) });
  it('Should fuzz 186# XYZ', function() { assert.v(Quaternion.fromEuler(2.403546517354723, -2.48866980952445, -2.9723137828939583, 'XYZ').rotateVector([2, 3, 5]), [-1.87309386063311, 5.70837578463149, 1.38056701781963]) });
  it('Should fuzz 187# XYZ', function() { assert.v(Quaternion.fromEuler(1.5484053019977138, 2.146485717756603, -0.8347629841802586, 'XYZ').rotateVector([2, 3, 5]), [2.25264373206943, 5.72386189888138, 0.403734044765031]) });
  it('Should fuzz 188# XYZ', function() { assert.v(Quaternion.fromEuler(-3.124137765506043, -1.7832531357647183, -2.8833743968711625, 'XYZ').rotateVector([2, 3, 5]), [-4.64137267158571, 3.37241308468603, 2.25488130723011]) });
  it('Should fuzz 189# XYZ', function() { assert.v(Quaternion.fromEuler(-2.3448423781390475, 1.8115403414690192, -2.6621948178054433, 'XYZ').rotateVector([2, 3, 5]), [4.94898340547435, 1.92448352821338, 3.13112222724934]) });
  it('Should fuzz 190# XYZ', function() { assert.v(Quaternion.fromEuler(1.901694817053734, 2.7091801143789853, 2.6327374755265156, 'XYZ').rotateVector([2, 3, 5]), [5.00816601506974, 3.55665807398999, -0.518127889832519]) });
  it('Should fuzz 191# XYZ', function() { assert.v(Quaternion.fromEuler(2.900355279701853, 2.974216099632196, 1.6623075410842683, 'XYZ').rotateVector([2, 3, 5]), [3.95889204214394, -0.616095670103574, 4.68482656284403]) });
  it('Should fuzz 192# XYZ', function() { assert.v(Quaternion.fromEuler(-2.0281641301406745, 1.6479048835331467, -1.3699844112976653, 'XYZ').rotateVector([2, 3, 5]), [4.72795998758995, -2.73098006024521, 2.86149301349688]) });
  it('Should fuzz 193# XYZ', function() { assert.v(Quaternion.fromEuler(0.9757450062105208, 0.633061882817306, 0.8920540044020111, 'XYZ').rotateVector([2, 3, 5]), [2.08779866532185, -1.93869985582023, 5.46649244050725]) });
  it('Should fuzz 194# XYZ', function() { assert.v(Quaternion.fromEuler(-1.5692115481971445, 1.4626689881971346, -2.6793793116789675, 'XYZ').rotateVector([2, 3, 5]), [4.92198410474262, 0.983616538396318, 3.57862696827347]) });
  it('Should fuzz 195# XYZ', function() { assert.v(Quaternion.fromEuler(2.711320784870006, 1.633957347995775, 2.209975675312064, 'XYZ').rotateVector([2, 3, 5]), [5.21731098843261, -1.19970706434474, -3.05620172922890]) });
  it('Should fuzz 196# XYZ', function() { assert.v(Quaternion.fromEuler(-3.043784603635529, 2.714992156783622, -0.3476289817846858, 'XYZ').rotateVector([2, 3, 5]), [-0.573365402295817, -2.69076219221110, 5.51643462214658]) });
  it('Should fuzz 197# XYZ', function() { assert.v(Quaternion.fromEuler(0.4404056791045319, 2.4857702895449245, 1.7165158352900054, 'XYZ').rotateVector([2, 3, 5]), [5.63165966854906, 2.23814588863585, -1.12920873128945]) });
  it('Should fuzz 198# XYZ', function() { assert.v(Quaternion.fromEuler(-0.8719427094795709, 1.8665312056683305, 2.8798881371994627, 'XYZ').rotateVector([2, 3, 5]), [5.57219269499949, -0.663768816593756, 2.55148574911011]) });
  it('Should fuzz 199# XYZ', function() { assert.v(Quaternion.fromEuler(0.08629119618934666, 1.7011825659596465, 2.1828828466580887, 'XYZ').rotateVector([2, 3, 5]), [5.42620616857709, -0.338491622992978, 2.90546210391042]) });
  it('Should fuzz 200# YXZ', function() { assert.v(Quaternion.fromEuler(-0.4765703400182413, 0.5785636989879035, 0.902956299533967, 'YXZ').rotateVector([2, 3, 5]), [-3.77277191749973, 0.136144264044790, 4.87315675901085]) });
  it('Should fuzz 201# YXZ', function() { assert.v(Quaternion.fromEuler(1.229769731626603, -2.0608359682066055, -2.7099877879225738, 'YXZ').rotateVector([2, 3, 5]), [0.555823375683926, 6.08785073483531, 0.793179554330891]) });
  it('Should fuzz 202# YXZ', function() { assert.v(Quaternion.fromEuler(0.197760649824692, -2.6819257949356574, 0.9306751132661537, 'YXZ').rotateVector([2, 3, 5]), [-2.36428063014226, -0.825181049427274, -5.63287256536132]) });
  it('Should fuzz 203# YXZ', function() { assert.v(Quaternion.fromEuler(2.7748069986559125, 0.2149622563907183, -2.3173519244932783, 'YXZ').rotateVector([2, 3, 5]), [0.695924512531629, -4.49128205230247, -4.16462178349047]) });
  it('Should fuzz 204# YXZ', function() { assert.v(Quaternion.fromEuler(1.9946900818827578, 0.4847958992855892, -2.59690800342681, 'YXZ').rotateVector([2, 3, 5]), [2.56639991154109, -5.51723029947284, -0.986793451853365]) });
  it('Should fuzz 205# YXZ', function() { assert.v(Quaternion.fromEuler(-2.02305178889919, -1.1994191611651226, -1.8724281406460914, 'YXZ').rotateVector([2, 3, 5]), [-4.97182595580561, 3.64268300172091, 0.108661005660800]) });
  it('Should fuzz 206# YXZ', function() { assert.v(Quaternion.fromEuler(-2.6569753209313918, 0.10265235953947549, 2.4981777112146712, 'YXZ').rotateVector([2, 3, 5]), [0.748623129852677, -1.70633532092011, -5.87605166604498]) });
  it('Should fuzz 207# YXZ', function() { assert.v(Quaternion.fromEuler(0.27232821692530695, -2.6879786200457056, 2.8317312488047346, 'YXZ').rotateVector([2, 3, 5]), [-3.65960463109698, 4.21109035513079, -2.62183370276950]) });
  it('Should fuzz 208# YXZ', function() { assert.v(Quaternion.fromEuler(-2.573089664363896, 2.087031268358495, 1.5930548937937559, 'YXZ').rotateVector([2, 3, 5]), [2.98880328621701, -5.30243457650877, -0.975316604053605]) });
  it('Should fuzz 209# YXZ', function() { assert.v(Quaternion.fromEuler(-1.7365507770538076, -2.4674334862494085, -0.6571124557758066, 'YXZ').rotateVector([2, 3, 5]), [3.99925361877173, 2.21996476651068, 4.13252065066739]) });
  it('Should fuzz 210# YXZ', function() { assert.v(Quaternion.fromEuler(-2.747764079826952, 1.2754937115585996, -3.064786645150873, 'YXZ').rotateVector([2, 3, 5]), [2.22494162848432, -5.69874640997057, 0.757577787877322]) });
  it('Should fuzz 211# YXZ', function() { assert.v(Quaternion.fromEuler(0.7751841940343738, -2.4078182721659966, -3.111286992114043, 'YXZ').rotateVector([2, 3, 5]), [-2.52794007791352, 5.62032669262314, 0.146447364832508]) });
  it('Should fuzz 212# YXZ', function() { assert.v(Quaternion.fromEuler(1.7610246532076976, 3.0973729542475477, -0.3067013559478755, 'YXZ').rotateVector([2, 3, 5]), [-5.33885064940803, -2.47499382234730, -1.83604992379244]) });
  it('Should fuzz 213# YXZ', function() { assert.v(Quaternion.fromEuler(2.0405124499199223, -2.138039212611806, 0.554278459665198, 'YXZ').rotateVector([2, 3, 5]), [-5.16060209283043, 2.28073518830299, 2.48323036392333]) });
  it('Should fuzz 214# YXZ', function() { assert.v(Quaternion.fromEuler(1.3753451438286284, 0.7876189754662675, -0.34628652353723455, 'YXZ').rotateVector([2, 3, 5]), [5.51346490717038, -2.03134237195327, -1.86422983703940]) });
  it('Should fuzz 215# YXZ', function() { assert.v(Quaternion.fromEuler(-2.755400713835545, -1.8952962680615928, 0.6817918709904713, 'YXZ').rotateVector([2, 3, 5]), [2.19480947199248, 3.59452832433985, 4.50135285299549]) });
  it('Should fuzz 216# YXZ', function() { assert.v(Quaternion.fromEuler(1.5021134944828018, 2.982356048531571, -0.1988878798933671, 'YXZ').rotateVector([2, 3, 5]), [-4.34716639324439, -3.30631816416389, -2.85839195121427]) });
  it('Should fuzz 217# YXZ', function() { assert.v(Quaternion.fromEuler(-1.6130176918059427, -2.700674182329078, 0.8903154242704892, 'YXZ').rotateVector([2, 3, 5]), [6.03073247827282, -0.978993197505859, -0.819657303232668]) });
  it('Should fuzz 218# YXZ', function() { assert.v(Quaternion.fromEuler(-1.6573581801267268, 2.574057096100389, -1.0477748125777353, 'YXZ').rotateVector([2, 3, 5]), [4.01468550874213, -2.49035478948526, 3.95985268518713]) });
  it('Should fuzz 219# YXZ', function() { assert.v(Quaternion.fromEuler(2.5024149457872786, 0.39424794707489585, 0.049546246818016115, 'YXZ').rotateVector([2, 3, 5]), [1.97917365169442, 0.937341594418993, -5.76231397893335]) });
  it('Should fuzz 220# YXZ', function() { assert.v(Quaternion.fromEuler(1.6627542699209812, 2.5317299505939017, 0.7370771548932193, 'YXZ').rotateVector([2, 3, 5]), [-1.99857662485077, -5.78656078247704, 0.722084333924236]) });
  it('Should fuzz 221# YXZ', function() { assert.v(Quaternion.fromEuler(-1.7054978683421957, -0.9948157795011134, -2.59216701500093, 'YXZ').rotateVector([2, 3, 5]), [-5.67414933994517, 2.23096410241539, -0.909301073206031]) });
  it('Should fuzz 222# YXZ', function() { assert.v(Quaternion.fromEuler(1.2025979485647467, -2.77875095378339, 3.0244103382391216, 'YXZ').rotateVector([2, 3, 5]), [-4.29315563872135, 4.34149872814082, 0.848648016121354]) });
  it('Should fuzz 223# YXZ', function() { assert.v(Quaternion.fromEuler(0.16921364709955178, 2.9420584573922968, -2.5194230034105614, 'YXZ').rotateVector([2, 3, 5]), [-0.824206402826869, 2.54088704465022, -5.55558969254101]) });
  it('Should fuzz 224# YXZ', function() { assert.v(Quaternion.fromEuler(-0.024804572843831973, 2.0319901291795075, 0.5243695989687933, 'YXZ').rotateVector([2, 3, 5]), [0.204473457942045, -6.07889536909956, 1.00260744887373]) });
  it('Should fuzz 225# YXZ', function() { assert.v(Quaternion.fromEuler(-1.6065883926324152, -2.2023249315305202, -0.2395675530109056, 'YXZ').rotateVector([2, 3, 5]), [4.82293761232586, 2.59524817353115, 2.82912702178531]) });
  it('Should fuzz 226# YXZ', function() { assert.v(Quaternion.fromEuler(-2.177369042887806, 2.6182523348223397, 0.9619752046701544, 'YXZ').rotateVector([2, 3, 5]), [2.93086751481358, -5.40599700986412, 0.430362568017530]) });
  it('Should fuzz 227# YXZ', function() { assert.v(Quaternion.fromEuler(1.5712140156482004, -2.190602270241615, -0.7856323542186145, 'YXZ').rotateVector([2, 3, 5]), [-3.48076727624286, 3.65969473159116, -3.53424583754452]) });
  it('Should fuzz 228# YXZ', function() { assert.v(Quaternion.fromEuler(-1.3230304081047723, -1.1225901748938814, -0.9090241539861967, 'YXZ').rotateVector([2, 3, 5]), [-0.986588073310170, 4.62128736602365, 3.95857891853027]) });
  it('Should fuzz 229# YXZ', function() { assert.v(Quaternion.fromEuler(1.3621379118367045, -0.8259298157413366, 2.4798382676522337, 'YXZ').rotateVector([2, 3, 5]), [3.42543128913426, 2.90464636208122, 4.22249333861741]) });
  it('Should fuzz 230# YXZ', function() { assert.v(Quaternion.fromEuler(0.8030651078805802, -2.1881075850573124, -3.0907048256368106, 'YXZ').rotateVector([2, 3, 5]), [-1.54609046279286, 5.87036202098653, 1.07165947176323]) });
  it('Should fuzz 231# YXZ', function() { assert.v(Quaternion.fromEuler(0.3043045164146623, 0.5499163201473842, -0.01966754539828308, 'YXZ').rotateVector([2, 3, 5]), [3.70482797435294, -0.0894030152643799, 4.92607925040935]) });
  it('Should fuzz 232# YXZ', function() { assert.v(Quaternion.fromEuler(-2.8559413978270514, 2.859183323553591, 0.4847144693287473, 'YXZ').rotateVector([2, 3, 5]), [0.714800616226950, -4.83762112150153, 3.75319623305841]) });
  it('Should fuzz 233# YXZ', function() { assert.v(Quaternion.fromEuler(3.05981673976045, -1.7104214506470856, -0.6181237210758255, 'YXZ').rotateVector([2, 3, 5]), [-3.51805538614154, 4.77238179208397, 1.68750061648165]) });
  it('Should fuzz 234# YXZ', function() { assert.v(Quaternion.fromEuler(0.690493834118588, 0.8462799264040832, -2.6566684918360277, 'YXZ').rotateVector([2, 3, 5]), [0.114155240729121, -6.12107953040751, 0.720662170118736]) });
  it('Should fuzz 235# YXZ', function() { assert.v(Quaternion.fromEuler(-0.20113945589105242, -0.6857983007151063, 0.5867788789618791, 'YXZ').rotateVector([2, 3, 5]), [-0.312578637863848, 5.95683871814055, 1.55510999006912]) });
  it('Should fuzz 236# YXZ', function() { assert.v(Quaternion.fromEuler(-2.193091996608141, 2.3870442078489758, -1.1203912177030357, 'YXZ').rotateVector([2, 3, 5]), [1.15344238586887, -3.06447844461855, 5.22288641700635]) });
  it('Should fuzz 237# YXZ', function() { assert.v(Quaternion.fromEuler(-0.010079302614553587, -0.7375005129217924, -0.9141678287222592, 'YXZ').rotateVector([2, 3, 5]), [3.56125696278440, 3.54519516928854, 3.57057979278896]) });
  it('Should fuzz 238# YXZ', function() { assert.v(Quaternion.fromEuler(-3.1246905954051845, 0.49157184657230424, -0.6994125703146703, 'YXZ').rotateVector([2, 3, 5]), [-3.54379383330498, -1.47130613200372, -4.82460190409093]) });
  it('Should fuzz 239# YXZ', function() { assert.v(Quaternion.fromEuler(0.8811048316661498, 0.24959589262261828, 1.8905603882515791, 'YXZ').rotateVector([2, 3, 5]), [1.70761245827038, -0.309082085543416, 5.91511013902158]) });
  it('Should fuzz 240# YXZ', function() { assert.v(Quaternion.fromEuler(0.4105566627532826, -0.3931957979152938, -1.1618004585846582, 'YXZ').rotateVector([2, 3, 5]), [5.19458464604464, 1.32272453395783, 3.04412387434273]) });
  it('Should fuzz 241# YXZ', function() { assert.v(Quaternion.fromEuler(-1.843851171738658, -2.650857786827163, 0.6909947726008125, 'YXZ').rotateVector([2, 3, 5]), [5.97409750215895, -0.806826644816005, 1.28809541568670]) });
  it('Should fuzz 242# YXZ', function() { assert.v(Quaternion.fromEuler(0.9008034125498288, 2.493948090560785, 1.1496266482244417, 'YXZ').rotateVector([2, 3, 5]), [-2.87480568145379, -5.45030617034873, 0.172206107149456]) });
  it('Should fuzz 243# YXZ', function() { assert.v(Quaternion.fromEuler(-1.322002185356977, -1.9350894240037104, 2.0325573290975916, 'YXZ').rotateVector([2, 3, 5]), [1.25695591568164, 4.51013748567310, -4.00982813676089]) });
  it('Should fuzz 244# YXZ', function() { assert.v(Quaternion.fromEuler(-2.6141757105839454, 1.5094695492846455, -2.71117063109037, 'YXZ').rotateVector([2, 3, 5]), [2.12352588862901, -5.20884082328334, 2.52162944899113]) });
  it('Should fuzz 245# YXZ', function() { assert.v(Quaternion.fromEuler(-0.47114800681142155, 0.9030700554811188, -0.5096281518306798, 'YXZ').rotateVector([2, 3, 5]), [0.868798219890180, -2.90876384329924, 5.36509855986176]) });
  it('Should fuzz 246# YXZ', function() { assert.v(Quaternion.fromEuler(-2.2881372473081694, -2.667638960690885, -3.0535112120963417, 'YXZ').rotateVector([2, 3, 5]), [3.40035039766828, 5.09754482839988, 0.672795582276572]) });
  it('Should fuzz 247# YXZ', function() { assert.v(Quaternion.fromEuler(-2.172702122894399, 2.606404366948044, 2.093356514348656, 'YXZ').rotateVector([2, 3, 5]), [5.48304680479402, -2.75283307512295, -0.598421086649843]) });
  it('Should fuzz 248# YXZ', function() { assert.v(Quaternion.fromEuler(0.07651838873417516, -0.01104729467524379, 0.13416127991886606, 'YXZ').rotateVector([2, 3, 5]), [1.95558356228981, 3.29559755711399, 4.82853286956257]) });
  it('Should fuzz 249# YXZ', function() { assert.v(Quaternion.fromEuler(0.40598889974164676, 1.7863566549750027, 0.08223145358387063, 'YXZ').rotateVector([2, 3, 5]), [2.39929329153366, -5.55893776341184, 1.15827572007505]) });
  it('Should fuzz 250# YXZ', function() { assert.v(Quaternion.fromEuler(-0.7080173542737191, -2.582749866534895, -0.5150296587387393, 'YXZ').rotateVector([2, 3, 5]), [5.76227163581531, 1.27263487760113, -1.78230919410507]) });
  it('Should fuzz 251# YXZ', function() { assert.v(Quaternion.fromEuler(0.6169164607096835, 0.5519928035944157, -2.3571157812556613, 'YXZ').rotateVector([2, 3, 5]), [1.96434483933927, -5.63291965294379, 1.55292161284490]) });
  it('Should fuzz 252# YXZ', function() { assert.v(Quaternion.fromEuler(0.29612393460032393, -2.785578573963596, -2.831413264709093, 'YXZ').rotateVector([2, 3, 5]), [-1.96075331221469, 4.99257872017562, -3.03802636122347]) });
  it('Should fuzz 253# YXZ', function() { assert.v(Quaternion.fromEuler(-2.339287406791761, 0.702784968687086, -2.3019681037425244, 'YXZ').rotateVector([2, 3, 5]), [-1.74421195819231, -5.89628887734605, -0.437609551751529]) });
  it('Should fuzz 254# YXZ', function() { assert.v(Quaternion.fromEuler(-1.3533661289376049, 0.0029369450553113907, -2.8927364306766927, 'YXZ').rotateVector([2, 3, 5]), [-5.13126111090331, -3.41484548405044, -0.0948141961503874]) });
  it('Should fuzz 255# YXZ', function() { assert.v(Quaternion.fromEuler(2.8421577874857533, 1.1889952882216877, 2.4973112835269546, 'YXZ').rotateVector([2, 3, 5]), [3.47138011926614, -5.08609776966383, 0.284832485830512]) });
  it('Should fuzz 256# YXZ', function() { assert.v(Quaternion.fromEuler(-1.4569552891989686, 2.7520530819671327, -2.1808682373864534, 'YXZ').rotateVector([2, 3, 5]), [6.01161248642462, 1.20761288508237, 0.634181703336341]) });
  it('Should fuzz 257# YXZ', function() { assert.v(Quaternion.fromEuler(0.37003541703058085, -1.041821643566771, -1.9839767313706416, 'YXZ').rotateVector([2, 3, 5]), [3.67339390968294, 2.78437624214904, 4.09309493250038]) });
  it('Should fuzz 258# YXZ', function() { assert.v(Quaternion.fromEuler(2.7681326118180998, -1.0724823577205242, -0.06613789247316681, 'YXZ').rotateVector([2, 3, 5]), [-2.08775792804647, 5.75947456785983, -0.685360880160872]) });
  it('Should fuzz 259# YXZ', function() { assert.v(Quaternion.fromEuler(0.8952391953268535, 1.6301287156104785, 2.623941148410842, 'YXZ').rotateVector([2, 3, 5]), [-3.50632299341281, -4.89530156485727, 1.31974302611176]) });
  it('Should fuzz 260# YXZ', function() { assert.v(Quaternion.fromEuler(-2.0732645446077234, -0.4534154258471079, -2.4070284056726723, 'YXZ').rotateVector([2, 3, 5]), [-5.56210504146645, -1.01629180123579, -2.45563402860329]) });
  it('Should fuzz 261# YXZ', function() { assert.v(Quaternion.fromEuler(0.608568800172046, 2.748114177721842, -2.3638512401127185, 'YXZ').rotateVector([2, 3, 5]), [-2.85821249861712, 1.35323962681562, -5.29144250891615]) });
  it('Should fuzz 262# YXZ', function() { assert.v(Quaternion.fromEuler(-2.6753175113382675, 0.09521043004999585, 2.096634328729417, 'YXZ').rotateVector([2, 3, 5]), [0.967230692482421, -0.252354399082327, -6.08282681364378]) });
  it('Should fuzz 263# YXZ', function() { assert.v(Quaternion.fromEuler(2.900362134130239, -2.1182294683634013, -1.7528803337229597, 'YXZ').rotateVector([2, 3, 5]), [-2.62299026320073, 5.57585618681523, -0.172481486277590]) });
  it('Should fuzz 264# YXZ', function() { assert.v(Quaternion.fromEuler(1.135424464858251, -1.8537796455892954, -2.7867099220386096, 'YXZ').rotateVector([2, 3, 5]), [1.43710384489350, 5.78064901836837, 1.58708206008041]) });
  it('Should fuzz 265# YXZ', function() { assert.v(Quaternion.fromEuler(-1.660532802907772, 2.468875053599903, 2.9190676595142984, 'YXZ').rotateVector([2, 3, 5]), [5.67105321547065, -1.17225162430761, -2.11305029675306]) });
  it('Should fuzz 266# YXZ', function() { assert.v(Quaternion.fromEuler(-1.0938289252780509, 0.9739283463353399, -0.6400950782819468, 'YXZ').rotateVector([2, 3, 5]), [-1.82786182877809, -3.45452953470605, 4.76708997489450]) });
  it('Should fuzz 267# YXZ', function() { assert.v(Quaternion.fromEuler(1.9941543826830257, 0.9668107910486112, -1.371509119561342, 'YXZ').rotateVector([2, 3, 5]), [0.192754070395879, -4.89146823906751, -3.74651629311012]) });
  it('Should fuzz 268# YXZ', function() { assert.v(Quaternion.fromEuler(0.7775287753472209, -0.8817076578674072, 1.108081771154838, 'YXZ').rotateVector([2, 3, 5]), [-0.740761009066131, 5.84854226412465, 1.80161774863456]) });
  it('Should fuzz 269# YXZ', function() { assert.v(Quaternion.fromEuler(0.919933759406077, 2.3385561992709665, -0.029241281717737433, 'YXZ').rotateVector([2, 3, 5]), [0.184621970676439, -5.63941478846977, -2.48252201833781]) });
  it('Should fuzz 270# YXZ', function() { assert.v(Quaternion.fromEuler(-2.420127667609748, -1.8979033496612348, 0.20486172888804477, 'YXZ').rotateVector([2, 3, 5]), [2.14067498001809, 3.66039385075872, 4.47426278701334]) });
  it('Should fuzz 271# YXZ', function() { assert.v(Quaternion.fromEuler(-1.350040323633169, -2.4230479949916406, 2.4148772830854943, 'YXZ').rotateVector([2, 3, 5]), [2.32213910603556, 3.97890809053341, -4.09584672312186]) });
  it('Should fuzz 272# YXZ', function() { assert.v(Quaternion.fromEuler(1.3487397764620086, 0.6930360904218298, -0.2737403754644969, 'YXZ').rotateVector([2, 3, 5]), [5.81780577017580, -1.38832368365303, -1.49187578903783]) });
  it('Should fuzz 273# YXZ', function() { assert.v(Quaternion.fromEuler(0.4666571361116665, 0.7712524354453159, -2.9873516472682793, 'YXZ').rotateVector([2, 3, 5]), [-0.766330680588077, -5.83106414206611, 1.84700521360939]) });
  it('Should fuzz 274# YXZ', function() { assert.v(Quaternion.fromEuler(-1.3294059664539575, 2.0703878393756234, -0.33675968755203645, 'YXZ').rotateVector([2, 3, 5]), [1.16401821188745, -5.42876882955070, 2.67834474959686]) });
  it('Should fuzz 275# YXZ', function() { assert.v(Quaternion.fromEuler(1.9285412014858379, -0.034424418063136564, 0.25556181247190235, 'YXZ').rotateVector([2, 3, 5]), [4.15876775915232, 3.57821121634072, -2.81088157286796]) });
  it('Should fuzz 276# YXZ', function() { assert.v(Quaternion.fromEuler(-3.0513682923843244, -3.0233669633853206, 0.1943027836352056, 'YXZ').rotateVector([2, 3, 5]), [-0.894739858296451, -2.71671708059286, 5.46066743997386]) });
  it('Should fuzz 277# YXZ', function() { assert.v(Quaternion.fromEuler(1.4612808455299398, 2.1618163477352033, -2.5940767983099593, 'YXZ').rotateVector([2, 3, 5]), [-5.75887779410799, -2.14446696504214, -0.486403113037743]) });
  it('Should fuzz 278# YXZ', function() { assert.v(Quaternion.fromEuler(-0.19554244677236188, -1.7210756559278761, -0.37868090345744987, 'YXZ').rotateVector([2, 3, 5]), [3.44973887819440, 4.63702122496982, -2.14413988150341]) });
  it('Should fuzz 279# YXZ', function() { assert.v(Quaternion.fromEuler(1.1279029778369063, -1.0216823480384645, 2.19361185142259, 'YXZ').rotateVector([2, 3, 5]), [0.910341297016767, 4.19943698480037, 4.41995562575424]) });
  it('Should fuzz 280# YXZ', function() { assert.v(Quaternion.fromEuler(0.6323059560612778, -1.2202367117516209, -1.512194278311653, 'YXZ').rotateVector([2, 3, 5]), [4.53585479976764, 4.07057694076999, 0.925432117821976]) });
  it('Should fuzz 281# YXZ', function() { assert.v(Quaternion.fromEuler(0.10969007770527162, 2.957428116940175, 2.2846688942465985, 'YXZ').rotateVector([2, 3, 5]), [-4.10269860143153, -0.470647325515051, -4.57671883348730]) });
  it('Should fuzz 282# YXZ', function() { assert.v(Quaternion.fromEuler(1.1515414641574342, -1.8761572102566053, 3.077902978846873, 'YXZ').rotateVector([2, 3, 5]), [0.233987556120379, 5.63050700950362, 2.49852769436551]) });
  it('Should fuzz 283# YXZ', function() { assert.v(Quaternion.fromEuler(0.5241469968115444, 0.7652839392083557, 0.07875668790257029, 'YXZ').rotateVector([2, 3, 5]), [4.41790008157620, -1.19337931970797, 4.13013373494157]) });
  it('Should fuzz 284# YXZ', function() { assert.v(Quaternion.fromEuler(2.509449232109975, -1.5893650192650486, -0.1831096980513336, 'YXZ').rotateVector([2, 3, 5]), [-3.60965826242649, 4.95112827620019, 0.675792883291286]) });
  it('Should fuzz 285# YXZ', function() { assert.v(Quaternion.fromEuler(-0.7782680333664094, -1.9818802452314972, 2.6535722977920715, 'YXZ').rotateVector([2, 3, 5]), [-1.95879546776475, 5.26757449995214, -2.53293884705460]) });
  it('Should fuzz 286# YXZ', function() { assert.v(Quaternion.fromEuler(-2.667873000697879, 1.9599954971437583, 2.6946631338250526, 'YXZ').rotateVector([2, 3, 5]), [4.40130172272727, -3.92752669665728, 1.78971427679457]) });
  it('Should fuzz 287# YXZ', function() { assert.v(Quaternion.fromEuler(0.10541677831988716, -1.4938657498153702, 2.765169076923965, 'YXZ').rotateVector([2, 3, 5]), [-2.69031417214997, 4.82729334779527, 2.73119911201298]) });
  it('Should fuzz 288# YXZ', function() { assert.v(Quaternion.fromEuler(2.0087455154597693, 3.131433070619722, 3.0194432146035366, 'YXZ').rotateVector([2, 3, 5]), [-3.55617183699733, 2.68301712894628, 4.26087560854900]) });
  it('Should fuzz 289# YXZ', function() { assert.v(Quaternion.fromEuler(-2.968716016859088, 1.634833834800344, 2.304170451145061, 'YXZ').rotateVector([2, 3, 5]), [3.65904335551257, -4.95632754182759, 0.214986093970284]) });
  it('Should fuzz 290# YXZ', function() { assert.v(Quaternion.fromEuler(1.3349953290234886, 1.2660669129839581, -1.8105809402848838, 'YXZ').rotateVector([2, 3, 5]), [-0.434325816851111, -5.56631153173844, -2.61295560935356]) });
  it('Should fuzz 291# YXZ', function() { assert.v(Quaternion.fromEuler(-1.2194909082776888, 1.490340863376204, 0.30596448663012366, 'YXZ').rotateVector([2, 3, 5]), [-3.27304840415482, -4.70550147358806, 2.26834962607623]) });
  it('Should fuzz 292# YXZ', function() { assert.v(Quaternion.fromEuler(-1.4404424629644608, -1.1239789206512794, 2.4318727207610404, 'YXZ').rotateVector([2, 3, 5]), [-3.46294804262933, 4.08896670959294, -3.04767814932785]) });
  it('Should fuzz 293# YXZ', function() { assert.v(Quaternion.fromEuler(0.7502255199307006, -0.8873437405909588, -1.514210970765683, 'YXZ').rotateVector([2, 3, 5]), [5.39249166029173, 2.72319852659733, 1.22687549426270]) });
  it('Should fuzz 294# YXZ', function() { assert.v(Quaternion.fromEuler(-2.079317698173676, 0.7535703097766229, 1.3997163370679555, 'YXZ').rotateVector([2, 3, 5]), [-3.39445532972693, -1.61156725718487, -4.88677030256775]) });
  it('Should fuzz 295# YXZ', function() { assert.v(Quaternion.fromEuler(-3.100383579747902, -1.8573638968368567, 1.0116677407730164, 'YXZ').rotateVector([2, 3, 5]), [1.66910868402156, 3.86705317533732, 4.50110830130062]) });
  it('Should fuzz 296# YXZ', function() { assert.v(Quaternion.fromEuler(1.2377552353194252, -1.6016513755472062, -1.2833125505776108, 'YXZ').rotateVector([2, 3, 5]), [1.98829438973841, 5.03054647906356, -2.95639773063706]) });
  it('Should fuzz 297# YXZ', function() { assert.v(Quaternion.fromEuler(-0.1741304910312267, -0.7043219518628292, 1.2959196059397682, 'YXZ').rotateVector([2, 3, 5]), [-2.66190460870959, 5.32499751277606, 1.59958286533064]) });
  it('Should fuzz 298# YXZ', function() { assert.v(Quaternion.fromEuler(-2.8731547143958847, -2.440545291747642, -2.5048001436373215, 'YXZ').rotateVector([2, 3, 5]), [0.227749197635421, 5.97705672707110, 1.49094707630771]) });
  it('Should fuzz 299# YXZ', function() { assert.v(Quaternion.fromEuler(-1.3474034137022453, -0.6814917676370444, -2.5628551780596256, 'YXZ').rotateVector([2, 3, 5]), [-6.00886943646717, 0.349688460507479, 1.33086666352368]) });
  it('Should fuzz 300# ZYX', function() { assert.v(Quaternion.fromEuler(-1.1477227038034734, 2.987267125010095, -2.304797835038062, 'ZYX').rotateVector([2, 3, 5]), [0.389497926397543, 3.28280542960443, 5.20302603075284]) });
  it('Should fuzz 301# ZYX', function() { assert.v(Quaternion.fromEuler(2.3074911518494625, -1.4922056848488345, 1.287758568774482, 'ZYX').rotateVector([2, 3, 5]), [5.69465679548755, -0.379191438920060, 2.32961323705400]) });
  it('Should fuzz 302# ZYX', function() { assert.v(Quaternion.fromEuler(0.8190123515266077, -0.52832868203377, -1.2712581285789093, 'ZYX').rotateVector([2, 3, 5]), [-2.47784045011818, 5.64118686165002, -0.193177368512095]) });
  it('Should fuzz 303# ZYX', function() { assert.v(Quaternion.fromEuler(1.9862266313627055, -2.2973347176429444, -2.4778711021972257, 'ZYX').rotateVector([2, 3, 5]), [-1.86562821899668, 2.45251516974643, 5.33897000278583]) });
  it('Should fuzz 304# ZYX', function() { assert.v(Quaternion.fromEuler(-2.448008813820457, -1.2485584771361928, -0.5131964885300411, 'ZYX').rotateVector([2, 3, 5]), [4.85595290156327, -2.55405343184545, 2.81007695358646]) });
  it('Should fuzz 305# ZYX', function() { assert.v(Quaternion.fromEuler(1.9128960788193936, 1.3650578314919963, 1.8738018935007865, 'ZYX').rotateVector([2, 3, 5]), [4.75156447386142, 3.55078696176076, -1.67766117047746]) });
  it('Should fuzz 306# ZYX', function() { assert.v(Quaternion.fromEuler(0.04562873184890215, -1.5319430314234688, -2.6333206897481336, 'ZYX').rotateVector([2, 3, 5]), [5.90363448585074, 0.0819487324199928, 1.77211293735152]) });
  it('Should fuzz 307# ZYX', function() { assert.v(Quaternion.fromEuler(1.7082581922472784, 1.5189698923251171, -0.4907798229987841, 'ZYX').rotateVector([2, 3, 5]), [-5.37944781826765, 2.38078609497089, -1.84211800396410]) });
  it('Should fuzz 308# ZYX', function() { assert.v(Quaternion.fromEuler(-2.360800840127718, 0.792542395043061, 0.1079474651609269, 'ZYX').rotateVector([2, 3, 5]), [-1.95546018755669, -5.37784024419132, 2.29238080668047]) });
  it('Should fuzz 309# ZYX', function() { assert.v(Quaternion.fromEuler(2.2273656446268753, -2.5865109162194737, -0.9504901081750443, 'ZYX').rotateVector([2, 3, 5]), [-3.41671443115251, -5.08845246804146, 0.658569644332992]) });
  it('Should fuzz 310# ZYX', function() { assert.v(Quaternion.fromEuler(0.5581620889287686, -0.7149317829885846, 1.2135085396195464, 'ZYX').rotateVector([2, 3, 5]), [0.671032828755916, -3.86645446800775, 4.75397147546709]) });
  it('Should fuzz 311# ZYX', function() { assert.v(Quaternion.fromEuler(-1.3582235757220142, -0.31314736684522027, 0.36943358556228123, 'ZYX').rotateVector([2, 3, 5]), [0.997819782603286, 0.0796272303597755, 6.08259937737401]) });
  it('Should fuzz 312# ZYX', function() { assert.v(Quaternion.fromEuler(-1.1379398712832716, -2.9681075030367023, -0.20499043012613916, 'ZYX').rotateVector([2, 3, 5]), [2.45364108671805, 4.11865287653077, -3.87509276020767]) });
  it('Should fuzz 313# ZYX', function() { assert.v(Quaternion.fromEuler(1.1168782178483472, 0.047432944424319334, 0.6091233434292644, 'ZYX').rotateVector([2, 3, 5]), [1.35669826875311, 1.86781762691331, 5.71582252350038]) });
  it('Should fuzz 314# ZYX', function() { assert.v(Quaternion.fromEuler(1.4450519528643433, 2.7610680570930564, 2.3822959785351543, 'ZYX').rotateVector([2, 3, 5]), [5.26804942047664, -3.12217771183441, 0.706867483436711]) });
  it('Should fuzz 315# ZYX', function() { assert.v(Quaternion.fromEuler(1.191993441127627, 0.6501418534159535, -1.8832006418774294, 'ZYX').rotateVector([2, 3, 5]), [-3.95829421441719, 0.427955510230147, -4.70624701788751]) });
  it('Should fuzz 316# ZYX', function() { assert.v(Quaternion.fromEuler(-2.5027160049193675, -0.4732247628880497, 1.8096630445047408, 'ZYX').rotateVector([2, 3, 5]), [-4.11554399269242, 3.87879401084547, 2.45300930810355]) });
  it('Should fuzz 317# ZYX', function() { assert.v(Quaternion.fromEuler(-0.6219650065290572, 0.7403571879604067, -0.37784631372466704, 'ZYX').rotateVector([2, 3, 5]), [5.84033774663510, 1.51366215675582, 1.26462717052675]) });
  it('Should fuzz 318# ZYX', function() { assert.v(Quaternion.fromEuler(-1.0047311750046433, -0.4374421565872173, 1.0999368547308022, 'ZYX').rotateVector([2, 3, 5]), [-2.76330822501648, -1.42202776307486, 5.32371718769889]) });
  it('Should fuzz 319# ZYX', function() { assert.v(Quaternion.fromEuler(1.2334916500170685, 0.9300689295351781, -0.5172117735116672, 'ZYX').rotateVector([2, 3, 5]), [-3.63850906812924, 4.97489798193548, 0.107897314496757]) });
  it('Should fuzz 320# ZYX', function() { assert.v(Quaternion.fromEuler(1.6600233017318615, 0.5092962351253791, 1.7804854659630642, 'ZYX').rotateVector([2, 3, 5]), [5.25514222068529, 3.15019008728304, 0.678072750045683]) });
  it('Should fuzz 321# ZYX', function() { assert.v(Quaternion.fromEuler(0.12996664844054395, 1.8255242619768177, -2.7184850822034883, 'ZYX').rotateVector([2, 3, 5]), [-5.96801599784728, -1.46831706441581, -0.476266782155014]) });
  it('Should fuzz 322# ZYX', function() { assert.v(Quaternion.fromEuler(-0.7592952412263112, -2.61495040794049, -2.285969855075417, 'ZYX').rotateVector([2, 3, 5]), [2.01139010667210, 0.583176061246562, 5.79777677393417]) });
  it('Should fuzz 323# ZYX', function() { assert.v(Quaternion.fromEuler(0.6555858521087345, -1.7034480138815504, -1.6998654901371815, 'ZYX').rotateVector([2, 3, 5]), [-0.153823497659332, 5.64974671422217, 2.46103644765852]) });
  it('Should fuzz 324# ZYX', function() { assert.v(Quaternion.fromEuler(0.15079542624744402, 2.528423169522439, -3.021514696446297, 'ZYX').rotateVector([2, 3, 5]), [-4.28827601637356, -3.05836093714332, 3.20267344347673]) });
  it('Should fuzz 325# ZYX', function() { assert.v(Quaternion.fromEuler(2.2786550983910328, 2.2101562329915563, -1.323548029229199, 'ZYX').rotateVector([2, 3, 5]), [-2.58590253383589, -5.56360603609137, -0.599496422565452]) });
  it('Should fuzz 326# ZYX', function() { assert.v(Quaternion.fromEuler(2.7510500358320904, -1.7059319114581573, -0.8106105385144504, 'ZYX').rotateVector([2, 3, 5]), [-0.752511248765720, -5.84429467791767, 1.81051002155311]) });
  it('Should fuzz 327# ZYX', function() { assert.v(Quaternion.fromEuler(-0.9561705506082845, 1.8756397070950852, 3.051799823065922, 'ZYX').rotateVector([2, 3, 5]), [-5.74482878713298, 2.18014813109316, -0.493858616426999]) });
  it('Should fuzz 328# ZYX', function() { assert.v(Quaternion.fromEuler(-1.6756754635228568, -1.7476767348326558, 0.08524848032347165, 'ZYX').rotateVector([2, 3, 5]), [3.12585577930718, 5.20886761787338, 1.04724580994246]) });
  it('Should fuzz 329# ZYX', function() { assert.v(Quaternion.fromEuler(-2.8835371958119302, 1.9748189732689285, -0.628438815632407, 'ZYX').rotateVector([2, 3, 5]), [0.101701674245338, -5.52318055889929, -2.73571440089287]) });
  it('Should fuzz 330# ZYX', function() { assert.v(Quaternion.fromEuler(-0.2295090793286314, -2.200229304927328, 2.1543810603515894, 'ZYX').rotateVector([2, 3, 5]), [-2.27373973087111, -5.45118577754953, 1.76484595783877]) });
  it('Should fuzz 331# ZYX', function() { assert.v(Quaternion.fromEuler(0.5326417493111752, 0.1666991110598306, 0.11440871239873251, 'ZYX').rotateVector([2, 3, 5]), [1.23442830466013, 3.52473345622957, 4.90432878416505]) });
  it('Should fuzz 332# ZYX', function() { assert.v(Quaternion.fromEuler(0.5160376998344023, -0.579262100947497, -0.9303489632059767, 'ZYX').rotateVector([2, 3, 5]), [-1.68428743623158, 5.71490230891524, 1.58210853979990]) });
  it('Should fuzz 333# ZYX', function() { assert.v(Quaternion.fromEuler(-0.8305182972230418, -0.9670971919720683, -2.7816136541661023, 'ZYX').rotateVector([2, 3, 5]), [3.17843224179658, -5.03046743946987, -1.60995833012580]) });
  it('Should fuzz 334# ZYX', function() { assert.v(Quaternion.fromEuler(2.0986600167400677, -0.8964851833998315, -0.622605153657287, 'ZYX').rotateVector([2, 3, 5]), [-4.34342154275458, -3.17782681912809, 3.00601164494844]) });
  it('Should fuzz 335# ZYX', function() { assert.v(Quaternion.fromEuler(0.7226141554400858, 1.7563900333584748, 3.0988651824569633, 'ZYX').rotateVector([2, 3, 5]), [-1.74150621230245, -5.81615143192908, -1.06749174862446]) });
  it('Should fuzz 336# ZYX', function() { assert.v(Quaternion.fromEuler(1.201428566217583, 1.3398177099553905, 0.01058807985359378, 'ZYX').rotateVector([2, 3, 5]), [-0.814587231596227, 6.05841397958448, -0.795026851179089]) });
  it('Should fuzz 337# ZYX', function() { assert.v(Quaternion.fromEuler(2.0817076492685986, -0.6790173504518302, -1.3981710132902596, 'ZYX').rotateVector([2, 3, 5]), [-6.15103340893350, -0.154307047067610, -0.375469489318716]) });
  it('Should fuzz 338# ZYX', function() { assert.v(Quaternion.fromEuler(-2.408061048667874, -2.9097704817805488, -0.18550028882833303, 'ZYX').rotateVector([2, 3, 5]), [4.78156985260077, -0.901269677705784, -3.78474605657335]) });
  it('Should fuzz 339# ZYX', function() { assert.v(Quaternion.fromEuler(-0.5662440820787289, -2.712874675088292, 0.627799142165796, 'ZYX').rotateVector([2, 3, 5]), [-3.84590376899220, 1.84180416902547, -4.45160438523146]) });
  it('Should fuzz 340# ZYX', function() { assert.v(Quaternion.fromEuler(3.0761829137863534, 0.6347861446359562, -1.2440898780177945, 'ZYX').rotateVector([2, 3, 5]), [-1.24761856116045, -5.62878730542263, -2.18178857732846]) });
  it('Should fuzz 341# ZYX', function() { assert.v(Quaternion.fromEuler(2.640329021309725, 0.7195290764390716, 1.9769719769307192, 'ZYX').rotateVector([2, 3, 5]), [1.00653851475431, 6.03758075532060, -0.731094276614505]) });
  it('Should fuzz 342# ZYX', function() { assert.v(Quaternion.fromEuler(-3.115465752483956, 2.828696514393558, 3.0042772657635473, 'ZYX').rotateVector([2, 3, 5]), [3.20443638173437, 3.74117177018395, 3.70610594308849]) });
  it('Should fuzz 343# ZYX', function() { assert.v(Quaternion.fromEuler(-2.3520329579345898, 1.3554022382350288, 2.530071744702375, 'ZYX').rotateVector([2, 3, 5]), [-2.45197898419653, 5.09244099737772, -2.46065921031035]) });
  it('Should fuzz 344# ZYX', function() { assert.v(Quaternion.fromEuler(2.3726153373502292, 2.6818225031676795, -2.527774520283887, 'ZYX').rotateVector([2, 3, 5]), [2.84502480652310, -3.34811787444705, 4.32388026534921]) });
  it('Should fuzz 345# ZYX', function() { assert.v(Quaternion.fromEuler(2.7563994254134094, 0.16649569445366685, -2.000184189901154, 'ZYX').rotateVector([2, 3, 5]), [-2.32806943064474, -2.61395128694039, -5.07418480108876]) });
  it('Should fuzz 346# ZYX', function() { assert.v(Quaternion.fromEuler(2.3160686997277953, 1.9496318476598145, 1.1781805136383152, 'ZYX').rotateVector([2, 3, 5]), [0.101209782354046, 5.00958172861487, -3.59080039605154]) });
  it('Should fuzz 347# ZYX', function() { assert.v(Quaternion.fromEuler(2.7751658678833113, -2.27254243845449, 3.0939280178187527, 'ZYX').rotateVector([2, 3, 5]), [-1.09473980995375, 3.88495978768498, 4.65925232162555]) });
  it('Should fuzz 348# ZYX', function() { assert.v(Quaternion.fromEuler(0.9025248625809894, -2.1515075199963265, 1.4368976644567946, 'ZYX').rotateVector([2, 3, 5]), [1.00905680193328, -6.07256644959593, -0.325178544362967]) });
  it('Should fuzz 349# ZYX', function() { assert.v(Quaternion.fromEuler(-1.7056919161278148, 1.3604584447946753, -2.9520268106968444, 'ZYX').rotateVector([2, 3, 5]), [-1.32186520009197, 5.16213438437492, -3.09920005653716]) });
  it('Should fuzz 350# ZYX', function() { assert.v(Quaternion.fromEuler(-2.4885467014692297, -0.9033025517422262, 2.923896705079131, 'ZYX').rotateVector([2, 3, 5]), [-6.06034525756932, 0.411437524898292, -1.05020689493198]) });
  it('Should fuzz 351# ZYX', function() { assert.v(Quaternion.fromEuler(0.1767717120544714, -2.641678095741913, 1.0471792407039642, 'ZYX').rotateVector([2, 3, 5]), [-3.63593340179289, -3.52434322210208, -3.51553596917311]) });
  it('Should fuzz 352# ZYX', function() { assert.v(Quaternion.fromEuler(2.9890832745046287, 0.3047734246998757, 1.9728703131595369, 'ZYX').rotateVector([2, 3, 5]), [-1.24681358028214, 6.03469958904228, 0.166903463226346]) });
  it('Should fuzz 353# ZYX', function() { assert.v(Quaternion.fromEuler(0.6171714384265035, -1.4758266897748882, 1.9280937805212055, 'ZYX').rotateVector([2, 3, 5]), [2.61076431064742, -5.17772141940270, 2.09167650876233]) });
  it('Should fuzz 354# ZYX', function() { assert.v(Quaternion.fromEuler(1.5791465024700964, 2.819528672317241, 2.830053832376885, 'ZYX').rotateVector([2, 3, 5]), [4.41404476377922, -3.07579315485402, 3.00926989349684]) });
  it('Should fuzz 355# ZYX', function() { assert.v(Quaternion.fromEuler(-1.427903172509391, 2.1826433359607504, 2.752970877570619, 'ZYX').rotateVector([2, 3, 5]), [-5.19373927931753, 3.29998547830551, 0.367652201743697]) });
  it('Should fuzz 356# ZYX', function() { assert.v(Quaternion.fromEuler(0.5481298622092381, 0.7856652627176683, -1.4345817708250967, 'ZYX').rotateVector([2, 3, 5]), [-2.97127770121474, 4.46720033203705, -3.03572561601212]) });
  it('Should fuzz 357# ZYX', function() { assert.v(Quaternion.fromEuler(2.8856982430212916, 0.3695147456820038, 1.1403574495031297, 'ZYX').rotateVector([2, 3, 5]), [-2.65257698016795, 4.09690669876886, 3.76552663858138]) });
  it('Should fuzz 358# ZYX', function() { assert.v(Quaternion.fromEuler(1.809158114363858, -1.4949681863861104, 0.8431041675100919, 'ZYX').rotateVector([2, 3, 5]), [2.96358441248898, -4.83534922262822, 2.41589845094553]) });
  it('Should fuzz 359# ZYX', function() { assert.v(Quaternion.fromEuler(1.4163304651630257, 2.2641812717659953, 1.9654559173552864, 'ZYX').rotateVector([2, 3, 5]), [5.60397541752907, -1.50706694001700, -2.07947319243062]) });
  it('Should fuzz 360# ZYX', function() { assert.v(Quaternion.fromEuler(2.991456922386151, 2.3725714628381827, 1.1059552111624695, 'ZYX').rotateVector([2, 3, 5]), [-1.49678320071457, 3.38659556730425, -4.92855054895188]) });
  it('Should fuzz 361# ZYX', function() { assert.v(Quaternion.fromEuler(-0.8662403532642293, -2.6220190546873097, 2.74957427595389, 'ZYX').rotateVector([2, 3, 5]), [-3.57481202775467, -3.02463880495658, 4.00902470256438]) });
  it('Should fuzz 362# ZYX', function() { assert.v(Quaternion.fromEuler(0.2903018858571462, -2.8215430152620646, 0.06028382330396154, 'ZYX').rotateVector([2, 3, 5]), [-4.14893624576073, 1.57147039497005, -4.27981411119053]) });
  it('Should fuzz 363# ZYX', function() { assert.v(Quaternion.fromEuler(-0.5675825508451422, 3.0288920412438607, 0.7269799630506357, 'ZYX').rotateVector([2, 3, 5]), [-1.71378507158855, -0.189993543616906, -5.91834801120922]) });
  it('Should fuzz 364# ZYX', function() { assert.v(Quaternion.fromEuler(0.36467654734774335, 1.1674268390727685, 0.4751453961292671, 'ZYX').rotateVector([2, 3, 5]), [5.59740410448147, 2.54392893779374, 0.444401677077853]) });
  it('Should fuzz 365# ZYX', function() { assert.v(Quaternion.fromEuler(2.2502811402952396, -0.6661587203720782, -0.2531933702106577, 'ZYX').rotateVector([2, 3, 5]), [-2.63376372921625, -3.35465653045343, 4.45079410682533]) });
  it('Should fuzz 366# ZYX', function() { assert.v(Quaternion.fromEuler(0.3004824478598773, -0.599085703093599, -2.4088420625621128, 'ZYX').rotateVector([2, 3, 5]), [4.33057315911788, 2.50874709774804, -3.59893374669062]) });
  it('Should fuzz 367# ZYX', function() { assert.v(Quaternion.fromEuler(-0.2632624332668949, -0.7630878587437162, 2.219706453312633, 'ZYX').rotateVector([2, 3, 5]), [0.308467945212969, -6.08665169159060, 0.926023062365822]) });
  it('Should fuzz 368# ZYX', function() { assert.v(Quaternion.fromEuler(0.7653098178186983, 1.4828925453197517, 2.1390011540088336, 'ZYX').rotateVector([2, 3, 5]), [4.04814345509690, -4.19362545908584, -2.00649945822649]) });
  it('Should fuzz 369# ZYX', function() { assert.v(Quaternion.fromEuler(-0.03915833354710685, -0.017786073277436643, -1.3242173364765926, 'ZYX').rotateVector([2, 3, 5]), [2.24665155097810, 5.49729070239177, -1.65298268045516]) });
  it('Should fuzz 370# ZYX', function() { assert.v(Quaternion.fromEuler(-0.8726974507957035, -2.5859816498380583, -1.418544552948675, 'ZYX').rotateVector([2, 3, 5]), [3.79065645265932, 3.87897850863658, 2.92992310265095]) });
  it('Should fuzz 371# ZYX', function() { assert.v(Quaternion.fromEuler(-2.2259347518685244, 0.4889760469072395, 1.699255627645754, 'ZYX').rotateVector([2, 3, 5]), [-5.98081876774250, 0.985688605083781, 1.12170621876989]) });
  it('Should fuzz 372# ZYX', function() { assert.v(Quaternion.fromEuler(-1.3543362700385442, 2.3030233383808696, 1.923946774181858, 'ZYX').rotateVector([2, 3, 5]), [-5.70908218030326, -0.713082333885670, -2.21311866912823]) });
  it('Should fuzz 373# ZYX', function() { assert.v(Quaternion.fromEuler(1.7642771310717942, -0.8391280583558274, 1.9409759957629111, 'ZYX').rotateVector([2, 3, 5]), [5.52383944136832, 1.69491333469313, 2.14813095826654]) });
  it('Should fuzz 374# ZYX', function() { assert.v(Quaternion.fromEuler(0.04371438052267784, 2.2574127738420975, -2.2054509014833976, 'ZYX').rotateVector([2, 3, 5]), [-5.52200599562813, 2.00828893795479, 1.86392739288189]) });
  it('Should fuzz 375# ZYX', function() { assert.v(Quaternion.fromEuler(-0.43165259089310704, 0.8294117925942803, 2.5480793028756725, 'ZYX').rotateVector([2, 3, 5]), [-2.63631758900013, -4.60252923936672, -3.14110715683227]) });
  it('Should fuzz 376# ZYX', function() { assert.v(Quaternion.fromEuler(-0.5505977121024332, -0.8605072493025046, 1.9576151211208321, 'ZYX').rotateVector([2, 3, 5]), [-2.47986352027563, -5.23912538492871, 2.09805674894692]) });
  it('Should fuzz 377# ZYX', function() { assert.v(Quaternion.fromEuler(-2.2315933847597798, 0.2684684216261308, -2.2539394490885396, 'ZYX').rotateVector([2, 3, 5]), [1.27567861992556, -1.59203936056658, -5.81704862736006]) });
  it('Should fuzz 378# ZYX', function() { assert.v(Quaternion.fromEuler(-0.11837325654829467, 2.761348127839958, -0.4042287284739716, 'ZYX').rotateVector([2, 3, 5]), [-0.0267973616790467, 4.76125050468761, -3.91532572502200]) });
  it('Should fuzz 379# ZYX', function() { assert.v(Quaternion.fromEuler(-1.0194228883321776, 2.0586595739735536, -0.6676100190733862, 'ZYX').rotateVector([2, 3, 5]), [5.10998436901029, 2.09742230551731, -2.73658170365676]) });
  it('Should fuzz 380# ZYX', function() { assert.v(Quaternion.fromEuler(-0.4872003148446846, -0.4372836820695536, 0.8822049367396563, 'ZYX').rotateVector([2, 3, 5]), [-1.36971225997898, -1.48602656680826, 5.82371130531067]) });
  it('Should fuzz 381# ZYX', function() { assert.v(Quaternion.fromEuler(0.7559485062004949, 1.156091186820916, 0.23662141227254185, 'ZYX').rotateVector([2, 3, 5]), [3.09505970856296, 5.31520418272890, 0.411351305250644]) });
  it('Should fuzz 382# ZYX', function() { assert.v(Quaternion.fromEuler(-1.8938482767351283, 0.8499184254624508, 0.04720894989334212, 'ZYX').rotateVector([2, 3, 5]), [0.973949127842087, -5.78693576979539, 1.88753741489760]) });
  it('Should fuzz 383# ZYX', function() { assert.v(Quaternion.fromEuler(-2.397760370894188, -2.0196949520483294, -2.9187909149877695, 'ZYX').rotateVector([2, 3, 5]), [-4.26674258519616, -1.45137300111034, 4.20576082573909]) });
  it('Should fuzz 384# ZYX', function() { assert.v(Quaternion.fromEuler(1.2326844655296982, -0.4834194118703694, 1.4743444505869974, 'ZYX').rotateVector([2, 3, 5]), [4.47520177385967, -1.40493407774469, 3.99984116190068]) });
  it('Should fuzz 385# ZYX', function() { assert.v(Quaternion.fromEuler(-2.3346007768173425, 0.05109990559053257, 2.027592825353075, 'ZYX').rotateVector([2, 3, 5]), [-5.59520411699566, 2.55852468382103, 0.384242542456397]) });
  it('Should fuzz 386# ZYX', function() { assert.v(Quaternion.fromEuler(-1.0841068367353404, 0.9052667884563119, 0.620014846037837, 'ZYX').rotateVector([2, 3, 5]), [2.30615348896402, -5.34956392856252, 2.01589232340465]) });
  it('Should fuzz 387# ZYX', function() { assert.v(Quaternion.fromEuler(-1.7330471937371208, 2.570859184592668, 1.2563371999438724, 'ZYX').rotateVector([2, 3, 5]), [-3.88872124946313, -0.0664536709572929, -4.78261758387499]) });
  it('Should fuzz 388# ZYX', function() { assert.v(Quaternion.fromEuler(-0.7074915482813298, -0.06103552448316174, 3.114946461162303, 'ZYX').rotateVector([2, 3, 5]), [-0.290516002197052, -3.87283726364742, -4.78714236071703]) });
  it('Should fuzz 389# ZYX', function() { assert.v(Quaternion.fromEuler(0.2328355170297618, 1.2269049465117225, -0.3699278689583303, 'ZYX').rotateVector([2, 3, 5]), [2.87041882482024, 5.41318339348202, -0.676861373287044]) });
  it('Should fuzz 390# ZYX', function() { assert.v(Quaternion.fromEuler(-1.3979232010106053, -0.5749362865929948, -1.8031131080484855, 'ZYX').rotateVector([2, 3, 5]), [4.78221838483955, -3.11579058014296, -2.32856959964589]) });
  it('Should fuzz 391# ZYX', function() { assert.v(Quaternion.fromEuler(1.1371561115778448, -0.6746870653939703, 1.747526375597853, 'ZYX').rotateVector([2, 3, 5]), [5.05698148778200, -2.04826886448421, 2.86906481122589]) });
  it('Should fuzz 392# ZYX', function() { assert.v(Quaternion.fromEuler(-1.8114925284456684, 0.3459765085323898, 2.301788798492443, 'ZYX').rotateVector([2, 3, 5]), [-5.91955860281828, -0.0986811946878015, -1.71729088089788]) });
  it('Should fuzz 393# ZYX', function() { assert.v(Quaternion.fromEuler(0.4409955849101035, 2.0908809061605753, 1.524760140735073, 'ZYX').rotateVector([2, 3, 5]), [3.70653307120978, -3.62097520889054, -3.33918420106293]) });
  it('Should fuzz 394# ZYX', function() { assert.v(Quaternion.fromEuler(-2.7634069193423394, -0.09826074664923157, 0.5541106676340792, 'ZYX').rotateVector([2, 3, 5]), [-1.34762220754110, -0.449524432063301, 5.99848665670936]) });
  it('Should fuzz 395# ZYX', function() { assert.v(Quaternion.fromEuler(2.18031793587679, 0.15864566657642776, 2.3029025220762964, 'ZYX').rotateVector([2, 3, 5]), [3.66325569974642, 4.75229254270466, -1.41289534885960]) });
  it('Should fuzz 396# ZYX', function() { assert.v(Quaternion.fromEuler(-1.8021868396550156, 0.5086069456122453, -2.8894775502154024, 'ZYX').rotateVector([2, 3, 5]), [-1.39002029339692, 1.32961866963162, -5.85661658103992]) });
  it('Should fuzz 397# ZYX', function() { assert.v(Quaternion.fromEuler(0.353771264274394, 0.7190585010904837, -0.4011342245762788, 'ZYX').rotateVector([2, 3, 5]), [1.89889838062986, 5.72665589575965, 1.26475183004515]) });
  it('Should fuzz 398# ZYX', function() { assert.v(Quaternion.fromEuler(0.29100653782471575, -1.042891314963474, -1.2784952935316263, 'ZYX').rotateVector([2, 3, 5]), [0.528344281263768, 6.05871185481550, 1.00641094030920]) });
  it('Should fuzz 399# ZYX', function() { assert.v(Quaternion.fromEuler(-0.07335149733389157, -2.566626761246863, 2.3619967437848635, 'ZYX').rotateVector([2, 3, 5]), [-1.30308868620726, -5.56802814373098, 2.30196057014413]) });
  it('Should fuzz 400# YZX', function() { assert.v(Quaternion.fromEuler(1.9406646090783326, -1.749472353999957, 1.1262850084592975, 'YZX').rotateVector([2, 3, 5]), [5.80539836245331, -1.39515874655750, 1.53325859695245]) });
  it('Should fuzz 401# YZX', function() { assert.v(Quaternion.fromEuler(-0.2148644344479611, 1.442766605187825, 1.8082868095955007, 'YZX').rotateVector([2, 3, 5]), [5.27157746895017, 1.27303277495959, 2.93084604555334]) });
  it('Should fuzz 402# YZX', function() { assert.v(Quaternion.fromEuler(1.0646297354164682, -2.98727916673332, -0.24742207367481983, 'YZX').rotateVector([2, 3, 5]), [2.94715054696224, -4.39145804033631, 3.16692278616101]) });
  it('Should fuzz 403# YZX', function() { assert.v(Quaternion.fromEuler(1.7118101317942163, -2.3397522091689633, 1.8609776349393465, 'YZX').rotateVector([2, 3, 5]), [2.19567799010106, 2.49119217630703, 5.19354981727262]) });
  it('Should fuzz 404# YZX', function() { assert.v(Quaternion.fromEuler(0.05873572521771786, 2.238935232476087, 0.7376077539002703, 'YZX').rotateVector([2, 3, 5]), [-0.00608280773875958, 2.27767294392206, 5.72819072307962]) });
  it('Should fuzz 405# YZX', function() { assert.v(Quaternion.fromEuler(1.4050351277130595, -0.18781463968778667, 2.6717482825639296, 'YZX').rotateVector([2, 3, 5]), [-2.88540803185962, -5.22523060194707, -1.53993040302343]) });
  it('Should fuzz 406# YZX', function() { assert.v(Quaternion.fromEuler(2.2869097596610697, 0.74695236855686, -3.0128203230471717, 'YZX').rotateVector([2, 3, 5]), [-6.03512654142951, -0.353114024861083, 1.20522118898542]) });
  it('Should fuzz 407# YZX', function() { assert.v(Quaternion.fromEuler(-0.01541740319068774, 0.4852265899179633, -2.883040032462553, 'YZX').rotateVector([2, 3, 5]), [2.61164254040782, -0.501843576653966, -5.56124772561908]) });
  it('Should fuzz 408# YZX', function() { assert.v(Quaternion.fromEuler(2.252915159954213, 1.8176128389470376, -0.7111005484087869, 'YZX').rotateVector([2, 3, 5]), [5.11325022532021, 0.586778263708578, 3.39269264780970]) });
  it('Should fuzz 409# YZX', function() { assert.v(Quaternion.fromEuler(0.6386681641320973, 0.09694529532234863, 1.4845702304590551, 'YZX').rotateVector([2, 3, 5]), [4.00371782293638, -4.50730204272794, 1.28626276083938]) });
  it('Should fuzz 410# YZX', function() { assert.v(Quaternion.fromEuler(-2.4458001497221256, -2.9047901314669864, -0.18011290448600503, 'YZX').rotateVector([2, 3, 5]), [-2.00912116832901, -4.20900199636615, -4.03084784202505]) });
  it('Should fuzz 411# YZX', function() { assert.v(Quaternion.fromEuler(-2.4731434037542264, 0.38905937670494595, -0.5152310079092612, 'YZX').rotateVector([2, 3, 5]), [-1.72216538599932, 5.45363754564376, -2.30043124305216]) });
  it('Should fuzz 412# YZX', function() { assert.v(Quaternion.fromEuler(1.9840535215067314, -1.6698025497097382, -0.7021744317214447, 'YZX').rotateVector([2, 3, 5]), [-0.405106467953448, -2.53579954791501, -5.60407078849084]) });
  it('Should fuzz 413# YZX', function() { assert.v(Quaternion.fromEuler(-3.1387637045581607, -1.8409778598455007, -1.971272636796834, 'YZX').rotateVector([2, 3, 5]), [-2.76304606412105, -2.84421658533131, 4.71974665244561]) });
  it('Should fuzz 414# YZX', function() { assert.v(Quaternion.fromEuler(2.145861639606161, 0.11634271934286389, -0.28682637251740717, 'YZX').rotateVector([2, 3, 5]), [2.50270374643570, 4.49513430981423, -3.39562092912440]) });
  it('Should fuzz 415# YZX', function() { assert.v(Quaternion.fromEuler(-2.787722144812219, -0.8614201028335811, 1.0112503077678072, 'YZX').rotateVector([2, 3, 5]), [-1.14010661567186, -3.24043515812316, -5.11856785545533]) });
  it('Should fuzz 416# YZX', function() { assert.v(Quaternion.fromEuler(2.4151718428911533, -1.4148583001971677, 1.634282835016588, 'YZX').rotateVector([2, 3, 5]), [5.37123037356136, -2.78026202498660, 1.19164900308326]) });
  it('Should fuzz 417# YZX', function() { assert.v(Quaternion.fromEuler(2.3152086860249836, 1.541418476298574, -2.667363417793527, 'YZX').rotateVector([2, 3, 5]), [-4.58019141230220, 1.98780846365274, 3.61530968777278]) });
  it('Should fuzz 418# YZX', function() { assert.v(Quaternion.fromEuler(-2.605015531693149, -3.1090969018498917, 3.018660597318994, 'YZX').rotateVector([2, 3, 5]), [4.16692344655530, 3.52359777211244, 2.86722997523951]) });
  it('Should fuzz 419# YZX', function() { assert.v(Quaternion.fromEuler(2.070128929557062, 2.2347203070470343, 3.0020808242456134, 'YZX').rotateVector([2, 3, 5]), [-4.77308310050537, 3.83428667404254, 0.718278091639869]) });
  it('Should fuzz 420# YZX', function() { assert.v(Quaternion.fromEuler(1.0797812555425903, 1.2348328959877728, 0.27892134824900294, 'YZX').rotateVector([2, 3, 5]), [4.60707999200166, 2.38516553838175, 3.32953439715136]) });
  it('Should fuzz 421# YZX', function() { assert.v(Quaternion.fromEuler(0.521299409868444, 1.3431549817398398, -1.326981203723053, 'YZX').rotateVector([2, 3, 5]), [-5.16821332008746, 3.20687321254372, 1.00276381902224]) });
  it('Should fuzz 422# YZX', function() { assert.v(Quaternion.fromEuler(-2.528850539093474, 2.2061473707648718, -2.602931979403888, 'YZX').rotateVector([2, 3, 5]), [4.31768624122919, 1.61581313513806, 4.09227729199959]) });
  it('Should fuzz 423# YZX', function() { assert.v(Quaternion.fromEuler(2.725799701142284, 1.3641657179345419, -1.8971105686751584, 'YZX').rotateVector([2, 3, 5]), [1.20888669106073, 2.73184240269628, 5.39218230914041]) });
  it('Should fuzz 424# YZX', function() { assert.v(Quaternion.fromEuler(-2.0757449348238497, 0.5101309412034287, -0.30331010472436715, 'YZX').rotateVector([2, 3, 5]), [-3.20729899242385, 4.77838403108771, -2.20913540206184]) });
  it('Should fuzz 425# YZX', function() { assert.v(Quaternion.fromEuler(-0.16889872320124777, 2.065746451373453, 0.09506933728131761, 'YZX').rotateVector([2, 3, 5]), [-3.99994863250783, 0.566900104417483, 4.65607508626206]) });
  it('Should fuzz 426# YZX', function() { assert.v(Quaternion.fromEuler(1.2379501209834043, 1.4806315693984597, -1.131894414468686, 'YZX').rotateVector([2, 3, 5]), [-2.38731989706636, 2.51420698464521, 5.09700568446145]) });
  it('Should fuzz 427# YZX', function() { assert.v(Quaternion.fromEuler(0.10080715181935052, -0.6050862987626924, 1.0738339658532539, 'YZX').rotateVector([2, 3, 5]), [0.463868414995948, -3.57615828262200, 4.99959178645649]) });
  it('Should fuzz 428# YZX', function() { assert.v(Quaternion.fromEuler(-0.8480755220740441, 0.536997732562396, 1.3069915729441322, 'YZX').rotateVector([2, 3, 5]), [-0.644789801457489, -2.45233424043385, 5.61874566830820]) });
  it('Should fuzz 429# YZX', function() { assert.v(Quaternion.fromEuler(-1.7864945349988186, 2.8340481367682795, -3.0234940385345275, 'YZX').rotateVector([2, 3, 5]), [5.44852261964857, 2.88328201993935, -0.0169132099948534]) });
  it('Should fuzz 430# YZX', function() { assert.v(Quaternion.fromEuler(-1.9650161996019806, 2.3011308961060326, -2.2830848591414465, 'YZX').rotateVector([2, 3, 5]), [6.14788095779581, 0.273319132106768, -0.358965709777428]) });
  it('Should fuzz 431# YZX', function() { assert.v(Quaternion.fromEuler(-2.5198698521002236, 2.111602406641759, 0.7948777163372278, 'YZX').rotateVector([2, 3, 5]), [-3.47267352099299, 2.47023775257950, -4.45403907283324]) });
  it('Should fuzz 432# YZX', function() { assert.v(Quaternion.fromEuler(1.3987991979654844, -2.0250430248649933, 0.32794019247466855, 'YZX').rotateVector([2, 3, 5]), [5.65463610389946, -2.33673846916236, 0.751494417287012]) });
  it('Should fuzz 433# YZX', function() { assert.v(Quaternion.fromEuler(0.7857611677501612, 2.1014121889498503, 2.188599541561918, 'YZX').rotateVector([2, 3, 5]), [2.50994862800286, 4.66699880966945, -3.14948884667505]) });
  it('Should fuzz 434# YZX', function() { assert.v(Quaternion.fromEuler(1.910027192823704, -2.336802633179361, 2.2136717453324444, 'YZX').rotateVector([2, 3, 5]), [1.29002414055893, 2.57981225858907, 5.44797268965335]) });
  it('Should fuzz 435# YZX', function() { assert.v(Quaternion.fromEuler(2.9935152680448134, -1.3905550971780525, -0.174357574700037, 'YZX').rotateVector([2, 3, 5]), [-3.42372482813647, -1.28246222046693, -4.96320450457937]) });
  it('Should fuzz 436# YZX', function() { assert.v(Quaternion.fromEuler(-1.2961848289942925, -0.26715195104127654, -0.3101790349487228, 'YZX').rotateVector([2, 3, 5]), [-2.86474478980871, 3.69953242618491, 4.01331497852713]) });
  it('Should fuzz 437# YZX', function() { assert.v(Quaternion.fromEuler(0.11181123851574792, 2.571380958125105, -2.9323639056100506, 'YZX').rotateVector([2, 3, 5]), [-1.27119791398640, 2.67568732924286, -5.40599233995072]) });
  it('Should fuzz 438# YZX', function() { assert.v(Quaternion.fromEuler(1.9702061607740529, -2.8885709769385293, -1.9956928937713119, 'YZX').rotateVector([2, 3, 5]), [-3.98709730186279, -3.71372149941019, 2.88293734415041]) });
  it('Should fuzz 439# YZX', function() { assert.v(Quaternion.fromEuler(1.9997807927238371, -0.3043108634645848, 1.5087149501796713, 'YZX').rotateVector([2, 3, 5]), [2.81010304743677, -5.18277752410434, -1.80059379051064]) });
  it('Should fuzz 440# YZX', function() { assert.v(Quaternion.fromEuler(0.28229943329982055, -2.3046656922960667, -1.791144748034126, 'YZX').rotateVector([2, 3, 5]), [0.605713118968244, -4.31378916213802, -4.36168942981161]) });
  it('Should fuzz 441# YZX', function() { assert.v(Quaternion.fromEuler(-2.2576808199705107, -2.141035606909959, -1.4650164169040494, 'YZX').rotateVector([2, 3, 5]), [-0.239964636890016, -4.53861544457748, 4.16453920851815]) });
  it('Should fuzz 442# YZX', function() { assert.v(Quaternion.fromEuler(1.6910137572602562, -2.01939451298397, 2.0947350428370664, 'YZX').rotateVector([2, 3, 5]), [0.829445237135753, 0.726445089473434, 6.06500602889830]) });
  it('Should fuzz 443# YZX', function() { assert.v(Quaternion.fromEuler(-0.10401944091936821, -0.2024092254843013, 3.082041855858642, 'YZX').rotateVector([2, 3, 5]), [1.79001569829182, -3.62710888552750, -4.65187327131730]) });
  it('Should fuzz 444# YZX', function() { assert.v(Quaternion.fromEuler(2.256492426316126, -2.986705057437084, 0.820080916235741, 'YZX').rotateVector([2, 3, 5]), [5.74618436821087, 1.28171318659466, -1.82717719825921]) });
  it('Should fuzz 445# YZX', function() { assert.v(Quaternion.fromEuler(-0.3462381961216945, 1.658731726269484, -2.007022980889012, 'YZX').rotateVector([2, 3, 5]), [-1.58415775529240, 1.70560386813845, -5.70800837870252]) });
  it('Should fuzz 446# YZX', function() { assert.v(Quaternion.fromEuler(0.2908389914428544, -0.5945951173242645, -3.1151583447045543, 'YZX').rotateVector([2, 3, 5]), [-1.40730487573555, -3.49512980485764, -4.87888928281087]) });
  it('Should fuzz 447# YZX', function() { assert.v(Quaternion.fromEuler(3.0248558871649287, -2.895354932280577, 1.7215193954853119, 'YZX').rotateVector([2, 3, 5]), [3.49030339628155, 4.74356335906423, -1.82109551107260]) });
  it('Should fuzz 448# YZX', function() { assert.v(Quaternion.fromEuler(1.4919415890033134, -0.5849478256941478, 2.4750037517331647, 'YZX').rotateVector([2, 3, 5]), [-2.17397037327877, -5.64765727407487, 1.17380583176918]) });
  it('Should fuzz 449# YZX', function() { assert.v(Quaternion.fromEuler(-2.819220225869737, 2.39968804231179, -1.5415810191294568, 'YZX').rotateVector([2, 3, 5]), [5.56141525346718, -2.39755742709274, 1.14994728674627]) });
  it('Should fuzz 450# YZX', function() { assert.v(Quaternion.fromEuler(2.796660571455633, -2.3536467302989466, 1.5982416844594827, 'YZX').rotateVector([2, 3, 5]), [5.68455928260540, 2.16543920319728, -0.998328012128841]) });
  it('Should fuzz 451# YZX', function() { assert.v(Quaternion.fromEuler(1.588846105776427, 0.9131726587165314, 0.8011669902997869, 'YZX').rotateVector([2, 3, 5]), [5.58939623661306, 0.664059214479184, -2.51349857167277]) });
  it('Should fuzz 452# YZX', function() { assert.v(Quaternion.fromEuler(2.8467203067176206, 0.22158475221740526, -0.7143414396629355, 'YZX').rotateVector([2, 3, 5]), [-0.174748672235015, 5.84622229367820, -1.94708700228113]) });
  it('Should fuzz 453# YZX', function() { assert.v(Quaternion.fromEuler(-0.9509209967070511, 1.3643690382201168, -1.3076028102577373, 'YZX').rotateVector([2, 3, 5]), [-1.65179238127301, 3.10704386040879, -5.06140893217141]) });
  it('Should fuzz 454# YZX', function() { assert.v(Quaternion.fromEuler(-0.3466240301008239, -2.3266379796814234, -1.5179032885060415, 'YZX').rotateVector([2, 3, 5]), [3.16357038210557, -4.98888718848496, -1.76148433374669]) });
  it('Should fuzz 455# YZX', function() { assert.v(Quaternion.fromEuler(1.5891707747077275, -1.0757080105280097, -0.047958926991244155, 'YZX').rotateVector([2, 3, 5]), [4.77983043766268, -0.222279258838661, -3.88636242755145]) });
  it('Should fuzz 456# YZX', function() { assert.v(Quaternion.fromEuler(-2.881718333241962, 0.29279821989914545, 0.49894366025696124, 'YZX').rotateVector([2, 3, 5]), [-3.28016947122640, 0.808749332047200, -5.15620138842031]) });
  it('Should fuzz 457# YZX', function() { assert.v(Quaternion.fromEuler(2.3566146508796155, 2.131990462575984, 1.206461337311742, 'YZX').rotateVector([2, 3, 5]), [1.83574562176485, 3.61065272158846, -4.64685107747784]) });
  it('Should fuzz 458# YZX', function() { assert.v(Quaternion.fromEuler(-2.546585427479958, 2.2407497353740045, 1.7477467040142578, 'YZX').rotateVector([2, 3, 5]), [-3.67131098987440, 4.95188239019656, -0.0183414636455024]) });
  it('Should fuzz 459# YZX', function() { assert.v(Quaternion.fromEuler(3.0489175177991585, 0.6565305984347147, 1.1802820387230017, 'YZX').rotateVector([2, 3, 5]), [-3.26050481204767, -1.53706169057483, -5.00065493010478]) });
  it('Should fuzz 460# YZX', function() { assert.v(Quaternion.fromEuler(-2.296081787995674, -0.5102849170896979, 0.8588621274280701, 'YZX').rotateVector([2, 3, 5]), [-4.71018376257176, -2.56988041003284, -3.03477900364010]) });
  it('Should fuzz 461# YZX', function() { assert.v(Quaternion.fromEuler(1.3787527853308603, -2.804710764293758, -1.844836495022706, 'YZX').rotateVector([2, 3, 5]), [-4.27101900217104, -4.43772171181315, -0.254995473677638]) });
  it('Should fuzz 462# YZX', function() { assert.v(Quaternion.fromEuler(1.7752933916420695, 0.1426621911132595, 1.6978991612467915, 'YZX').rotateVector([2, 3, 5]), [1.73699262094461, -5.00134308707609, -3.15743946262478]) });
  it('Should fuzz 463# YZX', function() { assert.v(Quaternion.fromEuler(-0.8851444312799308, -2.195693814230981, -2.9436807739261344, 'YZX').rotateVector([2, 3, 5]), [2.50456870749619, -0.476397886239815, -5.61250217313250]) });
  it('Should fuzz 464# YZX', function() { assert.v(Quaternion.fromEuler(-0.8722099915094432, -2.065516952610192, 0.4611241459124886, 'YZX').rotateVector([2, 3, 5]), [-4.80029987364074, -1.97949826354850, 3.32245507836196]) });
  it('Should fuzz 465# YZX', function() { assert.v(Quaternion.fromEuler(-1.4735426638635105, 1.969001109773103, 0.521411043097312, 'YZX').rotateVector([2, 3, 5]), [-5.88757367511315, 1.80054101112362, -0.307454528957730]) });
  it('Should fuzz 466# YZX', function() { assert.v(Quaternion.fromEuler(0.2628757839457201, 1.81073277956449, -2.983458223619645, 'YZX').rotateVector([2, 3, 5]), [0.175490272940286, 2.45961965037695, -5.64973223609605]) });
  it('Should fuzz 467# YZX', function() { assert.v(Quaternion.fromEuler(-0.60633381126281, -1.8549022424988744, 3.030357001292093, 'YZX').rotateVector([2, 3, 5]), [-0.608346678941541, -0.928549248376930, -6.06363839716382]) });
  it('Should fuzz 468# YZX', function() { assert.v(Quaternion.fromEuler(0.7026609658531764, -1.022385890744009, 2.958939495908311, 'YZX').rotateVector([2, 3, 5]), [-4.54224840399558, -3.71815738711351, -1.88236157022313]) });
  it('Should fuzz 469# YZX', function() { assert.v(Quaternion.fromEuler(2.6962150077676004, -2.087677461565663, -2.5684497192456943, 'YZX').rotateVector([2, 3, 5]), [-1.76836780206212, -1.83300467216670, 5.61364134839812]) });
  it('Should fuzz 470# YZX', function() { assert.v(Quaternion.fromEuler(-1.474480817789364, -1.4634803206165223, 0.4778731441126789, 'YZX').rotateVector([2, 3, 5]), [-5.73712915659962, -1.94945620796545, 1.13356496669552]) });
  it('Should fuzz 471# YZX', function() { assert.v(Quaternion.fromEuler(2.5383669048275204, 0.9971461514512372, 0.26551616033537506, 'YZX').rotateVector([2, 3, 5]), [3.38468869184329, 2.53885804443129, -4.48308847665699]) });
  it('Should fuzz 472# YZX', function() { assert.v(Quaternion.fromEuler(-2.537577119186702, 0.1283469736677687, 1.8034178948920392, 'YZX').rotateVector([2, 3, 5]), [-3.22130732657324, -5.25521840734411, 0.0765414846812384]) });
  it('Should fuzz 473# YZX', function() { assert.v(Quaternion.fromEuler(2.7204228271846667, 2.3003906591686105, 1.6510310097128462, 'YZX').rotateVector([2, 3, 5]), [-1.27880200051142, 4.97327753739327, -3.41045099357073]) });
  it('Should fuzz 474# YZX', function() { assert.v(Quaternion.fromEuler(3.138889852646602, 1.4716942205001011, -2.7691859942977004, 'YZX').rotateVector([2, 3, 5]), [-1.18370155299053, 1.89371319516970, 5.74566801754922]) });
  it('Should fuzz 475# YZX', function() { assert.v(Quaternion.fromEuler(-2.8093303074916136, -2.685222501628843, -0.11503236348611257, 'YZX').rotateVector([2, 3, 5]), [-1.29128080675752, -4.07172254061966, -4.44451003264808]) });
  it('Should fuzz 476# YZX', function() { assert.v(Quaternion.fromEuler(1.2037127227916509, 2.8809764280324135, 2.195296824707052, 'YZX').rotateVector([2, 3, 5]), [-0.613288007375255, 6.12949715659571, 0.230526413442672]) });
  it('Should fuzz 477# YZX', function() { assert.v(Quaternion.fromEuler(3.120982656609306, -0.1118063425059872, -0.5783938933502788, 'YZX').rotateVector([2, 3, 5]), [-2.51973340094999, 4.98952559823747, -2.59914945562390]) });
  it('Should fuzz 478# YZX', function() { assert.v(Quaternion.fromEuler(-0.5823035661076572, -2.6411820600916345, 1.86253825497211, 'YZX').rotateVector([2, 3, 5]), [-4.51951052379508, 3.99904743560215, -1.25763437974211]) });
  it('Should fuzz 479# YZX', function() { assert.v(Quaternion.fromEuler(1.0858799372031287, -2.3885675852582864, 1.324952904278395, 'YZX').rotateVector([2, 3, 5]), [1.65754979659016, 1.63801415503734, 5.70696401773493]) });
  it('Should fuzz 480# YZX', function() { assert.v(Quaternion.fromEuler(1.4260073456331153, -0.7296390793501155, 0.5011368882994964, 'YZX').rotateVector([2, 3, 5]), [6.00261481427575, -1.16250413691686, -0.785620470130768]) });
  it('Should fuzz 481# YZX', function() { assert.v(Quaternion.fromEuler(-2.7454531229084687, 1.7968316880155006, 0.9587510589817922, 'YZX').rotateVector([2, 3, 5]), [-3.77210977888939, 2.47999770866486, -4.19771356586226]) });
  it('Should fuzz 482# YZX', function() { assert.v(Quaternion.fromEuler(-2.3922387389860527, 1.784541592082853, 1.4775106697678657, 'YZX').rotateVector([2, 3, 5]), [-5.40311533305596, 2.95120464749286, 0.311023835601328]) });
  it('Should fuzz 483# YZX', function() { assert.v(Quaternion.fromEuler(0.1248702476107737, 1.538393210746941, -0.7343296498813179, 'YZX').rotateVector([2, 3, 5]), [-5.25479884248369, 2.17964004716265, 2.37408053566783]) });
  it('Should fuzz 484# YZX', function() { assert.v(Quaternion.fromEuler(-2.58699904417142, 2.1712671138551043, -1.6759124665169822, 'YZX').rotateVector([2, 3, 5]), [6.07489783968288, -0.981568005583656, 0.363511331089936]) });
  it('Should fuzz 485# YZX', function() { assert.v(Quaternion.fromEuler(-1.1354904528864558, 1.7255701298146198, 2.7857016315497356, 'YZX').rotateVector([2, 3, 5]), [5.06926785210925, 2.67814327716519, 2.26496623165703]) });
  it('Should fuzz 486# YZX', function() { assert.v(Quaternion.fromEuler(-1.7933401501087762, 2.0382246974531455, 1.331381903658258, 'YZX').rotateVector([2, 3, 5]), [-4.61699325389686, 3.65360707434809, 1.82606917715199]) });
  it('Should fuzz 487# YZX', function() { assert.v(Quaternion.fromEuler(-0.8413017841524204, -1.7364018900611065, -2.6267436563113296, 'YZX').rotateVector([2, 3, 5]), [4.02787360454506, -1.94806095432309, -4.24043544274064]) });
  it('Should fuzz 488# YZX', function() { assert.v(Quaternion.fromEuler(-0.5677380559632592, 0.5813670121873717, 3.0105577071689638, 'YZX').rotateVector([2, 3, 5]), [5.54363449375327, -1.93328349589338, -1.87897086836788]) });
  it('Should fuzz 489# YZX', function() { assert.v(Quaternion.fromEuler(2.8076941806090483, 1.2260360270343087, 0.6514857348092318, 'YZX').rotateVector([2, 3, 5]), [0.685916454731195, 1.66388523621412, -5.89584638010843]) });
  it('Should fuzz 490# YZX', function() { assert.v(Quaternion.fromEuler(-2.3698392446642367, -0.591855428845443, -1.2174321816815206, 'YZX').rotateVector([2, 3, 5]), [-2.72413450441256, 3.63893032610572, 4.16380562510032]) });
  it('Should fuzz 491# YZX', function() { assert.v(Quaternion.fromEuler(-1.8659121641879206, -1.4804768748918082, -0.18370372416586322, 'YZX').rotateVector([2, 3, 5]), [-5.35043378260458, -1.64342865247046, 2.58302160312352]) });
  it('Should fuzz 492# YZX', function() { assert.v(Quaternion.fromEuler(1.5718038195380561, -1.340933907773307, -2.167183303433245, 'YZX').rotateVector([2, 3, 5]), [-5.29325675314385, -1.38875021258590, -2.83774660467415]) });
  it('Should fuzz 493# YZX', function() { assert.v(Quaternion.fromEuler(-1.7964131803282637, -1.5875543103013807, -1.5727448101674069, 'YZX').rotateVector([2, 3, 5]), [1.82388481286980, -2.08340706000090, 5.50752750439989]) });
  it('Should fuzz 494# YZX', function() { assert.v(Quaternion.fromEuler(-0.524015347267925, -1.720314583381709, 0.6782180776462612, 'YZX').rotateVector([2, 3, 5]), [-3.83361474855646, -1.85837401170537, 4.45531637398159]) });
  it('Should fuzz 495# YZX', function() { assert.v(Quaternion.fromEuler(1.1658482998120707, -1.0371836152729412, 2.084500618565283, 'YZX').rotateVector([2, 3, 5]), [-1.43320470043422, -4.68678869558400, 3.73897526196674]) });
  it('Should fuzz 496# YZX', function() { assert.v(Quaternion.fromEuler(-1.7960742953413014, 2.6951733809115463, -1.357797686517213, 'YZX').rotateVector([2, 3, 5]), [2.76330025959489, -4.11662289956117, -3.66300253591659]) });
  it('Should fuzz 497# YZX', function() { assert.v(Quaternion.fromEuler(-1.7359669387135843, -2.0850594636187054, 3.0502273728288385, 'YZX').rotateVector([2, 3, 5]), [5.29612157026887, -0.0473880645409200, -3.15417987506607]) });
  it('Should fuzz 498# YZX', function() { assert.v(Quaternion.fromEuler(1.276688506356522, 3.095179969552399, 1.646846622184606, 'YZX').rotateVector([2, 3, 5]), [1.99028244654289, 5.30065665333720, 2.43758380910592]) });
  it('Should fuzz 499# YZX', function() { assert.v(Quaternion.fromEuler(-0.652841757265989, 1.3309193832937352, 1.5348891674633354, 'YZX').rotateVector([2, 3, 5]), [2.21974596231127, 0.781171985502079, 5.69758704995980]) });
  it('Should fuzz 500# XZY', function() { assert.v(Quaternion.fromEuler(1.5059215796302743, -0.16763489801575648, -0.6012380266394222, 'XZY').rotateVector([2, 3, 5]), [-0.661966935151862, -5.03893883868977, 3.48868100529547]) });
  it('Should fuzz 501# XZY', function() { assert.v(Quaternion.fromEuler(-1.286092504156149, 1.4125637729163882, -2.195161788363402, 'XZY').rotateVector([2, 3, 5]), [-3.78597313629205, -2.56458941216802, 4.13391927331323]) });
  it('Should fuzz 502# XZY', function() { assert.v(Quaternion.fromEuler(2.1263396006291027, 3.0998103927483633, 2.5723023944712775, 'XZY').rotateVector([2, 3, 5]), [-1.13503269081424, 6.05259350847680, 0.278949120678806]) });
  it('Should fuzz 503# XZY', function() { assert.v(Quaternion.fromEuler(-0.04951036451141011, 2.5473037018298914, -1.8377169238340627, 'XZY').rotateVector([2, 3, 5]), [2.75335006522017, -5.44454665336501, 0.880894521315659]) });
  it('Should fuzz 504# XZY', function() { assert.v(Quaternion.fromEuler(-1.3432480308666888, -2.7686500627828816, -3.1158927225869757, 'XZY').rotateVector([2, 3, 5]), [3.07462867606002, -5.27478439379061, 0.850475222080235]) });
  it('Should fuzz 505# XZY', function() { assert.v(Quaternion.fromEuler(2.346424090772042, 0.011587394613581381, -0.442915818186536, 'XZY').rotateVector([2, 3, 5]), [-0.370605854528109, -5.93505077974599, -1.62413778431081]) });
  it('Should fuzz 506# XZY', function() { assert.v(Quaternion.fromEuler(1.819676326709362, 0.62970412811939, -1.171670161728048, 'XZY').rotateVector([2, 3, 5]), [-4.86195036857926, -3.71090566895728, -0.768516577292057]) });
  it('Should fuzz 507# XZY', function() { assert.v(Quaternion.fromEuler(0.8944194027531625, 1.8124888891639435, -0.30255270893067143, 'XZY').rotateVector([2, 3, 5]), [-3.01317704084234, -4.38143400520537, 3.11830084798927]) });
  it('Should fuzz 508# XZY', function() { assert.v(Quaternion.fromEuler(-2.3226732410638355, -1.6228377180649538, 3.0821833781103045, 'XZY').rotateVector([2, 3, 5]), [3.08434808141071, -4.78502027290856, 2.36439799960840]) });
  it('Should fuzz 509# XZY', function() { assert.v(Quaternion.fromEuler(-0.05814527604955666, -0.11738330577517608, -3.0571441985489654, 'XZY').rotateVector([2, 3, 5]), [-2.04665531227934, 2.97690364501816, -4.99492209358628]) });
  it('Should fuzz 510# XZY', function() { assert.v(Quaternion.fromEuler(0.03252753242308115, -1.9831358852110608, 0.8378217998540864, 'XZY').rotateVector([2, 3, 5]), [0.723105426566094, -5.89013358519500, 1.66836593426880]) });
  it('Should fuzz 511# XZY', function() { assert.v(Quaternion.fromEuler(-2.154517490872676, 0.06377546485006569, -0.2042561426038021, 'XZY').rotateVector([2, 3, 5]), [0.751113856424890, 2.74066069091422, -5.47033883337807]) });
  it('Should fuzz 512# XZY', function() { assert.v(Quaternion.fromEuler(2.1844719435517606, 0.9995088970751018, 1.2308409944094132, 'XZY').rotateVector([2, 3, 5]), [0.385831637265195, -3.36226835474406, 5.15230875029554]) });
  it('Should fuzz 513# XZY', function() { assert.v(Quaternion.fromEuler(0.14861939814633907, 2.5962591389451823, 2.130404245148391, 'XZY').rotateVector([2, 3, 5]), [-4.27111017938107, -0.263550463454822, -4.43713409632841]) });
  it('Should fuzz 514# XZY', function() { assert.v(Quaternion.fromEuler(-0.3539562813798187, -2.8975272524296916, -1.5012871333001725, 'XZY').rotateVector([2, 3, 5]), [5.43026065072637, -0.819588876602937, 2.80009702305501]) });
  it('Should fuzz 515# XZY', function() { assert.v(Quaternion.fromEuler(-1.1166767935243156, -2.45921451048047, 2.721426552384382, 'XZY').rotateVector([2, 3, 5]), [1.72621512452156, -5.91595416553132, -0.147199372300522]) });
  it('Should fuzz 516# XZY', function() { assert.v(Quaternion.fromEuler(-2.572670566173903, -2.6256822164478697, 0.2169515446963981, 'XZY').rotateVector([2, 3, 5]), [-1.15511079389628, 5.85610745933279, -1.54004041459022]) });
  it('Should fuzz 517# XZY', function() { assert.v(Quaternion.fromEuler(3.1242525972778914, -2.7807840499792706, -0.31873251120089385, 'XZY').rotateVector([2, 3, 5]), [0.748047707618294, 2.83056455513010, -5.42478837618281]) });
  it('Should fuzz 518# XZY', function() { assert.v(Quaternion.fromEuler(2.137376265139303, -0.17626173387689725, 1.600581214437744, 'XZY').rotateVector([2, 3, 5]), [5.38776031044909, 0.691852226286934, 2.91434029140926]) });
  it('Should fuzz 519# XZY', function() { assert.v(Quaternion.fromEuler(-1.2169595446869423, 3.0270823809398655, 1.3895619788956983, 'XZY').rotateVector([2, 3, 5]), [-5.58680774821603, -1.82368974958312, 1.86057380443206]) });
  it('Should fuzz 520# XZY', function() { assert.v(Quaternion.fromEuler(1.088303727113244, -0.9818906837033552, -0.30482586411878687, 'XZY').rotateVector([2, 3, 5]), [2.72080640884053, -4.14067179652894, 3.66770358113113]) });
  it('Should fuzz 521# XZY', function() { assert.v(Quaternion.fromEuler(1.974304595123141, 2.1234648086774603, -1.3305628041412274, 'XZY').rotateVector([2, 3, 5]), [-0.253763496920095, -0.798340400385325, -6.10722987063231]) });
  it('Should fuzz 522# XZY', function() { assert.v(Quaternion.fromEuler(0.415740189671685, -2.0256045960166404, -1.343606592469988, 'XZY').rotateVector([2, 3, 5]), [4.63715281239137, 1.18587948413805, 3.88464974529639]) });
  it('Should fuzz 523# XZY', function() { assert.v(Quaternion.fromEuler(0.03599784007294504, 1.5013889165119156, -2.3983279831758777, 'XZY').rotateVector([2, 3, 5]), [-3.32954882637192, -4.54946960645527, -2.49327714318829]) });
  it('Should fuzz 524# XZY', function() { assert.v(Quaternion.fromEuler(-1.6971068348619258, -0.8188754328689893, 0.4421420973611516, 'XZY').rotateVector([2, 3, 5]), [4.88714422942506, 3.73927503033604, 0.365572876869678]) });
  it('Should fuzz 525# XZY', function() { assert.v(Quaternion.fromEuler(-2.3998063180630327, -0.2352632429208028, -0.6876113075950729, 'XZY').rotateVector([2, 3, 5]), [-0.883795172441350, 1.03739588967335, -6.01188122481293]) });
  it('Should fuzz 526# XZY', function() { assert.v(Quaternion.fromEuler(-2.581945607244119, -1.22547742445706, 0.7510647173845051, 'XZY').rotateVector([2, 3, 5]), [4.47274014649147, 4.24176571992633, -0.0449350555940959]) });
  it('Should fuzz 527# XZY', function() { assert.v(Quaternion.fromEuler(-2.523285613535753, -1.0927165110095167, 0.47722146614405636, 'XZY').rotateVector([2, 3, 5]), [4.53757814166166, 3.86418375660990, -1.57431524907388]) });
  it('Should fuzz 528# XZY', function() { assert.v(Quaternion.fromEuler(-0.017054127906734884, 0.40572472832998274, 0.3633407859209492, 'XZY').rotateVector([2, 3, 5]), [2.16634055971632, 4.26260602457041, 3.89065013315564]) });
  it('Should fuzz 529# XZY', function() { assert.v(Quaternion.fromEuler(-3.0835230688509743, -1.9381837568132592, -0.32598311003474034, 'XZY').rotateVector([2, 3, 5]), [2.69439815557997, 1.66121916619906, -5.28966629014158]) });
  it('Should fuzz 530# XZY', function() { assert.v(Quaternion.fromEuler(2.377667450715723, -0.3229322136934538, -2.493027824214641, 'XZY').rotateVector([2, 3, 5]), [-3.42356506717756, -1.19100104952420, 4.98605241958343]) });
  it('Should fuzz 531# XZY', function() { assert.v(Quaternion.fromEuler(-0.3100826420806291, 0.45545492443914704, -1.0331398584273814, 'XZY').rotateVector([2, 3, 5]), [-4.25654800447254, 2.50129844719538, 3.69124710141150]) });
  it('Should fuzz 532# XZY', function() { assert.v(Quaternion.fromEuler(2.1677687629293168, 1.1423768703355917, -2.6682546868937993, 'XZY').rotateVector([2, 3, 5]), [-4.41528261687720, 4.30164216090411, -0.0339725276394429]) });
  it('Should fuzz 533# XZY', function() { assert.v(Quaternion.fromEuler(-1.7900146038214693, 1.5613218454970106, -1.8084791646633651, 'XZY').rotateVector([2, 3, 5]), [-3.05036673988529, 1.90110842559620, 5.00809839223719]) });
  it('Should fuzz 534# XZY', function() { assert.v(Quaternion.fromEuler(-2.699510384937046, 2.212858205367638, -2.74983154280313, 'XZY').rotateVector([2, 3, 5]), [-0.152381093578589, 2.69346432304323, 5.54274570432499]) });
  it('Should fuzz 535# XZY', function() { assert.v(Quaternion.fromEuler(3.083071899728691, 2.0803895092781106, -1.9077434395336796, 'XZY').rotateVector([2, 3, 5]), [0.00568176203977444, 6.13568930492182, -0.594377381003118]) });
  it('Should fuzz 536# XZY', function() { assert.v(Quaternion.fromEuler(-0.07003484365497492, -2.0418337271023352, 0.6946852231099601, 'XZY').rotateVector([2, 3, 5]), [0.523487675236157, -5.38987012651569, 2.94537954653888]) });
  it('Should fuzz 537# XZY', function() { assert.v(Quaternion.fromEuler(-2.1419754979782124, -1.6948082705505954, -2.99523760681895, 'XZY').rotateVector([2, 3, 5]), [3.31189862431578, -5.16801858562409, 0.568252937431284]) });
  it('Should fuzz 538# XZY', function() { assert.v(Quaternion.fromEuler(1.023183081755704, 3.0338947454867915, -1.705165499188686, 'XZY').rotateVector([2, 3, 5]), [4.87013078335591, -2.96546948230476, -2.34260899480222]) });
  it('Should fuzz 539# XZY', function() { assert.v(Quaternion.fromEuler(-0.5711278015777808, 2.8942351133113524, -0.7197192253569842, 'XZY').rotateVector([2, 3, 5]), [1.00281774647697, -0.0709218746978095, 6.08188512346626]) });
  it('Should fuzz 540# XZY', function() { assert.v(Quaternion.fromEuler(-0.6972297777769421, -1.234676918034179, -1.5071205790147395, 'XZY').rotateVector([2, 3, 5]), [1.22831197622934, 5.76362559760245, -1.80883102022089]) });
  it('Should fuzz 541# XZY', function() { assert.v(Quaternion.fromEuler(0.4098685439024701, -0.11283993684071181, -1.1370956570732131, 'XZY').rotateVector([2, 3, 5]), [-3.33530951443947, 1.55530779814516, 4.94537441412866]) });
  it('Should fuzz 542# XZY', function() { assert.v(Quaternion.fromEuler(-3.1153443092849566, 1.0762012246214345, -1.1735492865468018, 'XZY').rotateVector([2, 3, 5]), [-4.46175768093656, 2.05155034541850, -3.72610514838441]) });
  it('Should fuzz 543# XZY', function() { assert.v(Quaternion.fromEuler(0.6766258375837353, 1.4521827785311059, 0.8205214080856411, 'XZY').rotateVector([2, 3, 5]), [-2.38473573569990, 2.94561462047912, 4.86172705717788]) });
  it('Should fuzz 544# XZY', function() { assert.v(Quaternion.fromEuler(-2.0899567673066217, -2.6114506308627132, 1.0150402250752961, 'XZY').rotateVector([2, 3, 5]), [-3.05784175028479, 3.42969691917288, 4.10935309663593]) });
  it('Should fuzz 545# XZY', function() { assert.v(Quaternion.fromEuler(2.5147139195490897, -3.0445708903162068, -0.6673352499570595, 'XZY').rotateVector([2, 3, 5]), [1.80697200193407, -0.731345570832335, -5.84807539625220]) });
  it('Should fuzz 546# XZY', function() { assert.v(Quaternion.fromEuler(0.8056089605437986, -2.597743242476285, -2.1663194645443404, 'XZY').rotateVector([2, 3, 5]), [6.05439796054197, 0.936174598499439, -0.683990099716087]) });
  it('Should fuzz 547# XZY', function() { assert.v(Quaternion.fromEuler(-2.4718301834333887, 2.3551369283738914, -1.4951315575753998, 'XZY').rotateVector([2, 3, 5]), [1.29133413707453, 5.81681862847854, 1.58021428604193]) });
  it('Should fuzz 548# XZY', function() { assert.v(Quaternion.fromEuler(0.40961998749633777, -2.2788856818413206, -0.2885058541221541, 'XZY').rotateVector([2, 3, 5]), [1.95704735934383, -4.27008366521741, 3.99203596242929]) });
  it('Should fuzz 549# XZY', function() { assert.v(Quaternion.fromEuler(1.0240377222466153, -0.7020124422167293, -0.19309724644922932, 'XZY').rotateVector([2, 3, 5]), [2.70335483568735, -3.66545062530245, 4.15407563073130]) });
  it('Should fuzz 550# XZY', function() { assert.v(Quaternion.fromEuler(0.07004366617808966, -3.1095989168082454, -0.5414845166353728, 'XZY').rotateVector([2, 3, 5]), [0.958677663454456, -3.33558474185085, 5.09458649622571]) });
  it('Should fuzz 551# XZY', function() { assert.v(Quaternion.fromEuler(-2.689207759567477, -2.4593275600989624, 2.212346262743721, 'XZY').rotateVector([2, 3, 5]), [-0.288514087473090, 1.67892614868448, 5.92435368699347]) });
  it('Should fuzz 552# XZY', function() { assert.v(Quaternion.fromEuler(-1.883938366042418, -1.2254605901005933, 0.2598245181133869, 'XZY').rotateVector([2, 3, 5]), [3.91202449412110, 4.72812926877552, 0.583830433554812]) });
  it('Should fuzz 553# XZY', function() { assert.v(Quaternion.fromEuler(3.0216628665312717, 1.3442803332180455, -1.019181639967655, 'XZY').rotateVector([2, 3, 5]), [-3.64433940762752, 1.91958627900577, -4.58628158745905]) });
  it('Should fuzz 554# XZY', function() { assert.v(Quaternion.fromEuler(-2.6659948431837397, -1.5810140375301667, -2.7094565963701474, 'XZY').rotateVector([2, 3, 5]), [3.03979603404440, -5.14418879800147, 1.51557305397137]) });
  it('Should fuzz 555# XZY', function() { assert.v(Quaternion.fromEuler(-2.8900444749851437, -3.103277020368072, -1.5594220777593615, 'XZY').rotateVector([2, 3, 5]), [5.08819450144061, 3.23073502087577, -1.29330117930684]) });
  it('Should fuzz 556# XZY', function() { assert.v(Quaternion.fromEuler(1.957823538937956, -0.5930297649003831, 0.050896203738147516, 'XZY').rotateVector([2, 3, 5]), [3.54392046185992, -4.99393618862913, -0.707975355440371]) });
  it('Should fuzz 557# XZY', function() { assert.v(Quaternion.fromEuler(-2.661183661574412, -2.728180512298212, -1.1604048590585714, 'XZY').rotateVector([2, 3, 5]), [4.67307108326828, 2.85660294823093, -2.82882064593713]) });
  it('Should fuzz 558# XZY', function() { assert.v(Quaternion.fromEuler(-2.1087394184557717, -0.8093452497519911, 1.1983808981905089, 'XZY').rotateVector([2, 3, 5]), [5.88700078310194, 0.899160179055390, 1.59208440484739]) });
  it('Should fuzz 559# XZY', function() { assert.v(Quaternion.fromEuler(-1.455412167452048, -2.0627492971916754, -2.8228328014416495, 'XZY').rotateVector([2, 3, 5]), [4.28148711082138, -3.90534950182915, -2.10169298148735]) });
  it('Should fuzz 560# XZY', function() { assert.v(Quaternion.fromEuler(-1.2254670641896825, 3.0584036486955064, -0.3231709117438153, 'XZY').rotateVector([2, 3, 5]), [-0.556803878230170, 4.05559207878742, 4.60891986604937]) });
  it('Should fuzz 561# XZY', function() { assert.v(Quaternion.fromEuler(1.181873649857561, -2.2959949306329084, -0.3152745480483339, 'XZY').rotateVector([2, 3, 5]), [2.01226714091042, -5.82654301350859, -0.0466633190676955]) });
  it('Should fuzz 562# XZY', function() { assert.v(Quaternion.fromEuler(2.961621230634371, -2.835751616865155, -2.6432003453660156, 'XZY').rotateVector([2, 3, 5]), [4.85762546435840, 2.20117000295742, 3.09165416340464]) });
  it('Should fuzz 563# XZY', function() { assert.v(Quaternion.fromEuler(0.384086267090725, -1.1101568387076317, 1.248700354482331, 'XZY').rotateVector([2, 3, 5]), [5.07704183133459, -3.11057278279596, -1.59624033460120]) });
  it('Should fuzz 564# XZY', function() { assert.v(Quaternion.fromEuler(-1.4089882335714499, -2.2797290385451645, 0.5885867425981592, 'XZY').rotateVector([2, 3, 5]), [-0.612973460616492, 2.15091929168202, 5.74437200547196]) });
  it('Should fuzz 565# XZY', function() { assert.v(Quaternion.fromEuler(2.4499162377133556, 0.5166561742434652, -2.4802344965923684, 'XZY').rotateVector([2, 3, 5]), [-5.52434887709016, 1.49310177698522, 2.29177149117364]) });
  it('Should fuzz 566# XZY', function() { assert.v(Quaternion.fromEuler(1.6483742847914709, -1.6016132693686023, 2.3429619564175006, 'XZY').rotateVector([2, 3, 5]), [2.93120098819333, 5.08299064469213, -1.88977958312251]) });
  it('Should fuzz 567# XZY', function() { assert.v(Quaternion.fromEuler(-1.919407810675893, -0.02435875884121197, 0.8912675932236267, 'XZY').rotateVector([2, 3, 5]), [5.21774020735547, 0.509310454598363, -3.24280588216176]) });
  it('Should fuzz 568# XZY', function() { assert.v(Quaternion.fromEuler(-0.9529405906125157, 0.6868997573685602, -0.6184046715453944, 'XZY').rotateVector([2, 3, 5]), [-2.88369516836833, 5.14348799979322, 1.79689548163279]) });
  it('Should fuzz 569# XZY', function() { assert.v(Quaternion.fromEuler(2.3997300459563906, 2.4672712558113012, 1.1759234765913202, 'XZY').rotateVector([2, 3, 5]), [-6.07918629936496, -0.803181423680058, 0.631184234806790]) });
  it('Should fuzz 570# XZY', function() { assert.v(Quaternion.fromEuler(2.4194722927302132, -1.4637499260358655, 1.3329821914590996, 'XZY').rotateVector([2, 3, 5]), [3.55234264447990, 4.24275551758475, -2.71659480861863]) });
  it('Should fuzz 571# XZY', function() { assert.v(Quaternion.fromEuler(-0.7849265474958047, 2.5582255223100816, -0.8189914823327604, 'XZY').rotateVector([2, 3, 5]), [0.255721948199885, 0.783739791879799, 6.10903905895461]) });
  it('Should fuzz 572# XZY', function() { assert.v(Quaternion.fromEuler(-1.3137632969255284, 2.106582563641843, 2.0794539531105825, 'XZY').rotateVector([2, 3, 5]), [-4.31177974887774, -3.69211574892736, -2.40350508501447]) });
  it('Should fuzz 573# XZY', function() { assert.v(Quaternion.fromEuler(0.6839916542096187, 3.1285604062569288, 0.621411570822219, 'XZY').rotateVector([2, 3, 5]), [-4.57574244669705, -4.11221424006291, 0.390224429423282]) });
  it('Should fuzz 574# XZY', function() { assert.v(Quaternion.fromEuler(-0.535783382350397, -1.4612454591799373, -2.2154668503458534, 'XZY').rotateVector([2, 3, 5]), [2.41366955889132, 4.00732065376588, -4.01442155713407]) });
  it('Should fuzz 575# XZY', function() { assert.v(Quaternion.fromEuler(-0.5286696147478911, 1.1261549952768846, 2.5445946809376245, 'XZY').rotateVector([2, 3, 5]), [-2.21073420595511, -0.636843666200824, -5.71901078993911]) });
  it('Should fuzz 576# XZY', function() { assert.v(Quaternion.fromEuler(0.1779799502801156, -0.7859975995437756, -0.3683006110589866, 'XZY').rotateVector([2, 3, 5]), [2.16904070847463, 1.08746018922859, 5.66680622059929]) });
  it('Should fuzz 577# XZY', function() { assert.v(Quaternion.fromEuler(0.35770620115436724, 1.5428760257956826, -1.9501212932840315, 'XZY').rotateVector([2, 3, 5]), [-3.14916654458185, -4.96610601283208, -1.84947050363057]) });
  it('Should fuzz 578# XZY', function() { assert.v(Quaternion.fromEuler(-0.2490071557499851, -2.213077122916538, -3.1083963413111992, 'XZY').rotateVector([2, 3, 5]), [3.69898988472007, -1.27681648293534, -4.76310964619158]) });
  it('Should fuzz 579# XZY', function() { assert.v(Quaternion.fromEuler(-0.36403793869907863, -0.3572923492782816, 1.1051051499319584, 'XZY').rotateVector([2, 3, 5]), [6.07599970110579, 1.03589851135690, 0.0956133167028601]) });
  it('Should fuzz 580# XZY', function() { assert.v(Quaternion.fromEuler(-0.9310132373191737, -2.8196518686616434, 1.1003926145121765, 'XZY').rotateVector([2, 3, 5]), [-4.13863886057524, -2.32436437343120, 3.93306478986302]) });
  it('Should fuzz 581# XZY', function() { assert.v(Quaternion.fromEuler(-1.7739929220869382, 0.04964920461142519, -0.9910238989877276, 'XZY').rotateVector([2, 3, 5]), [-3.23235166469019, 3.74782715570175, -3.67500943220002]) });
  it('Should fuzz 582# XZY', function() { assert.v(Quaternion.fromEuler(-0.31134077972309226, 2.7578544257674302, -2.4918168020366824, 'XZY').rotateVector([2, 3, 5]), [3.15848832585516, -5.14257913341564, -1.25611757092825]) });
  it('Should fuzz 583# XZY', function() { assert.v(Quaternion.fromEuler(-0.9380889531425485, 2.923108105357417, 0.9433660142631775, 'XZY').rotateVector([2, 3, 5]), [-5.74793975022054, -0.00106384700079687, 2.22737232991349]) });
  it('Should fuzz 584# XZY', function() { assert.v(Quaternion.fromEuler(1.3307645674162352, 2.8668834761701545, 0.36096667765215207, 'XZY').rotateVector([2, 3, 5]), [-4.31443399552638, -4.30947330155082, -0.902274437999264]) });
  it('Should fuzz 585# XZY', function() { assert.v(Quaternion.fromEuler(-1.3769183158477185, -2.6804427144587155, -2.896811250715743, 'XZY').rotateVector([2, 3, 5]), [4.15777237699836, -4.53184299152167, 0.418721818472934]) });
  it('Should fuzz 586# XZY', function() { assert.v(Quaternion.fromEuler(-1.3394372223339428, 2.1256809629983495, 2.1048814361057078, 'XZY').rotateVector([2, 3, 5]), [-4.28086853330325, -3.87512589172951, -2.15813899548236]) });
  it('Should fuzz 587# XZY', function() { assert.v(Quaternion.fromEuler(1.2271461354559143, -1.9607728946588032, -1.8516718674363628, 'XZY').rotateVector([2, 3, 5]), [4.81186200411988, 0.781264168209637, 3.77301078089886]) });
  it('Should fuzz 588# XZY', function() { assert.v(Quaternion.fromEuler(-0.7711250852342721, -2.0214985836398363, 2.566451302595855, 'XZY').rotateVector([2, 3, 5]), [2.24673342701055, -5.29174929721423, -2.22476477034901]) });
  it('Should fuzz 589# XZY', function() { assert.v(Quaternion.fromEuler(-2.7932549098555826, -3.081979501982009, -1.7999293736913236, 'XZY').rotateVector([2, 3, 5]), [5.49286206823174, 2.79388160021995, 0.150638319604796]) });
  it('Should fuzz 590# XZY', function() { assert.v(Quaternion.fromEuler(-1.8942705477222597, 2.5000548073270954, -1.6691652822953558, 'XZY').rotateVector([2, 3, 5]), [2.34859932687605, 3.16936821428816, 4.73700182858918]) });
  it('Should fuzz 591# XZY', function() { assert.v(Quaternion.fromEuler(-1.0669908650372135, -2.72803774866907, 1.9272294303948714, 'XZY').rotateVector([2, 3, 5]), [-2.44608290032748, -5.26917613647004, 2.06214967632812]) });
  it('Should fuzz 592# XZY', function() { assert.v(Quaternion.fromEuler(-2.4877829400105655, 2.204027400315887, 2.807219938324259, 'XZY').rotateVector([2, 3, 5]), [-2.27139788448157, -1.70378934059847, 5.47154946365613]) });
  it('Should fuzz 593# XZY', function() { assert.v(Quaternion.fromEuler(-0.5498877700234956, -1.7884690488772015, 2.206219732264106, 'XZY').rotateVector([2, 3, 5]), [2.31652145716282, -5.30614563716559, -2.11625773848385]) });
  it('Should fuzz 594# XZY', function() { assert.v(Quaternion.fromEuler(0.0946481122313072, -2.0209254920664916, 0.6801449929613348, 'XZY').rotateVector([2, 3, 5]), [0.656509177222286, -5.76035940401979, 2.09457757954766]) });
  it('Should fuzz 595# XZY', function() { assert.v(Quaternion.fromEuler(-1.878668383714453, -2.8897475915267563, 0.7767258645273571, 'XZY').rotateVector([2, 3, 5]), [-4.02803406068945, 3.31519011664784, 3.28396956386720]) });
  it('Should fuzz 596# XZY', function() { assert.v(Quaternion.fromEuler(-2.6833843190911644, -2.3778326708629938, -3.0317804108405575, 'XZY').rotateVector([2, 3, 5]), [3.90646415472219, -1.73123487815490, 4.44323796397746]) });
  it('Should fuzz 597# XZY', function() { assert.v(Quaternion.fromEuler(0.06128793542062194, -1.6550387045501092, 0.2620015066356465, 'XZY').rotateVector([2, 3, 5]), [2.71784768781296, -3.72536023560033, 4.09084283013385]) });
  it('Should fuzz 598# XZY', function() { assert.v(Quaternion.fromEuler(-2.7970690646418648, -2.1145081558201992, -1.1003221311449205, 'XZY').rotateVector([2, 3, 5]), [4.40393251736572, -0.0312841672064552, -4.31328177648656]) });
  it('Should fuzz 599# XZY', function() { assert.v(Quaternion.fromEuler(0.841500655858253, 0.29212647853743157, 2.0304048257103977, 'XZY').rotateVector([2, 3, 5]), [2.57770683384306, 5.59437814430447, 0.241579505105912]) });
});
