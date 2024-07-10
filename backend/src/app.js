import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import { promises as fs } from 'fs';
import { parseStringPromise } from 'xml2js';

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());


async function extractStationCodeFromTCID(tCID) {
  const station_mapping_file_path = `src/station_mapping.json`
    try {
        const data = JSON.parse(await fs.readFile(station_mapping_file_path, 'utf8'));
        if (data.hasOwnProperty(tCID)) {
            const rssFeed = data[tCID].rss_feed;
            const extractedCode = rssFeed.split('/').pop().split('_')[0];
            return extractedCode;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error reading or parsing the file:', error);
    }
}

// Fetch les données pour une journée passée
app.get('/weather/day', async (req, res) => {
  const { stationId, year, month, day } = req.query;

  if (!stationId || !year || !month || !day) {
    return res.status(400).json({ error: 'Missing required query parameters: stationId, year, month, day' });
  }

  const url = `https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID=${stationId}&Year=${year}&Month=${month}&Day=${day}&timeframe=1&submit=%20Download+Data`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.text();

    const lines = data.trim().split('\n');

    const headers = lines[0].split(',')
      .map(header => header.trim());
  
    const relevantHeaders = headers.filter((header, index) => {
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');
        if (columns[index] && columns[index].trim() !== '') {
          return true;
        }
      }
      return false;
    });
  
    const parsedData = lines.slice(1).map(line => {
        const columns = line.split(',');
      
        if (columns.length < relevantHeaders.length) {
          const diff = relevantHeaders.length - columns.length;
          for (let i = 0; i < diff; i++) {
            columns.push('');
          }
        } 

        const rowData = {};
        relevantHeaders.forEach((header, index) => {
          const key = header.replace(/"/g, '');
          let value = columns[index].trim();

          if (value === '') {
            value = null;
          } else {
            if (key === 'Weather') {
              value = value.replace(/^"|"$/g, '');
            } else {
              try {
                value = JSON.parse(value); 
              } catch (error) {
                console.error(`Error parsing value for header '${header}': ${error}`);
                value = null; 
              }
            }
          }
      
          rowData[key] = value;
        });
      
        return rowData;
      });
      

    const filteredRecords = parsedData.filter(record => {
      const recordDate = new Date(record['Date/Time (LST)']);
      return (
        recordDate.getFullYear() === parseInt(year) &&
        recordDate.getMonth() + 1 === parseInt(month) && 
        recordDate.getDate() === parseInt(day)
      );
    });

    // Log the filtered records for debugging
    console.log(`Filtered records: ${JSON.stringify(filteredRecords.slice(0, 5))}...`); // Print only the first 5 filtered records for brevity

    res.json(filteredRecords);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch les prévisions météo pour une station
app.get('/weather/forecast', async (req, res) => {
  const { tCID } = req.query;
  console.log('hi', tCID)

  if (!tCID) {
    return res.status(400).json({ error: 'Missing required query parameter: tCID' });
  }

  const code = await extractStationCodeFromTCID(tCID);
  console.log('city code', code)

  const url = `https://meteo.gc.ca/rss/city/${code}_f.xml`;

  try {
    const response = await fetch(url);
    console.log('status', response.status)
    if (!response.status == 200) {
      throw new Error('Network response was not ok');
    }
    const xml = await response.text();
    const result = await parseStringPromise(xml);
    res.json(result);
    //console.log('result' , result.feed.entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
