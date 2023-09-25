import { useState, useRef, useEffect, useMemo } from "react";
import { Waveform } from '@uiball/loaders'
import 'font-awesome/css/font-awesome.min.css';
import configData from '../config.json';
import axios from "axios";

const mimeType = "audio/webm";

export default function AudioRecorder() {
    const [quesNumber, setQuesNumber] = useState(1);

    const questions = useMemo(() => [], []);

    const [permission, setPermission] = useState(false);
    const mediaRecorder = useRef(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [stream, setStream] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [audio, setAudio] = useState(null);

    const [remainingTime, setRemainingTime] = useState(configData.SessionDuration);
    const timerIdRef = useRef(null);

    useEffect(() => {
        // Function to fetch questions from the /getquestionsfromapi route
        const fetchQuestionsFromAPI = async () => {
            try {
                const response = await axios.post("/getquestionsfromapi");
                if (response.status === 200) {
                    const { questions: fetchedQuestions } = response.data;
                    questions.splice(0, questions.length, ...fetchedQuestions); // Replace the existing questions array with the fetched questions
                } else {
                    console.error("Failed to fetch questions from the API");
                }
            } catch (error) {
                console.error("An error occurred while fetching questions:", error);
            }
        };

        // Call the function to fetch questions when the component mounts
        fetchQuestionsFromAPI();
    }, [questions]);

    useEffect(() => {
        if (recordingStatus === "recording" && !timerIdRef.current) {
            // Start the timer when recording starts
            timerIdRef.current = setInterval(() => {
                setRemainingTime((prevTime) => {
                    if (prevTime <= 0) {
                        clearInterval(timerIdRef.current);
                        stopRecording(); // Call stopRecording when time reaches zero
                        setRemainingTime(configData.SessionDuration);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else if (recordingStatus !== "recording" && timerIdRef.current) {
            // Stop the timer when recording stops
            clearInterval(timerIdRef.current);
            timerIdRef.current = null;
        }
    });

    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                setStream(streamData);
            }
            catch (err) {
                console.log(err.message);
            }
        } else {
            console.log("The MediaRecorder API is not supported in your browser.");
        }

        // Start the timer when permission is granted and recording starts
        if (permission && recordingStatus === "recording" && !timerIdRef.current) {
            timerIdRef.current = setInterval(() => {
                setRemainingTime((prevTime) => {
                    if (prevTime <= 0) {
                        clearInterval(timerIdRef.current);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
    };

    const startRecording = async () => {
        setRecordingStatus("recording");
        const media = new MediaRecorder(stream, { type: mimeType });
        mediaRecorder.current = media;
        mediaRecorder.current.start();
        let localAudioChunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;
            localAudioChunks.push(event.data);
        };
        setAudioChunks(localAudioChunks);
    };

    const stopRecording = async () => {
        setRecordingStatus("inactive");
        mediaRecorder.current.stop();
        setRemainingTime(configData.SessionDuration);
        mediaRecorder.current.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audioFile = new File([audioBlob], `Question${quesNumber}.mp3`); // Change the file extension if needed
            console.log(quesNumber);
            try {
                const formData = new FormData();
                formData.append("audio", audioFile);
                formData.append("quesNumber", quesNumber); // Add quesNumber to the FormData
                console.log(quesNumber);
                const response = await axios.post("/upload-audio", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (response.status === 200) {
                    console.log("Audio uploaded");
                    setAudio(audioUrl);
                    setAudioChunks([]);
                } else {
                    console.error("Error uploading audio. Status:", response.status);
                }
            } catch (error) {
                console.error("Error uploading audio:", error);
            }
        };
    };


    const handlePreviousQues = () => {
        if (quesNumber <= 1) {
            setQuesNumber(1);
        } else {
            setQuesNumber(quesNumber - 1);
        }
    };

    const handleNextQues = () => {
        setQuesNumber(quesNumber + 1);
        setAudio(null); // Reset the audio state
    };

    const handleFinish = () => {
        window.location.href = '/results';
    };

    // Function to format time in "MM:SS" format
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    return (
        <div>
            <div id="questions" style={{ backgroundColor: 'lightgrey', color: 'black', fontWeight: 'bold', padding: '10px', textAlign: 'center', fontSize: '20px', maxHeight: '75px', overflowY: 'auto' }}>
                {questions[quesNumber - 1]}
            </div>
            <br />

            <div className="audio-controls flex justify-center">
                <button
                    className={`group relative flex-grow py-2.5 px-2.5 mx-5 border border-transparent text-sm font-medium rounded-md text-white ${quesNumber === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'}`}
                    onClick={handlePreviousQues} disabled={quesNumber === 1}
                >
                    &lt;&lt;
                </button>

                {!permission ? (
                    <button onClick={getMicrophonePermission} type="button" className="group relative flex py-2.5 px-9 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500" >
                        Get Microphone
                    </button>
                ) : null}
                {permission && recordingStatus === "inactive" ? (
                    <button onClick={startRecording} type="button" className="group relative flex py-2.5 px-9 mx-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500" >
                        Start
                    </button>
                ) : null}
                {recordingStatus === "recording" ? (
                    <button onClick={stopRecording} type="button" className="group relative flex py-2.5 px-9 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500" >
                        Stop
                    </button>
                ) : null}

                <button
                    className={`group relative flex-grow py-2.5 px-2.5 mx-5 border border-transparent text-sm font-medium rounded-md text-white ${quesNumber === questions.length ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'}`}
                    onClick={handleNextQues} hidden={quesNumber === questions.length} // Disable when last question is shown
                >
                    &gt;&gt;
                </button>

                {quesNumber === questions.length && (
                    <button
                        className={`group relative flex-grow py-2.5 px-2.5 mx-5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                        onClick={handleFinish}
                    >
                        Finish
                    </button>
                )}
            </div>

            {permission && recordingStatus === "inactive" && (
                <center>
                    <br />
                    <Waveform
                        size={25}
                        lineWeight={3.5}
                        speed={0}
                        color="purple"
                    />
                </center>
            )}

            {recordingStatus === "recording" && (
                <center>
                    <br />
                    <Waveform
                        size={25}
                        lineWeight={3.5}
                        speed={1}
                        color="purple"
                    />
                </center>
            )}

            {permission && (
                <div className="mt-2 text-center text-sm text-gray-600 mt-5" id="timer">
                    {formatTime(remainingTime)}
                </div>
            )}

            <br />
            {audio ? (
                <div>
                    <div className="audio-container text-center">
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                            <audio src={audio} controls style={{ width: '80%' }}></audio>
                        </div>
                    </div>
                </div>
            ) : null}

            <br /><br />
            <div className="mt-2 text-center text-sm text-gray-600 mt-5">
                Click the button below to skip all questions and submit <br />
                <a href="./results" className="font-medium text-purple-600 hover:text-purple-500 mt-2 text-center text-sm mt-5">
                    SKIP ALL
                </a>
            </div>
        </div>
    );
};