"use client";
import BackArrow from "../components/BackArrow";
import "./page.css";
import LogInInputs from "../components/LogInInputs";
import { useState, useRef, useContext } from "react";
import UserContext from "../components/UserContext";
import { LanguageContext } from "../components/LanguageContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
const ChangePasswordPage = () => {
    const router = useRouter();
    const oldPasswordRef = useRef<HTMLInputElement>(null);
    const newPasswordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);
    const { userName } = useContext(UserContext);
    const { t } = useContext(LanguageContext);
    const [ChangePasswordInfo, setChangePasswordInfo] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const handleDataChange = () => {
        setChangePasswordInfo({
          oldPassword: oldPasswordRef.current ? oldPasswordRef.current.value : "",
          newPassword: newPasswordRef.current ? newPasswordRef.current.value : "",
          confirmPassword: confirmPasswordRef.current ? confirmPasswordRef.current.value : "",
        });
    };
    const handleChangePassword = async () => {
        if (ChangePasswordInfo.oldPassword === "" || ChangePasswordInfo.newPassword === "" || ChangePasswordInfo.confirmPassword === "") {
            toast.error(t("All fields are required."));
            return;
        }else if (ChangePasswordInfo.newPassword !== ChangePasswordInfo.confirmPassword) {
            toast.error(t("Passwords do not match"));
            return;
        }else if (!/[A-Z]/.test(ChangePasswordInfo.newPassword)) {
            toast.error(t("New password must contain at least one uppercase letter."));
            return;
        }else if (ChangePasswordInfo.newPassword.length < 8) {
            toast.error(t("New password must be at least 8 characters long."));
            return;
        }else if (!/[0-9]/.test(ChangePasswordInfo.newPassword)) {
            toast.error(t("New password must contain at least one number."));
            return;
        }else{
        const toastId = toast.loading(t("Changing password..."));
        try {
            const url = `http://localhost:8080/jamrik/changePassword/${encodeURIComponent(userName)}`;
            const response = await fetch(url, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userName: userName,
                    currentPassword: ChangePasswordInfo.oldPassword,
                    newPassword: ChangePasswordInfo.newPassword,
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to change password");
            }
            toast.success(t("Password changed successfully!"), { id: toastId });
            router.push("/dashboard");
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error(t("Could not change password"), { id: toastId });
        }
    }
};
    return (
        <div className="ChangePasswordPage">
        <div className="whiteBoxChangePassword">
            <BackArrow to="/profilepage"/>
            <h1 className="subTitle" style={{display: 'flex', justifyContent: 'center'}}>{t("Change Your Password")}</h1>
            <p style={{display: 'flex', justifyContent: 'center', margin: '10px 0px', fontSize: '18px', color: '#1C398E', fontWeight: 700}}>{userName}</p>
            <LogInInputs onValueChange={handleDataChange} ref={oldPasswordRef} label={t("Old Password")} iconSrc="/icons/lockicon.png" iconName="lock icon" inputType="password" inputName="oldPassword" placeholder={t("Enter old password")} />
            <LogInInputs onValueChange={handleDataChange} ref={newPasswordRef} label={t("New Password")} iconSrc="/icons/lockicon.png" iconName="lock icon" inputType="password" inputName="newPassword" placeholder={t("Enter new password")} />
            <LogInInputs onValueChange={handleDataChange} ref={confirmPasswordRef} label={t("Confirm Password")} iconSrc="/icons/lockicon.png" iconName="lock icon" inputType="password" inputName="confirmPassword" placeholder={t("Confirm new password")} />
            <button className="save-button" onClick={handleChangePassword}>{t("Save Changes")}</button>
        </div>
        </div>
    );
}
export default ChangePasswordPage;