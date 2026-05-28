"use client";
import { useState, useRef } from "react";
import React from "react";
import "./page.css";
import LogInInputs from "../components/LogInInputs";
import LogInStructure from "../components/LogInStructure";
import Button from "../components/Button";
import HaveAccount from "../components/HaveAccount";
import { useRouter } from "next/navigation";
import UserContext from "../components/UserContext";
import { useContext } from "react";
import LogInInputsErrorHandler from "../components/LogInInputsErrorHandler";
import { LanguageContext } from "../components/LanguageContext";
import Link from "next/link";
import { toast } from "sonner";

const LogInPage = () => {
    const [LogInDataForm, setLogInDataForm] = useState({
        userName: "",
        password: "",
    });
    const [showErrors, setShowErrors] = useState(false);
    const userNameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    
    const [noErrors, setNoErrors] = useState(false);
    const router = useRouter();
    const { setUserData } = useContext(UserContext);
    const { t } = useContext(LanguageContext);

    const noErrorsToggle = (valid: boolean) => {
        setNoErrors(valid);
    };

    const handleDataChange = () => {
        setLogInDataForm({
            userName: userNameRef.current ? userNameRef.current.value : "",
            password: passwordRef.current ? passwordRef.current.value : "",
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setShowErrors(true);
        
        const currentUsername = userNameRef.current ? userNameRef.current.value.trim() : "";
        const currentPassword = passwordRef.current ? passwordRef.current.value : "";

        if (!noErrors) {
            return;
        }
        const toastId = toast.loading(t("Logging in..."));
        try {
            toast.loading(t("Connecting to server..."), { id: toastId });
            const urlEncodedData = new URLSearchParams();
            urlEncodedData.append("username", currentUsername);
            urlEncodedData.append("password", currentPassword);
            
            const response = await fetch("http://localhost:8080/jamrik/login", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: urlEncodedData.toString(),
            });

            if (response.ok) {
                const data = await response.json();
                setUserData({
                    userName: data.userName || currentUsername,
                    id: String(data.id || ""),
                    role: data.role || "",
                    email: data.email || "",
                    avatarUrl: data.avatar || "0",
                });
                toast.success(t("Logged in successfully"), { id: toastId });
                router.push("/dashboard");
            } else {
              toast.error(t("wrong username or password"), { id: toastId });
            }
        } catch (error) {
            console.error("Connection error:", error);
            toast.error(t("Connection error occurred."), { id: toastId });
        }
    };

    return (
        <div className="LogInPage">
            <LogInStructure />
            <div className="whiteBoxLogin">
                <div>
                    <p className="subTitle">{t("Welcome back")}</p>
                    <p className="underSubtitle">{t("Enter your credentials to access your account")}</p>
                </div>
                
                {showErrors && (
                    <LogInInputsErrorHandler
                        fullName={LogInDataForm.userName}
                        password={LogInDataForm.password}
                        noErrors={noErrorsToggle}
                    />
                )}
                
                <form onSubmit={handleSubmit} noValidate>
                    <div className="LogInPageInputsContainer">
                        <LogInInputs 
                            onValueChange={handleDataChange} 
                            ref={userNameRef} 
                            label={t("User Name")} 
                            iconSrc="/icons/mailicon.png" 
                            iconName="mail icon" 
                            inputType="text" 
                            inputName="userName" 
                            placeholder="Mohammed Ahmad" 
                        />
                        <LogInInputs 
                            onValueChange={handleDataChange} 
                            ref={passwordRef} 
                            label={t("Password")} 
                            iconSrc="/icons/lockicon.png" 
                            iconName="lock icon" 
                            inputType="password" 
                            inputName="password" 
                            placeholder={t("Enter your password")} 
                        />
                    </div>
                    
                    <div>
                        <p className="forgotPassword">
                            <Link href="/changepasswordpage" className="forgotPassword">{t("Forgot Password?")}</Link>
                        </p>
                    </div>
                    
                    <Button iconSrc="/icons/signInIcon.png" iconName="sign in icon" buttonType="submit" buttonDesc={t("Sign In")} />
                </form>
                
                <hr className="hr"/>
                <HaveAccount leftSide={t("Don't have an account?")} rightSide={t("Sign up")} To="/signuppage" />
            </div>
        </div>
    );
};

export default LogInPage;