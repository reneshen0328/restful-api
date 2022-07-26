/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const createAuth0Client = require('@auth0/auth0-spa-js');

const app = express();
const port = process.env.PORT || 3000;
const db = mongoose.connect('mongodb://localhost/restful-api')

const { auth } = require('express-openid-connect');
const cookieParser = require("cookie-parser");
const { requiresAuth } = require('express-openid-connect');
const path = require('path');

const User = require('./models/userModel');
const Recipe = require('./models/recipeModel');

const userRouter = require('./routes/userRouter')(User);
const signupRouter = require('./routes/signupRouter')(User);
const loginRouter = require('./routes/loginRouter')(User,Recipe);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Serve the index page for all other requests
app.get("/*", (_, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
  });

// config auth0 webapp
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: 'a long, randomly-generated string stored in env',
    baseURL: 'http://localhost:4000',
    clientID: 'jMWLqEozXYAhn7QKanT4GI6qFIC27WwP',
    issuerBaseURL: 'https://dev-7yqi8at9.us.auth0.com'
    };

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
app.use('/', userRouter);
app.use('/', signupRouter);
app.use('/', loginRouter)

// req.isAuthenticated is provided from the auth router
// Endpoint to serve the configuration file
app.get('/',(req,res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/incorrectlogin', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
});

app.listen(port , ()=>{
    console.log('listening in port ' + port);
});