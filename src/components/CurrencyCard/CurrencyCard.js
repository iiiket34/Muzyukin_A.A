// src/components/CurrencyCard/CurrencyCard.js
import React from 'react';
import './CurrencyCard.css';

const CurrencyCard = ({ currencyCode, exchangeRates, currencyInfo, isAvailable }) => {
  if (!currencyInfo) return null;
  
  let rate;
  
  if (currencyCode === 'RUB') {
    rate = '1 RUB = 1 RUB';
  } else if (isAvailable && exchangeRates[currencyCode]) {
    rate = `1 ${currencyCode} = ${(exchangeRates[currencyCode].Value / exchangeRates[currencyCode].Nominal).toFixed(4)} RUB`;
  } else {
    rate = 'Курс недоступен';
  }
  
  return (
    <div className={`currency-card ${!isAvailable ? 'unavailable' : ''}`}>
      <div className="currency-header">
        <span className="currency-flag">{currencyInfo.flag}</span>
        <span className="currency-name">{currencyInfo.name}</span>
      </div>
      <div className="currency-code">{currencyCode}</div>
      <div className="currency-rate">{rate}</div>
      {!isAvailable && <div className="unavailable-badge">Недоступно</div>}
    </div>
  );
};

export default CurrencyCard;