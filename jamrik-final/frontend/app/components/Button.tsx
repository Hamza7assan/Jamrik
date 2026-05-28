import "./Button.css";
import Image from 'next/image';
type ButtonProps = {
    iconSrc: string;
    iconName: string;
    buttonType: "button" | "submit" | "reset";
    buttonDesc: string;
    buttonFun?: () => void;
};

const Button = ({ iconSrc, iconName, buttonType, buttonDesc, buttonFun }: ButtonProps) => {
    return (
      <button className="button" type={buttonType} onClick={buttonFun}>
        <Image src={iconSrc} alt={iconName} className="buttonIcon" width={24} height={24} />
        <p className="buttonText">{buttonDesc}</p>
      </button>
    );
};
export default Button;