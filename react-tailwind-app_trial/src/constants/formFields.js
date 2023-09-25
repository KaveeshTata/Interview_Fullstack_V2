const loginFields = [
    {
        labelText: "Username",
        labelFor: "username",
        id: "username",
        name: "username",
        type: "username",
        autoComplete: "username",
        isRequired: true,
        placeholder: "Username"
    },
    {
        labelText: "Password",
        labelFor: "password",
        id: "password",
        name: "password",
        type: "password",
        autoComplete: "current-password",
        isRequired: true,
        placeholder: "Password"
    }
]

const passwordResetFields = [
    {
        labelText: "Email address",
        labelFor: "email-address",
        id: "emailAddress",
        name: "email",
        type: "email",
        autoComplete: "email",
        isRequired: true,
        placeholder: "Email address"
    }
]

const otpVerificationFields = [
    {
        labelText: "OTP",
        labelFor: "otp",
        id: "otp",
        name: "otp",
        type: "number",
        autoComplete: "otp",
        isRequired: true,
        placeholder: "OTP"
    }
]

const signupFields = [
    {
        labelText: "Username",
        labelFor: "username",
        id: "username",
        name: "username",
        type: "text",
        autoComplete: "username",
        isRequired: true,
        placeholder: "Username"
    },
    {
        labelText: "Email address",
        labelFor: "email-address",
        id: "email-address",
        name: "email",
        type: "email",
        autoComplete: "email",
        isRequired: true,
        placeholder: "Email address"
    },
    {
        labelText: "Password",
        labelFor: "password",
        id: "password",
        name: "password",
        type: "password",
        autoComplete: "current-password",
        isRequired: true,
        placeholder: "Password"
    },
    {
        labelText: "Confirm Password",
        labelFor: "confirm-password",
        id: "confirm-password",
        name: "confirm-password",
        type: "password",
        autoComplete: "confirm-password",
        isRequired: true,
        placeholder: "Confirm Password"
    }
]

const passwordUpdateFields = [
    {
        labelText: "Password",
        labelFor: "password",
        id: "password",
        name: "password",
        type: "password",
        autoComplete: "current-password",
        isRequired: true,
        placeholder: "New Password"
    },
    {
        labelText: "Confirm Password",
        labelFor: "confirm-password",
        id: "confirmPassword",
        name: "confirm-password",
        type: "password",
        autoComplete: "confirm-password",
        isRequired: true,
        placeholder: "Confirm New Password"
    }
]

const registrationFields = [
    {
        labelText: "Firstname",
        labelFor: "firstname",
        id: "firstname",
        name: "firstname",
        type: "firstname",
        autoComplete: "firstname",
        isRequired: true,
        placeholder: "First name"
    },
    {
        labelText: "Lastname",
        labelFor: "lastname",
        id: "lastname",
        name: "lastname",
        type: "lastname",
        autoComplete: "lastname",
        isRequired: true,
        placeholder: "Last name"
    },
    {
        labelText: "Email address",
        labelFor: "email-address",
        id: "email_address",
        name: "email",
        type: "email",
        autoComplete: "email",
        isRequired: true,
        placeholder: "Email address"
    },
    {
        labelText: "Username",
        labelFor: "username",
        id: "username",
        name: "username",
        type: "text",
        autoComplete: "username",
        isRequired: true,
        placeholder: "Username"
    },
    {
        labelText: "Password",
        labelFor: "password",
        id: "password",
        name: "password",
        type: "password",
        autoComplete: "current-password",
        isRequired: true,
        placeholder: "Password"
    },
    {
        labelText: "Contactnumber",
        labelFor: "contactnumber",
        id: "contactnumber",
        name: "contactnumber",
        type: "number",
        autoComplete: "contactnumber",
        isRequired: true,
        placeholder: "Contact Number"
    }, {
        labelText: "User Type",
        labelFor: "usertype",
        id: "usertype",
        name: "usertype",
        type: "select", // Use "select" for dropdown
        isRequired: true,
        options: [
            { value: "", label: "Select Role" }, // Default option
            { value: "admin", label: "Admin" },
            { value: "user", label: "User" }
        ]
    }
]

const adminHomeFields = [
    {
        labelText: "Question Number",
        labelFor: "quesNumber",
        id: "quesNumber",
        name: "quesNumber",
        type: "number",
        autoComplete: "quesNumber",
        isRequired: true,
        placeholder: "Enter the number of questions"
    }
]

export { loginFields, passwordResetFields, signupFields, otpVerificationFields, passwordUpdateFields, registrationFields, adminHomeFields }