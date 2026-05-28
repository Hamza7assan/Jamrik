import Image from "next/image";
import "./DocumentsCard.css";

type DocumentCardProps = {
    DocumentIcon: string;
    DocumentName: string;
    DocumentDesc: string;
    clickFun?: () => void;
    fileCount: number; 
}

const DocumentsCard = ({ DocumentIcon, DocumentName, DocumentDesc, clickFun, fileCount }: DocumentCardProps) => {
    return (
        <div className="documentCard">
           <div className="documentCardInfo">
            <div>
                <Image src={DocumentIcon} alt="document icon" width={48} height={48}/>
            </div>
            <div>
                <p className="documentName">{DocumentName}</p>
                <p className="documentDesc">{DocumentDesc}</p>
            </div>
           </div>
           <hr />
           <div 
               className="documentCardUpload"
               style={{ cursor: fileCount >= 2 ? "not-allowed" : "pointer", opacity: fileCount >= 2 ? 0.5 : 1 }} 
               onClick={fileCount < 2 ? clickFun : undefined}
           >
            {/* Show count to the user so they know they can upload up to 2 */}
            <p>{fileCount >= 2 ? "Max Reached" : "Upload"} ({fileCount}/2)</p>
            <div>
                <Image src="/icons/Upload.png" alt="upload icon" width={24} height={24}/>
            </div>
           </div>
        </div>
    );
}
export default DocumentsCard;