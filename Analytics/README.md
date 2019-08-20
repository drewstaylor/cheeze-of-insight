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

// When running the development server
// Changes to files are watched, but
// still need to be built using on the server:
`$ browserify index.js > build/app.js`
// each time src code changes are made
```
