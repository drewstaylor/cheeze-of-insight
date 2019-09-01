'use strict';

// Your web app's Firebase configuration
// XXX TODO: Remove this security vulnerability from repo
const firebaseConfig = {
    apiKey: "AIzaSyBzUQmzf_kHpO_lU7FneB1xinVJifHfiUM",
    authDomain: "cheeze-of-insight.firebaseapp.com",
    databaseURL: "https://cheeze-of-insight.firebaseio.com",
    projectId: "cheeze-of-insight",
    storageBucket: "",
    messagingSenderId: "84005637289",
    appId: "1:84005637289:web:9252aa55eb5cf70b"
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const firebaseDb = firebaseApp.database();


const login = async function () {
    // Log the user in via Twitter
    let provider = new firebase.auth.TwitterAuthProvider();
    await firebase.auth().signInWithPopup(provider).catch(function(error) {
        console.log('Error authenticating user =>', error);
    });

    // Auth changed listener
    firebase.auth().onAuthStateChanged(function(user) {
        // Once authenticated, instantiate Firechat with the logged in user
        if (user) {
            initChat(user);
        }
    });
};

const logout = async function () {
    try {
        await firebase.auth().signOut();
    } catch (e) {
        console.log('Error logging out user =>', e);
    } 
};

const initChat = function (user) {
    // Get a Firebase Database ref
    let chatRef = firebase.database().ref('firechat-general');

    // Create a Firechat instance
    let chat = new FirechatUI(chatRef, document.getElementById('firechat-wrapper'));

    // Set the Firechat user
    chat.setUser(user.uid, user.displayName, (user) => {
        console.log('Chat User =>', user);
        chat.resumeSession();
    });
    
    console.log('Firechat =>', chat);

    return chat;
};

module.exports = {
    firebaseApp: firebaseApp,
    firebaseDb: firebaseDb,
    login: login,
    logout: logout
};