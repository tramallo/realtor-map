# RealtorMap

This project aims to ease a realtor company manage their data & allow to visualize it on a map.  

Expected functionalities are:
- Visualize properties on a map
- Perform CRUD operations to manage the available data
- Schedule property showings & manage showing appointments
- Visualize properties as list
- Filter visualized properties by their attributes

## Setup development environment
- Clone the repository
```bash
git clone https://github.com/tramallo/maps-test.git
```
- Instal dependencies
```bash
npm install
```
- Create **.env** file on the root of the poject and add the required key
```bash
echo VITE_GOOGLE_MAPS_API_KEY=your-api-key > .env
```
> [!IMPORTANT]  
> You need a google cloud project and Maps Platform service with Geocoding API enabled, which is the one used by this app.  
> See more about this on [Maps-Geocoding-API].
- Run the project
```bash
npm run dev
```

## Project characteristics

It consists on a map that shows markers, some markers represent properties, and others represent address searches
When user interacts with the markers, he can perform the CRUD operations on the properties

- To render the maps, its using [React-Leaflet]
- To geocode the addresses, its using Google Maps Platform Geocoding API [Maps-Geocoding-API]
- The map tiles are provided by [OpenStreetMap]
- To handle input data & validation it's using [React-Hook-Form] & [Zod]
- To manage local data storage, [Zustand]

[React-Leaflet]:https://react-leaflet.js.org
[Maps-Geocoding-API]: https://developers.google.com/maps/documentation/geocoding
[OpenStreetMap]: https://www.openstreetmap.org
[React-Hook-Form]: https://www.react-hook-form.com
[Zod]: https://zod.dev
[Zustand]: https://zustand-demo.pmnd.rs