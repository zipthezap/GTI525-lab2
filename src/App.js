import React, { useEffect, useState, useCallback } from 'react';
import logo from './logo.png';
import banner from './banniere.png';
import './App.css';
import DateFilter from './DateFilter';
import Grid from '@mui/material/Grid';

const canadianProvinces = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland",
  "Nova Scotia",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Northwest Territories",
  "Nunavut",
  "Yukon"
];

function App() {
  const [stationData, setStationData] = useState([]);
  const [stationInven, setStationInven] = useState([]);
  const [provinceIndicesMap, setProvinceIndicesMap] = useState({});
  const [expandedProvince, setExpandedProvince] = useState(null);
  const [expandedProvinceData, setExpandedProvinceData] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [historicalDailyInfo, setHistoricalDailyInfo] = useState([]);
  const [dataUnavailable, setDataUnavailable] = useState(true);
  const [forecastInfo, setForecastInfo] = useState([]);

  const fetchStationFile = async (file) => {
    try {
      const response = await fetch(file);
      if (!response.ok) {
        console.error(`Failed to fetch ${file}: ${response.status} ${response.statusText}`);
        return null;
      }
      const text = await response.text();
      const lines = text.split('\n');
      
      const data = lines.slice(2).map(line => {
        const values = line.split('","').map(val => val.replace(/"/g, ''));
        return {
          longitude: values[0],
          latitude: values[1],
          stationName: values[2],
          climateID: values[3],
          dateTime: values[4],
          year: values[5],
          month: values[6],
          meanMaxTemp: values[7],
          meanMaxTempFlag: values[8],
          meanMinTemp: values[9],
          meanMinTempFlag: values[10],
          meanTemp: values[11],
          meanTempFlag: values[12],
          extrMaxTemp: values[13],
          extrMaxTempFlag: values[14],
          extrMinTemp: values[15],
          extrMinTempFlag: values[16],
          totalRain: values[17],
          totalRainFlag: values[18],
          totalSnow: values[19],
          totalSnowFlag: values[20],
          totalPrecip: values[21],
          totalPrecipFlag: values[22],
          snowGrndLastDay: values[23],
          snowGrndLastDayFlag: values[24],
          dirOfMaxGust: values[25],
          dirOfMaxGustFlag: values[26],
          spdOfMaxGust: values[27],
          spdOfMaxGustFlag: values[28]
        };
      });

      return data;
    } catch (error) {
      console.error(`Error fetching ${file}:`, error);
      return null;
    }
  };
  
  const fetchStationInventory = async (file) => {
    try {
      const response = await fetch(file);
      if (!response.ok) {
        console.error(`Failed to fetch ${file}: ${response.status} ${response.statusText}`);
        return null;
      }
      const text = await response.text();
      const lines = text.split('\n');
  
      const inventoryText = lines.slice(5).join('\n');
  
      const inventoryData = inventoryText.split('\n').map(line => {
        const values = line.split('","').map(val => val.replace(/"/g, ''));
        return {
          name: values[0],
          province: values[1],
          climateID: values[2],
          stationID: values[3],
          wMOID: values[4],
          tCID: values[5],
          latitudeDecimalDegrees: values[6],
          longitudeDecimalDegrees: values[7],
          latitude: values[8],
          longitude: values[9],
          elevationM: values[10],
          firstYear: values[11],
          lastYear: values[12],
          hLYFirstYear: values[13],
          hLYLastYear: values[14],
          dLYFirstYear: values[15],
          dLYLastYear: values[16],
          mLYFirstYear: values[17],
          mLYLastYear: values[18]
        };
      });
  
      return inventoryData;
    } catch (error) {
      console.error(`Error fetching ${file}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const processJSFiles = async () => {
      const stationsDataFiles = [
        `${process.env.PUBLIC_URL}/Lab1_CSV/118.csv.js`,
        `${process.env.PUBLIC_URL}/Lab1_CSV/1865.csv.js`,
        `${process.env.PUBLIC_URL}/Lab1_CSV/2205.csv.js`,
        `${process.env.PUBLIC_URL}/Lab1_CSV/3002.csv.js`,
        `${process.env.PUBLIC_URL}/Lab1_CSV/3328.csv.js`,
        `${process.env.PUBLIC_URL}/Lab1_CSV/3698.csv.js`,
        `${process.env.PUBLIC_URL}/Lab1_CSV/4337.csv.js`,
        `${process.env.PUBLIC_URL}/Lab1_CSV/4789.csv.js`,
        `${process.env.PUBLIC_URL}/Lab1_CSV/4932.csv.js`,
        `${process.env.PUBLIC_URL}/Lab1_CSV/5097.csv.js`,
        `${process.env.PUBLIC_URL}/Lab1_CSV/5251.csv.js`,
        `${process.env.PUBLIC_URL}/Lab1_CSV/5415.csv.js`,
        `${process.env.PUBLIC_URL}/Lab1_CSV/6207.csv.js`,
        `${process.env.PUBLIC_URL}/Lab1_CSV/6358.csv.js`,
        `${process.env.PUBLIC_URL}/Lab1_CSV/6633.csv.js`,
        `${process.env.PUBLIC_URL}/Lab1_CSV/6720.csv.js`,
      ];

      const stationInvenData = await fetchStationInventory(`${process.env.PUBLIC_URL}/Lab1_CSV/Station Inventory EN.csv.js`);
      setStationInven(stationInvenData);

      const stationData = [];
      for (const file of stationsDataFiles) {
        const fileData = await fetchStationFile(file);
        if (fileData !== null) {
          stationData.push(fileData);
        }
      }

      setStationData(stationData);

      const provinceIndicesMap = mapProvincesToIndices(stationData, stationInvenData);
      console.log("Province Indices Map:", provinceIndicesMap);
      setProvinceIndicesMap(provinceIndicesMap);
    };

    processJSFiles();
  }, []);

  useEffect(() => {
    console.log("Station Data:", stationData);

    if (selectedStation) {
      const uniqueYears = [...new Set(selectedStation.map(data => data.year))];
      const uniqueMonths = [...new Set(selectedStation.map(data => data.month))];
      
      console.log("Unique Years:", uniqueYears); 
      console.log("Unique Months:", uniqueMonths);

      setYears(uniqueYears);
      setMonths(uniqueMonths);
    }
  }, [selectedStation]);

  const mapProvincesToIndices = (stationData, stationInvenData) => {
    const provinceIndicesMap = {};
    canadianProvinces.forEach((province, index) => { 
      provinceIndicesMap[province] = [];
    });
  
    stationData.forEach((data, dataIndex) => {
      if (data.length > 0) {
        const inventoryMatch = stationInvenData.find(inventory => inventory.climateID === data[0].climateID);
        if (inventoryMatch && inventoryMatch.province) {
          const province = inventoryMatch.province.trim();
          const formattedProvince = province.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
          if (formattedProvince in provinceIndicesMap) {
            provinceIndicesMap[formattedProvince].push(dataIndex); 
          }
        }
      }
    });
    return provinceIndicesMap;
  };
  
  const toggleProvince = async (province) => {
    console.log("test:", province)
    if (expandedProvince === province) {
      setExpandedProvince(null);
      setExpandedProvinceData([]);
      setSelectedStation(null); 
    } else if (province == 'all-stations') {
      const allStationsIndexes = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
      ];
      const provinceData = allStationsIndexes.map(index => stationData[index]);
      console.log("data:", provinceData);
      console.log("expanded:", expandedProvinceData);
      setExpandedProvince("all-stations");  
      setExpandedProvinceData(provinceData);
    }
    else { 
      const dataIndices = provinceIndicesMap[province];
      const provinceData = dataIndices.map(index => stationData[index]);

      setExpandedProvince(province);  
      setExpandedProvinceData(provinceData);
    }
  };

  const handlePeriodChange = useCallback((start, end) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  const handleDateChange = useCallback(async (year, month, day) => {
    if (year && month && day && selectedStation) {
      try {
        const stationID = stationInven.find(item => item.climateID == selectedStation[0].climateID).stationID;
  
        console.log('stationId', stationID);
        console.log('year', year);
        console.log('month', month);
        console.log('day', day);
  
        const response = await fetch(`http://localhost:3001/weather/day?stationId=${stationID}&year=${year}&month=${month}&day=${day}`, {
          headers: {
            Accept: 'application/json'
          }
        });
  
        console.log('Response:', response);
  
        if (!response.ok) {
          throw new Error(`Network response was not ok. Status: ${response.status}`);
        }
  
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
  
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Expected JSON, but received:', text);
          throw new Error(`Expected JSON, but received: ${text}`);
        }
  
        const data = await response.json();
        console.log("Fetched Data:", data);
  
        const allDataUnavailable = data.every(info => 
          !info["Temp (°C)"] && 
          !info["Temp ressentie"] && 
          !info["Weather"] && 
          !info["Rel Hum (%)"] && 
          !info["Wind Dir (10s deg)"] && 
          !info["Wind Spd (km/h)"] && 
          !info["Stn Press (kPa)"]
        );
  
        if (data.length === 0 || allDataUnavailable) {
          setDataUnavailable(true);
          setHistoricalDailyInfo([]);
        } else {
          setDataUnavailable(false);
          setHistoricalDailyInfo(data);
        }
      } catch (error) {
        console.error(`Error fetching daily info:`, error);
        setDataUnavailable(true);
        setHistoricalDailyInfo([]);
      }
    }
  }, [selectedStation, stationInven]);
  
  const handleForecast = useCallback(async () => {
    if (selectedStation) {
      try {
        const tCID = stationInven.find(item => item.climateID === selectedStation[0].climateID).tCID;
        console.log('fetch');
        const response = await fetch(`http://localhost:3001/weather/forecast?tCID=${tCID}`, {
          headers: {
            Accept: 'application/json'
          }
        });

        if (!response.status == 200) {
          throw new Error(`Network response was not ok. Status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Expected JSON, but received:', text);
          throw new Error(`Expected JSON, but received: ${text}`);
        }

        const data = await response.json();
        console.log('data', data);
        setForecastInfo(data.feed);
      } catch (error) {
        console.error(`Error fetching forecast info:`, error);
        setForecastInfo([]);
      }
    }
  }, [selectedStation, stationInven]);

  useEffect(() => {
    handleForecast();
  }, [selectedStation, handleForecast]);

  return (
    <div className="App">
      <header>
        <div id="logo-banner">
          <img src={logo} alt="logo" /> 
          <img src={banner} alt="banner" /> 
        </div>
      </header>
  
      <div className="content-container">
        <div className="province-list">
          <ul>
            <React.Fragment key='all-stations'>
              <li className="province-box" onClick={() => toggleProvince('all-stations')} style={{ cursor: 'pointer' }}>
                Toutes les stations
              </li>
              {expandedProvince === 'all-stations' && (
                <ul className="expanded-content">
                  {expandedProvinceData
                    .map((station, idx) => ({
                      stationName: station[0].stationName,
                      index: idx
                    }))
                    .sort((a, b) => {
                      return a.stationName.localeCompare(b.stationName);
                    })
                    .map((station, idx) => (
                      <li
                        key={idx}
                        onClick={() => setSelectedStation(expandedProvinceData[station.index])}
                        className={
                          selectedStation &&
                          selectedStation[0].stationName === expandedProvinceData[station.index][0].stationName
                            ? 'selected-station'
                            : ''
                        }
                      >
                        {station.stationName}
                      </li>
                    ))}
                </ul>
              )}
            </React.Fragment>
            {Object.keys(provinceIndicesMap)
              .filter(province => province !== 'all-stations')
              .sort()
              .map((province) => {
                const indices = provinceIndicesMap[province];
                if (indices.length > 0) {
                  return (
                    <React.Fragment key={province}>
                      <li className="province-box" onClick={() => toggleProvince(province)} style={{ cursor: 'pointer' }}>
                        {province}
                      </li>
                      {expandedProvince === province && (
                        <ul className="expanded-content">
                          {indices
                            .map( index => ({
                              stationName: stationData[index][0].stationName,
                              index: index
                            }))
                            .sort((a, b) => {
                            return a.stationName.localeCompare(b.stationName);
                            })
                            .map((station, idx) => (
                              <li
                                key={idx}
                                onClick={() => setSelectedStation(stationData[station.index])}
                                className={selectedStation && selectedStation[0].stationName === stationData[station.index][0].stationName ? 'selected-station' : ''}
                              >
                                {console.log('hi:', station)}
                                {station.stationName}
                              </li>
                            ))}
                        </ul>
                      )}
                    </React.Fragment>
                  );
                } else {
                  return null;
                }
              })}
          </ul>
        </div>
        <Grid container>
          <Grid xs={12}>
            {console.log('selected station', selectedStation)}
            {selectedStation && (
              <span>
                Ville sélectionnée: {selectedStation[0].stationName}
              </span>
            )}
          </Grid>
          <Grid>
            <DateFilter 
              stationData={selectedStation || []} 
              years={years} 
              months={months} 
              onPeriodChange={handlePeriodChange}
              onDateChange={handleDateChange}
              historicalDailyInfo={historicalDailyInfo}
              dataUnavailable={dataUnavailable}
              forecastInfo={forecastInfo}
            />
          </Grid>
        </Grid>
      </div>
  
      <footer>
        <div id="coords">
          <h3>Équipe 6</h3>
          <p>Noms : Crystel Abou-Nahed, Bryan Caniedo, Olivier Fontaine</p>
          <p>Courriels : crystel.abou-nahed.1@ens.etsmtl.ca, bryan.caniedo.1@ens.etsmtl.ca, olivier.fontaine.2@ens.etsmtl.ca</p>
        </div>
      </footer>
    </div>
  );   
}

export default App;
