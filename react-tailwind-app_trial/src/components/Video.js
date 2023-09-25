import { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import configData from '../config.json';

const mimeType = 'video/webm; codecs="opus,vp8"';

export default function VideoRecorder() {
    const [quesNumber, setQuesNumber] = useState(1);
    const questions = useMemo(() => [], []);
    const [permission, setPermission] = useState(false);
    const [stream, setStream] = useState(null);
    const mediaRecorder = useRef(null);
    const liveVideoFeed = useRef(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [recordedVideo, setRecordedVideo] = useState(null);
    const [videoChunks, setVideoChunks] = useState([]);

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
        if (permission && stream && liveVideoFeed.current) {
            liveVideoFeed.current.srcObject = stream;
        }
    }, [permission, stream]);

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

    const getCameraPermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true
                });
                setPermission(true);
                setStream(streamData);
            } catch (err) {
                console.log(err.message)
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
        setRecordedVideo(null);
        const media = new MediaRecorder(stream, { mimeType });
        mediaRecorder.current = media;
        mediaRecorder.current.start();

        let localVideoChunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;
            localVideoChunks.push(event.data);
        };

        setVideoChunks(localVideoChunks);
    };

    const stopRecording = async () => {
        setRecordingStatus("inactive");
        mediaRecorder.current.stop();
        setRemainingTime(configData.SessionDuration);
        mediaRecorder.current.onstop = async () => {
            const videoBlob = new Blob(videoChunks, { type: mimeType });
            const videoUrl = URL.createObjectURL(videoBlob);
            const videoFile = new File([videoBlob], `Question${quesNumber}.mp4`);
            console.log(quesNumber)
            try {
                const formData = new FormData();
                formData.append("video", videoFile);
                formData.append("quesNumber", quesNumber); // Add quesNumber to the FormData
                console.log(quesNumber)
                const response = await axios.post("/upload", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                if (response.status === 200) {
                    console.log("Video uploaded");
                    setRecordedVideo(videoUrl);
                    setVideoChunks([]);
                } else {
                    console.error("Error uploading audio. Status:", response.status);
                }
            } catch (error) {
                console.error("Error uploading audio:", error);
            }
        };
    };

    const handlePreviousQues = () => {
        console.log("Previous Question Button working");
        if (quesNumber <= 1) {
            setQuesNumber(1);
        } else {
            setQuesNumber(quesNumber - 1);
        }
    };

    const handleNextQues = () => {
        console.log("Next Question Button working");
        setQuesNumber(quesNumber + 1);
        // setVideoChunks(null); // Reset the video state
        setRecordedVideo(null); // Reset the video state
    };

    const handleFinish = () => {
        console.log("Finish Button working");
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
            <div id="questions" style={{ backgroundColor: 'lightgrey', color: 'black', fontWeight: 'bold', padding: '10px', textAlign: 'center', fontSize: '20px', maxHeight: '80px', overflowY: 'auto' }}>
                {questions[quesNumber - 1]}
            </div>

            <div className="video-player">
                <br />
                {permission && (
                    <video ref={liveVideoFeed} autoPlay muted className="live-player"></video>
                )}
                <br />
                {recordedVideo ? (
                    <div className="recorded-player">
                        <center>
                            <video className="recorded" src={recordedVideo} controls style={{ width: '80%' }}>
                            </video>
                        </center>
                    </div>
                ) : null}
            </div>

            {permission && (
                <div className="mt-2 text-center text-sm text-gray-600 mt-5" id="timer">
                    {formatTime(remainingTime)}
                </div>
            )}
            <br/>

            <div className="video-controls flex justify-center">
                <button
                    className={`group relative flex-grow py-2.5 px-2.5 mx-5 border border-transparent text-sm font-medium rounded-md text-white ${quesNumber === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'}`}
                    onClick={handlePreviousQues} disabled={quesNumber === 1} // Disable when first question is shown
                >
                    &lt;&lt;
                </button>

                {!permission ? (
                    <button onClick={getCameraPermission} type="button" className="group relative flex py-2.5 px-9 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        Get Camera
                    </button>
                ) : null}
                {permission && recordingStatus === "inactive" ? (
                    <button onClick={startRecording} type="button" className="group relative flex py-2.5 px-9 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        Start Recording
                    </button>
                ) : null}
                {recordingStatus === "recording" ? (
                    <button onClick={stopRecording} type="button" className="group relative flex py-2.5 px-9 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Stop Recording
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
            <br />

            <div className="mt-2 text-center text-sm text-gray-600 mt-5">
                Click the button below to skip all questions and submit <br />
                <a href="./results" className="font-medium text-purple-600 hover:text-purple-500 mt-2 text-center text-sm mt-5">
                    SKIP ALL
                </a>
            </div>
        </div>
    );
};