// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const ytdl = require('ytdl-core');
const fs = require('fs');
const cors = require('cors')({origin: true});

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();


// const express = require('express');
// const cors = require('cors');


// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    // Push the new message into the Realtime Database using the Firebase Admin SDK.
    const snapshot = await admin.database().ref('/messages').push({original: original});
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    res.redirect(303, snapshot.ref.toString());
  });



// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
.onCreate((snapshot, context) => {
  // Grab the current value of what was written to the Realtime Database.
  const original = snapshot.val();
  console.log('Uppercasing', context.params.pushId, original);
  const uppercase = original.toUpperCase();
  // You must return a Promise when performing asynchronous tasks inside a Functions such as
  // writing to the Firebase Realtime Database.
  // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
  return snapshot.ref.parent.child('uppercase').set(uppercase);
});

exports.videoDownload = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    var URL = req.query.URL;
    var quality = req.query.quality;

    ytdl.getInfo(URL, (err, info) => {
      if (err) throw err;
      var link;
      for( var i= 0; i < info.formats.length; i++) {
        if(info.formats[i].qualityLabel === quality && info.formats[i].audioChannels > 0){
          link = info.formats[i].url;
        }
      }
      response = {
        download_url: link
      }
      res.send(
        response
      );
    })
  })
})

exports.videoInfo = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    var URL = req.query.URL;
    console.log(URL);

    ytdl.getInfo(URL, (err, info) => {
      if (err) throw err;
      console.log(info.formats);
      var links = [];
      var qualitites = [];
      for( var i= 0; i < info.formats.length; i++) {
        var quality = info.formats[i].qualityLabel;
        if(!qualitites.includes(quality) && quality !== null){
          qualitites.push(quality);
        }
      }
      response = {
        title: info.title,
        id: info.video_id,
        thumbnail: info.player_response.videoDetails.thumbnail.thumbnails[info.player_response.videoDetails.thumbnail.thumbnails.length - 1].url,
        backup_thumbnail: `https://img.youtube.com/vi/${info.video_id}/maxresdefault.jpg`,
        video_length: info.length_seconds,
        uploader: info.author,
        available_qualitites: qualitites
      }
      res.send(
        response
      );    
    })
  })
})
