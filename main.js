/*-------------------------------------------------------------------------------------------*/
// MAIN JAVASCRIPT FILE
// This file contains the core client-side logic for the C1PHER web application. It manages
// user interface behaviour, authentication, API communication, and various other interactive
// features used throughout the game.
/*-------------------------------------------------------------------------------------------*/

/*-------------------------------------------------------------------------------------------*/
// LOADS SAVED THEME (LIGHT/DARK MODE)
/*-------------------------------------------------------------------------------------------*/

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark");
}

/*-------------------------------------------------------------------------------------------*/
// DOMContentLoaded
/*-------------------------------------------------------------------------------------------*/

// Run all scripts only after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {

/*-------------------------------------------------------------------------------------------*/
// MENU DROPDOWN
/*-------------------------------------------------------------------------------------------*/

    const userMenuBtn = document.querySelector(".user-menu-btn");
    const userDropdown = document.querySelector(".user-dropdown");

    if (userMenuBtn && userDropdown) {
        // Toggle dropdown when menu button is clicked
        userMenuBtn.addEventListener("click", (e) => {
            // Prevent click from propagating to document listener
            e.stopPropagation();
            userDropdown.classList.toggle("open");
        });

        // Close dropdown when clicking outside it
        document.addEventListener("click", (e) => {
            if (!userDropdown.contains(e.target) && !userMenuBtn.contains(e.target)) {
                userDropdown.classList.remove("open");
            }
        });
    }

/*-------------------------------------------------------------------------------------------*/
// AUTHENTICATION MODALS (LOGIN/SIGNUP WINDOWS)
// (Including login and signup sections) Handles login and signup functionality by communicating
// with the backend API. Successful authentication stores username in localStorage to maintain
// the users session. 
/*-------------------------------------------------------------------------------------------*/

    // Buttons that open the login and signup windows
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");

    if (loginBtn && signupBtn) {
        // Show login modal when login button is clicked
        loginBtn.onclick = () => {
            document.getElementById("loginModal").style.display = "block";
        };

        // Show signup modal when signup button is clicked
        signupBtn.onclick = () => {
            document.getElementById("signupModal").style.display = "block";
        };

        // Close modal when close button is clicked
        document.querySelectorAll(".close").forEach(closeBtn => {
            closeBtn.onclick = () => {
                // dataset.close contains the modal ID to close
                const modalId = closeBtn.dataset.close;
                if (modalId) {
                    document.getElementById(modalId).style.display = "none";
                }
            };
        });

        // Close modal if user clicks outside the modal content
        window.addEventListener("click", event => {
            if (event.target.classList.contains("modal")) {
                event.target.style.display = "none";
            }
        });
    }

/*-------------------------------------------------------------------------------------------*/
// LOGIN FORM
/*-------------------------------------------------------------------------------------------*/

    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            // Prevents page refresh on submit
            e.preventDefault();

            // Retrieve entered username and password
            const username = document.getElementById("login-username").value.trim().toLowerCase();
            const password = document.getElementById("login-password").value;

            // Send login request to backend API to authenticate user credentials
            fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })
            .then(res => res.json())
            .then(data => {

                if (data.success) {
                    // Store logged in user
                    localStorage.setItem("user", username);
                    // Redirect
                    window.location.href = "journey.html";

                } else {
                    alert("Invalid username or password");
                }
            })
            .catch(err => console.error("Login failed:", err));
        });
    }

/*-------------------------------------------------------------------------------------------*/
// SIGNUP FORM
/*-------------------------------------------------------------------------------------------*/

    const signupForm = document.getElementById("signup-form");

    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const username = document.getElementById("signup-username").value.trim().toLowerCase();
            const password = document.getElementById("signup-password").value;

            fetch("http://localhost:3000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Store logged in user
                    localStorage.setItem("user", username);
                    // Redirect to journey page
                    window.location.href = "journey.html";
                } else {
                    alert(data.message);
                }
            })
            .catch(err => console.error("Signup failed:", err));
        });
    }

/*-------------------------------------------------------------------------------------------*/
// PROFILE PAGE
// Handles loading and displaying user profile information. This includes username, score, and
// overall progress through the educational journey. 
/*-------------------------------------------------------------------------------------------*/

    const profileUsername = document.getElementById("profile-username");

    // Only run this logic if the profile page element exists
    if (profileUsername) {
        // Retrieve the currently logged in user from localStorage
        const username = localStorage.getItem("user");

        // If no user logged in display message
        if (!username) {
            profileUsername.textContent = "Not logged in";
            return;
        }

        // Request user profile data from backend API
        fetch("http://localhost:3000/api/user/" + username)
        .then(res => res.json())
        .then(user => {

            // Page title (browser tab)
            document.title = `${user.username}'s Profile | C1PHER`;

            // Display username on page
            profileUsername.textContent = `${user.username}'s Profile`;

            // Display score
            document.getElementById("profile-score").textContent = user.points;

            // Retrieve progress value returend by the backend 
            const progress = user.progress || 0;

            // Display progress percentage
            document.getElementById("profile-progress").textContent = `${Math.round(user.progress * 100)}%`;
        })
        // Log error if request fails 
        .catch(err => console.error("Failed to load user:", err));
    }

/*-------------------------------------------------------------------------------------------*/
// SETTINGS PAGE
// Handles user preferences for theme selection and account management
/*-------------------------------------------------------------------------------------------*/

    // Theme toggle (light/dark mode)
    // Select all radio buttons used for theme selection
    const themeRadios = document.querySelectorAll('input[name="theme"]');

    themeRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            // If dark theme selected, apply dark and save preference
            if (radio.value === "dark") {
                document.body.classList.add("dark");
                localStorage.setItem("theme", "dark");
            } 
            // Else apply light theme and save
            else {
                document.body.classList.remove("dark");
                localStorage.setItem("theme", "light");
            }
        });
    });

    // If theme radios exist and saved theme stored, set correct radio
    // Automatically select the correct option when the settings page loads
    if (themeRadios.length && savedTheme) {
        themeRadios.forEach(radio => {
            radio.checked = radio.value === savedTheme;
        });
    }

    // Account Deletion
    // Allows a user to permanently delete their account from the system 
    const deleteBtn = document.getElementById("delete-account");

    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            // Retrieve logged in user
            const username = localStorage.getItem("user");
            // Ask for confirmation before deleting
            if (!confirm("Are you sure you want to delete your account?")) return;

            // Send delete request to backend API
            fetch("http://localhost:3000/api/user/" + username, {
                method: "DELETE"
            })
            .then(res => res.json())
            .then(() => {
                // Remove stored user
                localStorage.removeItem("user");
                // Inform the user and redirect to home page
                alert("Account deleted");
                window.location.href = "home.html";
            })
            // Log error if deletion fails 
            .catch(err => console.error("Delete failed:", err));
        });
    }

/*-------------------------------------------------------------------------------------------*/
// INFO PAGE TRACKING
// This section detects when a user visits one of the cipher information pages. When an info 
// page is opened, the system sends a request to the backend API to record that the user has 
// read the page. This contributes to the users overall learning progress and is displayed
// on the profile page.
/*-------------------------------------------------------------------------------------------*/

    // Map HTML page names to their corresponding page identifiers
    // These identifiers are stored in users.json when a page is read
    const infoPages = {
        "shift-info.html": "shift-info",
        "substitution-info.html": "substitution-info",
        "mixedalphabet-info.html": "mixedalphabet-info",
        "transposition-info.html": "transposition-info",
        "route-info.html": "route-info",
        "railfence-info.html": "railfence-info"
    };

    // Determine the current page by extracting the file name from the URL
    const currentPage = window.location.pathname.split("/").pop();

    // Check if the current page exists in the infoPages mapping
    // If it does this means the user has already opened the page
    if (infoPages[currentPage]) {
        // Retrieve the currently logged-in user from localStorage
        const username = localStorage.getItem("user");
        // Only record the page visit if a user is logged in
        if (username) {
            // Send POST request to the backend to record that the user has read the page
            fetch("http://localhost:3000/api/read-page", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                // Send the username and page indentifier in the request body
                body: JSON.stringify({
                    username: username,
                    page: infoPages[currentPage]
                })
            })
            // Log error if request fails
            .catch(err => console.error("Failed to record page read:", err));
        }
    }

/*-------------------------------------------------------------------------------------------*/
// RECORD CHALLENGE COMPLETION
// This function sends challenge completion data to the backend API. When a user completes a 
// challenge, the frontend calls this function to record the completion and update the users
// score and progress in users.json.
/*-------------------------------------------------------------------------------------------*/

    function recordChallengeCompletion(challengeId, score) {
        // Retrieve the currently logged-in user from localStorage
        const username = localStorage.getItem("user");

        // If no user is logged in, exit the function
        if (!username) return;

        // Send POST request to the backend API to record the challenge completion
        fetch("http:localhost:3000/api/complete", {
            method: "POST",
            // Specify that JSON data is being sent
            headers: {
                "Content-Type": "application/json"
            },
            // Send username, challenge ID and score to the server
            // Backend will update users progress and total points 
            body: JSON.stringify({
                username: username,
                challengeId: challengeId,
                score: score
            })
        })
        // Log error if request fails 
        .catch(err => console.error("Failed to record challenge:", err));
    }

/*-------------------------------------------------------------------------------------------*/
// INFO MODAL FOR WORDLE STYLE CHALLENGES
// Controls the help modal displayed on certain challenge pages. The modal provides instructions
// explaining how the challenge works. It can be opened manually from all related challenges 
// and opens automatically on the first related challenge. 
/*-------------------------------------------------------------------------------------------*/

    const helpModal = document.getElementById("helpModal");

    if (helpModal) {

        // Detects if current page is the shift challenge (first one) as this is the first related challenge
        const shiftPage = document.querySelector(".shift-challenge");

        // Buttons controlling modal behaviour
        const openHelp = document.getElementById("open-help") || document.getElementById("hint-btn");
        const closeHelp = document.getElementById("close-help");
        const startBtn = document.getElementById("start-challenge");

        // Automatically show help modal when shift challenge loads
        if (shiftPage) {
            helpModal.style.display = "block";
        }

        // Open modal
        openHelp?.addEventListener("click", () => {
            helpModal.style.display = "block";
        });

        // Close modal
        closeHelp?.addEventListener("click", () => {
            helpModal.style.display = "none";
        });

        startBtn?.addEventListener("click", () => {
            helpModal.style.display = "none";
        });

        // Close modal when clicking outside
        window.addEventListener("click", (e) => {
            if (e.target === helpModal) {
                helpModal.style.display = "none";
            }
        });
    }

/*-------------------------------------------------------------------------------------------*/
// WORDLE STYLE ATTEMPTS
// Initialises the logic for wordle-style gameplay. The user submits guesses which are compared
// against the correct answer. Feedback is provided using coloured indicators showing:
// - correct letter in correct position
// - correct letter in wrong position
// - incorrect letter
// The number of attempts impacts the final score awarded to the user. 
/*-------------------------------------------------------------------------------------------*/

    function initWordleChallenge({
        challengeId,
        answer,
        maxScore = 10,
        answerInput,
        feedbackArea,
        submitBtn,
        resultModal,
        resultTitle,
        resultMessage
    }) {
        
        // Track number of attempts made by user
        let attempts = 0;

        // Main function: runs when user submits a guess
        function handleGuess() {

            // Stops if anything missing
            if (!answerInput || !feedbackArea || !answer) return;
            
            // Normalise user input
            const guess = answerInput.value
            .replace(/[^a-zA-Z]/g, "") // removes spaces
            .trim()
            .toLowerCase();

            if (!guess) return;

            // Increase attempt counter
            attempts++;

            // New row for wordle style feedback
            const row = document.createElement("div");
            row.classList.add("feedback-row");

            const guessLetters = guess.split("");
            const answerLetters = answer.split("");

            const spans = [];

            // First pass: check for correct letters and position
            guessLetters.forEach((letter, index) => {
                const span = document.createElement("span");
                span.classList.add("letter");
                span.textContent = letter;

                if (letter === answerLetters[index]) {
                    span.classList.add("correct");
                    answerLetters[index] = null;
                    guessLetters[index] = null;
                }
                spans.push(span);
            });

            // Second pass: check for correct letters and wrong position
            guessLetters.forEach((letter, index) => {
                if (letter === null) return;

                const span = spans[index];
                const presentIndex = answerLetters.indexOf(letter);

                if (presentIndex !== -1) {
                    span.classList.add("present");
                    answerLetters[presentIndex] = null;
                } else {
                    span.classList.add("absent");
                }
            });

            // Append letters to feedback row
            spans.forEach(span => row.appendChild(span));

            // Adds newest attempt to sidebar
            feedbackArea.prepend(row);

            // If correct then popup with score
            if (guess === answer) {
                let score = maxScore - (attempts - 1) * 2;
                if (score < 2) score = 2;

                recordChallengeCompletion(challengeId, score);

                resultTitle.textContent = "Correct!";
                resultMessage.textContent = `Solved in ${attempts} attempt(s). Score: ${score}`;
                
                resultModal.style.display = "block";
            }

            // Clears input box for next guess 
            answerInput.value = "";
        }

        // Submit button click
        if (submitBtn) {
            submitBtn.addEventListener("click", handleGuess);
        }

        // Allow enter key submission
        if (answerInput) {
            answerInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    handleGuess();
                }
            });
        }
    }

/*-------------------------------------------------------------------------------------------*/
// SHIFT CIPHER CHALLENGE
/*-------------------------------------------------------------------------------------------*/

    // Checks if the current page contains the shift challenge section
    const shiftChallenge = document.querySelector(".shift-challenge");

    if (shiftChallenge) {

        // Reference UI elements that are used for the challenge
        const submitBtn = document.getElementById("submit-btn");
        const feedbackArea = document.getElementById("feedback-area");
        const answerInput = document.getElementById("answer");

        // Elements used to display the results modal 
        const resultModal = document.getElementById("resultModal");
        const resultTitle = document.getElementById("result-title");
        const resultMessage = document.getElementById("result-message");

        // Request challenge data from the backend API
        fetch("http://localhost:3000/api/challenges/shift")
        // Convert server response to JSON format
        .then(res => res.json())
        // Once challenge data is received initialise the guessing system
        .then(data => {

            initWordleChallenge({
                challengeId: data.id,
                answer: data.answer,
                maxScore: data.maxScore,
                answerInput,
                feedbackArea,
                submitBtn,
                resultModal,
                resultTitle,
                resultMessage
            });
        })
        .catch(err => {
            console.error("Failed to load challenge:", err);
        });
    }

/*-------------------------------------------------------------------------------------------*/
// SHIFT CIPHER CHALLENGE - HARD
/*-------------------------------------------------------------------------------------------*/

    // Checks if the current page contains the shift challenge section
    const shiftChallengeTwo = document.querySelector(".shift-challenge-two");

    if (shiftChallengeTwo) {

        // Reference UI elements that are used for the challenge
        const submitBtn = document.getElementById("submit-btn");
        const feedbackArea = document.getElementById("feedback-area");
        const answerInput = document.getElementById("answer");

        // Elements used to display the results modal 
        const resultModal = document.getElementById("resultModal");
        const resultTitle = document.getElementById("result-title");
        const resultMessage = document.getElementById("result-message");

        // Request challenge data from the backend API
        fetch("http://localhost:3000/api/challenges/shiftTwo")
        // Convert server response to JSON format
        .then(res => res.json())
        // Once challenge data is received initialise the guessing system
        .then(data => {

            initWordleChallenge({
                challengeId: data.id,
                answer: data.answer,
                maxScore: data.maxScore,
                answerInput,
                feedbackArea,
                submitBtn,
                resultModal,
                resultTitle,
                resultMessage
            });
        })
        .catch(err => {
            console.error("Failed to load challenge:", err);
        });
    }


/*-------------------------------------------------------------------------------------------*/
// SUBSTITUTION CIPHER CHALLENGE
/*-------------------------------------------------------------------------------------------*/

    // Checks if the substitution challenge page is loaded
    const substitutionChallenge = document.querySelector(".substitution-challenge");

    if (substitutionChallenge) {

        // UI elements used in game
        const submitBtn = document.getElementById("submit-btn");
        const feedbackArea = document.getElementById("feedback-area");
        const answerInput = document.getElementById("answer");

        // Result modal elements
        const resultModal = document.getElementById("resultModal");
        const resultTitle = document.getElementById("result-title");
        const resultMessage = document.getElementById("result-message");

        // Request substitution challenge data from backend
        fetch("http://localhost:3000/api/challenges/substitution")
        // Convert to JSON
        .then(res => res.json())
        .then(data => {

            initWordleChallenge({
                challengeId: data.id,
                answer: data.answer,
                answerInput,
                feedbackArea,
                submitBtn,
                resultModal,
                resultTitle,
                resultMessage
            });
        })
        // Log any errors during request
        .catch(err => {
            console.error("Failed to load challenge:", err);
        });
    }

/*-------------------------------------------------------------------------------------------*/
// MIXED ALPHABET CIPHER CHALLENGE
/*-------------------------------------------------------------------------------------------*/

    // Check if mixed alphabet challenge page is loaded
    const mixedAlphabetChallenge = document.querySelector(".mixed-alphabet-challenge");

    if (mixedAlphabetChallenge) {

        // UI elements
        const submitBtn = document.getElementById("submit-btn");
        const feedbackArea = document.getElementById("feedback-area");
        const answerInput = document.getElementById("answer");

        // Result modal 
        const resultModal = document.getElementById("resultModal");
        const resultTitle = document.getElementById("result-title");
        const resultMessage = document.getElementById("result-message");

        //Request challenge data
        fetch("http://localhost:3000/api/challenges/mixedalphabet")
        .then(res => res.json())
        .then(data => {

            initWordleChallenge({
                challengeId: data.id,
                answer: data.answer,
                answerInput,
                feedbackArea,
                submitBtn,
                resultModal,
                resultTitle,
                resultMessage
            });
        })
        .catch(err => {
            console.error("Failed to load challenge:", err);
        });
    }

/*-------------------------------------------------------------------------------------------*/
// TRANSPOSITION CIPHER CHALLENGE
/*-------------------------------------------------------------------------------------------*/

    // Check if transposition challenge page is loaded
    const transpositionChallenge = document.querySelector(".transposition-challenge");

    if (transpositionChallenge) {

        // UI elements
        const submitBtn = document.getElementById("submit-btn");
        const feedbackArea = document.getElementById("feedback-area");
        const answerInput = document.getElementById("answer");

        // Result modal 
        const resultModal = document.getElementById("resultModal");
        const resultTitle = document.getElementById("result-title");
        const resultMessage = document.getElementById("result-message");

        // Fetch data
        fetch("http://localhost:3000/api/challenges/transposition")
        .then(res => res.json())
        .then(data => {

            initWordleChallenge({
                challengeId: data.id,
                answer: data.answer,
                answerInput,
                feedbackArea,
                submitBtn,
                resultModal,
                resultTitle,
                resultMessage
            });
        })
        .catch(err => {
            console.error("Failed to load challenge:", err);
        });
    }

/*-------------------------------------------------------------------------------------------*/
// ROUTE CIPHER INFO
// This section of code demonstrates how a route cipher works by animating the path taken 
// through a grid of letters. The animation highlights the order in which letters are read to 
// produce the ciphertext. 
/*-------------------------------------------------------------------------------------------*/

    // References to show route button and grid container
    const showRouteBtn = document.getElementById("show-route-btn");
    const routeGrid = document.getElementById("route-info-grid");

    // Only run logic if both elements exist on the page
    if (showRouteBtn && routeGrid) {
        // When button clicked run animation
        showRouteBtn.addEventListener("click", () => {
            // Select all cells inside grid
            const cells = routeGrid.querySelectorAll("div");

            // Reset the grid first so rout can be replayed
            // Removes previous highlight styles from cells
            cells.forEach(cell => {
                cell.classList.remove("route-cell", "route-active");
            });

            // Snake pattern indices
            // Order for the route to move through the grid
            const routeOrder = [
                0, 5, 10, 
                11, 6, 1, 
                2, 7, 12,
                13, 8, 3, 
                4, 9, 14
            ];

            // Loop each step in the route
            routeOrder.forEach((index, step) => {
                // Delays each step 
                setTimeout(() => {
                    // Mark this cell as part of the route 
                    cells[index].classList.add("route-cell");

                    // Highlight the current step
                    cells[index].classList.add("route-active");

                    // Remove active highlight from previous step
                    if (step > 0) {
                        cells[routeOrder[step - 1]].classList.remove("route-active");
                    }
                }, step * 400); // Each step happens 400ms after the previous one
            });
        });
    }

/*-------------------------------------------------------------------------------------------*/
// ROUTE CIPHER CHALLENGE
// This section of code implements the interactive route cipher challenge. The user must follow
// the correct route through the grid by selecting cells in the correct order. Incorrect 
// selections increase the mistake counter and reduce the final score. Using hints also shows
// the next step and reduces the final score. 
/*-------------------------------------------------------------------------------------------*/

    // Checks if route cipher challenge page is loaded 
    const routeChallenge = document.querySelector(".route-challenge");

    if (routeChallenge) {

        // Reference to the grid container that will display the route letters 
        const routeGrid1 = document.getElementById("route-challenge-grid");
        // Input box used to display letters selected by user
        const answerInput = document.getElementById("answer");

        // Stop execution if grid container doesn't exist 
        if (!routeGrid1) return;

        // Arrays used to track correct route and players selection
        let correctRoute = [];
        let playerRoute = [];
        // Variables used to track scoring and hints
        let mistakes = 0;
        let hintsUsed = 0;
        let maxScore = 10;
        let requiredLength = 8;

        // UI elements used to display score statistics 
        const mistakes1 = document.getElementById("mistakes");
        const hints1 = document.getElementById("hintsUsed");
        const score1 = document.getElementById("score");

        // Fetch challenge
        fetch("http://localhost:3000/api/challenges/route")
        .then(res => res.json())
        .then(data => {

            correctRoute = data.route;
            requiredLength = data.requiredLength;
            maxScore = data.maxScore;

            // Builds grid using letters from the API
            buildGrid(data.grid);
            // Highlights the starting position of the route
            highlightStart();
            // Initialise score display
            updateScore();
        });

        // BUILD GRID FUNCTION
        function buildGrid(rows) {

            // Clear any previous grid content
            routeGrid1.innerHTML = "";

            // Loop through each row of the grid 
            rows.forEach(row => {
                // Splits row string into individual letters 
                row.split("").forEach(letter => {

                    // Create a new grid cell 
                    const cell = document.createElement("div");

                    // Display letter in cell 
                    cell.textContent = letter;
                    // Add cell to grid container 
                    routeGrid1.appendChild(cell);

                });
            });
            // Add click interactions to each grid cell 
            addCellEvents();
        }

        // HIGHLIGHT START CELL FUNCTION 
        function highlightStart() {

            const cells = routeGrid1.querySelectorAll("div");

            // Prevents errors if grid not created 
            if (!cells.length) return;

            // First element of the correct route represents the start position
            const startIndex = correctRoute[0];
            cells[startIndex].classList.add("route-start");
        }

        // CELL CLICK LOGIC FUNCTION 
        function addCellEvents() {

            const cells = routeGrid1.querySelectorAll("div");

            cells.forEach((cell, index) => {

                cell.addEventListener("click", () => {

                    // Prevents additional selection if route = required length
                    if (playerRoute.length >= requiredLength) return;
                    // Prevents selecting the same cell multiple times
                    if (cell.classList.contains("route-selected")) return;

                    // Determines which cell index the user should click next 
                    const expectedIndex = correctRoute[playerRoute.length];

                    // Debugging info for console
                    console.log({
                        clicked: index,
                        expected: expectedIndex,
                        routeStep: playerRoute.length
                    });

                    // Correct cell selected
                    if (index === expectedIndex) {
                        
                        // Add selected cell index to user's route
                        playerRoute.push(index);

                        // If user completes required route length then reveal rest
                        if(playerRoute.length === requiredLength) {
                            revealRemainingRoute();
                        }

                        // Update visual state of selected cell
                        cell.classList.remove("route-hint-active", "route-start");
                        cell.classList.add("route-selected");

                        // Append selected letter to answer input field 
                        if (answerInput) {
                            answerInput.value += cell.textContent;
                        }
                    }
                    // Wrong cell selected 
                    else {
                        
                        // Increase mistake counter
                        mistakes++;
                        // Update score
                        updateScore();

                        // Add visual feedback 
                        cell.classList.add("route-wrong");
                        cell.offsetHeight;

                        // Remove wrong indicator after delay
                        setTimeout(() => {
                            cell.classList.remove("route-wrong");
                        }, 800);
                    }
                }); 
            });
        }

        // SCORE SYSTEM FUNCTION 
        function updateScore() {

            // Score decreases with mistakes and hints
            const score = Math.max(maxScore - mistakes - (hintsUsed * 2), 2);

            // Update UI statistics
            if (mistakes1) mistakes1.textContent = mistakes;
            if (hints1) hints1.textContent = hintsUsed;
            if (score1) score1.textContent = score;
        }

        // Hint button 
        document.getElementById("hint-btn")
        ?.addEventListener("click", () => {

            const cells = routeGrid1.querySelectorAll("div");
            // Determine the next correct cell in route
            const hintIndex = correctRoute[playerRoute.length];

            if (hintIndex === undefined) return;

            // Increase hint counter
            hintsUsed++;
            // Update score
            updateScore();

            const hintCell = cells[hintIndex];

            // Highlight hint cell
            hintCell.classList.add("route-hint-active");

            // Remove hint after delay
            setTimeout(() => {
                if (!hintCell.classList.contains("route-selected")) {
                    hintCell.classList.remove("route-hint-active")
                }
            }, 1200);
        });

        // Submit route
        document.getElementById("submit-route")
        ?.addEventListener("click", () => {
            
            // Ensure route has been completed
            if (playerRoute.length < requiredLength) {
                alert("Route incomplete!");
                return;
            }

            // Build ciphertext from selected letters
            const firstLetters = playerRoute
            .slice(0, requiredLength)
            .map(i =>
            routeGrid1.children[i].textContent
            )
            .join("");

            // Calculate final score
            const score = Math.max(maxScore - mistakes - hintsUsed * 2, 2);

            recordChallengeCompletion(6, score);
            // Display result modal 
            showResult(firstLetters, score);
        });

        // RESULT MODAL FUNCTION 
        function showResult(text, score) {

            const modal = document.getElementById("resultModal");

            document.getElementById("result-title")
            .textContent = "Route Complete!";

            document.getElementById("result-message")
            .textContent = `Ciphertext start: ${text}\nScore: ${score}`;

             modal.style.display = "block";
        }

        // REVEAL REMAINING ROUTE FUNCTION 
        function revealRemainingRoute() {

            const cells = routeGrid1.querySelectorAll("div");
            const remaining = correctRoute.slice(requiredLength);

            remaining.forEach((cellIndex, step) => {

                setTimeout(() => {
                    cells[cellIndex].classList.add("route-selected");
                }, step * 180);
            });
        }
    }

/*-------------------------------------------------------------------------------------------*/
// RAIL FENCE INFO PAGE
// Demonstrates how the rail fence cipher works by animating the process of writing the 
// plaintext in a zigzag pattern across multiple rails and then reading the rows to produce 
// the ciphertext. 
/*-------------------------------------------------------------------------------------------*/

    // References to page elements 
    const railGrid = document.getElementById("rail-grid");
    const showRailBtn = document.getElementById("show-rail-btn");
    const readRailBtn = document.getElementById("read-rail-btn");
    const resetRailBtn = document.getElementById("reset-rail-btn");
    const railOutput = document.getElementById("rail-cipher-output");

    // Only run the logic if the rail info page elements exist
    if (railGrid && showRailBtn) {

        // Plaintext used for the demo
        const text = "CURIOUSERANDCURIOUSER";
        // Number of rails used in the cipher
        const rails = 3;
        // Numbr of coulmns is equal to length of the plaintext
        const cols = text.length;

        // Configures CSS grid size dynamically
        railGrid.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
        railGrid.style.gridTemplateRows = `repeat(${rails}, 40px)`;

        // Array storing grid cells 
        let cells = [];

        // BUILD GRID FUNCTION 
        function buildGrid() {

            railGrid.innerHTML = "";
            cells = [];

            for (let r = 0; r < rails; r++) {
                for (let c = 0; c < cols; c++) {

                    const cell = document.createElement("div");
                    cell.classList.add("rail-cell");

                    railGrid.appendChild(cell);
                    cells.push(cell);
                }
            }
        }

        // RESET GRID FUNCTION 
        function resetGrid() {
            buildGrid();
            railOutput.textContent = "";
        }

        // ANIMATE ENCRYPTION FUNCTION 
        function animateEncryption() {

            resetGrid();

            let rail = 0;
            let direction = 1;

            // Place letters one-by-one in zigzag pattern 
            text.split("").forEach((letter, index) => {

                setTimeout(() => {

                    const cellIndex = rail * cols + index;
                    const cell = cells[cellIndex];

                    cell.textContent = letter;
                    cell.classList.add("rail-active");

                    // Move up or down the rails 
                    rail += direction;

                    // Reverse direction at top or bottom rail 
                    if (rail === 0 || rail === rails - 1) {
                        direction *= -1;
                    }

                }, index * 120);
            });

            // After zigzag writing finishes, read rows to form ciphertext
            setTimeout(() => {

                let cipher = "";

                for (let r = 0; r < rails; r++) {

                    setTimeout(() => {

                        // Highlight entire row
                        for (let c = 0; c < cols; c++) {
                            cells[r * cols + c].classList.add("rail-row-highlight");
                        }

                        // Read letters across the row 
                        for (let c = 0; c < cols; c++) {

                            const cell = cells[r * cols + c];

                            if (cell.textContent) {
                                cell.classList.add("rail-reading");
                                cipher += cell.textContent;
                            }
                        }

                        // Update displayed ciphertext
                        railOutput.textContent = `Ciphertext: ${cipher}`;

                    }, r * 800);
                }
            }, text.length * 120 + 400);
        }

        // ANIMATE READING FUNCTION 
        function animateReading() {

            if (!cells.length) return;

            let cipher = "";
            let step = 0;

            // Reset animation classes
            cells.forEach(cell => {
                cell.classList.remove("rail-active");
                cell.classList.remove("rail-reading");
            });

            // Read rows sequentially
            for (let r = 0; r < rails; r++) {
                for (let c = 0; c < cols; c++) {

                    const cell = cells[r * cols + c];

                    if(cell.textContent) {

                        setTimeout(() => {

                            cells.forEach(c => 
                                c.classList.remove("rail-reading")
                            );

                            cell.classList.add("rail-reading");

                            cipher += cell.textContent;
                            railOutput.textContent = `Ciphertext: ${cipher}`;

                        }, step * 180);
                        step++;
                    }
                }
            }
        }

        // Button event listeners
        showRailBtn.addEventListener("click", animateEncryption);
        readRailBtn?.addEventListener("click", animateReading);
        resetRailBtn?.addEventListener("click", resetGrid);

        // Build grid on page load 
        buildGrid();
    }

/*-------------------------------------------------------------------------------------------*/
// RAIL FENCE CHALLENGE
// Interactive challenge where the user must read the rail fence cipher correctly by selecting
// letters in the correct order. Incorrect selections increase mistakes and reduce the final 
// score. Using hints also reduces the final score. 
/*-------------------------------------------------------------------------------------------*/

    // Check if rail fence challenge 
    const railChallenge = document.querySelector(".rail-challenge");

    if (railChallenge) {

        const railGrid = document.getElementById("rail-challenge-grid");
        const answerInput = document.getElementById("answer");

        if (!railGrid) return;

        // Arrays for correct order and player selections 
        let correctOrder = [];
        let playerOrder = [];
        // Scoring variables
        let mistakes = 0;
        let hintsUsed = 0;
        let maxScore = 10;
        // Ciphertext parameters 
        let requiredLength = 10;
        let plaintext = "";
        let rails = 3;
        let cols = 0;

        // UI score elements 
        const mistakes1 = document.getElementById("mistakes");
        const hints1 = document.getElementById("hintsUsed");
        const score1 = document.getElementById("score");

        // Fetch challenge data 
        fetch("http://localhost:3000/api/challenges/railfence")
        .then(res => res.json())
        .then(data => {

            plaintext = data.plaintext;
            rails = data.rails;
            requiredLength = data.requiredLength;
            maxScore = data.maxScore;
            cols = plaintext.length;

            buildRailGrid();
        })
        .catch(err => console.error("Failed to load challenge:", err));

        // BUILD RAIL GRID FUNCTION 
        function buildRailGrid() {

            // Clear any previous grid content
            railGrid.innerHTML = "";
            // Configure CSS grid size
            railGrid.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
            railGrid.style.gridTemplateRows = `repeat(${rails}, 40px)`;

            // Create grid cells for each row and column 
            for (let r = 0; r < rails; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = document.createElement("div");
                    cell.classList.add("rail-cell");
                    railGrid.appendChild(cell);
                }
            }

            // Fill grid with zigzag pattern plaintext letters 
            fillZigzag();
            // Determine correct reading order for ciphertext
            generateCorrectOrder();
            // Add click interaction to cells 
            addCellEvents();
            // Initialise score display 
            updateScore();
        }

        // FILL ZIG ZAG FUNCTION 
        function fillZigzag() {

            const cells = railGrid.querySelectorAll(".rail-cell");

            // Current rail position
            let rail = 0;
            // Move direction
            let direction = 1;

            for (let i = 0; i < plaintext.length; i++) {

                // Convert rail/column coordinates into flat grid index 
                const index = rail * cols + i;
                // Place plaintext character into cell
                cells[index].textContent = plaintext[i];

                // Move rail
                rail += direction;

                // Reverse direction if at top or bottom rail 
                if (rail === 0 || rail === rails - 1) {
                    direction *= -1;
                }
            }
        }

        // GENERATE CORRECT ORDER FUNCTION 
        function generateCorrectOrder() {

            correctOrder = [];

            const cells = railGrid.querySelectorAll(".rail-cell");

            for (let r = 0; r < rails; r++) {
                for (let c = 0; c < cols; c++) {
                    const index = r* cols + c;
                    if (cells[index].textContent) {
                        correctOrder.push(index);
                    }
                }
            }
        }

        // ADD CELL EVENTS FUNCTION 
        function addCellEvents() {

            const cells = railGrid.querySelectorAll(".rail-cell");

            cells.forEach((cell, index) => {

                cell.addEventListener("click", () => {

                    // Ignore empty cells (no letters)
                    if (!cell.textContent) return;

                    // Prevent selecting more letters than required 
                    if (playerOrder.length >= requiredLength) return;
                    // Prevent selecting same cell twice 
                    if (cell.classList.contains("rail-selected")) return;
                    // Determine expected next cell in sequence 
                    const expectedIndex = correctOrder[playerOrder.length];

                    // If player selects correct cell 
                    if (index === expectedIndex) {

                        playerOrder.push(index);
                        cell.classList.add("rail-selected");

                        // Add letter to answer field 
                        answerInput.value += cell.textContent;

                        // Reveal remainder of cipher once player completes 
                        if (playerOrder.length === requiredLength) {
                            revealRemainingRail();
                        }
                    } else {

                        // Incorrect selection increases mistake counter 
                        mistakes++;
                        updateScore();

                        // Temporary visual feedback 
                        cell.classList.add("rail-wrong");

                        setTimeout(() => {
                            cell.classList.remove("rail-wrong");
                        }, 800);
                    }
                });
            });
        }

        // REVEAL REMAINING RAILS FUNCTION 
        function revealRemainingRail() {

            const cells = railGrid.querySelectorAll(".rail-cell");
            const remaining = correctOrder.slice(requiredLength);

            remaining.forEach((index, step) => {
                setTimeout(() => {
                    cells[index].classList.add("rail-selected");
                }, step * 150);
            });
        }

        // UPDATE SCORE FUNCTION 
        function updateScore () {

            const score = Math.max(maxScore - mistakes - (hintsUsed * 2), 2);

            if (mistakes1) mistakes1.textContent = mistakes;
            if (hints1) hints1.textContent = hintsUsed;
            if (score1) score1.textContent = score;
        }

        document.getElementById("hint-btn")
        ?.addEventListener("click", () => {
            const cells = railGrid.querySelectorAll(".rail-cell");
            const hintIndex = correctOrder[playerOrder.length];
            if (hintIndex === undefined) return;
            hintsUsed++;
            updateScore();
            const hintCell = cells[hintIndex];
            hintCell.classList.add("rail-hint-active");
            setTimeout(() => {
                if (!hintCell.classList.contains("rail-selected")) {
                    hintCell.classList.remove("rail-hint-active");
                }
            }, 1200);
        });

        document.getElementById("submit-rail")
        ?.addEventListener("click", () => {

            if (playerOrder.length < requiredLength) {
                alert("Ciphertext incomplete!");
                return;
            }
            const cells = railGrid.querySelectorAll(".rail-cell");

            const firstLetters = playerOrder
            .slice(0, requiredLength)
            .map(i => cells[i].textContent)
            .join("");

            const score = Math.max(maxScore - mistakes - hintsUsed * 2, 2);

            recordChallengeCompletion(7, score);
            showResult(firstLetters, score);
        });

        // SHOW RESULT FUNCTION 
        function showResult(text, score) {

            const modal = document.getElementById("resultModal");

            document.getElementById("result-title")
            .textContent = "Rail Fence Challenge Complete!";

            document.getElementById("result-message")
            .textContent = 
             `Ciphertext start: ${text}\nScore: ${score}`;

            modal.style.display = "block";
        }
    }
});


