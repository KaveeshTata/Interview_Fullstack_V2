import { useState } from 'react';
import { passwordResetFields, otpVerificationFields, passwordUpdateFields } from "../constants/formFields";
import FormAction from "./FormAction";
import Input from "./Input";

const fields1 = passwordResetFields;
let fieldsState1 = {};
fields1.forEach(field => (fieldsState1[field.id] = ''));

const fields2 = otpVerificationFields;
let fieldsState2 = {};
fields2.forEach(field => (fieldsState2[field.id] = ''));

const fields3 = passwordUpdateFields;
let fieldsState3 = {};
fields3.forEach(field => (fieldsState3[field.id] = ''));

export default function Passwordreset() {
    const [passwordResetState, setpasswordResetState] = useState(fieldsState1);
    const [OtpVerificationState, setOtpVerificationState] = useState(fieldsState2);
    const [passwordUpdateState, setpasswordUpdateState] = useState(fieldsState3);

    const [text, setText] = useState(""); // Declare text as a state variable
    const [showSuccessFlashMessage, setShowSuccessFlashMessage] = useState(false); // State to control flash message visibility
    const [showFailFlashMessage, setShowFailFlashMessage] = useState(false); // State to control flash message visibility

    const [step, setStep] = useState(1); // State to track the current step

    const handleChange1 = (e) => setpasswordResetState({ ...passwordResetState, [e.target.id]: e.target.value });
    const handleChange2 = (e) => setOtpVerificationState({ ...OtpVerificationState, [e.target.id]: e.target.value });
    const handleChange3 = (e) => setpasswordUpdateState({ ...passwordUpdateState, [e.target.id]: e.target.value });

    const emailInput = passwordResetState.emailAddress;

    const handleSubmit1 = async (e) => {
        e.preventDefault();
        try {
            // Create a data object with the email address
            const data1 = { email: emailInput };

            const response1 = await fetch('/reset_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data1),
            });

            if (response1.status === 200) {
                // Handle success (e.g., show a success message)
                console.log('OTP sent successfully');
                setText("OTP sent successfully");
                setShowSuccessFlashMessage(true);

                setTimeout(() => {
                    setShowSuccessFlashMessage(false);
                    setStep(2); // Move to the next step
                }, 2000);

                setShowFailFlashMessage(false);
            } else if (response1.status === 404) {
                // Handle not found (e.g., show an error message)
                console.error('Email not registered');
                setText("Email not registered");
                setShowFailFlashMessage(true);
            } else {
                // Handle other errors (e.g., show an error message)
                console.error('Failed to send OTP');
                setText("Failed to send OTP");
                setShowFailFlashMessage(true);
            }
        } catch (error) {
            console.error(error);
            // Handle unexpected errors (e.g., show an error message)
        }
    };

    const handleSubmit2 = async (e) => {
        e.preventDefault();
        const otpInput = OtpVerificationState.otp;
        try {
            // Create a data object with the OTP
            const data2 = {
                otp: otpInput,
                email: emailInput
            };

            // Make a POST request to your backend route
            const response2 = await fetch('/verify_otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data2),
            });

            if (response2.status === 200) {
                // Handle success (e.g., show a success message)
                console.log('OTP verification successful');
                setText("OTP verification successful");
                setShowSuccessFlashMessage(true);

                setTimeout(() => {
                    setShowSuccessFlashMessage(false);
                    setStep(3); // Move to the next step
                }, 2000);

                setShowFailFlashMessage(false);
            } else if (response2.status === 404) {
                // Handle not found (e.g., show an error message)
                console.error('Email not registered');
                setText("Email not registered");
                setShowFailFlashMessage(true);
            } else if (response2.status === 401) {
                // Handle unauthorized (e.g., show an error message)
                console.error('Invalid OTP');
                setText("Invalid OTP");
                setShowFailFlashMessage(true);
            } else {
                // Handle other errors (e.g., show an error message)
                console.error('Failed to verify OTP');
                setText("Failed to verify OTP");
                setShowFailFlashMessage(true);
            }
        } catch (error) {
            console.error(error);
            // Handle unexpected errors (e.g., show an error message)
            setText(error);
            setShowFailFlashMessage(true);
        }
    };

    const handleSubmit3 = (e) => {
        e.preventDefault();
        comparePasswords();
    };

    const comparePasswords = () => {
        const newPasswordInput = passwordUpdateState.password;
        const newPasswordInputConfirm = passwordUpdateState.confirmPassword;

        if (newPasswordInput === newPasswordInputConfirm) {
            updatePassword();
        } else {
            console.log("Invalid");
            setText("Passwords don't match. Try again.");
            setShowFailFlashMessage(true); // Show the flash message
        }
    };

    const updatePassword = async () => {
        try {
            // Create a data object with the new password
            const data3 = {
                password: passwordUpdateState.password,
                email: emailInput
            };

            // Make a POST request to your backend route
            const response3 = await fetch("/update_password", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data3),
            });

            if (response3.status === 200) {
                // Handle success (e.g., show a success message)
                console.log('Password updated successfully');
                setText("Password updated successfully. Redirecting back to login page");
                setShowSuccessFlashMessage(true);

                // Redirecting to Login page
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            } else if (response3.status === 404) {
                // Handle not found (e.g., show an error message)
                console.error('Email not registered');
                setText("Email not registered");
                setShowFailFlashMessage(true);
            } else {
                // Handle other errors (e.g., show an error message)
                console.error('Failed to update password');
                setText("Failed to update password");
                setShowFailFlashMessage(true);
            }
        } catch (error) {
            console.error(error);
            // Handle unexpected errors (e.g., show an error message)
            setText(error);
            setShowFailFlashMessage(true);
        }
    };

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

            {/* Div for Email input */}
            {step === 1 && (
                <div id='PR1'>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit1}>
                        {fields1.map((field) => (
                            <Input
                                key={field.id}
                                value={passwordResetState[field.id]}
                                handleChange={handleChange1}
                                labelText={field.labelText}
                                labelFor={field.labelFor}
                                id={field.id}
                                name={field.name}
                                type={field.type}
                                isRequired={field.isRequired}
                                placeholder={field.placeholder}
                            />
                        ))}
                        <FormAction handleSubmit={handleSubmit1} text="Send OTP" />
                    </form>
                </div>
            )}

            {/* Div for OTP input */}
            {step === 2 && (
                <div id='PR2'>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit2}>
                        {fields2.map((field) => (
                            <Input
                                key={field.id}
                                value={OtpVerificationState[field.id]}
                                handleChange={handleChange2}
                                labelText={field.labelText}
                                labelFor={field.labelFor}
                                id={field.id}
                                name={field.name}
                                type={field.type}
                                isRequired={field.isRequired}
                                placeholder={field.placeholder}
                            />
                        ))}
                        <FormAction handleSubmit={handleSubmit2} text="Validate OTP" />
                    </form>
                </div>
            )}

            {/* Div for new Password input */}
            {step === 3 && (
                <div id='PR3'>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit3}>
                        <div className="-space-y-px">
                            {fields3.map((field) => (
                                <Input
                                    key={field.id}
                                    handleChange={handleChange3}
                                    value={passwordUpdateState[field.id]}
                                    labelText={field.labelText}
                                    labelFor={field.labelFor}
                                    id={field.id}
                                    name={field.name}
                                    type={field.type}
                                    isRequired={field.isRequired}
                                    placeholder={field.placeholder}
                                />
                            ))}
                        </div>
                        <FormAction handleSubmit={handleSubmit3} text="Update Password" />
                    </form>
                </div>
            )}
        </div>
    );
}