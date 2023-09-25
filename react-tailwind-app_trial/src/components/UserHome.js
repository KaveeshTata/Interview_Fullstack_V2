import FormAction from "./FormAction";
import React, { useState } from "react";

export default function UserHome() {
    const [selectedOption, setSelectedOption] = useState(""); // State to store the selected radio button option
    const [showFlashMessage, setShowFlashMessage] = useState(false);

    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // First, call the createUserDirectories route with the selected option
        fetch("/create_user_directory", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                // Handle the response as needed
                console.log("Response from createUserDirectories:", data);

                // Now, fetch the timestamp
                return fetch("/timestamps", {
                    method: "POST",
                });
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                const timestamp = data.timestamp;

                // Handle redirection based on selected option
                if (selectedOption === "audioSession") {
                    console.log("audio");
                    window.location.href = `/audio?timestamp=${timestamp}`;
                } else if (selectedOption === "videoSession") {
                    console.log("video");
                    window.location.href = `/video?timestamp=${timestamp}`;
                } else {
                    console.log("Please select the option");
                    setShowFlashMessage(true);
                }
            })
            .catch((error) => {
                console.error("Fetch error:", error);
            });
    };

    return (
        <div>
            {showFlashMessage && (
                <div id="flashMsg">
                    Invalid login credentials. Please try again.
                </div>
            )}
            <br />

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="flex justify-center space-x-4">
                    {/* Radio button 1 */}
                    <div>
                        <input
                            type="radio"
                            id="audioSession"
                            value="audioSession"
                            checked={selectedOption === "audioSession"}
                            onChange={handleOptionChange}
                        />
                        <label htmlFor="audioSession" className="ml-2 text-gray-700">Audio Session</label>
                    </div>

                    {/* Radio button 2 */}
                    <div>
                        <input
                            type="radio"
                            id="videoSession"
                            value="videoSession"
                            checked={selectedOption === "videoSession"}
                            onChange={handleOptionChange}
                        />
                        <label htmlFor="videoSession" className="ml-2 text-gray-700">Video Session</label>
                    </div>
                </div>

                {/* Start Session button */}
                <FormAction handleSubmit={handleSubmit} text="Start Session" />
            </form>

            <div className="mt-2 text-center text-sm text-gray-600 mt-5">
                Click the button above to start your session
                <div className="flex justify-center mt-4">
                    <a
                        href="./login"
                        className="font-medium text-purple-600 hover:text-purple-500 mt-2 text-center text-sm mt-5"
                    >
                        Logout
                    </a>
                </div>
            </div>
        </div>
    );
}
