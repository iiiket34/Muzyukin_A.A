// src/context/CurrencyContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const CURRENCY_INFO = {
    // Страны БРИКС+
    BRL: { name: 'Бразильский реал', flag: '🇧🇷', isBRICS: true },
    RUB: { name: 'Российский рубль', flag: '🇷🇺', isBRICS: true },
    INR: { name: 'Индийская рупия', flag: '🇮🇳', isBRICS: true },
    CNY: { name: 'Китайский юань', flag: '🇨🇳', isBRICS: true },
    ZAR: { name: 'Южноафриканский рэнд', flag: '🇿🇦', isBRICS: true },
    IDR: { name: 'Индонезийская рупия', flag: '🇮🇩', isBRICS: true },
    EGP: { name: 'Египетский фунт', flag: '🇪🇬', isBRICS: true },
    ETB: { name: 'Эфиопский быр', flag: '🇪🇹', isBRICS: true },
    IRR: { name: 'Иранский риал', flag: '🇮🇷', isBRICS: true },
    AED: { name: 'Дирхам ОАЭ', flag: '🇦🇪', isBRICS: true },
    
    // Другие валюты
    USD: { name: 'Доллар США', flag: '🇺🇸', isBRICS: false },
    EUR: { name: 'Евро', flag: '🇪🇺', isBRICS: false },
    JPY: { name: 'Японская иена', flag: '🇯🇵', isBRICS: false },
    GBP: { name: 'Фунт стерлингов', flag: '🇬🇧', isBRICS: false },
    CHF: { name: 'Швейцарский франк', flag: '🇨🇭', isBRICS: false },
    TRY: { name: 'Турецкая лира', flag: '🇹🇷', isBRICS: false },
    KZT: { name: 'Казахстанский тенге', flag: '🇰🇿', isBRICS: false },
    SGD: { name: 'Сингапурский доллар', flag: '🇸🇬', isBRICS: false },
    THB: { name: 'Тайский бат', flag: '🇹🇭', isBRICS: false },
    CAD: { name: 'Канадский доллар', flag: '🇨🇦', isBRICS: false },
    AUD: { name: 'Австралийский доллар', flag: '🇦🇺', isBRICS: false },
    HKD: { name: 'Гонконгский доллар', flag: '🇭🇰', isBRICS: false },
    SEK: { name: 'Шведская крона', flag: '🇸🇪', isBRICS: false },
    NOK: { name: 'Норвежская крона', flag: '🇳🇴', isBRICS: false },
    KRW: { name: 'Южнокорейская вона', flag: '🇰🇷', isBRICS: false },
    MXN: { name: 'Мексиканское песо', flag: '🇲🇽', isBRICS: false },
  };

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
      
      if (!response.ok) throw new Error('Ошибка получения данных от ЦБ РФ');
      
      const data = await response.json();
      
      // Добавляем рубль с курсом 1
      const rates = { ...data.Valute, RUB: { Value: 1, Nominal: 1 } };
      setExchangeRates(rates);
    } catch (err) {
      setError(err.message);
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 1800000); // Обновление каждые 30 минут
    return () => clearInterval(interval);
  }, []);

  const convertCurrency = (amount, from, to) => {
    if (!exchangeRates[from] || !exchangeRates[to]) return null;
    
    if (from === to) return amount;
    
    const fromRate = exchangeRates[from].Value / exchangeRates[from].Nominal;
    const toRate = exchangeRates[to].Value / exchangeRates[to].Nominal;
    
    return (amount * fromRate) / toRate;
  };

  const value = {
    exchangeRates,
    loading,
    error,
    CURRENCY_INFO,
    convertCurrency
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};