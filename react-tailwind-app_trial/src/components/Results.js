import { useState, useEffect } from 'react';
import { DotPulse } from '@uiball/loaders';

export default function Dashboard() {
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        // Fetch summary data when the component mounts
        async function fetchSummaryData() {
            try {
                setLoading(true);

                const response = await fetch("/summary"); // Assuming your backend is running on the same host
                if (response.ok) {
                    const data = await response.json();
                    setQuestions(data.questions);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchSummaryData();
    }, []);

    const handleSubmitButton = async () => {
        setLoading(true); // Show the loader when the submit button is clicked

        try {
            // Make an HTTP POST request using fetch
            const response = await fetch("/create_session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // You can include a request body here if needed
            });
            let statusValue = response.ok ? "1" : "0";
            if (response.ok) {
                console.log('Submit button working');
                // You can handle any success logic here
            } else {
                console.error('Failed to create Whisper session');
                // Handle the error case here
            }
            setQuestions((prevQuestions) =>
                prevQuestions.map((question) => ({
                    ...question,
                    status: statusValue,
                }))
            );
        } catch (error) {
            console.error('An error occurred:', error);
            // Handle any network or request error here
        } finally {
            setLoading(false); // Hide the loader when the operation is complete
        }
    };

    const handleLogoutButton = () => {
        window.location.href = '/';
    };

    const getFlagSymbol = (flag) => {
        // "&#9989;" for true and "&#10062;" for false
        return flag ? "\u2714" : "\u2716"; // "&#9989;" for true and "&#10062;" for false
    }

    return (
        <div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table
                    style={{
                        borderCollapse: 'collapse',
                        width: '100%',
                    }}
                >
                    <thead>
                        <tr>
                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Question</th>
                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Question Recorded</th>
                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Question Saved</th>
                            <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {questions.map((question, index) => (
                            <tr key={index}>
                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>
                                    <div style={{ maxHeight: '50px', overflowY: 'auto' }}>{question.question}</div>
                                </td>
                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{getFlagSymbol(question.recorded_flag)}</td>
                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{getFlagSymbol(question.saved_flag)}</td>
                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{getFlagSymbol(question.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <br />
            <div className="flex justify-center mt-4">
                <button
                    className={`group relative flex py-2.5 px-9 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                    onClick={handleSubmitButton}
                    disabled={loading} // Disable the button while loading
                    style={{ width: loading ? '125px' : 'auto' }} // Increase width when loading
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <br />
                            <DotPulse size={35} color="black" />
                        </div>
                    ) : 'Submit'}
                </button>

                <button
                    className="group relative flex py-2.5 px-9 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ml-10"
                    onClick={handleLogoutButton}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}