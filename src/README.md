# Analytics Component - POC

To test the built POC simply open `index.html`

Or For development:
```
// Install
$ npm install
$ npm install -g browserify

// Build App
$ browserify index.js > build/app.js

// Run development server
$ npm run develop

// When running the development server, changes to the files are watched, but the app still needs to be 
// built for the server each time src code changes are updated. 
// E.g.:
$ browserify index.js > build/app.js
```
