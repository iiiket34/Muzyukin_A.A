// src/components/Converter/Converter.js
import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { useHistory } from '../../context/HistoryContext';
import CurrencyCard from '../CurrencyCard/CurrencyCard';
import './Converter.css';

const Converter = () => {
  const { exchangeRates, loading, error: apiError, CURRENCY_INFO } = useCurrency();
  const { addToHistory } = useHistory();
  
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('RUB');
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState('');
  const [localError, setLocalError] = useState('');

  // Получаем список доступных валют
  const getAvailableCurrencies = () => {
    return Object.keys(CURRENCY_INFO).filter(
      code => code === 'RUB' || (exchangeRates && exchangeRates[code])
    );
  };

  const availableCurrencies = getAvailableCurrencies();
  const bricsCurrencies = availableCurrencies.filter(code => CURRENCY_INFO[code].isBRICS);
  const otherCurrencies = availableCurrencies.filter(code => !CURRENCY_INFO[code].isBRICS);

  // Функция конвертации
  const convert = (value, from, to) => {
    if (from === to) return value;

    try {
      const fromRate = from === 'RUB' ? 1 : exchangeRates[from].Value / exchangeRates[from].Nominal;
      const toRate = to === 'RUB' ? 1 : exchangeRates[to].Value / exchangeRates[to].Nominal;
      return (value * fromRate) / toRate;
    } catch (e) {
      return null;
    }
  };

  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setAmount(Math.max(0, value));
  };

  useEffect(() => {
    if (!exchangeRates || amount <= 0) {
      setResult('');
      return;
    }

    const converted = convert(amount, fromCurrency, toCurrency);
    
    if (converted === null) {
      setLocalError('Курс для выбранной валюты недоступен');
      setResult('');
    } else {
      setLocalError('');
      setResult(converted.toFixed(2));
      
      if (fromCurrency !== toCurrency && amount > 0) {
        addToHistory({
          date: new Date().toLocaleString(),
          amount,
          from: fromCurrency,
          to: toCurrency,
          result: converted.toFixed(2),
          fromCurrencyName: CURRENCY_INFO[fromCurrency]?.name || fromCurrency,
          toCurrencyName: CURRENCY_INFO[toCurrency]?.name || toCurrency,
        });
      }
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

  return (
    <div className="converter-section">
      <div className="converter">
        <div className="input-group">
          <label>Из:</label>
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            min="0"
            step="0.01"
            disabled={loading}
            placeholder="Введите сумму"
          />
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            disabled={loading}
          >
            <optgroup label="Страны БРИКС+">
              {bricsCurrencies.map(code => (
                <option key={code} value={code}>
                  {CURRENCY_INFO[code].flag} {CURRENCY_INFO[code].name} ({code})
                </option>
              ))}
            </optgroup>
            <optgroup label="Другие валюты">
              {otherCurrencies.map(code => (
                <option key={code} value={code}>
                  {CURRENCY_INFO[code].flag} {CURRENCY_INFO[code].name} ({code})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <button 
          className="swap-btn" 
          onClick={() => {
            setFromCurrency(toCurrency);
            setToCurrency(fromCurrency);
          }}
          disabled={loading}
        >
          ⇄
        </button>

        <div className="input-group">
          <label>В:</label>
          <input
            type="text"
            value={loading ? 'Загрузка...' : result}
            readOnly
            className="result-input"
          />
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            disabled={loading}
          >
            <optgroup label="Страны БРИКС+">
              {bricsCurrencies.map(code => (
                <option key={code} value={code}>
                  {CURRENCY_INFO[code].flag} {CURRENCY_INFO[code].name} ({code})
                </option>
              ))}
            </optgroup>
            <optgroup label="Другие валюты">
              {otherCurrencies.map(code => (
                <option key={code} value={code}>
                  {CURRENCY_INFO[code].flag} {CURRENCY_INFO[code].name} ({code})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {(apiError || localError) && (
        <div className="error">{apiError || localError}</div>
      )}

      <div className="info-section">
        <h2>Валюты стран БРИКС+</h2>
        <div className="brics-grid">
          {bricsCurrencies.map(code => (
            <CurrencyCard
              key={code}
              currencyCode={code}
              exchangeRates={exchangeRates}
              currencyInfo={CURRENCY_INFO[code]}
              isAvailable={!!exchangeRates[code] || code === 'RUB'}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Converter;