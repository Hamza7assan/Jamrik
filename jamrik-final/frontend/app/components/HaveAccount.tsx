import "./HaveAccount.css";
import Link from "next/link";
type Props = {
    leftSide: string;
    rightSide: string;
    To : string;
};
const HaveAccount = (props: Props) => {
    return (
       <div className="HaveAccount">
        <p className="left">{props.leftSide} 
        <Link href={props.To} className="right">{props.rightSide}</Link></p>
        </div>
        )
    }
    export default HaveAccount;