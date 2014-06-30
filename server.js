var express = require('express')
  , app = express()
  , bodyParser = require('body-parser')

app.use(bodyParser());

/*
 * ReadMe Secret Key
 * You can get your secret key from ReadMe.io, inside the "User Apps" section.
 * Don't give this out; this keeps other people from provisioning accounts on your app. 
 */

var README_SECRET = 'ABCD';

/*
 * Set up the database. For the purpose of a simple demo,
 * we're using a synchronous flat file database.
 */

var flatfile = require('flat-file-db');
var db = flatfile.sync('./database.db');

/*
 * Random string function. This is not a good way to be
 * generating your secret keys.
 */

function randomString(N) {
  return (Math.random().toString(36)+'00000000000000000').slice(2, N+2);
}

/*
 * ROUTES
 * This logic should be split up until controllers and models.
 * For the sake of demonstration, though, all code is done below.
 */
var router = express.Router();

router.post('/create', function(req, res) {
  if(req.body.readme_secret != README_SECRET) {
    return res.send({
      'error': "Hey, you're not ReadMe!",
    });
  }

  // Get the user from the database
  var user = db.get(req.body.user);

  // If the user doesn't exist yet; we'll create it.
  if(!user) {
    user = {
      'readme_user_secret': req.body.readme_user_secret,
      'apps': {},
    };
  }

  // Make sure the user has the correct secret key
  if(user.readme_user_secret != req.body.readme_user_secret) {
    return res.send({
      'error': "The secret key didn't match",        
    });
  }

  // See if this app already exists (this shouldn't happen using ReadMe, but we should still check)
  if(req.body.app_id in user.apps) {
    return res.send({
      'error': "This app already exists",
    });
  }

  // Now, create the new app
  var app = {
    'name': req.body.app_name,
    'values': {
      // These are optional (and can be named anything)
      'secret_key': 'sk_' + randomString(5),
      'public_key': 'pk_' + randomString(5),

      // We can return any arbitrary strings or numbers that will be saved.
      'times_updated': 1,
    },
  };
  user.apps[req.body.app_id] = app;

  // Save everything
  db.put(req.body.user, user);

  // Send the response
  res.send({
    'readme_user_secret': user.readme_user_secret,
    'values': app.values,
  });

});

router.put('/update/:app_id', function(req, res) {
  if(req.body.readme_secret != README_SECRET) {
    return res.send({
      'error': "Hey, you're not ReadMe!",
    });
  }

  // Get the user from the database
  var user = db.get(req.body.user);

  // Make sure the user has the correct secret key
  if(user.readme_user_secret != req.body.readme_user_secret) {
    return res.send({
      'error': "The secret key didn't match",
    });
  }

  // Let's get the app we're updating
  var app = user.apps[req.params.app_id];
  if(!app) {
    return res.send({
      'error': "We couldn't find the app",
    });
  }

  // Update the name if it exists
  if('app_name' in req.body) {
    app.name = req.body.app_name;
  }

  // Refresh the secret keys if we're supposed to
  if('refresh_keys' in req.body && req.body.refresh_keys === "true") {
    app.values.secret_key = 'sk_' + randomString(5);
    app.values.public_key = 'pk_' + randomString(5);
  }

  // Increment our counter, to show we can store arbitrary data
  app.values.times_updated++;

  // Now, save the app!
  user.apps[req.body.app_id] = app;

  // Save everything
  db.put(req.body.user, user);

  // Send the response
  res.send({
    'readme_user_secret': user.readme_user_secret,
    'values': app.values,
  });

});

router.delete('/delete/:app_id', function(req, res) {
  if(req.body.readme_secret != README_SECRET) {
    return res.send({
      'error': "Hey, you're not ReadMe!",
    });
  }

  // Get the user from the database
  var user = db.get(req.body.user);

  // Make sure the user has the correct secret key
  if(user.readme_user_secret != req.body.readme_user_secret) {
    return res.send({
      'error': "The secret key didn't match",        
    });
  }

  // Delete the app!
  delete user.apps[req.params.app_id];

  // Save everything
  db.put(req.body.user, user);

  // Send the response
  res.send({
    'readme_user_secret': user.readme_user_secret,
  });

});

app.use('/', router);


/*
 * Start the app
 */

var port = process.env.PORT || 8080;
app.listen(port);
console.log('Starting on port ' + port);

