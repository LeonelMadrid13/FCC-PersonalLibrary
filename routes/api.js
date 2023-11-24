/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
const { response } = require("express");
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

const mongoose = require("mongoose");
mongoose.connect(MONGODB_CONNECTION_STRING);

const Schema = mongoose.Schema;
const bookSchema = new Schema({
  title: String,
  comments: { type: [String], default: [] },
});

const Book = mongoose.model("Book", bookSchema, "books2");

module.exports = function (app) {
  app
    .route("/api/books")
    .get(async function (req, res) {
      try {
        const books = await Book.find({});
        const bookSummary = books.map(({ _id, title, comments }) => ({
          _id,
          title,
          commentcount: comments.length,
        }));
        // console.log(bookSummary)
        return res.json(bookSummary);
      } catch (error) {
        console.log(error.message);
        return res.status(500).send("Failed to retreive books");
      }
    })

    .post(function (req, res) {
      let title = req.body.title;
      if (!title) return res.send("missing required field title");

      try {
        const book = new Book({ title });
        const bookToSend = { _id: book._id, title: book.title };
        book.save(bookToSend);
        return res.json(bookToSend);
      } catch (error) {
        console.log(error.message);
        return res.status(500).send("Failed to save book");
      }
    })

    .delete(async function (req, res) {
      try {
        await Book.deleteMany({});
        // console.log('deleted')
        return res.send("complete delete successful");
      } catch (error) {
        console.log(err.message);
        return res.status(500).send("Failed to delete books");
      }
    });

  app
    .route("/api/books/:id")
    .get(async function (req, res) {
      let bookid = req.params.id;
      // console.log(bookid);
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      try {
        const book = await Book.findById(bookid).exec();
        if (!book) return res.send("no book exists");

        const { _id, title, comments } = book["_doc"];
        return res.json({ _id, title, comments });
      } catch (error) {
        console.log(error.message);
        if (error.message.includes("Cast to ObjectId failed")) {
          return res.send("no book exists");
        }
        return res.status(500).send("please try later");
      }
    })

    .post(async function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      if(!comment) return res.send('missing required field comment');
      try {
        const book = await Book.findOneAndUpdate(
          { _id: bookid },
          { $push: { comments: comment } },
          { new: true }
        );
        if (!book) return res.send("no book exists");

        const { _id, title, comments } = book["_doc"];
        return res.json({ _id, title, comments });
      } catch (error) {
        if (error.message.includes("Cast to ObjectId failed"))
          return res.send("no book exists");
        return res.send("no book exists");
      }
    })

    .delete(async function (req, res) {
      let bookid = req.params.id;
      try {
        const book = await Book.findByIdAndDelete(bookid);
        if (!book) return res.send("no book exists");
        return res.send("delete successful");
      } catch (error) {
        if (error.message.includes("Cast to ObjectId failed")) return res.send("no book exists");
        return res.status(500).send("please try later");
      }
    });
};
