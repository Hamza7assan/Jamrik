"use client";
import React, { useContext } from "react";
import UserContext from "../components/UserContext";
import "./AvatarSelector.css"; 

const UserProfileSprite = ({ scale = 1 }: { scale?: number }) => {
  const { avatarUrl } = useContext(UserContext);

  if (isNaN(Number(avatarUrl))) {
      return <div style={{width: 100*scale, height: 100*scale, background: '#ddd', borderRadius: '50%'}}></div>;
  }

  return (
    <div 
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }} 
        className="sprite-scaler"
    >
        <div className={`spriteWindow avatar-index-${avatarUrl}`} />
    </div>
  );
};
export default UserProfileSprite;