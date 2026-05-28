"use client";
import LogInStructure from "../components/LogInStructure";
import LogInInputs from "../components/LogInInputs";
import Button from "../components/Button";
import HaveAccount from "../components/HaveAccount";
import { useState ,useRef, useContext } from "react";
import { useRouter } from "next/navigation";
import "./page.css";
import UserContext from "../components/UserContext";
import LogInInputsErrorHandler from "../components/LogInInputsErrorHandler";
import { LanguageContext } from "../components/LanguageContext";
import { toast } from "sonner";
const SignUpPage = () => {
  const [signUpDataForm, setSignUpDataForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userRole: "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const handleDataChange = () => {
    setSignUpDataForm({
      fullName:  fullNameRef.current ? fullNameRef.current.value : "",
      email: emailRef.current ? emailRef.current.value : "",
      password: passwordRef.current ? passwordRef.current.value : "",
      confirmPassword: confirmPasswordRef.current ? confirmPasswordRef.current.value : "",
      userRole: signUpDataForm.userRole,
    });
  };
  const [noErrors, setNoErrors] = useState(false);
  const router = useRouter();
  const { setUserData, avatarUrl} = useContext(UserContext);
  const { t } = useContext(LanguageContext);

  const noErrorsToggle = (valid: boolean) => {
      setNoErrors(valid);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowErrors(true);
    if (!noErrors) {
        return;
    }
    const toastId = toast.loading(t("Creating account..."));
    try {
        toast.loading(t("Creating account..."), { id: toastId });
            const response = await fetch("http://localhost:8080/jamrik/register", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userName: signUpDataForm.fullName,
                    email: signUpDataForm.email,
                    role: signUpDataForm.userRole,
                    password: signUpDataForm.password,
                    confirmPassword: signUpDataForm.confirmPassword,
                    avatar:0,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setUserData({
                    userName: data.userName,
                    id: String(data.id || ""),
                    role: data.role || "",
                    email: data.email,
                    avatarUrl: avatarUrl,
                });
                toast.success(t("Account created successfully!"), { id: toastId });
                router.push("/dashboard");
            } else {
                console.error("Registration failed with status:", response.status);
                const errorText = await response.text();
                toast.error(t("Registration failed") + ": " + errorText, { id: toastId });
            }
        } catch (error) {
            console.error("Network error during registration:", error);
            toast.error(t("Cannot connect to the server."), { id: toastId });
        }
};
    return (
        <div className="SignUpPage">
            <LogInStructure />
                <div className="whiteBoxSignup">
                <div>
                <p className="subTitle">{t("Create an account")}</p>
                <p className="underSubtitle">{t("Enter your information to set up your logistics account")}</p>
              </div>
              
              {showErrors && (
                <LogInInputsErrorHandler
                  fullName={signUpDataForm.fullName}
                  email={signUpDataForm.email}
                  password={signUpDataForm.password}
                  confirmPassword={signUpDataForm.confirmPassword}
                  userRole={signUpDataForm.userRole}
                  noErrors={noErrorsToggle}
                />
              )}
              <form onSubmit={handleSubmit} noValidate>

              <div className="SignUpPageInputsContainer">
              <LogInInputs onValueChange={handleDataChange} ref={fullNameRef} label={t("User Name")} iconSrc="/icons/usericon.png" iconName="user icon" inputType="text" inputName="userName" placeholder="Mohammed Ahmad" />
              <LogInInputs onValueChange={handleDataChange} ref={emailRef} label={t("Email")} iconSrc="/icons/mailicon.png" iconName="mail icon" inputType="email" inputName="email" placeholder="Mohammed Ahmad@gmail.com" />
              <LogInInputs onValueChange={handleDataChange} ref={passwordRef} label={t("Password")} iconSrc="/icons/lockicon.png" iconName="lock icon" inputType="password" inputName="password" placeholder={t("Enter your password")} />
              <LogInInputs onValueChange={handleDataChange} ref={confirmPasswordRef} label={t("Confirm Password")} iconSrc="/icons/lockicon.png" iconName="lock icon" inputType="password" inputName="confirmPassword" placeholder={t("Confirm new password")} />
              </div>

              <div className="selectContainer">
                <label className="inputLabel">{t("User Role")}</label>
                <select className="selectField"
                 name="userRole" 
                  value={signUpDataForm.userRole}
                  onChange={(e) => setSignUpDataForm({...signUpDataForm, userRole: e.target.value})}
                  style={{ color: signUpDataForm.userRole === "" ? "#A9A9A9" : "#000000" }}
                        >
                  <option value="" disabled>{t("Select Role")}</option>
                    <option value="Procurement Officer">{t("Procurement Officer")}</option>
                    <option value="Logistics Officer">{t("Logistics Officer")}</option>
                    <option value="Customs Broker">{t("Customs Broker")}</option>
                </select>

              </div>
              
              <Button iconSrc="/icons/createAccountIcon.png" iconName="sign up icon" buttonType="submit" buttonDesc={t("Create Account")} /> 
              </form>

              <hr className="hr"/>
              <HaveAccount leftSide={t("Already have an account?")} rightSide={t("Sign in")} To="/loginpage" />
              </div>
        </div>
    );
};

export default SignUpPage;