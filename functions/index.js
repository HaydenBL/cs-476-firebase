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
  var URL = req.query.URL;
  console.log(URL);
  // var info = ytdl.getInfo(URL);
  // ytdl.downloadFromInfo(info);

  // var stream = ytdl(URL)

  
  // res.header('Content-Disposition', 'attachment; filename="video.mp4"');
  // ytdl(URL, {format: 'mp4', quality: 'lowest'}).pipe(res);
  // res.send();

  var links = []
  ytdl(URL, {format: 'mp4', quality: 'lowest'}).on(err, err => {
    err.formats
  })

  ytdl(URL, {format: 'mp4', quality: 'lowest'}, function(err, format) {
    if (err) {res.send('the url is invalid please try again...');}
    console.log((format.formats).length);//i am getting value... in console but not outside of the function.. 
    //this object contains all the download links  
    for( var i= 0, len = (format.formats).length; i < len; i++) {
      var el = format.formats[i].container;
      if ( el === 'mp4') {
        console.log(format.formats[i]);
        var download_url = format.formats[i];
        //this push will store the all links in 'links' object..
        links.push(download_url);
      }
    }
  });
  console.log(links);
  res.send(links);


  // var stream = ytdl(URL, {quality: 'lowest', filter: format => format.container === 'mp4'}).  .on("response", response => {
  //   // If you want to set size of file in header
  //   res.setHeader("content-length", response.headers["content-length"]);
  // })
  // .pipe(res);
  // res.download()
  // res.send(stream);
})

exports.videoInfo = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    var URL = req.query.URL;
    console.log(URL);

    ytdl.getInfo(URL, (err, info) => {
      if (err) throw err;
      response = {
        title: info.title,
        id: info.video_id,
        thumbnail: info.player_response.videoDetails.thumbnail.thumbnails[info.player_response.videoDetails.thumbnail.thumbnails.length - 1].url,
        backup_thumbnail: `https://img.youtube.com/vi/${info.video_id}/maxresdefault.jpg`,
        video_length: info.length_seconds,
        uploader: info.author
      }
      console.log(response);
      res.send(
        response
      );
    
    })
})
})
