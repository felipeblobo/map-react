import "./global.css";
import "./App.css";
import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import AsyncSelect from "react-select/async";
import Leaflet from "leaflet";
import mapPackage from "./package.svg";
import mapPin from "./pin.svg";
import { useState } from "react";
import { fetchLocalMapBox } from "./apiMapBox";
import { v4 as uuidv4 } from "uuid";

const initialPosition = { lat: -22.3265, lng: -54.8331 };

const mapPackageIcon = Leaflet.icon({
  iconUrl: mapPackage,
  iconSize: [58, 68],
  iconAnchor: [29, 68],
  popupAnchor: [170, 2],
});

const mapPinIcon = Leaflet.icon({
  iconUrl: mapPin,
  iconSize: [58, 68],
  iconAnchor: [29, 68],
  popupAnchor: [170, 2],
});

function App() {
  const [vagas, setVagas] = useState([]);
  const [position, setPosition] = useState(null);
  const [name, setName] = useState("");
  const [complement, setComplement] = useState("");
  const [address, setAddress] = useState({
    label: "",
    value: "",
  });

  const [location, setLocation] = useState(initialPosition);

  const loadOptions = (inputValue, callback) => {
    const handleAsync = async() => {
      const response = await fetchLocalMapBox(inputValue)
      let places = [];
      if (inputValue.length < 5) return;      
      response.features.map((item) => {
      return places.push({
        label: item.place_name,
        value: item.place_name,
        coords: item.center,
        place: item.place_name,
      });
    });

    callback(places);

    }
    
    handleAsync()

  };

  const handleChangeSelect = (event) => {
    console.log("changed", event);
    setPosition({
      longitude: event.coords[0],
      latitude: event.coords[1],
    });

    setAddress({ label: event.place, value: event.place });

    setLocation({
      lng: event.coords[0],
      lat: event.coords[1],
    });
  };

  async function handleSubmit(event) {
    event.preventDefault();

    if (!address || !name) return;

    setVagas([
      ...vagas,
      {
        id: uuidv4(),
        name,
        address: address?.value || "",
        complement,
        latitude: location.lat,
        longitude: location.lng,
      },
    ]);

    setName("");
    setAddress(null);
    setComplement("");
    setPosition(null);
  }

  return (
    <div id="page-map">
      <main>
        <form onSubmit={handleSubmit} className="landing-page-form">
          <fieldset>
            <legend>ONG</legend>

            <div className="input-block">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                placeholder="Digite o nome da instituição"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="address">Endereço</label>
              <AsyncSelect
                placeholder="Digite seu endereço..."
                classNamePrefix="filter"
                cacheOptions
                loadOptions={loadOptions}
                onChange={handleChangeSelect}
                value={address}
              />
            </div>

            <div className="input-block">
              <label htmlFor="complement">Complemento</label>
              <input
                placeholder="apto / casa"
                id="complement"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
              />
            </div>
          </fieldset>

          <button className="confirm-button" type="submit">
            Confirmar
          </button>
        </form>
      </main>

      <MapContainer
        center={location}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {position && (
          <Marker
            icon={mapPinIcon}
            position={[position.latitude, position.longitude]}
          ></Marker>
        )}

        {vagas.map((vaga) => (
          <Marker
            key={vaga.id}
            icon={mapPackageIcon}
            position={[vaga.latitude, vaga.longitude]}
          >
            <Popup
              closeButton={false}
              minWidth={240}
              maxWidth={240}
              className="map-popup"
            >
              <div>
                <h3>{vaga.name}</h3>
                <p>
                  {vaga.address} - {vaga.complement}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
