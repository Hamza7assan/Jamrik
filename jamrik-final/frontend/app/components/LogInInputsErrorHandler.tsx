import "./LogInInputsErrorHandler.css";
import { useEffect } from "react";
type LogInInputsErrorHandlerProps = {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    userRole?: string;
    noErrors: (valid: boolean) => void;
};

const LogInInputsErrorHandler = ({ fullName, email, password, confirmPassword, userRole, noErrors }: LogInInputsErrorHandlerProps) => {
    const errors: string[] = [];
    if (!fullName?.trim()) {
        errors.push("Full Name is required. ");
    }else if (fullName.length < 3) {
        errors.push("Full Name must be at least 3 characters. ");
    }else if (fullName.length > 20) {
        errors.push("Full Name must be less than 20 characters. ");
    }

    if (!password?.trim()) {
        errors.push("Password is required. ");
    } else if (password.length < 8) {
        errors.push("Password must be at least 8 characters. ");
    }else if (password.length > 20) {
        errors.push("Password must be less than 20 characters. ");
    }else if (!/\d/.test(password)) {
        errors.push("Password must contain at least one number. ");
    }else if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter. ");
    }

    if(email !== undefined) {
    if (!email?.trim()) {
        errors.push("Email is required. ");
    } else if (!(email.includes("@") && email.includes("."))) {
        errors.push("Please enter a valid email address. ");
    }

    if (!confirmPassword?.trim()) {
        errors.push("Confirm the Password. ");
    } else if (confirmPassword !== password) {
        errors.push("Passwords do not match. ");
    }

    if (!userRole?.trim()) {
        errors.push("User Role is required. ");
    }
}

const errorsCount = errors.length;
    useEffect(() => {
    noErrors(errorsCount === 0);
}, [errorsCount]); 

if (errors.length === 0) return null;

return (
    <div className="errorSummaryBox">
            {errors.map((errorMessage, index) => (
                <span key={`${errorMessage}-${index}`} className="inputErrorText">{errorMessage}</span>
            ))}
    </div>
)
}
export default LogInInputsErrorHandler;