document.addEventListener("DOMContentLoaded", function () {
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };
    firebase.initializeApp(firebaseConfig);

    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    let currentUser = null;

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            currentUser = firebase.auth().currentUser;
            redirectToChatApp();
        } catch (error) {
            console.error(error);
            alert("Login failed. Please check your credentials.");
        }
    });

    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;
        try {
            await firebase.auth().createUserWithEmailAndPassword(email, password);
            currentUser = firebase.auth().currentUser;
            redirectToChatApp();
        } catch (error) {
            console.error(error);
            alert("Signup failed. Please check your input.");
        }
    });

    function redirectToChatApp() {
        window.location.href = "chat.html";
    }

    // ...

    document.getElementById("dm-button").addEventListener("click", function () {
        const username = prompt("Enter the username of the user you want to DM:");
        if (username) {
            sendFriendRequest(username);
        }
    });

    document.getElementById("send-button").addEventListener("click", function () {
        const messageText = document.getElementById("message-input").value;
        if (messageText.trim() !== "") {
            sendMessage(selectedUser, messageText);
            document.getElementById("message-input").value = "";
        }
    });

    async function sendFriendRequest(username) {
        const usersCollection = firebase.firestore().collection("users");
        const userSnapshot = await usersCollection.where("username", "==", username).get();

        if (!userSnapshot.empty) {
            const targetUserId = userSnapshot.docs[0].id;

            await usersCollection.doc(currentUser.uid).update({
                friendRequestsSent: firebase.firestore.FieldValue.arrayUnion(targetUserId)
            });

            await usersCollection.doc(targetUserId).update({
                friendRequestsReceived: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
            });
        } else {
            alert("User not found.");
        }
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

    function generateConversationId(userId1, userId2) {
        const sortedUserIds = [userId1, userId2].sort();
        return sortedUserIds.join("_");
    }

    // ...
});
