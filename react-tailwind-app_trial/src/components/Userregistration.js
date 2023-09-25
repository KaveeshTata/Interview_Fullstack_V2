import React, { useState } from 'react';
import { registrationFields } from "../constants/formFields"
import FormAction from "./FormAction";
import Input from "./Input";

const fields = registrationFields;
let fieldsState = {};

fields.forEach(field => fieldsState[field.id] = '');

export default function Signup() {
    const [signupState, setSignupState] = useState(fieldsState);
    const [text, setText] = useState(""); // Declare text as a state variable
    const [showSuccessFlashMessage, setShowSuccessFlashMessage] = useState(false); // State to control flash message visibility
    const [showFailFlashMessage, setShowFailFlashMessage] = useState(false); // State to control flash message visibility

    const handleChange = (e) => setSignupState({ ...signupState, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createAccount();
    }

    // Handle Account Creation here
    const createAccount = async () => {
        const response = await fetch("/register", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupState),
        });

        if (response.status === 200) {
            console.log("Account created successfully");
            setText("Account created successfully"); // Update text using setText
            setShowSuccessFlashMessage(true);
            resetForm();

            setTimeout(() => {
                setShowSuccessFlashMessage(false);
            }, 3000);

        } else if (response.status === 400) {
            console.log("Bad request - Invalid data");
            setText("Invalid data. Please check your input."); // Update text using setText
            setShowFailFlashMessage(true);
        } else if (response.status === 409) {
            console.log("Conflict - Username or email already exists");
            setText("Username or email already exists. Please choose a different one."); // Update text using setText
            setShowFailFlashMessage(true);
        } else if (response.status === 500) {
            console.log("Internal Server Error");
            setText("Internal Server Error. Please try again later."); // Update text using setText
            setShowFailFlashMessage(true);
        } else {
            console.log("Unknown error");
            setText("An unknown error occurred. Please try again later."); // Update text using setText
            setShowFailFlashMessage(true);
        }
    };

    const resetForm = () => {
        const signupState = {};
        fields.forEach(field => signupState[field.id] = '');
        setSignupState(signupState);
    }

    const handleHomeButton = () => {
        window.location.href = '/adminhome';
    }

    const handleLogoutButton = () => {
        window.location.href = '/';
    }

    return (
        <div>
            {showSuccessFlashMessage && (
                <div id="successFlashMsg">
                    {text}
                </div>
            )}
            {showFailFlashMessage && (
                <div id="failFlashMsg">
                    {text}
                </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="">
                    {fields.map(field =>
                        field.type === "select" ? ( // Check if the field is a select dropdown
                            <div key={field.id} className="mb-4">
                                <select
                                    id={field.id}
                                    name={field.name}
                                    value={signupState[field.id]}
                                    onChange={handleChange}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required={field.isRequired}
                                >
                                    {field.options.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <Input
                                key={field.id}
                                handleChange={handleChange}
                                value={signupState[field.id]}
                                labelText={field.labelText}
                                labelFor={field.labelFor}
                                id={field.id}
                                name={field.name}
                                type={field.type}
                                isRequired={field.isRequired}
                                placeholder={field.placeholder}
                            />
                        )
                    )}
                    <FormAction handleSubmit={handleSubmit} text="Register" />
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
    );
}
