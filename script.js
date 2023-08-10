document.addEventListener("DOMContentLoaded", function () {
    const chatContainer = document.getElementById("chat-container");
    const messagesDiv = document.getElementById("messages");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");
    const dmButton = document.getElementById("dm-button");

    let currentUser = null;
    let selectedUser = null;

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            loadFriendRequests();
            loadMessages();
            // Load other user data and more initializations
        } else {
            window.location.href = "index.html";
        }
    });

    // ...

    async function loadFriendRequests() {
        const userDoc = await firebase.firestore().collection("users").doc(currentUser.uid).get();
        const friendRequestsReceived = userDoc.data().friendRequestsReceived || [];

        // Display received friend requests
        // Implement UI to accept/reject friend requests
    }

    async function loadMessages() {
        // Load and display messages from Firestore
        // Implement real-time updates for new messages
    }

    // ...

    async function acceptFriendRequest(requestUserId) {
        await firebase.firestore().collection("users").doc(currentUser.uid).update({
            friendRequestsReceived: firebase.firestore.FieldValue.arrayRemove(requestUserId),
            friends: firebase.firestore.FieldValue.arrayUnion(requestUserId)
        });

        await firebase.firestore().collection("users").doc(requestUserId).update({
            friendRequestsSent: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
            friends: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
        });
    }

    async function rejectFriendRequest(requestUserId) {
        await firebase.firestore().collection("users").doc(currentUser.uid).update({
            friendRequestsReceived: firebase.firestore.FieldValue.arrayRemove(requestUserId)
        });

        await firebase.firestore().collection("users").doc(requestUserId).update({
            friendRequestsSent: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
        });
    }

    async function sendMessage(recipientUserId, messageText) {
        const conversationId = generateConversationId(currentUser.uid, recipientUserId);

        await firebase.firestore().collection("conversations").doc(conversationId)
            .collection("messages").add({
                sender: currentUser.uid,
                text: messageText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
    }

    // ...
});
