"use client";
import "./page.css";
import MainStructure from "../components/MainStructure";
import ContentTitle from "../components/ContentTitle";
import Image from "next/image";
import { useState, useRef, useContext } from "react";   
import Button from "../components/Button";
import { LanguageContext } from "../components/LanguageContext";
import { toast } from "sonner";
import { jamrikFetch } from "../utils/apiClient";


const HsCodeAssistant = () => {
    const { t } = useContext(LanguageContext);
    const [hsCodeData, setHsCodeData] =useState({
        productName: "",
        productDescription: "",
    });
    const [hsCodeResultSection, setHsCodeResultSection] = useState("none");
    const [hsCodeResult, setHsCodeResult] = useState("");
    const productNameRef = useRef<HTMLInputElement>(null);
    const productDescriptionRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = async () => {
    const productName = productNameRef.current?.value || "";
    const productDescription = productDescriptionRef.current?.value || "";

    setHsCodeData({ productName, productDescription });

    if (productName !== "" && productDescription !== "") {
        const toastId = toast.loading(t("Finding HS Code..."));
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/ai/predict-hs-code`;
            
            const requestBody = {
                product_name: productName,
                description: productDescription
            };

            const response = await jamrikFetch(url, {
                method: "POST", 
                credentials: "omit", // Omit credentials to avoid potential CORS issues
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody) 
            });

            if (response.ok) {
                const data = await response.json(); 
                setHsCodeResult(data.suggested_hs_code || "N/A");
                setHsCodeResultSection("block");
                toast.success(t("HS Code generated successfully!"), { id: toastId });
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || errorData.detail || "Could not generate HS code.";
                console.error("Failed to fetch HS Code:", errorMessage);
                toast.error(t(errorMessage), { id: toastId });
            }
        } catch (error) {
            console.error("Connection error:", error);
            toast.error(t("AI Service is currently unreachable."), { id: toastId });
        }
    }else toast.error(t("Please fill in both product name and description."));
};
    return (
       <MainStructure>
        <div className="HsCodeAssistantContainer">
         <ContentTitle title={t("HS Code Classification Assistant")} subTitle={t("AI-powered tool to help you find the correct HS code for your goods")} />
            
            <div className="whatsHSCodeContainer">
                <div>
                    <Image src="/icons/lamp.png" alt="Lamp Icon" width={32} height={32} />
                </div>
                <div>
                    <p style={{fontSize:"18px",color:"#171717",fontWeight:"400"}}>{t("What is an HS Code?")}</p>
                    <p style={{fontSize:"16px",color:"#404040",fontWeight:"300" ,}}>{t("The Harmonized System (HS) Code is an internationally standardized system of names and numbers used to classify traded products. It's essential for customs declarations, determining duties and taxes, and ensuring compliance with international trade regulations. Each product is assigned a unique code that helps identify it across borders.")}</p>
                </div>
            </div>

            
            <div className="resultSection" style={{display:`${hsCodeResultSection}`, margin:"15px 0px",padding:"0px 10px 10px 10px" , border: '1px solid #ddd', borderRadius: '13px', backgroundColor: '#fcfcfc', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'  }}>
              <p className="resultProductLabel" style={{ fontSize: '20px', color: '#000000', marginBottom: '8px', fontWeight: 'semi-bold', marginTop: '8px' }}>
              {t("Suggested HS Code for:")} {hsCodeData.productName}</p>
    
               <div style={{ background: '#1C398E', color: 'white', padding: '15px', borderRadius: '8px', fontSize: '20px', fontWeight: 'bold', alignItems: 'center' }}>
                  <span id="hsCodeDisplayBox">{hsCodeResult}</span>
                 </div>

            </div>

            <div className="describeYourProductContainer">
                <div>
                    <p style={{fontSize:"24px",color:"#171717",fontWeight:"400"}}>{t("Describe Your Product")}</p>
                    <p style={{fontSize:"16px",color:"#525252",fontWeight:"300"}}>{t("Provide detailed information about your product to find the most accurate HS code classification.")}</p>
                </div>
               
               <div className="productName">
                <label >{t("Product Name")}</label>
                <input type="text" placeholder={t("Enter product name")} ref={productNameRef} />
               </div>

               <div className="productDescription">
                <label >{t("Product Description")}</label>
                <textarea placeholder={t("Enter product description")} ref={productDescriptionRef} />
               </div>
               <div>
               <Button buttonFun={handleSubmit} iconSrc="/icons/searchicon.png" iconName="search icon" buttonType="submit" buttonDesc={t("Find HS Code")} />
            </div>

            </div>


        
        </div>
        </MainStructure>
    );
}
export default HsCodeAssistant;