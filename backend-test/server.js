/*-------------------------------------------------------------------------------------------*/
// server.js file
/*-------------------------------------------------------------------------------------------*/

// open inline terminal
// run node server.js
// ctrl + c to end

const express = require("express");
const cors =require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const USERS_FILE = "./users.json";

function loadUsers() {
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
}

function saveUsers(data) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// GET request to the root URL 
app.get("/", (req, res) => {
    // Sends a plain text response back to the broswer
    // Confirms server is running
    res.send("C1PHER API is running.");
});


/*-------------------------------------------------------------------------------------------*/
// CHALLENGE DATA 
/*-------------------------------------------------------------------------------------------*/

const challenges = {
    shift: {
        id: 1,
        cipher: "Shift Cipher",
        ciphertext: "mszrob",
        key: 10,
        answer: "cipher",
        answerLength: 6,
        maxScore: 10
    },

    shiftTwo: {
        id: 2,
        cipher: "Shift Cipher",
        ciphertext: "lpdjlqwlrq lv wkh rqob zhdsrq",
        key: 3,
        answer: "imagination",
        answerLength: 11,
        maxScore: 20
    },

    substitution: {
        id: 3,
        cipher: "Substitution Cipher",
        quote: "It's no use going back to yesterday.",
        key: {
            plaintext: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            ciphertext: "ZYABXWCDVUEFTSGHRQIJPOKLNM"
        },
        encryptText: "ITS NO USE",
        answer: "vjisgpix",
        answerLength: 8,
        maxScore: 10
    },

    mixedalphabet: {
        id: 4,
        cipher: "Mixed Alphabet Cipher",
        quote: "I can't go back to yesterday.",
        key: {
            plaintext: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            ciphertext: "ENIGMABCDFGHJKLOPQRSTUVWXYZ"
        },
        encryptText: "I CANT GO BACK",
        answer: "dieltboneih",
        answerLength: 11,
        maxScore: 10
    },

    transposition: {
        id: 5,
        cipher: "Transposition Cipher",
        ciphertext: "eht reirruh i og eht redniheb i teg",
        decryptext: "eht reirruh i og",
        answer: "thehurrierigo",
        answerLength: 16,
        maxScore: 10
    },

    route: {
        id: 6,
        cipher: "Route Cipher",
        grid: [
            "IFYOUDONTKNOW",
            "WHEREYOUREGOI",
            "NGANYROADWILL",
            "TAKEYOUTHEREX"
        ],
        route: [
            0, 13, 26, 39,
            40, 27, 14, 1,
            2, 15, 28, 41,
            42, 29, 16, 3,
            4, 17, 30, 43,
            44, 31, 18, 5,
            6, 19, 32, 45,
            46, 33, 20, 7,
            8, 21, 34, 47, 
            48, 35, 22, 9,
            10, 23, 36, 49,
            50, 37, 24, 11,
            12, 25, 38, 51,
        ],
        requiredLength: 8,
        maxScore: 10
    },

    railfence: {
        id: 7,
        cipher: "Rail Fence Cipher",
        plaintext: "IMAGINATIONISTHEONLYWEAPON",
        rails: 3,
        requiredLength: 10,
        maxScore: 10
    }
};

/*-------------------------------------------------------------------------------------------*/
// API ROUTES
/*-------------------------------------------------------------------------------------------*/

/*-------------------------------------------------------------------------------------------*/
// AUTHENTICATION ROUTES
/*-------------------------------------------------------------------------------------------*/

// POST /api/login
// Authenticates a user using username and password
// Returns success: true if credentials match an existing account

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const data = loadUsers();
    // Find user with matching username and password
    const user = data.users.find(
        u => u.username === username && u.password === password
    );
    if (!user) {
        return res.json({ success: false });
    }
    res.json({ success: true });
});

// POST /api/register
// Creates a new user account and stores it in users.json
// Usernames are noralised to lowercase to avoid duplicates

app.post("/api/register", (req, res) => {
    const { username, password } = req.body;
    const data = loadUsers();
    // Normalise username (remove spaces and convert to lower case)
    const usernameClean = username.trim().toLowerCase();
    const existingUser = data.users.find( u => u.username === usernameClean);
    // Check if user already exists
    if (existingUser) {
        return res.json({ success: false, message: "User already exists" });
    }
    // Create new user object
    const newUser = {
        username: usernameClean,
        password,
        points: 0,
        completedChallenges: [],
        pagesRead: []
    };
    // Save new user
    data.users.push(newUser);
    saveUsers(data);
    res.json({ success: true });
});

/*-------------------------------------------------------------------------------------------*/
// USER MANAGEMENT ROUTES
/*-------------------------------------------------------------------------------------------*/

// DELTE /api/user/:username
// Deletes a user account from users.json
// Allows users to delete their accounts

app.delete("/api/user/:username", (req, res) => {
    const { username } = req.params;
    const data = loadUsers();
    data.users = data.users.filter(u => u.username !== username);
    saveUsers(data);
    res.json({ success: true });
});

// GET /api/user/:username
// Retrieve profile into for a specific user
// Returns username, score and overall progress

app.get("/api/user/:username", (req, res) => {
    const { username } = req.params;
    const data = loadUsers();
    const user = data.users.find(u => u.username === username);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    // Calculate overall learning progress
    const totalChallenges = Object.keys(challenges).length;
    const totalPages = 6;
    const progress = 
        (user.completedChallenges.length + user.pagesRead.length) /
        (totalChallenges + totalPages);
    res.json({
        username: user.username,
        points: user.points,
        progress: progress
    });
});

/*-------------------------------------------------------------------------------------------*/
// CHALLENGE ROUTES
/*-------------------------------------------------------------------------------------------*/

// GET /api/challenges/:type
// Retrieves challenge data for a specific cipher

app.get("/api/challenges/:type", (req, res) => {
    const { type } = req.params;
    // Checks if requested challenge exists
    if (!challenges[type]) {
        return res.status(404).json({ error: "Challenge not found" });
    }
    res.json(challenges[type]);
});

// POST /api/coomplete
// Records completion of a challenge and updates the users score
// Prevents duplicate completions for the same challenge

app.post("/api/complete", (req, res) => {
    const { username, challengeId, score } = req.body;
    const data = loadUsers();
    const user = data.users.find(u => u.username === username);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    // prevent duplicate completions
    if (!user.completedChallenges.includes(challengeId)) {
        user.completedChallenges.push(challengeId);
        user.points += score;
        saveUsers(data);
    }
    res.json({ success: true });
});

// POST /api/read-page
// Tracks when a user reads an info page
// Used for calculating learning progress

app.post("/api/read-page", (req, res) => {
    const { username, page } = req.body;
    const data = loadUsers();
    const user = data.users.find(u => u.username === username);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Only add the page if it hasn't been read before
    if (!user.pagesRead.includes(page)) {
        user.pagesRead.push(page);
    }

    saveUsers(data);

    res.json({ success: true });
});

/*-------------------------------------------------------------------------------------------*/
// SERVER
/*-------------------------------------------------------------------------------------------*/

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
