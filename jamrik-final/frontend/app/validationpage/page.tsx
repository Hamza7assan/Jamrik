"use client";
import MainStructure from "../components/MainStructure";
import ContentTitle from "../components/ContentTitle";
import { useEffect, useRef, useState, useContext } from "react";
import Image from "next/image";
import { LanguageContext } from "../components/LanguageContext";
import "./page.css";
import { toast } from "sonner";
import { jamrikFetch } from "../utils/apiClient";


const ValidationPage = () => {
    const { t } = useContext(LanguageContext);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [filesData, setFilesData] = useState<{key: string; docType: string; file: File | null}[]>([
        {
            key : "1",
            docType: "",
            file: null
        },
        {
            key : "2",
            docType: "",
            file: null
        }
    ]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const docTypes = [
        { value: "", label: t("Select Document Type") },
        { value: "airwayBill", label: t("Airway Bill") },
        { value: "invoice", label: t("Commercial Invoice") },
        { value: "packingList", label: t("Packing List") },
        { value: "certificateOfOrigin", label: t("Certificate of Origin") },
        { value: "proformaInvoice", label: t("Proforma Invoice") },
    ];

    const handleUploadTrigger = (index: number) => {
        setActiveIndex(index);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleTypeChange = (index: number, newType: string) => {
        setFilesData(prev => {
            const newFilesData = [...prev];
            newFilesData[index] = {
                ...newFilesData[index],
                docType: newType
            };
            return newFilesData;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {  
    const files = e.target.files;
    if (files && files.length > 0 && activeIndex !== null) {
        const selectedFile = files[0];
        const fileName = selectedFile.name.toLowerCase();
        if (!fileName.endsWith(".pdf")) {
            toast.error(t("Please upload PDF files only"));
            e.target.value = "";
            return;
        }
        
        setFilesData(prev => {
            const newFilesData = [...prev];
            newFilesData[activeIndex] = {
                ...newFilesData[activeIndex],
                file: selectedFile
            };
            return newFilesData;
        });

        e.target.value = ""; 
        setActiveIndex(null); 
    }
};

const [displayAiResult, setDisplayAiResult] = useState(false);
const [aiValidationResult, setAiValidationResult] = useState<any[]>([]);

const handleValidate = async () => {
        if (filesData[0].file === null || filesData[1].file === null || filesData[0].docType === "" || filesData[1].docType === "") {
            toast.error(t("Please upload both documents and select their types."));
            return;
        }

        setDisplayAiResult(false);
        setAiValidationResult([]);
        
        const toastId = toast.loading(t("AI is validating the documents..."));

        const formData = new FormData();
        formData.append("invoice_1", filesData[0].file);
        formData.append("invoice_2", filesData[1].file);

        try {
            const response = await jamrikFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/ai/validate-two-invoices`, {
                method: "POST",
                credentials: "include",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.detail || data.message || "Validation engine service returned an error status.";
                toast.dismiss(toastId);
                toast.error(errorMessage);
                return;
            }
            
            setAiValidationResult(data.discrepancies || []);
            setDisplayAiResult(true);

            toast.success(t("Documents processed successfully! Review AI assessment below."), { id: toastId });

        } catch (error) {
            toast.dismiss(toastId);
            toast.error(t("Validation engine service returned an error status."));
        }
    };
   
    return (
        <MainStructure>
        <div className="validationPageContainer">
        <ContentTitle title={t("Validation Page")} subTitle={t("Upload 2 Documents for validation")} />

            <div className="validationPageFileUploadContainer">                
                {filesData.map((fileObj, index) => (
                    <div key={fileObj.key}>
                        <select 
                            value={fileObj.docType} 
                            onChange={(e) => handleTypeChange(index, e.target.value)}
                            className="validationPageSelect">
                            {docTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <div 
                            className="validationPageFileInputContainer" 
                            onClick={() => handleUploadTrigger(index)} 
                         >

                        {fileObj.file ? (
                           <span className="fileNameLabel">{fileObj.file.name}</span>
                            ) : (
                           <Image src="/icons/plus.png" alt="Upload Icon" width={32} height={32} />
                                  )}
                        </div>
                    </div>
                ))}

            </div>

        <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        style={{ display: 'none' }}
      />

      <button className="validationPageValidateButton" onClick={handleValidate}>
        {t("Validate")}
      </button>
      {displayAiResult && (
        <div className="AiValidationResultContainer" style={{ padding: "20px", marginTop: "20px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <p className="validationResultTitle" style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>{t("AI Reconciliation Report")}</p>
          
          {aiValidationResult.length === 0 ? (
              <div style={{ padding: "16px", backgroundColor: "#e6fffa", borderLeft: "4px solid #38b259", borderRadius: "4px" }}>
                  <p style={{ color: "#2f855a", fontWeight: "bold", margin: 0 }}>✅ Perfect Match! No discrepancies found between the documents.</p>
              </div>
          ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {aiValidationResult.map((disc, index) => (
                  <div key={index} style={{ padding: "16px", backgroundColor: disc.status === "Match" ? "#e6fffa" : "#fff5f5", borderLeft: `4px solid ${disc.status === "Match" ? "#38b259" : "#e53e3e"}`, borderRadius: "4px" }}>
                    <p style={{ fontWeight: "bold", margin: "0 0 8px 0", color: "#2d3748" }}>{disc.field} - <span style={{ color: disc.status === "Match" ? "#2f855a" : "#c53030" }}>{disc.status}</span></p>
                    <p style={{ margin: 0, color: "#4a5568" }}>{disc.message}</p>
                  </div>
                ))}
              </div>
          )}
        </div>
      )}

        </div>
        </MainStructure>
    );
}
export default ValidationPage;