"use client";
import React, { useContext, useRef ,useState } from "react";
import AvatarSelector from "../components/AvatarSelector"; 
import UserProfileSprite from "../components/UserProfileSprite"; // New component
import UserContext from "../components/UserContext";
import { LanguageContext } from "../components/LanguageContext";
import BackArrow from "../components/BackArrow";
import "./style.css"; 
import LogInInputs from "../components/LogInInputs";
import Link from "next/dist/client/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
const ProfilePage = () => {
  const [avatarClicked, setAvatarClicked] = useState(false);
  const avatarClickedToggle = () => {  setAvatarClicked(!avatarClicked);};
const {setUserData, userName, id , role, avatarUrl,email} = useContext(UserContext);
const { t } = useContext(LanguageContext);
const userNameRef =useRef<HTMLInputElement>(null);
const emailRef = useRef<HTMLInputElement>(null);
const [ChangeUserInfo, setChangeUserInfo] = useState({
    userName: userName,
    email: email,
    userRole: role || ""
});
const handleDataChange = () => {
    setChangeUserInfo({
      userName:  userNameRef.current ? userNameRef.current.value : "",
      email: emailRef.current ? emailRef.current.value : "",
      userRole: ChangeUserInfo.userRole, 
    });
};
const router = useRouter();

const handleLogOut = async () => {
    const toastId = toast.loading(t("Logging out..."));
    try {
        toast.loading(t("Logging out..."), { id: toastId });
        const response = await fetch("http://localhost:8080/jamrik/logout", {
            method: "POST",
            credentials: "include"
        });
        
        if (response.ok) {
            setUserData({ userName: "Account Type", id: "Demo Account", role: "", email: "", avatarUrl: "0" });
            toast.success(t("Logged out successfully!"), { id: toastId });
            router.push("/loginpage");
        } else {
            toast.error(t("Logout failed"), { id: toastId });
        }
    } catch (error) {
        console.error("Logout error:", error);
        toast.error(t("Could not connect to the server."), { id: toastId });
    }
};
const handleSaveChanges = async () => {
    const toastId = toast.loading(t("Saving changes..."));
    try {
        toast.loading(t("Saving changes..."), { id: toastId });
        const url = `http://localhost:8080/jamrik/changeData/${encodeURIComponent(userName)}`;
        const response = await fetch(url, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userName: ChangeUserInfo.userName,
                email: ChangeUserInfo.email,
                role: ChangeUserInfo.userRole,
                avatar: avatarUrl,
            }),
        });

        if (response.ok) {
            const updatedUser = await response.json();
                setUserData({
                userName: updatedUser.userName,
                id: String(updatedUser.id || id),
                role: updatedUser.role,
                email: updatedUser.email,
                avatarUrl:avatarUrl
            });

            toast.success(t("Profile updated successfully!"), { id: toastId });
        } else {
            const error = await response.text();
            toast.error(t("Update failed: ") + error, { id: toastId });
        }
    } catch (error) {
        console.error("Connection error:", error);
        toast.error(t("Connection error"), { id: toastId });
    }
};
  return (
      <div className="profilePage">
          <div className="userAvatar"  onClick={() => avatarClickedToggle()}>
            <UserProfileSprite scale={2} />
          </div>
          {avatarClicked &&
        <div className="avatarSection" >
          <AvatarSelector avatarClickedToggle={avatarClickedToggle}/> 
        </div>
        }
            <BackArrow to="/dashboard" />
              <div className="userIdProfilePage">{id}</div>
        
          <div className="UserProfileInfoContainer">
            <div>
            <p className="profileTitle">{t("My Profile")}</p>
            <p className="profileSubtitle">{t("Manage your profile information")}</p>
            </div>
            <div className="profileInputFieldsContainer">
        <LogInInputs onValueChange={handleDataChange} ref={userNameRef} label={t("User Name")} iconSrc="/icons/usericon.png" iconName="user icon" inputType="text" inputName="userName" placeholder={t("Change your user name")} initialValue={userName} />
        <LogInInputs onValueChange={handleDataChange} ref={emailRef} label={t("Email")} iconSrc="/icons/mailicon.png" iconName="mail icon" inputType="email" inputName="email" placeholder="Mohammed Ahmad@gmail.com" initialValue={email}/>
               </div>
                <div className="selectContainer">
                <label className="inputLabel">{t("User Role")}</label>
                <select className="selectField"
                 name="userRole" 
                   value={ChangeUserInfo.userRole}
                   onChange={(e) => setChangeUserInfo({...ChangeUserInfo, userRole: e.target.value})}
                  style={{ color: ChangeUserInfo.userRole === "" ? "#A9A9A9" : "#000000" }}
                        >
                  <option value="" disabled>{t("Select Role")}</option>
                    <option value="Procurement Officer">{t("Procurement Officer")}</option>
                    <option value="Logistics Officer">{t("Logistics Officer")}</option>
                    <option value="Customs Broker">{t("Customs Broker")}</option>
                </select>

              </div>
              <Link href="/changepasswordpage" className="changePasswordLink">{t("Change Password")}</Link>

          <button className="submitChangesBtn" type="submit" onClick={handleSaveChanges}>{t("Save Changes")}</button>
          <hr className="hr"/>
          <button className="logOutBtn" type="submit" onClick={handleLogOut}>{t("Log Out")}</button>
          </div>
        
        </div>
  );
};

export default ProfilePage;