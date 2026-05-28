import "./ShipmentsCard.css";
type ShipmentsCardProps = {
    shipmentName: string;
    referenceNumber: string;
    status?: string;
    handleDeleteShipment:(id: string) => void;
    isSelected?: boolean;
    handleClick: (id: string) => void;
    handleStatusUpdate?: (id: string, newStatus: string) => void;
}
import { toast } from "sonner";
import { useContext } from "react";
import { LanguageContext } from "./LanguageContext";
const ShipmentsCard = ({shipmentName, referenceNumber,status, handleDeleteShipment,isSelected,handleClick, handleStatusUpdate, isCompact }: ShipmentsCardProps & { handleClick: (id: string) => void }) => {
    const { t } = useContext(LanguageContext);
    const handleStatusChange = async (newStatus: string) => {
    try {
        const url = `http://localhost:8080/jamrik/shipments/changeStatus/${encodeURIComponent(referenceNumber)}?status=${encodeURIComponent(newStatus)}`;
        
        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
        });

        if (response.ok) {
            const updatedShipment = await response.json();
            toast.success(`${t("Status updated to ")} ${t(newStatus)}`);
            if (handleStatusUpdate) {
                handleStatusUpdate(referenceNumber, newStatus);
            }
        } else {
            toast.error(t("Failed to update status."));
        }
    } catch (error) {
        console.error("Error updating status:", error);
        toast.error(t("Failed to update status."));
    }
};

    const displayShipmentName = isCompact && shipmentName && shipmentName.length > 14 ? shipmentName.substring(0, 14) + "..." : shipmentName;
    const displayReferenceNumber = isCompact && referenceNumber && referenceNumber.length > 14 ? referenceNumber.substring(0, 14) + "..." : referenceNumber;

    return (
        <div className={`shipmentCardContainer ${isSelected ? 'selected' : ''}`} onClick={() => {handleClick(referenceNumber || "");}} style={{ cursor: isSelected ? "default" : "pointer" }}>
            <p>{displayShipmentName}</p>
                <p className="shipmentCardTitle">{displayReferenceNumber}</p>
                {(isSelected) && (
                    <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between" , marginTop: "3px"}}>
                        <div className="shipmentCardStatus" onClick={() => {
                               if (status === "In Progress") {
                                    handleStatusChange("Done");
                                } else if (status === "Done") {
                                    handleStatusChange("In Progress");
                                }
                                }}>
                            {t("Status: ")} {t(status || "")}
                        </div>
                        <button className="shipmentCardStatus" onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteShipment(referenceNumber || "");
                        }} style={{backgroundColor: "transparent", border: "none", color: "red", cursor: "pointer"}}>
                            {t("Delete Shipment")}
                        </button>
                    </div>
                )}
            </div>
    );
}
export default ShipmentsCard;