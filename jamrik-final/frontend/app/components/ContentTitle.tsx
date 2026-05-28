import "./ContentTitle.css";
type ContentTitleProps = {
    title: string;
    subTitle: string;
}
const ContentTitle = ({title, subTitle}: ContentTitleProps) => {
    return (
        <div>
            <p className="ContentTitle">{title}</p>
            <p className="ContentSubtitle">{subTitle}</p>
        </div>
    );
}
export default ContentTitle;