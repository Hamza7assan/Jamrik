"use client";
import Image from "next/image";
import './MainStructure.css';
import Link from "next/link";
import { useContext } from "react";
import UserContext from "./UserContext";
import { LanguageContext } from "./LanguageContext";
import { useRouter } from "next/navigation";
import UserProfileSprite from "./UserProfileSprite";
type MainStructureProps = {
    children: React.ReactNode;
}
const MainStructure = (props: MainStructureProps) => {
    const userContext = useContext(UserContext);
    const { language, toggleLanguage, t } = useContext(LanguageContext);
    const router = useRouter();

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (userContext.userName === "Account Type") {
      router.push("/loginpage");
    } else {
      router.push("/profilepage");
    }
  };
    return (
        <div className="mainStructure">

            <div className="leftSide">

            <div className="logoContainer">
                <Image src="/images/finalLogo2.png" alt="Logo" width={50} height={50} />
                <span>JAMRIK</span>
            </div>

            <div className="leftBar">
                <Link href="/dashboard">
                <div className="LeftBarItems">
                <Image src="/icons/Dashboard.png" alt="Dashboard" width={24} height={24} />
                <p>{t("Dashboard")}</p>
                </div>
                </Link>

                <Link href="/newshipment" >
                <div className="LeftBarItems">
                <Image src="/icons/New.png" alt="New Shipment" width={24} height={24} />
                <p>{t("New Shipment")}</p>
                </div>
                </Link>

                <Link href="/shipments">
                <div className="LeftBarItems">
                <Image src="/icons/Shipment.png" alt="Shipments" width={24} height={24} />
                <p>{t("Shipments")}</p>
                </div>
                </Link>
                
                <Link href="/hscodeassistant" >
                <div className="LeftBarItems">
                <Image src="/icons/search.png" alt="HS Code Assistant" width={24} height={24} />
                <p>{t("HS Code Assistant")}</p>
                </div>
                </Link>

                <Link href="/validationpage" >
                <div className="LeftBarItems">
                <Image src="/icons/mainCircle.png" alt="Validation Page" width={24} height={24} />
                <p>{t("Validation")}</p>
                </div>
                </Link>

            </div>

            </div>

            <div className="rightSide">
                <div className="header">
                    <p className="subtitle">{t("Digital Clearance System")}</p>

                    <div className="notificationAccount">
                        <div 
                          onClick={toggleLanguage} 
                          style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', padding: '0 10px' }}
                        >
                          {language === 'en' ? 'AR' : 'EN'}
                        </div>
                        <div className="accountContainer">
                            <div onClick={handleProfileClick} >
                            <div className="accountIcon">
                                <UserProfileSprite scale={0.75} />
                            </div>
                        </div>
                        <div className="accountInfo">
                            <p className="accountName" style={{ fontFamily: "'Dancing Script', cursive, serif", fontSize: "18px", color: "#2B4B8A", fontWeight: "bold" }}>Hello!!</p>
                            <p className="accountName">{userContext.userName}</p>
                        </div>
                        </div>
                    </div>
                </div>


                <div className="pageContent">
                    {props.children}
            </div>

            </div>

            </div>
            
    );
};
export default MainStructure;