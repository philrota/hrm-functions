const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const express = require("express");
const app = express();

//get all rooms
app.get("/rooms", (req, res) => {
  admin
    .firestore()
    .collection("Rooms")
    .get()
    .then(data => {
      let rooms = [];
      data.forEach(doc => {
        rooms.push(doc.data());
      });
      return res.json(rooms);
    })
    .catch(err => console.error(err));
});
//get a single room
app.get("/room:num", (req, res) => {
  let roomData = {};
  db.doc(`/Rooms/${req.params.num}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Room not found!" });
      }
      roomData = doc.data();
      return res.json(roomData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});
//modify a room
app.post("/modify", (req, res) => {
  let roomDetails = {
    num: req.body.num,
    beds: req.body.beds,
    occupiedFrom: req.body.occupiedFrom,
    occupiedTo: req.body.occupiedTo,
    occupiedBy: req.body.occupiedBy,
    isFull: req.body.isFull
  };
  db.doc(`/Rooms/${req.body.num}`)
    .update(roomDetails)
    .then(() => {
      return res.json({
        message: `Room ${req.body.num} modified succesfully!`
      });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});
//insert a room
app.post("/insertRoom", (req, res) => {
  const newRoom = {
    num: req.body.num,
    beds: req.body.beds,
    occupiedFrom: req.body.occupiedFrom,
    occupiedTo: req.body.occupiedTo,
    occupiedBy: req.body.occupiedBy,
    isFull: req.body.isFull
  };
  admin
    .firestore()

    .doc(`/Rooms/${req.body.num}`)
    .set(newRoom)
    .then(doc => {
      res.json({ message: `Inserted a new Room IDnumber: ${req.body.num}` });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "something went wrong" });
    });
});
//delete rooms
app.delete("/deleteRoom:num", (req, res) => {
  const document = db.doc(`/Rooms/${req.params.num}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Room not found!" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({
        message: `Room ${req.params.num} has been deleted successfully!`
      });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});
exports.api = functions.region("europe-west1").https.onRequest(app);
