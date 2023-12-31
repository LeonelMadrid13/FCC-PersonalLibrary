/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);
const ENDPOINT = "/api/books";

suite("Functional Tests", function () {
  let firstId;
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  // test("#example Test GET /api/books", function (done) {
  //   chai
  //     .request(server)
  //     .get(ENDPOINT)
  //     .end(function (err, res) {
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, "response should be an array");
  //       assert.property(
  //         res.body[0],
  //         "commentcount",
  //         "Books in array should contain commentcount"
  //       );
  //       assert.property(
  //         res.body[0],
  //         "title",
  //         "Books in array should contain title"
  //       );
  //       assert.property(
  //         res.body[0],
  //         "_id",
  //         "Books in array should contain _id"
  //       );
  //       done();
  //     });
  // });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function () {
    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        test("Test POST /api/books with title", function (done) {
          chai
            .request(server)
            .post(ENDPOINT)
            .send({ title: "Moby Dick" })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.property(res.body, "_id");
              assert.property(res.body, "title");
              assert.equals(res.body.title, "Moby Dick");
              assert.property(res.body, "comments");
              assert.isArray(res.body.comments);
            });
            done();
        });

        test("Test POST /api/books with no title given", function (done) {
          chai
            .request(server)
            .post(ENDPOINT)
            .send({})
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, "missing required field title");
              done();
            });
        });
      }
    );

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", function (done) {
        chai
          .request(server)
          .get(ENDPOINT)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body, "response should be an array");
            assert.property(
              res.body[0],
              "commentcount",
              "Books in array should contain commentcount"
            );
            assert.property(
              res.body[0],
              "title",
              "Books in array should contain title"
            );
            assert.property(
              res.body[0],
              "_id",
              "Books in array should contain _id"
            );
            firstId = res.body[0]._id;
            done();
          });
      });

      suite("GET /api/books/[id] => book object with [id]", function () {
        test("Test GET /api/books/[id] with id not in db", function (done) {
          chai
          .request(server)
          .get(`${ENDPOINT}/${firstId}`)
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.property(res.body, "title");
            assert.property(res.body, "_id");
            done();
          })
        });

        test("Test GET /api/books/[id] with valid id in db", function (done) {
          chai
          .request(server)
          .get(`${ENDPOINT}/65602338f67bce7b758e0d0f`)
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, "no book exists")
            done();
          })
        });
      });

      suite(
        "POST /api/books/[id] => add comment/expect book object with id",
        function () {
          test("Test POST /api/books/[id] with comment", function (done) {
            chai
            .request(server)
            .post(`${ENDPOINT}/${firstId}`)
            .send({comment: 'Good soup'})
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.property(res.body, 'comments');
              assert.isArray(res.body.comments)
              assert.equal(res.body.comments[0], 'Good soup')
              done();
            });
          });

          test("Test POST /api/books/[id] without comment field", function (done) {
            chai
            .request(server)
            .post(`${ENDPOINT}/${firstId}`)
            .send({})
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'missing required field comment')
              done();
            });
          });

          test("Test POST /api/books/[id] with comment, id not in db", function (done) {
            chai
            .request(server)
            .post(`${ENDPOINT}/65602338f67bce7b758e0d0f`)
            .send({comment: 'Good soup'})
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, "no book exists")
              done();
            });
          });
        }
      );

      suite("DELETE /api/books/[id] => delete book object id", function () {
        test("Test DELETE /api/books/[id] with valid id in db", function (done) {
          chai
            .request(server)
            .delete(`${ENDPOINT}/${firstId}`)
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, "delete successful")
              done();
            });
        });

        test("Test DELETE /api/books/[id] with  id not in db", function (done) {
          chai
            .request(server)
            .delete(`${ENDPOINT}/65602338f67bce7b758e0d0f`)
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, "no book exists")
              done();
            });
        });
      });
    });
  });
});
