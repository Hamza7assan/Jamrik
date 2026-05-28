"use client";
import { useState } from "react";
import "./LogInInputs.css";
import Image from 'next/image';
// import { useEffect } from "react";
type logInInputsProps = {
label: string;
iconSrc: string;
iconName: string;
inputType : string;
inputName: string;
placeholder: string;
ref: React.Ref<HTMLInputElement>;
initialValue?: string;
onValueChange : (v: string) => void;
}


const LogInInputs = ({ iconSrc, iconName, label, placeholder, inputType, inputName, ref, onValueChange, initialValue }: logInInputsProps) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
        const togglePasswordVisibility = () => {
            setIsPasswordVisible(!isPasswordVisible);
        };
        const isPasswordField = inputType === "password" || inputName.toLowerCase().includes("password");
        const resolvedInputType = isPasswordField
            ? (isPasswordVisible ? "text" : "password")
            : inputType;
        const currentEyeIcon = isPasswordVisible ? "/icons/eye.png" : "/icons/eyeOff.png";

         const [fieldInput, setFieldInput] = useState(initialValue || "");
         const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setFieldInput(e.target.value);
            onValueChange(e.target.value);
        };

    //     useEffect(() => {
    //  if (initialValue !== undefined && initialValue !== fieldInput) {
    //      setFieldInput(initialValue);
    //        }
    //      }, [initialValue]);
        
        return (
        <div>
            <div style={{marginTop:"12px"}}>
            <label htmlFor={inputName} className="inputLabel">{label}</label> 
            <div className="iconWrapper">
             <Image src={iconSrc} className="inputIcon" alt={iconName} width={24} height={24} />
            <input onChange={handleChange} ref={ref} value={fieldInput} type={resolvedInputType} id={inputName} name={inputName} className="inputField" placeholder={placeholder} />
               {isPasswordField &&
             <Image onClick={togglePasswordVisibility} src={currentEyeIcon} className="eyeIcon" alt="eye icon" width={24} height={24}  />}
            </div>
            </div>
            </div>
            )}
            export default LogInInputs;