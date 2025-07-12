// src/App.js
import React, { useState } from 'react';
import { CurrencyProvider } from './context/CurrencyContext';
import { HistoryProvider } from './context/HistoryContext';
import Converter from './components/Converter/Converter';
import History from './components/History/History';
import Charts from './components/Charts/Charts';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('converter');
  
  return (
    <CurrencyProvider>
      <HistoryProvider>
        <div className="app">
          <header>
            <h1>Конвертер валют </h1>
            <p className="update-info">
              Поддержка валют стран БРИКС и других мировых валют
            </p>
          </header>
          
          <nav className="tabs">
            <button 
              className={activeTab === 'converter' ? 'active' : ''} 
              onClick={() => setActiveTab('converter')}
            >
              Конвертер
            </button>
            <button 
              className={activeTab === 'history' ? 'active' : ''} 
              onClick={() => setActiveTab('history')}
            >
              История
            </button>
            <button 
              className={activeTab === 'chart' ? 'active' : ''} 
              onClick={() => setActiveTab('chart')}
            >
              Графики
            </button>
          </nav>
          
          <main>
            {activeTab === 'converter' && <Converter />}
            {activeTab === 'history' && <History />}
            {activeTab === 'chart' && <Charts />}
          </main>
          
          <footer>
            <p>Данные предоставлены</p>
            <p>Курсы обновляются автоматически каждые 30 минут</p>
          </footer>
        </div>
      </HistoryProvider>
    </CurrencyProvider>
  );
}

export default App;