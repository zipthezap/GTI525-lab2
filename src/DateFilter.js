import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import './App.css';

const DateFilter = ({ stationData = [], years = [], months = [], onPeriodChange, onDateChange, historicalDailyInfo, dataUnavailable, forecastInfo  }) => {
  const [selectedYearFrom, setSelectedYearFrom] = useState('');
  const [selectedMonthFrom, setSelectedMonthFrom] = useState('');
  const [selectedYearTo, setSelectedYearTo] = useState('');
  const [selectedMonthTo, setSelectedMonthTo] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [globalStats, setGlobalStats] = useState({});
  const [monthlyStats, setMonthlyStats] = useState({});
  const [toggle, setToggle] = useState(3);

  const days = Array.from({ length: 31 }, (_, index) => index + 1);

  const frenchMonths = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const handleYearFromChange = (e) => {
    setSelectedYearFrom(e.target.value);
    setSelectedMonthFrom('');
  };

  const handleMonthFromChange = (e) => {
    setSelectedMonthFrom(e.target.value);
  };

  const handleYearToChange = (e) => {
    setSelectedYearTo(e.target.value);
    setSelectedMonthTo('');
  };

  const handleMonthToChange = (e) => {
    setSelectedMonthTo(e.target.value);
  };

  const handleReset = () => {
    setSelectedYearFrom('');
    setSelectedMonthFrom('');
    setSelectedYearTo('');
    setSelectedMonthTo('');
    setFilteredData(stationData);
    onPeriodChange('', '');
  };

  const calculateStatistics = (data) => {
    const stats = {
      temperature: { max: -Infinity, maxYear: '', maxMonth: '', min: Infinity, minYear: '', minMonth: '' },
      extremeTemperature: { max: -Infinity, maxYear: '', maxMonth: '', min: Infinity, minYear: '', minMonth: '' },
      rain: { max: -Infinity, maxYear: '', maxMonth: '', min: Infinity, minYear: '', minMonth: '' },
      snow: { max: -Infinity, maxYear: '', maxMonth: '', min: Infinity, minYear: '', minMonth: '' },
      wind: { max: -Infinity, maxYear: '', maxMonth: '', min: Infinity, minYear: '', minMonth: '' }
    };

    data.forEach(record => {
      const meanTemp = parseFloat(record.meanTemp);
      if (!isNaN(meanTemp)) {
        if (meanTemp > stats.temperature.max) {
          stats.temperature.max = meanTemp;
          stats.temperature.maxYear = record.year;
          stats.temperature.maxMonth = record.month;
        }
        if (meanTemp < stats.temperature.min) {
          stats.temperature.min = meanTemp;
          stats.temperature.minYear = record.year;
          stats.temperature.minMonth = record.month;
        }
      }

      const extrMaxTemp = parseFloat(record.extrMaxTemp);
      const extrMinTemp = parseFloat(record.extrMinTemp);
      if (!isNaN(extrMaxTemp)) {
        if (extrMaxTemp > stats.extremeTemperature.max) {
          stats.extremeTemperature.max = extrMaxTemp;
          stats.extremeTemperature.maxYear = record.year;
          stats.extremeTemperature.maxMonth = record.month;
        }
      }
      if (!isNaN(extrMinTemp)) {
        if (extrMinTemp < stats.extremeTemperature.min) {
          stats.extremeTemperature.min = extrMinTemp;
          stats.extremeTemperature.minYear = record.year;
          stats.extremeTemperature.minMonth = record.month;
        }
      }

      const totalRain = parseFloat(record.totalRain);
      if (!isNaN(totalRain)) {
        if (totalRain > stats.rain.max) {
          stats.rain.max = totalRain;
          stats.rain.maxYear = record.year;
          stats.rain.maxMonth = record.month;
        }
        if (totalRain < stats.rain.min) {
          stats.rain.min = totalRain;
          stats.rain.minYear = record.year;
          stats.rain.minMonth = record.month;
        }
      }

      const totalSnow = parseFloat(record.totalSnow);
      if (!isNaN(totalSnow)) {
        if (totalSnow > stats.snow.max) {
          stats.snow.max = totalSnow;
          stats.snow.maxYear = record.year;
          stats.snow.maxMonth = record.month;
        }
        if (totalSnow < stats.snow.min) {
          stats.snow.min = totalSnow;
          stats.snow.minYear = record.year;
          stats.snow.minMonth = record.month;
        }
      }

      const spdOfMaxGust = parseFloat(record.spdOfMaxGust);
      if (!isNaN(spdOfMaxGust)) {
        if (spdOfMaxGust > stats.wind.max) {
          stats.wind.max = spdOfMaxGust;
          stats.wind.maxYear = record.year;
          stats.wind.maxMonth = record.month;
        }
        if (spdOfMaxGust < stats.wind.min) {
          stats.wind.min = spdOfMaxGust;
          stats.wind.minYear = record.year;
          stats.wind.minMonth = record.month;
        }
      }
    });

    for (const key in stats) {
      if (stats[key].max === -Infinity) {
        stats[key].max = "N/A";
        stats[key].maxYear = "N/A";
        stats[key].maxMonth = "N/A";
      }
      if (stats[key].min === Infinity) {
        stats[key].min = "N/A";
        stats[key].minYear = "N/A";
        stats[key].minMonth = "N/A";
      }
    }

    setGlobalStats(stats);
  };

  const calculateMonthlyStatistics = (data) => {
    const monthlyStats = {};

    data.forEach(record => {
      const month = record.month;
      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          temperature: { max: -Infinity, min: Infinity, maxYear: '', minYear: '' },
          extremeTemperature: { max: -Infinity, min: Infinity, maxYear: '', minYear: '' },
          rain: { max: -Infinity, min: Infinity, maxYear: '', minYear: '' },
          snow: { max: -Infinity, min: Infinity, maxYear: '', minYear: '' },
          wind: { max: -Infinity, min: Infinity, maxYear: '', minYear: '' }
        };
      }

      const meanTemp = parseFloat(record.meanTemp);
      if (!isNaN(meanTemp)) {
        if (meanTemp > monthlyStats[month].temperature.max) {
          monthlyStats[month].temperature.max = meanTemp;
          monthlyStats[month].temperature.maxYear = record.year;
        }
        if (meanTemp < monthlyStats[month].temperature.min) {
          monthlyStats[month].temperature.min = meanTemp;
          monthlyStats[month].temperature.minYear = record.year;
        }
      }

      const extrMaxTemp = parseFloat(record.extrMaxTemp);
      const extrMinTemp = parseFloat(record.extrMinTemp);
      if (!isNaN(extrMaxTemp)) {
        if (extrMaxTemp > monthlyStats[month].extremeTemperature.max) {
          monthlyStats[month].extremeTemperature.max = extrMaxTemp;
          monthlyStats[month].extremeTemperature.maxYear = record.year;
        }
      }
      if (!isNaN(extrMinTemp)) {
        if (extrMinTemp < monthlyStats[month].extremeTemperature.min) {
          monthlyStats[month].extremeTemperature.min = extrMinTemp;
          monthlyStats[month].extremeTemperature.minYear = record.year;
        }
      }

      const totalRain = parseFloat(record.totalRain);
      if (!isNaN(totalRain)) {
        if (totalRain > monthlyStats[month].rain.max) {
          monthlyStats[month].rain.max = totalRain;
          monthlyStats[month].rain.maxYear = record.year;
        }
        if (totalRain < monthlyStats[month].rain.min) {
          monthlyStats[month].rain.min = totalRain;
          monthlyStats[month].rain.minYear = record.year;
        }
      }

      const totalSnow = parseFloat(record.totalSnow);
      if (!isNaN(totalSnow)) {
        if (totalSnow > monthlyStats[month].snow.max) {
          monthlyStats[month].snow.max = totalSnow;
          monthlyStats[month].snow.maxYear = record.year;
        }
        if (totalSnow < monthlyStats[month].snow.min) {
          monthlyStats[month].snow.min = totalSnow;
          monthlyStats[month].snow.minYear = record.year;
        }
      }

      const spdOfMaxGust = parseFloat(record.spdOfMaxGust);
      if (!isNaN(spdOfMaxGust)) {
        if (spdOfMaxGust > monthlyStats[month].wind.max) {
          monthlyStats[month].wind.max = spdOfMaxGust;
          monthlyStats[month].wind.maxYear = record.year;
        }
        if (spdOfMaxGust < monthlyStats[month].wind.min) {
          monthlyStats[month].wind.min = spdOfMaxGust;
          monthlyStats[month].wind.minYear = record.year;
        }
      }
    });

    for (const month in monthlyStats) {
      for (const key in monthlyStats[month]) {
        if (monthlyStats[month][key].max === -Infinity) {
          monthlyStats[month][key].max = "N/A";
          monthlyStats[month][key].maxYear = "N/A";
        }
        if (monthlyStats[month][key].min === Infinity) {
          monthlyStats[month][key].min = "N/A";
          monthlyStats[month][key].minYear = "N/A";
        }
      }
    }

    setMonthlyStats(monthlyStats);
  };

  function updateToggle(id) {
    setToggle(id);
  }

  useEffect(() => {
    if (stationData.length > 0) {
      const defaultYearFrom = Math.min(...years);
      const defaultMonthFrom = '01';
      const defaultYearTo = Math.max(...years);
      const defaultMonthTo = '12';

      setSelectedYearFrom(defaultYearFrom);
      setSelectedMonthFrom(defaultMonthFrom);
      setSelectedYearTo(defaultYearTo);
      setSelectedMonthTo(defaultMonthTo);

      const startDate = `${defaultYearFrom}-${defaultMonthFrom}-01`;
      const endDate = `${defaultYearTo}-${defaultMonthTo}-01`;

      onPeriodChange(startDate, endDate);
      calculateStatistics(stationData); // Calcul des statistiques pour toutes les périodes
      calculateMonthlyStatistics(stationData); // Calcul des statistiques par mois
    }
  }, [stationData, years, onPeriodChange]);

  useEffect(() => {
    if (stationData && selectedYearFrom && selectedMonthFrom && selectedYearTo && selectedMonthTo) {
      const startDate = `${selectedYearFrom}-${selectedMonthFrom}-01`;
      const endDate = `${selectedYearTo}-${selectedMonthTo}-01`;

      onPeriodChange(startDate, endDate);

      const filtered = stationData.filter(data => {
        const date = new Date(`${data.year}-${data.month}-01`);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });

      setFilteredData(filtered);
      calculateStatistics(filtered); // Calcul des stats période
      calculateMonthlyStatistics(filtered); // Calcul des stats mois
    } else {
      setFilteredData(stationData || []);
      onPeriodChange('', '');
      calculateStatistics(stationData);  
      calculateMonthlyStatistics(stationData);  
    }
  }, [selectedYearFrom, selectedMonthFrom, selectedYearTo, selectedMonthTo, stationData, onPeriodChange]);

  useEffect(() => {
    if (selectedYear && selectedMonth && selectedDate) {
      onDateChange(selectedYear, selectedMonth, selectedDate);
    }
  }, [selectedYear, selectedMonth, selectedDate, onDateChange]);  

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const isColumnEmpty = (data, key) => {
    return data.every(record => !record[key]);
  };

  return (
    <div>
      <div id="dateFilter" className={toggle !== 3 ? "show-content" : "hide-content"}>
        <h3 id="filterTitle">Plage de dates</h3>
        <Grid container columns={4}>
          <Grid xs={1}>
            <Grid container columns={1}>
              <Grid xs>
                <span>De:</span>
                <div className="custom-select date-range">
                  <select value={selectedYearFrom} onChange={handleYearFromChange}>
                    <option value="">Année</option>
                    {years.map((year, index) => (
                      <option key={index} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="custom-select date-range">
                  <select value={selectedMonthFrom} onChange={handleMonthFromChange}>
                    <option value="">Mois</option>
                    {months.map((month, index) => (
                      <option key={index} value={month}>{frenchMonths[parseInt(month) - 1]}</option>
                    ))}
                  </select>
                </div>
              </Grid>
              
              <Grid xs={1}>
                <span>À:</span>
                <div className="custom-select date-range">
                  <select value={selectedYearTo} onChange={handleYearToChange}>
                    <option value="">Année</option>
                    {years.map((year, index) => (
                      <option key={index} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="custom-select date-range">
                  <select value={selectedMonthTo} onChange={handleMonthToChange}>
                    <option value="">Mois</option>
                    {months.map((month, index) => (
                      <option key={index} value={month}>{frenchMonths[parseInt(month) - 1]}</option>
                    ))}
                  </select>
                </div>
              </Grid>
            </Grid>
          </Grid>
          <Grid xs={1}>
            <div className="filterButton">
              <button id="allData" className="tabs-label" onClick={handleReset}>Toutes les données</button>
            </div>
          </Grid>
        </Grid>
      </div>
  
      <div>
        <ul id="tabs">
          <li className='tab' id="meteo-data-tab" onClick={() => updateToggle(1)}>Données</li>
          <li className='tab' id="global-stats-tab" onClick={() => updateToggle(2)}>Statistiques</li>
          <li className='tab' id="historical-daily-info-tab" onClick={() => updateToggle(3)}>Informations journalières historiques</li>
          <li className='tab' id="forecast-tab" onClick={() => updateToggle(4)}>Prévisions météo</li>
        </ul>
        <div id="meteo-data" className={toggle === 1 ? "show-content" : "hide-content"}>
          {filteredData && filteredData.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Année</th>
                  <th>Mois</th>
                  <th>Temp max moy (°C)</th>
                  <th>Temp max min (°C)</th>
                  <th>Temp moy (°C)</th>
                  <th>Temp max enreg (°C)</th>
                  <th>Temp Min enreg (°C)</th>
                  <th>Pluie tot (mm)</th>
                  <th>Neige tot (cm)</th>
                  <th>Vit vent max (km/h)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((data, index) => (
                  <tr key={index}>
                    <td>{data.year}</td>
                    <td>{frenchMonths[parseInt(data.month) - 1]}</td>
                    <td>{data.meanMaxTemp}</td>
                    <td>{data.meanMinTemp}</td>
                    <td>{data.meanTemp}</td>
                    <td>{data.extrMaxTemp}</td>
                    <td>{data.extrMinTemp}</td>
                    <td>{data.totalRain}</td>
                    <td>{data.totalSnow}</td>
                    <td>{data.spdOfMaxGust}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div id="global-stats" className={toggle === 2 ? "show-content" : "hide-content"}>
          <h2>Statistiques globales</h2>
          {globalStats.temperature && globalStats.extremeTemperature && globalStats.rain && globalStats.snow && globalStats.wind ? (
            <table>
              <thead>
                <tr>
                  <th>Donnée</th>
                  <th>Valeur maximale</th>
                  <th>Année</th>
                  <th>Mois</th>
                  <th>Valeur minimale</th>
                  <th>Année</th>
                  <th>Mois</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Température moyenne mensuelle</td>
                  <td>{globalStats.temperature.max}°C</td>
                  <td>{globalStats.temperature.maxYear}</td>
                  <td>{globalStats.temperature.maxMonth}</td>
                  <td>{globalStats.temperature.min}°C</td>
                  <td>{globalStats.temperature.minYear}</td>
                  <td>{globalStats.temperature.minMonth}</td>
                </tr>
                <tr>
                  <td>Température extrême</td>
                  <td>{globalStats.extremeTemperature.max}°C</td>
                  <td>{globalStats.extremeTemperature.maxYear}</td>
                  <td>{globalStats.extremeTemperature.maxMonth}</td>
                  <td>{globalStats.extremeTemperature.min}°C</td>
                  <td>{globalStats.extremeTemperature.minYear}</td>
                  <td>{globalStats.extremeTemperature.minMonth}</td>
                </tr>
                <tr>
                  <td>Quantité de pluie</td>
                  <td>{globalStats.rain.max} mm</td>
                  <td>{globalStats.rain.maxYear}</td>
                  <td>{globalStats.rain.maxMonth}</td>
                  <td>{globalStats.rain.min} mm</td>
                  <td>{globalStats.rain.minYear}</td>
                  <td>{globalStats.rain.minMonth}</td>
                </tr>
                <tr>
                  <td>Quantité de neige</td>
                  <td>{globalStats.snow.max} cm</td>
                  <td>{globalStats.snow.maxYear}</td>
                  <td>{globalStats.snow.maxMonth}</td>
                  <td>{globalStats.snow.min} cm</td>
                  <td>{globalStats.snow.minYear}</td>
                  <td>{globalStats.snow.minMonth}</td>
                </tr>
                <tr>
                  <td>Vitesse du vent</td>
                  <td>{globalStats.wind.max} km/h</td>
                  <td>{globalStats.wind.maxYear}</td>
                  <td>{globalStats.wind.maxMonth}</td>
                  <td>{globalStats.wind.min} km/h</td>
                  <td>{globalStats.wind.minYear}</td>
                  <td>{globalStats.wind.minMonth}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p></p>
          )}
          <h2>Statistiques par mois</h2>
          {Object.keys(monthlyStats).length > 0 ? (
            frenchMonths.map((monthName, index) => {
              const monthIndex = String(index + 1).padStart(2, '0');
              const stats = monthlyStats[monthIndex];
              return (
                <div key={index}>
                  <h3>{monthName}</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Donnée</th>
                        <th>Valeur maximale</th>
                        <th>Année</th>
                        <th>Valeur minimale</th>
                        <th>Année</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Température moyenne mensuelle</td>
                        <td>{stats ? stats.temperature.max : 'N/A'}°C</td>
                        <td>{stats ? stats.temperature.maxYear : 'N/A'}</td>
                        <td>{stats ? stats.temperature.min : 'N/A'}°C</td>
                        <td>{stats ? stats.temperature.minYear : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>Température extrême</td>
                        <td>{stats ? stats.extremeTemperature.max : 'N/A'}°C</td>
                        <td>{stats ? stats.extremeTemperature.maxYear : 'N/A'}</td>
                        <td>{stats ? stats.extremeTemperature.min : 'N/A'}°C</td>
                        <td>{stats ? stats.extremeTemperature.minYear : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>Quantité de pluie</td>
                        <td>{stats ? stats.rain.max : 'N/A'} mm</td>
                        <td>{stats ? stats.rain.maxYear : 'N/A'}</td>
                        <td>{stats ? stats.rain.min : 'N/A'} mm</td>
                        <td>{stats ? stats.rain.minYear : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>Quantité de neige</td>
                        <td>{stats ? stats.snow.max : 'N/A'} cm</td>
                        <td>{stats ? stats.snow.maxYear : 'N/A'}</td>
                        <td>{stats ? stats.snow.min : 'N/A'} cm</td>
                        <td>{stats ? stats.snow.minYear : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>Vitesse du vent</td>
                        <td>{stats ? stats.wind.max : 'N/A'} km/h</td>
                        <td>{stats ? stats.wind.maxYear : 'N/A'}</td>
                        <td>{stats ? stats.wind.min : 'N/A'} km/h</td>
                        <td>{stats ? stats.wind.minYear : 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })
          ) : (
            <p></p>
          )}
        </div>
        <div id="historical-daily-info" className={toggle === 3 ? "show-content" : "hide-content"}>
          <div className="filter-section">
            <label htmlFor="year">Année:</label>
            <div className="custom-select">
              <select
                id="year"
                name="year"
                value={selectedYear}
                onChange={handleYearChange}
              >
                <option value="">Année</option>
                {years.map((year, index) => (
                  <option key={index} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="filter-section">
            <label htmlFor="month">Mois:</label>
            <div className="custom-select">
              <select
                id="month"
                name="month"
                value={selectedMonth}
                onChange={handleMonthChange}
              >
                <option value="">Mois</option>
                {months.map((month, index) => (
                  <option key={index} value={month}>{frenchMonths[parseInt(month) - 1]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="filter-section">
            <label htmlFor="date">Jour:</label>
            <select
              id="date"
              name="date"
              value={selectedDate}
              onChange={handleDateChange}
            >
              <option value="">Jour</option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          {dataUnavailable ? (
            <p>Données non disponibles pour la date sélectionnée. Veuillez choisir une autre date.</p>
          ) : (
            historicalDailyInfo.length > 0 && (
              <table>
                <thead>
                  <tr>
                    {!isColumnEmpty(historicalDailyInfo, "Time (LST)") && <th>Heure</th>}
                    {!isColumnEmpty(historicalDailyInfo, "Temp (°C)") && <th>Temp (°C)</th>}
                    {!isColumnEmpty(historicalDailyInfo, "Wind Chill") && <th>Temp ressentie</th>}
                    {!isColumnEmpty(historicalDailyInfo, "Weather") && <th>Météo</th>}
                    {!isColumnEmpty(historicalDailyInfo, "Rel Hum (%)") && <th>Humidité (%)</th>}
                    {!isColumnEmpty(historicalDailyInfo, "Wind Dir (10s deg)") && <th>Dir. vent</th>}
                    {!isColumnEmpty(historicalDailyInfo, "Wind Spd (km/h)") && <th>Vit. vent (km/h)</th>}
                    {!isColumnEmpty(historicalDailyInfo, "Stn Press (kPa)") && <th>Pression (kPa)</th>}
                  </tr>
                </thead>
                <tbody>
                  {historicalDailyInfo.map((info, index) => (
                    <tr key={index}>
                      {!isColumnEmpty(historicalDailyInfo, "Time (LST)") && <td>{info["Time (LST)"]}</td>}
                      {!isColumnEmpty(historicalDailyInfo, "Temp (°C)") && <td>{info["Temp (°C)"]}</td>}
                      {!isColumnEmpty(historicalDailyInfo, "Wind Chill") && <td>{info["Wind Chill"]}</td>}
                      {!isColumnEmpty(historicalDailyInfo, "Weather") && <td>{info["Weather"]}</td>}
                      {!isColumnEmpty(historicalDailyInfo, "Rel Hum (%)") && <td>{info["Rel Hum (%)"]}</td>}
                      {!isColumnEmpty(historicalDailyInfo, "Wind Dir (10s deg)") && <td>{info["Wind Dir (10s deg)"]}</td>}
                      {!isColumnEmpty(historicalDailyInfo, "Wind Spd (km/h)") && <td>{info["Wind Spd (km/h)"]}</td>}
                      {!isColumnEmpty(historicalDailyInfo, "Stn Press (kPa)") && <td>{info["Stn Press (kPa)"]}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
        <div id="forecast" className={toggle === 4 ? "show-content" : "hide-content"}>
          {forecastInfo.entry?.length > 0 ? (
            <>
            <h3>
              <a href={forecastInfo.link[0].$.href}>
                {forecastInfo.title}
              </a>
            </h3>
            <p>Dernier mise a jour: {forecastInfo.updated}</p>
            <table>
              <thead>
                <tr>
                  <th>Prévisions des 7 jours à venir</th>
                </tr>
              </thead>
              <tbody>
                {forecastInfo.entry.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </>
          ) : (
            <p>Prévisions météo non disponibles.</p>
          )}
        </div>
      </div>
      
    </div>
  );

}

export default DateFilter;
