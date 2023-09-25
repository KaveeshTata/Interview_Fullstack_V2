const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const crypto = require('crypto');
const cheerio = require('cheerio');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3001;
const host = process.env.HOST || '0.0.0.0';
app.use(
    session({
        secret: crypto.randomBytes(32).toString('hex'), // Replace with your own secret key
        resave: true,
        saveUninitialized: true,
    })
);

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: './uploads/',
});
const upload = multer({ storage });
const sessionTimestamps = {};
let globalUsername = null;
let number_of_questions;
const qid = [];
let questions = [];
let savedFlag = [];
let promptFlag = [];
let llmFlag = [];

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'build')));
const currentDir = __dirname;
const parentDir = path.join(currentDir, '..', '..');
const userDirectoriesPath = path.join(parentDir, 'Backend_API');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.get('/userhome', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.get('/passwordreset', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.get('/otpverification', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.get('/passwordupdate', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.get('/adminhome', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.get('/userregistration', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    console.log("1")
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.get('/audio', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.get('/video', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.post('/login', async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    globalUsername = username
    // req.session.username = username;
    data = {
        username: username,
        password: password
    }
    try {
        // Send a POST request to your Flask backend for login
        const response = await axios.post('http://127.0.0.1:5001/api/login', data);

        if (response.status === 200) {
            // Authentication successful, return the user's role and a 200 status code
            res.status(200).json({ role: response.data.roles });
        } else {
            // Authentication failed, return the error message and status code from the backend
            res.status(response.status).json({ message: response.data.message });
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500); // Send a 500 Internal Server Error status code
    }
});

app.get('/get', (req, res) => {
    const sessionData = req.session;
    res.json(sessionData);
});

app.post('/register', async (req, res) => {
    try {
        // Extract form data or JSON data from the frontend (adjust as needed)
        const details = {
            username: req.body.username,
            email: req.body.email_address,
            password: req.body.password,
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            contactNumber: req.body.contactnumber,
            role: req.body.usertype, // User-specified role
        };

        const data = { details };

        // Send the data as JSON to the backend API
        const response = await axios.post('http://127.0.0.1:5001/api/register', data);

        if (response.status === 200) {
            res.status(200).end(); // Registration successful
        } else {
            res.status(500).end(); // Error registering
        }
    } catch (error) {
        console.error(error);
        res.status(500).end(); // Internal server error
    }
});

// Reset Password Route
app.post('/reset_password', async (req, res) => {
    try { // Extract data from the request
        data = {
            email: req.body.email
        }
        // Make a POST request to the backend route
        const response = await axios.post('http://127.0.0.1:5001/reset_password', data);

        if (response.status === 200) {
            res.status(200).json({}); // 200 for success
        } else if (response.status === 404) {
            res.status(404).json({}); // 404 for not found (Email not registered)
        } else {
            res.status(500).json({}); // 500 for internal server error (Failed to send OTP)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({}); // 500 for internal server error
    }
});

// Verify OTP Route
app.post('/verify_otp', async (req, res) => {
    try {
        data = {
            otp: req.body.otp,
            email: req.body.email
        } // Extract data from the request

        // Make a POST request to the backend route
        const response = await axios.post('http://127.0.0.1:5001/verify_otp', data);

        if (response.status === 200) {
            res.status(200).json({}); // 200 for success
        } else if (response.status === 404) {
            res.status(404).json({}); // 404 for not found (Email not registered)
        } else if (response.status === 401) {
            res.status(401).json({}); // 401 for unauthorized (Invalid OTP)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({}); // 500 for internal server error
    }
});

// Update Password Route
app.post('/update_password', async (req, res) => {
    try {
        data = {
            new_password: req.body.password,
            email: req.body.email
        } // Extract data from the request

        // Make a POST request to the backend route
        const response = await axios.post('http://127.0.0.1:5001/update_password', data);

        if (response.status === 200) {
            res.status(200).json({}); // 200 for success
        } else if (response.status === 404) {
            res.status(404).json({}); // 404 for not found (Email not registered)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({}); // 500 for internal server error
    }
});

app.post('/upload', upload.single('video'), (req, res) => {

    const username = globalUsername; // Assuming you have user sessions set up

    if (username in sessionTimestamps) {
        const sessionTimestamp = sessionTimestamps[username];
        const extname = path.extname(req.file.originalname);
        const quesNumber = req.body.quesNumber;
        const filename = `${username}_${sessionTimestamp}_Question${quesNumber}${extname}`;

        // Get the temporary path of the uploaded file
        const tempPath = req.file.path;

        const newuserdirectorypath = path.join(userDirectoriesPath, username)
        // Define the destination path where you want to save the video
        const destinationPath = path.join(newuserdirectorypath, filename);

        // Use the fs module to move the file to the destination
        fs.rename(tempPath, destinationPath, (err) => {
            if (err) {
                console.error('Error moving file:', err);
                res.status(500).json({ error: 'Error uploading the video' });
            } else {
                res.json(200);
            }
        });
    } else {
        res.status(401).json({ error: 'User session not found' });
    }
});

app.post('/upload-audio', upload.single('audio'), (req, res) => {
    const username = globalUsername; // Assuming you have user sessions set up
    console.log("Entered uploading")
    if (username in sessionTimestamps) {
        const sessionTimestamp = sessionTimestamps[username];
        const extname = path.extname(req.file.originalname);
        const quesNumber = req.body.quesNumber;
        const filename = `${username}_${sessionTimestamp}_Question${quesNumber}${extname}`;

        // Get the temporary path of the uploaded audio file
        const tempPath = req.file.path;

        const newuserdirectorypath = path.join(userDirectoriesPath, username)
        // Define the destination path where you want to save the audio
        const destinationPath = path.join(newuserdirectorypath, filename);

        // Use the fs module to move the audio file to the destination
        fs.rename(tempPath, destinationPath, (err) => {
            if (err) {
                console.error('Error moving audio file:', err);
                res.status(500).json({ error: 'Error uploading the audio' });
            } else {
                const audioUrl = `http://localhost:${port}/uploads/${filename}`;
                res.status(200).json({ audioUrl });
            }
        });
    } else {
        res.status(401).json({ error: 'User session not found' });
    }
});

app.post('/timestamps', (req, res) => {
    const username = globalUsername; // Retrieve username from session
    console.log(username)
    if (!username) {
        res.status(400).json({ error: 'Username is required' });
        return;
    }
    // Check if a timestamp already exists for the username and delete it
    if (sessionTimestamps.hasOwnProperty(username)) {
        delete sessionTimestamps[username];
    }

    // Update the session timestamp for the username
    sessionTimestamps[username] = Math.floor(Date.now() / 1000);

    res.json({ timestamp: sessionTimestamps[username] }); // Return the session timestamp for the same username
});

app.post('/create_user_directory', (req, res) => {
    const username = globalUsername;
    console.log(username)
    if (!username) {
        return res.status(400).json({ message: "Invalid request" });
    }
    console.log("User directory created for:", username);
    const data = {
        username: username
    };
    axios.post('http://127.0.0.1:5001/api/create_user_directory', data)
        .then((response) => {
            console.log(response.data); // Log the response from Python
            res.status(200).json({ message: "User directory created" });
        })
        .catch((error) => {
            console.error("Error creating user directory:", error);
            res.status(500).json({ message: "Error creating user directory" });
        });
});

app.post('/submit_number', async (req, res) => {
    try {
        number_of_questions = parseInt(req.body.numberInput);
        console.log(number_of_questions)
        const response = await axios.post("http://127.0.0.1:5001/api/get_num_questions", { num_questions: number_of_questions });

        if (response.status === 200) {
            res.status(200).json({ message: "Selected questions successfully" });
        } else {
            res.status(500).json({ message: "Failed to send JSON response to API app" });
        }
    } catch (error) {
        res.status(500).json({ message: "An error occurred" });
    }
});

app.post('/getquestionsfromapi', async (req, res) => {
    try {
        const questionurl = 'http://127.0.0.1:5001/api/get_chosen_questions';
        const response = await axios.post(questionurl);

        if (response.status === 200) {
            const data = response.data;
            qid.length = 0; // Clear existing data
            qid.push(...data.chosen_questions.map((question_data) => question_data.qid));
            console.log("qid:", qid)
            questions = data.chosen_questions.map((question_data) => question_data.question);
            console.log("questions:", questions)
            return res.status(200).json({ questions: questions });
        } else {
            return res.status(response.status).json({ message: 'Failed to fetch questions from the API' });
        }
    } catch (error) {
        return res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
});

app.post('/create_session', async (req, res) => {
    try {
        const username = globalUsername; // Assuming you have session management middleware
        if (username in sessionTimestamps) {
            const sessionTimestamp = sessionTimestamps[username];
            const newuserdirectorypath = path.join(userDirectoriesPath, username)
            const video_files = fs.readdirSync(newuserdirectorypath);
            const video_names = video_files.filter((filename) =>
                (filename.endsWith('.mp4') || filename.endsWith('.mp3')) && filename.startsWith(`${username}_${sessionTimestamp}`)
            );

            let data = {};

            if (video_names.length > 0) {
                data = {
                    user_id: username,
                    videos: video_names,
                    qid: qid,
                    timestamp: sessionTimestamp,
                };
                console.log(data);
            }

            const response = await axios.post('http://127.0.0.1:5001/api/create_session', data);

            if (response.status === 200) {
                const response_status = { status: 'success' };
                return res.status(200).json(response_status);
            } else {
                return res.status(response.status).json({ message: 'Failed to create Whisper session' });
            }
        }
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
        return res.status(500).json({ message: `Error connecting to the API: ${error.message}` });
    }
});

app.get('/summary', async (req, res) => {
    const summaryTable = [];
    const username = globalUsername; // Assuming you have user sessions set up

    if (username in sessionTimestamps) {
        const sessionTimestamp = sessionTimestamps[username];
        console.log(sessionTimestamp)

        const qidToQuestion = Object.fromEntries(qid.map((key, i) => [key, questions[i]]));

        // Ensure savedFlag has the same length as questions list
        while (savedFlag.length < questions.length) {
            savedFlag.push(0); // Initialize with default value
        }

        while (promptFlag.length < qid.length) {
            promptFlag.push(0);
        }

        while (llmFlag.length < qid.length) {
            llmFlag.push(0);
        }

        // const userDirectoryPath = path.join(backendApiPath, username);

        for (let idx = 0; idx < qid.length; idx++) {
            const questionId = qid[idx];
            const question = questions[idx];
            let questionRecorded = false;
            let questionSaved = false;
            const videoFilename = `${username}_${sessionTimestamp}_Question${idx + 1}.mp4`;
            const audioFilename = `${username}_${sessionTimestamp}_Question${idx + 1}.mp3`;
            console.log(videoFilename)
            const newuserdirectorypath = path.join(userDirectoriesPath, username)
            // Define the destination path where you want to save the video
            const filepath = path.join(newuserdirectorypath, videoFilename);
            const filepath1 = path.join(newuserdirectorypath, audioFilename);
            console.log(filepath)
            if (fs.existsSync(newuserdirectorypath)) {
                const filesInDirectory = fs.readdirSync(newuserdirectorypath);

                if (filesInDirectory.includes(videoFilename)) {
                    questionRecorded = true;
                }

                if (filesInDirectory.includes(audioFilename)) {
                    questionRecorded = true;
                }

                if (questionRecorded && fs.existsSync(filepath)) {
                    questionSaved = true;
                }
                if (questionRecorded && fs.existsSync(filepath1)) {
                    questionSaved = true;
                }
            }

            savedFlag[idx] = questionSaved ? 1 : 0;
            const questionSavedFlag = savedFlag[idx];
            promptFlag[idx] = 0;
            llmFlag[idx] = 0;

            const data = {
                user_id: username,
                session_id: sessionTimestamp,
                question_id: questionId,
                question_saved_flag: questionSavedFlag,
                prompt_flag: promptFlag[idx],
                llm_flag: llmFlag[idx],
            };

            try {
                const response = await axios.post('http://127.0.0.1:5001/api/summary', data);

                if (response.status === 200) {
                    summaryTable.push({
                        question,
                        recorded_flag: questionRecorded ? 1 : 0,
                        saved_flag: questionSaved ? 1 : 0,
                    });
                }
            } catch (error) {
                console.error(error);
            }
        }

        return res.status(200).json({ questions: summaryTable });
    }
});

app.get('/initialdashboard', async (req, res) => {
    try {
        console.log("1")
        const response = await axios.get('http://127.0.0.1:5001/api/initialdashboard');
        const data = response.data;
        console.log(data)
        const usernames = data.usernames;
        res.status(200).json({ usernames });
    } catch (error) {
        res.status(500).json({ error: 'API request failed' });
    }
});

app.post('/get_sessions', async (req, res) => {
    try {
        const username = req.body.username;
        const data = { username };
        const response = await axios.post("http://127.0.0.1:5001/api/get_sessions", data);

        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);
            const sessionOptions = $('option').map(function () {
                return $(this).attr('value');
            }).get();
            console.log(sessionOptions);
            res.status(200).json(sessionOptions);
        } else {
            res.status(response.status).json({ error: "Something went wrong" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/dashboardtransactions', async (req, res) => {
    const username = req.body.user;
    const session = req.body.session;

    try {
        const data = {
            username: username,
            session_id: session
        };

        // Send data as JSON in the request using axios
        const response = await axios.post('http://127.0.0.1:5001/api/dashboard', data);

        if (response.status === 200) {
            const transaction_rows = response.data.transactions;
            return res.status(200).json({ transactions_html: transaction_rows });
        } else {
            return res.status(500).json({ error: 'Failed to fetch data from the API server' });
        }
    } catch (error) {
        return res.status(400).json({ error: 'Invalid session_id format' });
    }
});

app.listen(port, host, () => {
    console.log(`Server is running on ${host}:${port}`);
});