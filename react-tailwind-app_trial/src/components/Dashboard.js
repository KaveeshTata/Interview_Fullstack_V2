import React, { useState, useEffect } from 'react';
import FormAction from "./FormAction";

export default function Dashboard() {
    const [loginState, setLoginState] = useState({
        user: '',
        session: '',
    });
    const [showFlashMessage, setShowFlashMessage] = useState(false);
    const [text, setText] = useState("");
    const [users, setUsers] = useState([]);
    const [sessions, setSessions] = useState([]); // Store distinct session IDs
    const [transactions, setTransactions] = useState([]); // Store transaction data

    useEffect(() => {
        // Fetch the list of users from your server
        fetch("http://localhost:3001/initialdashboard") // Replace with your actual API endpoint
            .then((response) => response.json())
            .then((data) => {
                setUsers(data.usernames);
            })
            .catch((error) => console.error("Error fetching users:", error));
    }, []);

    useEffect(() => {
        // Fetch sessions data when loginState.user changes
        if (loginState.user) {
            fetch("http://localhost:3001/get_sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: loginState.user }), // Pass the selected username in the body
            })
                .then((response) => response.json())
                .then((data) => {
                    // Assuming data.sessions is an array of session IDs
                    setSessions(data);
                })
                .catch((error) => console.error("Error fetching sessions:", error));
        }
    }, [loginState.user]);

    const handleChange = (e) => {
        setLoginState({ ...loginState, [e.target.name]: e.target.value });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        getTransactions();
    }


    const getTransactions = async () => {
        const { user, session } = loginState;
    
        if (!user || !session) {
            return; // Do not fetch data if user or session is not selected
        }
    
        try {
            const requestData = {
                user: user,
                session: session,
            };
            console.log(requestData)
    
            // Make an HTTP POST request to your server-side route
            const response = await fetch('http://localhost:3001/dashboardtransactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
    
            if (!response.ok) {
                console.error("Error fetching transaction data");
                setText("Error fetching transaction data. Please try again.");
                setShowFlashMessage(true);
                return;
            }
    
            const transactionsData = await response.json(); // Assuming your server returns JSON data
            setTransactions(transactionsData.transactions_html);
        } catch (error) {
            console.error("An error occurred while fetching transaction data:", error);
            setText("An error occurred while fetching transaction data. Please try again.");
            setShowFlashMessage(true);
        }
    }

    const handleHomeButton = () => {
        window.location.href = '/adminhome';
    }

    const handleLogoutButton = () => {
        window.location.href = '/';
    }

    const getFlagSymbol = (flag) => {
        // "&#9989;" for true and "&#10062;" for false
        return flag ? "\u2714" : "\u2716";
    }

    return (
        <div>
            {showFlashMessage && (
                <div id="flashMsg">
                    {text}
                </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="-space-y-px">
                    <div className="mb-4">
                        <select
                            name="user"
                            value={loginState.user}
                            onChange={handleChange}
                            className="mt-1 p-2 border rounded-md w-full"
                            required
                        >
                            <option value="">Select User</option>
                            {users.map((data) => (
                                <option key={data} value={data}>
                                    {data}
                                </option>
                            ))}
                        </select>
                    </div>
                    {loginState.user && (
                        <div className="mb-4">
                            <select
                                name="session"
                                value={loginState.session}
                                onChange={handleChange}
                                className="mt-1 p-2 border rounded-md w-full"
                                required
                            >
                                <option value="">Select Session</option>
                                {sessions.map((session) => (
                                    <option key={session} value={session}>
                                        {session}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <FormAction handleSubmit={handleSubmit} text="Show Transactions" />

                <br />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                    Transactions
                </h2>

                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table style={{
                        borderCollapse: 'collapse',
                        width: '100%'
                    }}>
                        <thead>
                            <tr>
                                {/* <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Username</th>
                                <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>SessionID</th> */}
                                <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Question ID</th>
                                <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Video Flag</th>
                                <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Prompt Flag</th>
                                <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>LLM Flag</th>
                                <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction, index) => (
                                <tr key={index}>
                                    {/* <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{transaction.username}</td>
                                    <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{transaction.sessionId}</td> */}
                                    <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{transaction.questionId}</td>
                                    <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{getFlagSymbol(transaction.videoFlag)}</td>
                                    <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{getFlagSymbol(transaction.promptFlag)}</td>
                                    <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{getFlagSymbol(transaction.llmFlag)}</td>
                                    <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{transaction.result}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </form>

            <br />
            <div className="flex justify-center mt-4">
                <button className="group relative flex py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500" onClick={handleHomeButton}>
                    Back to Home
                </button>
                <button className="group relative flex py-2.5 px-9 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ml-10" onClick={handleLogoutButton}>
                    Logout
                </button>
            </div>
        </div>
    )
}