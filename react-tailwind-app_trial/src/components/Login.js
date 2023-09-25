import { useState } from 'react';
import { loginFields } from "../constants/formFields";
import FormAction from "./FormAction";
import FormExtra from "./FormExtra";
import Input from "./Input";

const fields = loginFields;
let fieldsState = {};
fields.forEach(field => fieldsState[field.id] = '');

export default function Login() {
    const [loginState, setLoginState] = useState(fieldsState);
    const [showFlashMessage, setShowFlashMessage] = useState(false);

    const handleChange = (e) => {
        setLoginState({ ...loginState, [e.target.id]: e.target.value });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        authenticateUser();
    }

    // Handle Login API Integration here
    const authenticateUser = () => {
        // const usernameInput = loginState.username.toLowerCase();
        const usernameInput = loginState.username;
        const passwordInput = loginState.password;

        fetch("http://localhost:3001/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: usernameInput, password: passwordInput }),
        })
            .then(async (response) => {
                if (response.ok) {
                    const userData = await response.json();
                    console.log(`Valid ${userData.role} login`);

                    // Send the username to server.js using an HTTP POST request

                    window.location.href = `/${userData.role}home`;
                } else {
                    console.log("Invalid login");
                    setShowFlashMessage(true);
                }
            })
            .catch((error) => {
                console.error("Error authenticating user:", error);
            });
    };

    return (
        <div>
            {showFlashMessage && (
                <div id="flashMsg">
                    Invalid login credentials. Please try again.
                </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="-space-y-px">
                    {
                        fields.map(field =>
                            <Input
                                key={field.id}
                                handleChange={handleChange}
                                value={loginState[field.id]}
                                labelText={field.labelText}
                                labelFor={field.labelFor}
                                id={field.id}
                                name={field.name}
                                type={field.type}
                                isRequired={field.isRequired}
                                placeholder={field.placeholder}
                            />
                        )
                    }
                </div>

                <FormExtra />
                <FormAction handleSubmit={handleSubmit} text="Login" />
            </form>
        </div>
    )
}
