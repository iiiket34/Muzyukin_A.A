// src/components/Charts/Charts.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useCurrency } from '../../context/CurrencyContext';
import './Charts.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Charts = () => {
  const { exchangeRates, loading, CURRENCY_INFO } = useCurrency();
  const [chartData, setChartData] = useState(null);
  const [chartCurrency, setChartCurrency] = useState('USD');
  const [chartDays, setChartDays] = useState(30);
  const [activeChartTab, setActiveChartTab] = useState('brics');
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [chartError, setChartError] = useState('');
  
  // Группировка валют
  const bricsCurrencies = Object.keys(CURRENCY_INFO).filter(code => CURRENCY_INFO[code].isBRICS);
  const otherCurrencies = Object.keys(CURRENCY_INFO).filter(code => !CURRENCY_INFO[code].isBRICS);
  
  // Функция для проверки доступности валюты
  const isCurrencyAvailable = useCallback(() => {
    // Рубль всегда доступен
    if (chartCurrency === 'RUB') return true;
    
    // Проверяем наличие валюты в текущих курсах
    if (exchangeRates[chartCurrency]) return true;
    
    // Для некоторых валют может не быть данных
    return false;
  }, [chartCurrency, exchangeRates]);
  
  // Функция для получения исторических данных
  const fetchHistoricalRates = useCallback(async () => {
    if (!isCurrencyAvailable()) {
      setChartError('Курс недоступен для выбранной валюты');
      setChartData(null);
      return;
    }
    
    setIsLoadingChart(true);
    setChartError('');
    
    try {
      const today = new Date();
      const dates = [];
      
      // Генерируем даты за выбранный период
      for (let i = chartDays; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date);
      }
      
      // Получаем данные для всех дат
      const rateData = await Promise.all(
        dates.map(async (date) => {
          try {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            // Формируем URL для запроса исторических данных
            const url = `https://www.cbr-xml-daily.ru/archive/${year}/${month}/${day}/daily_json.js`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
              // Для дат без данных возвращаем null
              return { date, rate: null };
            }
            
            const data = await response.json();
            
            // Если запрошенная валюта - рубль
            if (chartCurrency === 'RUB') {
              return { date, rate: 1 };
            }
            
            // Если валюта есть в данных
            if (data.Valute[chartCurrency]) {
              const currency = data.Valute[chartCurrency];
              return { 
                date, 
                rate: currency.Value / currency.Nominal 
              };
            }
            
            return { date, rate: null };
          } catch (error) {
            return { date, rate: null };
          }
        })
      );
      
      // Фильтруем только те даты, где есть данные
      const validData = rateData.filter(item => item.rate !== null);
      
      if (validData.length === 0) {
        setChartError('Нет данных за выбранный период');
        setChartData(null);
        return;
      }
      
      // Формируем данные для графика
      const labels = validData.map(item => 
        item.date.toLocaleDateString('ru-RU', { 
          day: '2-digit', 
          month: '2-digit' 
        })
      );
      
      const rates = validData.map(item => item.rate);
      
      setChartData({
        labels,
        datasets: [
          {
            label: `${chartCurrency} к RUB`,
            data: rates,
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: '#2980b9',
          }
        ]
      });
    } catch (error) {
      setChartError('Ошибка при загрузке исторических данных');
      console.error('Ошибка загрузки исторических данных:', error);
      setChartData(null);
    } finally {
      setIsLoadingChart(false);
    }
  }, [chartCurrency, chartDays, exchangeRates, isCurrencyAvailable]);
  
  useEffect(() => {
    if (exchangeRates && Object.keys(exchangeRates).length > 0) {
      fetchHistoricalRates();
    }
  }, [chartCurrency, chartDays, exchangeRates, fetchHistoricalRates]);

  // При смене валюты проверяем доступность
  useEffect(() => {
    if (!isCurrencyAvailable()) {
      setChartError('Курс недоступен для выбранной валюты');
      setChartData(null);
    }
  }, [chartCurrency, isCurrencyAvailable]);
  
  return (
    <div className="chart-section">
      <h2>Графики изменения курсов</h2>
      
      <div className="chart-tabs">
        <button 
          className={`chart-tab ${activeChartTab === 'brics' ? 'active' : ''}`}
          onClick={() => setActiveChartTab('brics')}
        >
          Страны БРИКС+
        </button>
        <button 
          className={`chart-tab ${activeChartTab === 'other' ? 'active' : ''}`}
          onClick={() => setActiveChartTab('other')}
        >
          Другие валюты
        </button>
      </div>
      
      <div className="chart-controls">
        <div className="control-group">
          <label>Валюта:</label>
          <select
            value={chartCurrency}
            onChange={(e) => setChartCurrency(e.target.value)}
            disabled={loading || isLoadingChart}
          >
            {activeChartTab === 'brics' 
              ? bricsCurrencies.map(code => (
                  <option 
                    key={code} 
                    value={code} 
                    className={`${CURRENCY_INFO[code].isBRICS ? 'brics' : ''} ${
                      !exchangeRates[code] && code !== 'RUB' ? 'unavailable' : ''
                    }`}
                    disabled={!exchangeRates[code] && code !== 'RUB'}
                  >
                    {CURRENCY_INFO[code].flag} {CURRENCY_INFO[code].name} ({code})
                    {!exchangeRates[code] && code !== 'RUB' && ' (недоступно)'}
                  </option>
                ))
              : otherCurrencies.map(code => (
                  <option key={code} value={code}>
                    {CURRENCY_INFO[code].flag} {CURRENCY_INFO[code].name} ({code})
                  </option>
                ))
            }
          </select>
        </div>
        
        <div className="control-group">
          <label>Период:</label>
          <select
            value={chartDays}
            onChange={(e) => setChartDays(parseInt(e.target.value))}
            disabled={loading || isLoadingChart || !isCurrencyAvailable()}
          >
            <option value={7}>7 дней</option>
            <option value={14}>14 дней</option>
            <option value={30}>30 дней</option>
            <option value={90}>3 месяца</option>
            <option value={180}>6 месяцев</option>
          </select>
        </div>
      </div>
      
      {isLoadingChart && (
        <div className="loading-chart">
          <div className="loader"></div>
          <p>Загрузка исторических данных...</p>
        </div>
      )}
      
      {chartError && !isLoadingChart && (
        <div className="chart-error">
          <p>{chartError}</p>
          {!isCurrencyAvailable() && (
            <p>Выберите другую валюту для просмотра графика</p>
          )}
        </div>
      )}
      
      {chartData && !isLoadingChart && !chartError && (
        <div className="chart-container">
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: `Изменение курса ${chartCurrency} к RUB за последние ${chartDays} дней`,
                  font: {
                    size: 16
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `1 ${chartCurrency} = ${context.parsed.y.toFixed(4)} RUB`;
                    },
                    title: function(context) {
                      return context[0].label;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: false,
                  title: {
                    display: true,
                    text: 'RUB'
                  },
                  ticks: {
                    callback: function(value) {
                      return value.toFixed(2);
                    }
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Дата'
                  }
                }
              },
              interaction: {
                intersect: false,
                mode: 'index',
              }
            }}
          />
        </div>
      )}
      
      <div className="chart-info">
        <p>График показывает реальное изменение курса валюты к российскому рублю за выбранный период.</p>
        <p>Некоторые валюты могут быть недоступны.</p>
      </div>
    </div>
  );
};

export default Charts;