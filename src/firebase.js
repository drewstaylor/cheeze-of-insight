'use strict';

const config = require('./config');
const firebaseConfig = config.firebaseConfig;

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
const getChat = async function (user, wizards = [], wallet = null) {
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

        // Update Firebase with wallet address
        let userRef = firebase.database().ref('firechat-general/user-names-online/' + String(user.name));
        userRef.update({
            wallet: wallet,
            wizards: wizards
        });
    });

    return chat;
};

/**
 * Gets a list of chat rooms enabled in Firebase / Firechat
 * @param {Object} : The target Firebase chat `Object` to be queried for rooms
 * @return {Object} : Returns an `Array` of currently available chat rooms
 */
const getRooms = async function (chat) {
    if (!chat) {
        return;
    }
    let rooms;
    await chat.getRoomList((roomArray) => {
        rooms = roomArray;
        console.log('Chat Rooms =>', rooms);
    });
    return rooms;
};

/**
 * Creates a new chat channel
 * @param {Object} chat: The target Firebase chat `Object`
 * @param {String} roomName: The name of the room to be created
 * @param {String} type: The type of room to be created. Either 'public' or 'private'. 
 * @return {String} : Returns the ID of the created room
 */
const createRoom = async function (chat, roomName, type) {
    let room = '';
    if (!chat || !roomName || !type) {
        return;
    } else if (type !== 'private' && type !== 'public') {
        // Room type must be either 'private' or 'public'
        return;
    }
    await chat.createRoom(roomName, type, (roomId) => {
        room = roomId;
        console.log('Created Room =>', room);
    });
    // Return ID of created room
    return room;
};

// Release Exports
module.exports = {
    firebaseApp: firebaseApp,
    firebaseDb: firebaseDb,
    login: login,
    logout: logout,
    getChat: getChat,
    listenForChatUser: listenForChatUser,
    getRooms: getRooms,
    createRoom: createRoom
};