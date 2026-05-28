"use client";
import { createContext, useState, useEffect, ReactNode } from "react";

type UserData = {
  userName: string;
  id: string;
  role: string;
  email: string;
  avatarUrl: string;
};

type UserContextType = {
  userName: string;
  id: string;
  role: string;
  avatarUrl: string; 
  email: string; 
  setUserData: (data: UserData) => void;
};

const UserContext = createContext<UserContextType>({
  userName: "Account Type",
  id: "Demo Account",
  role: "",
  avatarUrl: "0", 
  email: "", 
  setUserData: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserDataState] = useState<UserData>({ 
    userName: "Account Type", 
    id: "Demo Account",
    role: "",
    email: "",
    avatarUrl: "0",
  });

  useEffect(() => {
    const storedData = localStorage.getItem("jamrikUserData");
    if (storedData) {
      try {
        setUserDataState(JSON.parse(storedData));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const setUserData = (data: UserData) => {
    setUserDataState(data);
    localStorage.setItem("jamrikUserData", JSON.stringify(data));
  };

  return (
    <UserContext.Provider 
      value={{ 
        userName: userData.userName, 
        id: userData.id, 
        role: userData.role,
        avatarUrl: userData.avatarUrl,
        email: userData.email,
        setUserData 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;