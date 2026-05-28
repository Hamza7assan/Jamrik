import './LogInStructure.css';
import Image from "next/image";
import BackArrow from "./BackArrow";
const LogInStructure = () => {
    return (
        <div>
            <Image src="/images/finalLogo.png" alt="Logo" className="logo" width={135} height={135} priority />
            <BackArrow to="/dashboard" />
            <div>
                <p className="title">JAMRIK</p>
                <p className="subtitle">Digital Clearance System</p>
                </div>
        </div>
        
    )
}
export default LogInStructure;