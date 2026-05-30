"use client";
import MainStructure from "../components/MainStructure"; 
import "./page.css";
import ContentTitle from "../components/ContentTitle";
import Image from "next/image";
import ShipmentsCard from "../components/ShipmentsCard";
import { useState ,useEffect, useContext } from "react";
import { LanguageContext } from "../components/LanguageContext";
import { toast } from "sonner";
import { jamrikFetch } from "../utils/apiClient";

import Button from "../components/Button"; // Or simply use native buttons
const Shipments = () => {
    const { t } = useContext(LanguageContext);
    const defaultShipment = {
        shipmentName: "Create Shipment",
        referenceNumber: "shipment reference number",
        status: "Shipment Status",
    };

    const [allShipments, setAllShipments] = useState([defaultShipment]);

    useEffect(() => {
        const fetchShipments = async () => {
            try {
                const response = await jamrikFetch("http://localhost:8080/jamrik/shipments/searchAll", { credentials: "include" }); 
                
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        setAllShipments(data);
                        setClickedShipmentData(data[0]);
                    } else {
                        setAllShipments([defaultShipment]);
                        setClickedShipmentData(defaultShipment);
                    }
                } else {
                    console.error("Failed to fetch shipments");
                }
            } catch (error) {
                console.error("Connection error:", error);
            }
        };

        fetchShipments();
    }, []);

    const [clickedShipmentData, setClickedShipmentData] = useState(
        {
            shipmentName: allShipments[0].shipmentName,
            referenceNumber: allShipments[0].referenceNumber,
            status: allShipments[0].status,
        }
    );
    const handleShipmentClick = (referenceNumber: string) => {
        const clickedShipment = allShipments.find(shipment => shipment.referenceNumber === referenceNumber);
        if (clickedShipment) {
            setClickedShipmentData(clickedShipment);
        }
    };
    const [deleteShipmentModalOpen, setDeleteShipmentModalOpen] = useState(false);
    const [shipmentToDelete, setShipmentToDelete] = useState<string | null>(null);

    const confirmDeleteShipment = (referenceNumber: string) => {
        if (referenceNumber === "shipment reference number") {
            toast.error(t("Cannot delete the default placeholder shipment."));
            return;
        }
        setShipmentToDelete(referenceNumber);
        setDeleteShipmentModalOpen(true);
    };

    const handleStatusUpdate = (referenceNumber: string, newStatus: string) => {
        setAllShipments(prev => prev.map(s => s.referenceNumber === referenceNumber ? { ...s, status: newStatus } : s));
        setClickedShipmentData(prev => prev.referenceNumber === referenceNumber ? { ...prev, status: newStatus } : prev);
    };

    const handleDeleteShipment = async () => {
        if (!shipmentToDelete) return;
        const referenceNumber = shipmentToDelete;
        setDeleteShipmentModalOpen(false);
        setShipmentToDelete(null);

        const toastId = toast.loading(t("Deleting shipment..."));
        try {
            const url = `http://localhost:8080/jamrik/shipments/deleteShipment?referenceNumber=${referenceNumber}`;
            
            const response = await jamrikFetch(url, {
                method: "DELETE",
                credentials: "include",
            });

            if (response.ok) {
                const newShipments = allShipments.filter(s => s.referenceNumber !== referenceNumber);
                
                if (newShipments.length > 0) {
                    setAllShipments(newShipments);
                    if (clickedShipmentData.referenceNumber === referenceNumber) {
                        setClickedShipmentData(newShipments[0]);
                    }
                } else {
                    setAllShipments([defaultShipment]);
                    setClickedShipmentData(defaultShipment);
                }
                toast.success(t("Shipment deleted successfully."), { id: toastId });
            } else {
                const error = await response.text();
                toast.error(t("Delete failed: ") + error, { id: toastId });
            }
        } catch (error) {
            console.error("Connection error:", error);
            toast.error(t("Could not connect to the server."), { id: toastId });
        }
    };
    const [allDocuments, setAllDocuments] = useState<any[]>([]);

    const fetchDocuments = async () => {
        if (!clickedShipmentData?.referenceNumber || clickedShipmentData.referenceNumber === "shipment reference number") return;
        try {
            // FIXED: Added encodeURIComponent to prevent URL corruption with special characters
            const encodedRef = encodeURIComponent(clickedShipmentData.referenceNumber);
            const url = `http://localhost:8080/jamrik/shipments/searchAllDocs?referenceNumber=${encodedRef}`;
            
            const response = await jamrikFetch(url, { credentials: "include" });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`🚨 Backend Rejected Request! Status: ${response.status} | Msg: ${errorText}`);
                setAllDocuments([]);
                return;
            }
            
            const data = await response.json();
            setAllDocuments(Array.isArray(data) ? data : [data]);
        } catch (error) {
            console.error("🚨 Network/Fetch Exception:", error);
            setAllDocuments([]);
        }
    };
useEffect(() => {
    fetchDocuments();
}, [clickedShipmentData?.referenceNumber]);

    const handleDeleteDocument = async (documentName: string) => {
        if (window.confirm(t("Are you sure you want to delete this document?"))) {
            const toastId = toast.loading(t("Deleting document..."));
            try {
                const url = `http://localhost:8080/jamrik/documents/delete/${encodeURIComponent(clickedShipmentData.referenceNumber)}?documentName=${encodeURIComponent(documentName)}`;
                const response = await jamrikFetch(url, { method: "DELETE", credentials: "include" });

                if (response.ok) {
                    setAllDocuments(prev => prev.filter(doc => doc.documentName !== documentName));
                    toast.success(t("Document deleted successfully."), { id: toastId });
                } else {
                    const error = await response.text();
                    toast.error(t("Delete failed: ") + error, { id: toastId });
                }
            } catch (error) {
                console.error("Connection error:", error);
                toast.error(t("Could not connect to the server."), { id: toastId });
            }
        }
    };
    // Modal States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadShipmentReference, setUploadShipmentReference] = useState("");
    const [uploadFileName, setUploadFileName] = useState("");
    const [uploadFileType, setUploadFileType] = useState("");
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    const handleAddDocument = (shipmentReference: string) => {
        setUploadShipmentReference(shipmentReference);
        setUploadFileName("");
        setUploadFileType("");
        setUploadFile(null);
        setIsUploadModalOpen(true);
    };

    const handleCustomUpload = async () => {
        if (!uploadFileName || !uploadFileType || !uploadFile) {
            toast.error(t("Please fill in all fields and select a file"));
            return;
        }
        if (uploadFile.size > 10 * 1024 * 1024) {
            toast.error(t("Please upload a file smaller than 10MB"));
            return;
        }
        const fileName = uploadFile.name.toLowerCase();
        if (!fileName.endsWith(".pdf") && !fileName.endsWith(".doc") && !fileName.endsWith(".docx")
            && !fileName.endsWith(".png") && !fileName.endsWith(".jpg") && !fileName.endsWith(".jpeg")) {
            toast.error(t("Please upload PDF, Word, or Image files only"));
            return;
        }

        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("fileName", uploadFileName);
        formData.append("fileType", uploadFileType);

        const toastId = toast.loading(t("Uploading document..."));
        try {
            const response = await jamrikFetch(`http://localhost:8080/jamrik/documents/uploadOne/${encodeURIComponent(uploadShipmentReference)}`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to upload document");
            }
            toast.success(t("Your document has been processed and saved successfully."), { id: toastId });
            setIsUploadModalOpen(false);
            fetchDocuments();
        } catch (error) {
            toast.error(`${t("Upload failed")}: ${error instanceof Error ? error.message : error}`, { id: toastId });
        }
    };
const [aiResultContent, setAiResultContent] = useState<any>(null);

// Customs Declaration Form states
const [isGeneratingCustoms, setIsGeneratingCustoms] = useState(false);
const [customsPdfUrl, setCustomsPdfUrl] = useState<string | null>(null);
const [showCustomsModal, setShowCustomsModal] = useState(false);
const [customsPdfBlob, setCustomsPdfBlob] = useState<Blob | null>(null);

const handleAnalyzeDocuments = async () => {
    // 1. Safety Guard: Check if a valid shipment is actively selected
    if (!clickedShipmentData?.referenceNumber || clickedShipmentData.referenceNumber === "shipment reference number") {
        toast.error(t("Please select a valid shipment from the tracking list first."));
        return;
    }

    // 2. Safety Guard: Check if the shipment actually has documents attached to analyze
    if (allDocuments.length === 0) {
        toast.error(t("This shipment has no uploaded documents to analyze. Please add documents first."));
        return;
    }

    // 3. Update UI to a processing state and open the loading blocker overlay
    setAiResultContent(t("Analyzing documents... Please wait."));
    
    const toastId = toast.loading(t("Analyzing documents... This may take a moment."));

    try {
        // 4. Construct URL targeted directly at our new proxy endpoint
        const url = `http://localhost:8080/api/ai/analyze-documents?referenceNumber=${encodeURIComponent(clickedShipmentData.referenceNumber)}`;
        
        const response = await jamrikFetch(url, {
            method: "POST", // Using POST since Spring proxy is PostMapping
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(t("The AI analysis engine encountered an unexpected error."));
        }

        const data = await response.json();
        const discrepancies = data.discrepancies || [];
        
        toast.success(t("Analysis complete!"), { id: toastId });

        if (discrepancies.length === 0) {
            setAiResultContent(
                <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#E6F4EA", color: "#137333", fontWeight: "600" }}>
                    ✅ {t("All documents verified! No discrepancies found.")}
                </div>
            );
        } else {
            setAiResultContent(
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                    {discrepancies.map((item: any, idx: number) => {
                        const isMismatch = item.status === "Mismatch";
                        return (
                            <div key={idx} style={{
                                padding: "12px 16px",
                                borderRadius: "8px",
                                borderLeft: `5px solid ${isMismatch ? "#d9534f" : "#2e7d32"}`,
                                backgroundColor: isMismatch ? "#FDF2F2" : "#F1F8F5",
                                color: isMismatch ? "#C53030" : "#22543D",
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: "bold", fontSize: "14px", textTransform: "uppercase" }}>{item.field}</span>
                                    <span style={{
                                        fontSize: "11px",
                                        fontWeight: "bold",
                                        padding: "2px 8px",
                                        borderRadius: "12px",
                                        backgroundColor: isMismatch ? "#FED7D7" : "#C6F6D5",
                                        color: isMismatch ? "#9B2C2C" : "#22543D"
                                    }}>
                                        {isMismatch ? t("MISMATCH") : t("VERIFIED MATCH")}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.4" }}>{item.message}</p>
                            </div>
                        );
                    })}
                </div>
            );
        }

    } catch (error) {
        const fallbackErrorMessage = error instanceof Error ? error.message : t("Could not communicate with the analysis server.");
        
        // Reset state back to a clean alert if the backend drops/fails
        setAiResultContent(t("Failed to run analysis. Check connection protocols."));
        
        toast.error(fallbackErrorMessage, { id: toastId });
    }
};

// Generate Customs Declaration Form handler
const handleGenerateCustomsDeclaration = async () => {
    // Safety Guard: Check if a valid shipment is actively selected
    if (!clickedShipmentData?.referenceNumber || clickedShipmentData.referenceNumber === "shipment reference number") {
        toast.error(t("Please select a valid shipment from the tracking list first."));
        return;
    }

    // Safety Guard: Check if the shipment has documents
    if (allDocuments.length === 0) {
        toast.error(t("This shipment has no uploaded documents to analyze. Please add documents first."));
        return;
    }

    setIsGeneratingCustoms(true);
    const toastId = toast.loading(t("Generating customs declaration form..."));

    try {
        const url = `http://localhost:8080/api/ai/generate-declaration?referenceNumber=${encodeURIComponent(clickedShipmentData.referenceNumber)}`;
        const response = await jamrikFetch(url, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || t("Failed to generate customs declaration form."));
        }

        const data = await response.json();
        if (data.download_url) {
            const pdfUrl = `http://localhost:8000${data.download_url}`;
            
            // Fetch the PDF blob from FastAPI
            const pdfResponse = await jamrikFetch(pdfUrl);
            const blob = await pdfResponse.blob();
            const localPdfUrl = URL.createObjectURL(blob);

            if (customsPdfUrl) {
                URL.revokeObjectURL(customsPdfUrl);
            }

            setCustomsPdfBlob(blob);
            setCustomsPdfUrl(localPdfUrl);
            setShowCustomsModal(true);
            toast.success(t("Customs declaration form generated successfully!"), { id: toastId });
        } else {
            throw new Error(t("No download URL returned from AI Engine."));
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t("Failed to generate customs declaration form.");
        toast.error(errorMessage, { id: toastId });
    } finally {
        setIsGeneratingCustoms(false);
    }
};

// Download the generated PDF
const handleDownloadCustomsPdf = () => {
    if (customsPdfBlob) {
        const url = URL.createObjectURL(customsPdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `customs_declaration_${clickedShipmentData.referenceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// Close the PDF modal
const handleCloseCustomsModal = () => {
    setShowCustomsModal(false);
    if (customsPdfUrl) {
        URL.revokeObjectURL(customsPdfUrl);
        setCustomsPdfUrl(null);
    }
};
    return (
        <MainStructure>
        <div className="ShipmentsContainer">
            <ContentTitle title={t("Shipment Tracking")} subTitle={t("View and manage your shipments")} />
            <div style={{gap: "16px", display: "flex", flexDirection: "row", flexWrap: "wrap", margin:"16px 0px"}}>
            <div className="allShipmentsTableContainer">
                <div >
                <p className="allShipmentsTittle">{t("All Shipments")}</p>
                <p className="allShipmentsNumber">{allShipments.length} {t("shipments")}</p>
                </div>

                <hr/>
                {allShipments.map((shipment) => (
                    <ShipmentsCard 
                        key={shipment.referenceNumber}
                        shipmentName={shipment.shipmentName}
                        referenceNumber={shipment.referenceNumber}
                        status={shipment.status}
                        handleClick={() => handleShipmentClick(shipment.referenceNumber)}
                        handleDeleteShipment={() => confirmDeleteShipment(shipment.referenceNumber)}
                        handleStatusUpdate={handleStatusUpdate}
                    />
                ))}
            </div>
            <div className="selectedShipmentContainer">
                <ShipmentsCard 
                    shipmentName={clickedShipmentData.shipmentName}
                    referenceNumber={clickedShipmentData.referenceNumber}
                    status={clickedShipmentData.status}
                    isSelected={true}
                    handleClick={() => {}}
                    handleDeleteShipment={() => confirmDeleteShipment(clickedShipmentData.referenceNumber)}
                    handleStatusUpdate={handleStatusUpdate}
                />
                <div className="selectedShipmentUploadedDocumentsContainer">
                    <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                <p className="uploadedDocumentsTitle">{t("Uploaded Documents")}</p>
                <button className="addDocumentButton" onClick={()=>handleAddDocument(clickedShipmentData.referenceNumber)}>
               {t("Add Document")}
                </button>
                </div>
                     <div className="uploadedFilesList">
              {allDocuments.map((doc, index) => (
              <div key={`${doc.documentName}-${index}`} className="uploadedFileCard">
                <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start",  padding: "8px 0px 8px 8px"}}>
              <span className="fileNameText">{doc.documentType || "Document"}:</span>
              <a href={`http://localhost:8080/jamrik/documents/view/${doc.id}`} target="_blank" rel="noopener noreferrer" style={{color: "#1C398E", textDecoration: "underline", marginLeft: "4px"}}>
                  {doc.documentName}
              </a>
                </div>
              <button 
                className="removeFileBtn" 
                onClick={() => handleDeleteDocument(doc.documentName)}
              >
                ✖️
              </button>
            </div>
           ))}
           
            </div>
                </div>
                <div className="AiResultsContainer">
                <p className="aiResultsTitle">{t("AI Analysis Results")}</p>
                <div className="aiResultsContent">
                    {aiResultContent || t("AI analysis results will appear here after you analyze the documents.")}
                </div>
                </div>

                <div className="ShipmentBtnsContainer">
                <button className="analyzeShipmentDocumentsButton" onClick={handleAnalyzeDocuments}>
                    {t("Analyze Documents")}
                </button>
                <button className="generateFormButton" onClick={handleGenerateCustomsDeclaration} disabled={isGeneratingCustoms}>{isGeneratingCustoms ? t("Generating customs declaration form...") : t("Generate Customs Declaration Form")}</button>
                </div>
            </div>
        </div>
        </div>

        {/* Custom Document Upload Modal */}
        {isUploadModalOpen && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                <div style={{ backgroundColor: "#FFFFFF", padding: "24px", borderRadius: "10px", width: "400px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1C398E", margin: 0 }}>{t("Add Document")}</h2>
                    <input 
                        type="text" 
                        placeholder={t("Document Name")} 
                        value={uploadFileName}
                        onChange={(e) => setUploadFileName(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }}
                    />
                    <select 
                        value={uploadFileType}
                        onChange={(e) => setUploadFileType(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }}
                    >
                        <option value="" disabled>{t("Select Document Type")}</option>
                        <option value="Commercial Invoice">{t("Commercial Invoice")}</option>
                        <option value="Packing List">{t("Packing List")}</option>  
                        <option value="Bill of Lading">{t("Bill of Lading")}</option>
                        <option value="Certificate of Origin">{t("Certificate of Origin")}</option>
                        <option value="Other">{t("Other")}</option>
                    </select>
                    <input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                        style={{ width: "100%" }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                        <button 
                            onClick={() => setIsUploadModalOpen(false)}
                            style={{ padding: "10px 20px", backgroundColor: "#ccc", color: "#333", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold" }}
                        >
                            {t("Cancel")}
                        </button>
                        <button 
                            onClick={handleCustomUpload}
                            style={{ padding: "10px 20px", backgroundColor: "#1C398E", color: "#fff", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold" }}
                        >
                            {t("Upload")}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Customs Declaration PDF Viewer Modal */}
        {showCustomsModal && customsPdfUrl && (
            <div className="customsModalOverlay" onClick={handleCloseCustomsModal}>
                <div className="customsModalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="customsModalHeader">
                        <h2 className="customsModalTitle">{t("Generate Customs Declaration Form")}</h2>
                        <button className="customsModalCloseBtn" onClick={handleCloseCustomsModal}>✕</button>
                    </div>
                    <div className="customsModalBody">
                        <iframe
                            src={customsPdfUrl}
                            className="customsPdfIframe"
                            title="Customs Declaration Form PDF"
                        />
                    </div>
                    <div className="customsModalFooter">
                        <button className="customsDownloadBtn" onClick={handleDownloadCustomsPdf}>
                            ⬇️ {t("Download PDF")}
                        </button>
                        <button className="customsCloseFooterBtn" onClick={handleCloseCustomsModal}>
                            {t("Close")}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteShipmentModalOpen && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                <div style={{ backgroundColor: "#FFFFFF", padding: "24px", borderRadius: "10px", width: "400px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#d9534f", margin: 0 }}>{t("Delete Shipment")}</h2>
                    <p style={{ color: "#463f3f", fontSize: "16px", margin: 0 }}>{t("Are you sure you want to delete this shipment? This action cannot be undone.")}</p>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                        <button 
                            onClick={() => { setDeleteShipmentModalOpen(false); setShipmentToDelete(null); }}
                            style={{ padding: "10px 20px", backgroundColor: "#ccc", color: "#333", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold" }}
                        >
                            {t("Cancel")}
                        </button>
                        <button 
                            onClick={handleDeleteShipment}
                            style={{ padding: "10px 20px", backgroundColor: "#d9534f", color: "#fff", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold" }}
                        >
                            {t("Delete")}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </MainStructure>
    );
}
export default Shipments;