import Image from "next/image";
import Link from "next/link";
type BackArrowProps = {
    to: string;
};
 const BackArrow = ({ to }: BackArrowProps) => {
    return (
        <div className="backArrowContainer">
            <Link href={to}>
            <Image
            src="/icons/BackArrow.png" 
            alt="Back Arrow" 
            className="backArrow"
            width={45}
            height={45}
            style={{position: "absolute", top: "20px", left: "20px"}}/>
            </Link>
        </div>
    );
}
export default BackArrow;