"use client";
import React, { useState, useEffect, useContext } from "react";
import { LanguageContext } from "./LanguageContext";
import "./CurrencyConverter.css";

const CURRENCY_REGISTRY = [
  // Africa
  { region: 'Africa', code: 'DZD', name: 'Algerian Dinar', factor: 189 },
  { region: 'Africa', code: 'XOF', name: 'CFA Franc BCEAO', factor: 855 },
  { region: 'Africa', code: 'XAF', name: 'CFA Franc BEAC', factor: 855 },
  { region: 'Africa', code: 'GHS', name: 'Ghanaian Cedi', factor: 18.5 },
  { region: 'Africa', code: 'KES', name: 'Kenyan Shilling', factor: 185 },
  { region: 'Africa', code: 'MUR', name: 'Mauritian Rupee', factor: 64 },
  { region: 'Africa', code: 'MAD', name: 'Moroccan Dirham', factor: 14.1 },
  { region: 'Africa', code: 'NGN', name: 'Nigerian Naira', factor: 2100 },
  { region: 'Africa', code: 'ZAR', name: 'South African Rand', factor: 26.65 },
  { region: 'Africa', code: 'TZS', name: 'Tanzanian Shilling', factor: 3600 },
  { region: 'Africa', code: 'TND', name: 'Tunisian Dinar', factor: 4.4 },
  { region: 'Africa', code: 'UGX', name: 'Ugandan Shilling', factor: 5300 },

  // Americas
  { region: 'Americas', code: 'ARS', name: 'Argentine Peso', factor: 1230 },
  { region: 'Americas', code: 'BRL', name: 'Brazilian Real', factor: 7.15 },
  { region: 'Americas', code: 'CAD', name: 'Canadian Dollar', factor: 1.93 },
  { region: 'Americas', code: 'CLP', name: 'Chilean Peso', factor: 1350 },
  { region: 'Americas', code: 'COP', name: 'Colombian Peso', factor: 5500 },
  { region: 'Americas', code: 'CRC', name: 'Costa Rican Colon', factor: 730 },
  { region: 'Americas', code: 'DOP', name: 'Dominican Peso', factor: 82 },
  { region: 'Americas', code: 'MXN', name: 'Mexican Peso', factor: 23.5 },
  { region: 'Americas', code: 'PEN', name: 'Peruvian Sol', factor: 5.2 },
  { region: 'Americas', code: 'USD', name: 'US Dollar', factor: 1.41 },
  { region: 'Americas', code: 'UYU', name: 'Uruguayan Peso', factor: 55 },

  // Asia
  { region: 'Asia', code: 'BDT', name: 'Bangladeshi Taka', factor: 154 },
  { region: 'Asia', code: 'CNY', name: 'Chinese Yuan', factor: 10.21 },
  { region: 'Asia', code: 'HKD', name: 'Hong Kong Dollar', factor: 11 },
  { region: 'Asia', code: 'INR', name: 'Indian Rupee', factor: 117.61 },
  { region: 'Asia', code: 'IDR', name: 'Indonesian Rupiah', factor: 22000 },
  { region: 'Asia', code: 'JPY', name: 'Japanese Yen', factor: 219.45 },
  { region: 'Asia', code: 'KZT', name: 'Kazakhstani Tenge', factor: 630 },
  { region: 'Asia', code: 'MYR', name: 'Malaysian Ringgit', factor: 6.7 },
  { region: 'Asia', code: 'TWD', name: 'New Taiwan Dollar', factor: 45.4 },
  { region: 'Asia', code: 'PKR', name: 'Pakistani Rupee', factor: 390 },
  { region: 'Asia', code: 'PHP', name: 'Philippine Peso', factor: 79.5 },
  { region: 'Asia', code: 'SGD', name: 'Singapore Dollar', factor: 1.9 },
  { region: 'Asia', code: 'KRW', name: 'South Korean Won', factor: 1910 },
  { region: 'Asia', code: 'LKR', name: 'Sri Lankan Rupee', factor: 420 },
  { region: 'Asia', code: 'THB', name: 'Thai Baht', factor: 50.5 },
  { region: 'Asia', code: 'VND', name: 'Vietnamese Dong', factor: 35000 },

  // Europe
  { region: 'Europe', code: 'GBP', name: 'British Pound', factor: 1.13 },
  { region: 'Europe', code: 'BGN', name: 'Bulgarian Lev', factor: 2.5 },
  { region: 'Europe', code: 'CZK', name: 'Czech Koruna', factor: 33.1 },
  { region: 'Europe', code: 'DKK', name: 'Danish Krone', factor: 9.8 },
  { region: 'Europe', code: 'EUR', name: 'Euro', factor: 1.32 },
  { region: 'Europe', code: 'HUF', name: 'Hungarian Forint', factor: 512 },
  { region: 'Europe', code: 'ISK', name: 'Icelandic Krona', factor: 195 },
  { region: 'Europe', code: 'NOK', name: 'Norwegian Krone', factor: 15.3 },
  { region: 'Europe', code: 'PLN', name: 'Polish Zloty', factor: 5.6 },
  { region: 'Europe', code: 'RON', name: 'Romanian Leu', factor: 6.5 },
  { region: 'Europe', code: 'RUB', name: 'Russian Ruble', factor: 130 },
  { region: 'Europe', code: 'RSD', name: 'Serbian Dinar', factor: 154 },
  { region: 'Europe', code: 'SEK', name: 'Swedish Krona', factor: 14.8 },
  { region: 'Europe', code: 'CHF', name: 'Swiss Franc', factor: 1.26 },

  // Middle East
  { region: 'Middle East', code: 'BHD', name: 'Bahraini Dinar', factor: 0.53 },
  { region: 'Middle East', code: 'EGP', name: 'Egyptian Pound', factor: 66.85 },
  { region: 'Middle East', code: 'IRR', name: 'Iranian Rial', factor: 59000 },
  { region: 'Middle East', code: 'IQD', name: 'Iraqi Dinar', factor: 1845 },
  { region: 'Middle East', code: 'ILS', name: 'Israeli New Shekel', factor: 5.2 },
  { region: 'Middle East', code: 'JOD', name: 'Jordanian Dinar', factor: 1 },
  { region: 'Middle East', code: 'KWD', name: 'Kuwaiti Dinar', factor: 0.43 },
  { region: 'Middle East', code: 'LBP', name: 'Lebanese Pound', factor: 126000 },
  { region: 'Middle East', code: 'OMR', name: 'Omani Rial', factor: 0.54 },
  { region: 'Middle East', code: 'QAR', name: 'Qatari Riyal', factor: 5.14 },
  { region: 'Middle East', code: 'SAR', name: 'Saudi Riyal', factor: 5.29 },
  { region: 'Middle East', code: 'TRY', name: 'Turkish Lira', factor: 48.35 },
  { region: 'Middle East', code: 'AED', name: 'UAE Dirham', factor: 5.18 },
  { region: 'Middle East', code: 'YER', name: 'Yemeni Rial', factor: 352 },

  // Oceania
  { region: 'Oceania', code: 'AUD', name: 'Australian Dollar', factor: 2.15 },
  { region: 'Oceania', code: 'FJD', name: 'Fijian Dollar', factor: 3.1 },
  { region: 'Oceania', code: 'NZD', name: 'New Zealand Dollar', factor: 2.3 },
  { region: 'Oceania', code: 'PGK', name: 'Papua New Guinean Kina', factor: 5.3 },
];

export default function CurrencyConverter() {
  const { t } = useContext(LanguageContext);
  const [baseCurrency, setBaseCurrency] = useState<string>("JOD");
  const [targetCurrency, setTargetCurrency] = useState<string>("USD");

  const [baseAmount, setBaseAmount] = useState<string>("1");
  const [targetAmount, setTargetAmount] = useState<string>("1.41");

  // Helper function to get the numeric conversion factor relative to JOD
  const getFactor = (code: string) => {
    return CURRENCY_REGISTRY.find((c) => c.code === code)?.factor || 1;
  };

  // Helper function to get the clean name string
  const getName = (code: string) => {
    return CURRENCY_REGISTRY.find((c) => c.code === code)?.name || "";
  };

  const handleBaseChange = (val: string) => {
    setBaseAmount(val);
    const numericValue = parseFloat(val);
    if (isNaN(numericValue)) {
      setTargetAmount("");
      return;
    }

    const baseFactor = getFactor(baseCurrency);
    const targetFactor = getFactor(targetCurrency);

    const result = (numericValue / baseFactor) * targetFactor;
    
    // Format to 2 decimals, unless it's JOD which uses 3 decimals (fils)
    setTargetAmount(targetCurrency === "JOD" ? result.toFixed(3) : result.toFixed(2));
  };

  // Handler for modifying the Bottom (Target) Input field
  const handleTargetChange = (val: string) => {
    setTargetAmount(val);
    const numericValue = parseFloat(val);
    if (isNaN(numericValue)) {
      setBaseAmount("");
      return;
    }

    const baseFactor = getFactor(baseCurrency);
    const targetFactor = getFactor(targetCurrency);

    // Convert Target Amount back to JOD, then convert JOD to Base Amount
    const result = (numericValue / targetFactor) * baseFactor;
    setBaseAmount(baseCurrency === "JOD" ? result.toFixed(3) : result.toFixed(2));
  };

  // Recalculate values smoothly whenever dropdown selections change
  useEffect(() => {
    handleBaseChange(baseAmount);
  }, [baseCurrency, targetCurrency]);

  const regions = Array.from(new Set(CURRENCY_REGISTRY.map((c) => c.region)));

  return (
    <div className="currency-converter-container">
      <div className="currency-converter-title">
        <span className="currency-converter-label">
          1 {t(getName(baseCurrency))} {t("equals")}
        </span>
        <h2 className="currency-converter-amount">
          {((1 / getFactor(baseCurrency)) * getFactor(targetCurrency)).toFixed(2)}{" "}
          {t(getName(targetCurrency))}
        </h2>
      </div>

      <div className="currency-converter-blocks">
        {/* TOP BLOCK (Base Input & Dropdown) */}
        <div className="currency-input-group">
          <input
            type="number"
            value={baseAmount}
            onChange={(e) => handleBaseChange(e.target.value)}
            className="currency-input"
          />
          <select
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
            className="currency-select"
          >
            {regions.map((region) => (
              <optgroup key={region} label={t(region)} className="text-xs text-gray-400 font-sans">
                {CURRENCY_REGISTRY.filter((c) => c.region === region).map((currency) => (
                  <option key={currency.code} value={currency.code} className="text-gray-900 font-medium">
                    {currency.code} — {t(currency.name)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* BOTTOM BLOCK (Target Input & Dropdown) */}
        <div className="currency-input-group">
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => handleTargetChange(e.target.value)}
            className="currency-input"
          />
          <select
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value)}
            className="currency-select"
          >
            {regions.map((region) => (
              <optgroup key={region} label={t(region)} className="text-xs text-gray-400 font-sans">
                {CURRENCY_REGISTRY.filter((c) => c.region === region).map((currency) => (
                  <option key={currency.code} value={currency.code} className="text-gray-900 font-medium">
                    {currency.code} — {t(currency.name)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

    </div>
  );
}