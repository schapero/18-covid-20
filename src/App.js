import React,{useState,useEffect} from "react";
import {FormControl,MenuItem,Select,Card, CardContent} from "@material-ui/core";
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import {sortData} from './util';
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
import './App.css';

function App() {
  const [countries, setCountries] = useState([]);
  const [country,setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter,setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [casesType, setCasesType] = useState("cases");
  const [mapCountries,setMapCountries] = useState([]);

  useEffect(()=>{
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    })
  },[])

  useEffect(()=>{
    const getCountriesData = async() =>{
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response)=> response.json())
      .then((data)=>{
          setCountries(data.map((country)=>(
            {
              name: country.country,
              value: country.countryInfo.iso2
            })))
          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(countries);
      });
    }
    getCountriesData();
  },[]);


  const onCountryChange = async ({target}) =>{
    const countryCode = target.value;
    const url = countryCode ==='worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then(response=>response.json())
    .then(data=>{
      setCountry(countryCode);
      setCountryInfo(data);
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    })


    //https://disease.sh/v3/covid-19/all
    //https://disease.sh/v3/covid-19/countries/[COUNTRY_CODE]
  }


  return (
    <div className="app">

      <div className="app__left" >
        <div className = "app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select
            variant="outlined"
            onChange={onCountryChange}
            value={country}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {/* Countries dropdwon list */}
              {countries.map(country => <MenuItem value ={country.value} > {country.name} </MenuItem>
              )}
            </Select>
  
          </FormControl>
        </div>
      
        <div className="app__stats">
          <InfoBox title="Coronavirus cases" cases={countryInfo.todayCases} total={countryInfo.cases}/>
          <InfoBox title="Recoverd" cases={countryInfo.todayRecovered} total={countryInfo.recovered}/>
          <InfoBox title="Deaths" cases={countryInfo.todayDeaths} total={countryInfo.deaths}/>
        </div>

        <Map 
         center={mapCenter}
         zoom={mapZoom}
         countries={mapCountries}
        />
      </div>


      <Card className="app__right" >
        <CardContent>
          <h3> Live cases by country</h3>
          <Table countries={tableData} />
          <h3>Worldwide new cases</h3>
          <LineGraph />
        </CardContent>
      </Card>

      
    </div>
  );
}

export default App;
