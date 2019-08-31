# Cheeze of Insight

Build & run development server:
```
// Install
$ npm install
$ npm install -g browserify
$ npm install -g nodemon

// Build App
$ browserify index.js > build/app.js

// Run development server
$ npm start

// OR: run development server with live reload
$ npm run develop

// When running the development server with live re-load, changes to the files are watched, but the app still needs to be 
// built for the server each time src code changes are updated 
// E.g.:
$ browserify index.js > build/app.js
```
