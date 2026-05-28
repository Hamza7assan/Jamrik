"use client";
import "./page.css";
import MainStructure from "../components/MainStructure";
import Image from "next/image";
import ShipmentCalendar from "../components/ShipmentCalendar";
import ContentTitle from "../components/ContentTitle";
import { useState, useContext } from "react";
import { LanguageContext } from "../components/LanguageContext";
import CurrencyConverter from "../components/CurrencyConverter";
import React from 'react';
const DashBoard = () => {
    const { t } = useContext(LanguageContext);
    const [featureExplanationPressed, setFeatureExplanationPressed] = useState(false);
    const featuresExplanation = [
        {
            title: t("New Shipment"),
            description: t("Streamline your logistics by digitizing invoices, packing lists, and certificates. Automatically generate customs declarations, identify document discrepancies, and receive instant cost estimations for your shipments."),
            iconSrc: "/icons/blackNew.png",
        },
        {
            title: t("HS Codes"),
            description: t("Quickly identify the correct Harmonized System (HS) codes for your products. Access up-to-date customs duty rates and regulatory requirements for seamless international trade."),
            iconSrc: "/icons/blackSearch.png",
        },
        {
            title: t("Validation Page"),
            description: t("Pre-screen your documents before official submission. Ensure all paperwork meets strict customs requirements to avoid costly penalties and shipment hold-ups."),
            iconSrc: "/icons/blackmainCircle.png",
        },
        {
            title: t("Currency Converter"),
            description: t("Stay on top of international exchange rates. Instantly convert currencies to accurately estimate your shipping costs and customs duties in your local currency."),
            iconSrc: "/icons/badge-dollar-sign.png",
        },
        {
            title: t("Shipment Calendar"),
            description: t("Organize your logistics timeline effectively. Add custom notes, track important deadlines, and manage your clearance schedule all in one place."),
            iconSrc: "/icons/calendar-sync.png",
        }
    ];
    const [explanationDataNeeded, setExplanationDataNeeded] = useState({
        title: "",
        description: "",
        iconSrc: "",
    });
    return (
        <MainStructure>
        <div className="dashboardContainer">
            
            <ContentTitle title={t("Dashboard Overview")} subTitle={t("Real-time visibility into your logistics operations")} />

            <div className="dashboardCardsContainer">

                <div className="dashboardTopCards">

                    <div className="dashboardFeatureExplanationCardsBox">
                        <p className="dashboardFeatureExplanationCardsTitle">{t("Features Explanation")}</p>
                        <div className="featureExplanationCardsContainer">
                           {featuresExplanation.map((feature, index) => (
    <React.Fragment key={index}>
        <div onClick={() => {setFeatureExplanationPressed(true); setExplanationDataNeeded(feature);}}>
            <p className="featureExplanationTitle">{feature.title}</p>
            <Image src={feature.iconSrc} alt={feature.title} width={24} height={24} />
        </div>
        <hr />
    </React.Fragment>
))}

                        </div>
                    </div>


                        <div className="dashboardFeatureExplanationCardsBox">
                            <CurrencyConverter/>
                    </div>
                
                </div>

                {featureExplanationPressed && (
                    <div className="dashboardBottomCard">
                        <div>
                            <p className="dashboardBottomCardTitle">{explanationDataNeeded.title}</p>
                            <p className="dashboardBottomCardSubtitle">{explanationDataNeeded.description}</p>
                        </div>

                    </div>
                )}

            </div>

            <div className="calendar">
                <ShipmentCalendar />
            </div>

        </div>
        </MainStructure>
    );
}
export default DashBoard;