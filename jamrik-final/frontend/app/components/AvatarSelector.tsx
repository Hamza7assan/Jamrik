"use client";
import React, { useContext } from "react";
import "./AvatarSelector.css"; 
import UserContext from "../components/UserContext";
type AvatarSelectorProps = {
  avatarClickedToggle: () => void;
};
const AvatarSelector = ({ avatarClickedToggle }: AvatarSelectorProps) => {
  const { userName, id, role, avatarUrl, email, setUserData } = useContext(UserContext);

  const totalAvatars = 12;

  const handleSelect = (avatarIndex: number) => {
    setUserData({ userName:userName, id:id, role:role, avatarUrl: String(avatarIndex),email:email });
    avatarClickedToggle();
  };

  return (
    <div className="avatarGridContainer">
      <div className="avatarGrid">
        {[...Array(totalAvatars)].map((_, index) => {
          const isSelected = String(index) === avatarUrl;

          return (
            <div
              key={index}
              onClick={() => handleSelect(index)}
              className={`selectableAvatarFrame ${isSelected ? "activeAvatar" : ""}`}
            >
              <div
                className={`spriteWindow avatar-index-${index}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarSelector;