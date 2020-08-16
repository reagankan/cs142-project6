"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!


const uri = process.env.MONGODB_URI || 'mongodb://localhost/cs142project6';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true } );

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    User.find({}, function(err, users) {
        if (err) {
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('Doing /user/list error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (users.length === 0) {
            // Query didn't return an error but didn't find the SchemaInfo object - This
            // is also an internal error return.
            response.status(500).send('Missing UserList');
            return;
        }

        // remove Mongoose schema restrictions.
        for (let i = 0; i < users.length; i++) {
            users[i] = JSON.parse(JSON.stringify(users[i]));
            // setup user property according to fetch API.
            delete users[i].location;
            delete users[i].description;
            delete users[i].occupation;
            delete users[i].__v;
        }
        
        console.log('/user/list::num_users_retrieved: ', users.length);
        response.status(200).end(JSON.stringify(users));
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    var id = request.params.id;
    User.findOne({_id: id}, function(err, user) {
        if (err) {
            if (user === undefined) {
                console.error('/user/' + id, '::invalid_user_detected_error: ', err);
                response.status(400).send(JSON.stringify(err));
                return;
            }
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('Doing /user/' + id, err);
            response.status(500).send(JSON.stringify(err));
            return;
        }

        if (user === null) {
            console.log('User with _id:' + id + ' not found.', user);
            response.status(400).send('Not found');
            return;
        }
        // remove Mongoose schema restrictions.
        let convertedUser = JSON.parse(JSON.stringify(user));

        // setup user property according to fetch API.
        delete convertedUser.__v;

        console.log('/user/', convertedUser._id + "/::full_name: " + convertedUser.first_name + " " + convertedUser.last_name);
        response.status(200).end(JSON.stringify(convertedUser));
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    var id = request.params.id;
    //NOTE user_id === Mongo Id of User Schema.
    //Note _id is the Mongo Id of the Photo Schema.
    Photo.find({user_id: id}, async function(err, photos) {
        if (err) {
            if (photos === undefined) {
                console.error('/photosOfUser/' + id, '::invalid_user_detected_error: ', err);
                response.status(400).send(JSON.stringify(err));
                return;
            }
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('Doing /photosOfUser/' + id, ' error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }

        if (photos === null) {
            console.log('photosOfUser with _id:' + id + ' not found.', photos);
            response.status(400).send('Not found');
            return;
        }

        for (let i = 0; i < photos.length; i++) {
            // remove Mongoose schema restrictions.
            photos[i] = JSON.parse(JSON.stringify(photos[i]));
            photos[i].comments = JSON.parse(JSON.stringify(photos[i].comments));

            // setup photos and photos.comments property according to fetch API.
            delete photos[i].__v;
            for (let j = 0; j < photos[i].comments.length; j++) {
                let commenter = await User.findById(photos[i].comments[j].user_id).exec();
                photos[i].comments[j].user = {
                    _id: photos[i].comments[j].user_id,
                    first_name: commenter.first_name,
                    last_name: commenter.last_name,
                };
                delete photos[i].comments[j].user_id;
            }
        }
        // remove Mongoose schema restrictions.
        let convertedPhotos = JSON.parse(JSON.stringify(photos));

        console.log('/photosOfUser/' + id + "::num_photos: ", photos.length);
        response.status(200).end(JSON.stringify(convertedPhotos));
    });
});

const port = process.env.PORT || 3000;
var server = app.listen(port, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


