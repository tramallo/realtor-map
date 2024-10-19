import "./App.css";
import Map from "./components/Map";
import SearchBar from "./components/SearchBar";

export default function App() {
  const handleSearch = (searchValue: string) => {
    const markerPosition = { lat: -31.39, lng: -57.95 };

    console.log(searchValue);
  };

  return (
    <div id="app">
      <SearchBar onSearch={handleSearch} />
      <Map />
    </div>
  );
}
