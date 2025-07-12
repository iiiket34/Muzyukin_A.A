// src/components/History/History.js
import React, { useContext } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { useHistory } from '../../context/HistoryContext';
import './History.css';

const History = () => {
  const { history, clearHistory } = useHistory();
  const { CURRENCY_INFO } = useCurrency();

  return (
    <div className="history-section">
      <div className="history-header">
        <h2>История конвертаций</h2>
        {history.length > 0 && (
          <button className="clear-history-btn" onClick={clearHistory}>
            Очистить историю
          </button>
        )}
      </div>
      
      {history.length === 0 ? (
        <div className="empty-history">
          <p>История конвертаций пуста</p>
          <p>Выполните конвертацию валют, чтобы увидеть историю операций</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((record, index) => (
            <div key={index} className="history-record">
              <div className="record-header">
                <div className="record-date">{record.date}</div>
                <div className="record-currencies">
                  {CURRENCY_INFO[record.from]?.flag} {record.from} → 
                  {CURRENCY_INFO[record.to]?.flag} {record.to}
                </div>
              </div>
              
              <div className="record-details">
                <div className="record-amount">{record.amount} {record.from}</div>
                <div className="record-arrow">→</div>
                <div className="record-result">{record.result} {record.to}</div>
              </div>
              
              <div className="record-names">
                {record.fromCurrencyName} → {record.toCurrencyName}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;