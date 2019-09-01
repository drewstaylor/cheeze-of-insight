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

/**
 * Asynchronous Firebase Login (XXX: Twitter only)
 * @return {Boolean} : Returns `true` or `false` based login success
 */
const login = async function () {
    // Log the user in via Twitter
    let provider = new firebase.auth.TwitterAuthProvider();
    let response;
    await firebase.auth().signInWithPopup(provider).catch(function(error) {
        console.log('Error authenticating user =>', error);
        response = false;
    });
    response = true;
    return response;
};

/**
 * Logout from Firebase Twitter auth
 */
const logout = async function () {
    try {
        await firebase.auth().signOut();
    } catch (e) {
        console.log('Error logging out user =>', e);
    } 
};

/**
 * Listens for changes to applicatin Auth State and returns the Firebase User Object of the requesting User
 */
const listenForChatUser = async function () {
    let chatUser;
    // Auth changed listener
    await firebase.auth().onAuthStateChanged(async (user) => {
        // Once authenticated, instantiate Firechat with the logged in user
        if (user) {
            chatUser = user;
            //console.log('Auth state changed =>', chatUser);
        } else {
            chatUser = false;
        }
    });
    return chatUser;
};

/**
 * Initializes a Firechat session and joins the current user
 * @param {Object} user : An `Observable` Firebase User object returned by `listenForChatUser`
 * @param {Object} wizards : An `Array` of Wizards to be set on the requesting chat user
 * @see this.listenForChatUser
 */
const getChat = function (user, wizards = []) {
    // Get a Firebase Database ref
    let chatRef = firebase.database().ref('firechat-general');

    // Create a Firechat instance
    let chat = new Firechat(chatRef);

    // Set the Firechat user
    chat.setUser(user.uid, user.displayName, (user) => {
        //console.log('New chat User =>', user);
        chat.userData = user;
        chat.userData.wizards = wizards;
        chat.resumeSession();
    });

    return chat;
};

/**
 * Gets a list of chat rooms enabled in Firebase / Firechat
 * @param {Object} : The target Firebase chat `Object` to be queried for rooms
 * @return {Object} : Returns an `Array` of currently available chat rooms
 */
const getRooms = async function getRooms(chat) {
    /*chat.createRoom('public', 'public', function (roomId) {
        console.log('Created Room =>', roomId);
    });*/

    let rooms;
    chat.getRoomList((roomArray) => {
        rooms = roomArray;
        console.log('Chat Rooms =>', rooms);
    });
    return rooms;
};

/**
 * Gets a list of chat rooms enabled in Firebase / Firechat
 * @param {Object} : The target Firebase chat `Object` to be queried for rooms
 * @return {Object} : Returns an `Array` of currently available chat rooms
 */
const createRoom = async function (chat) {

}

// Release Exports
module.exports = {
    firebaseApp: firebaseApp,
    firebaseDb: firebaseDb,
    login: login,
    logout: logout,
    getChat: getChat,
    listenForChatUser: listenForChatUser,
    getRooms: getRooms
};