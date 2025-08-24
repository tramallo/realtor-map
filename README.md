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
- Create **.env** file on the root of the poject and add the required values
```bash
VITE_SUPABASE_PROJECT_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_publishable_anon_key
```
- Run the project
```bash
npm run dev
```

## Project characteristics

It consists on a map that shows markers, some markers represent properties, and others represent address searches
When user interacts with the markers, he can perform CRUD operations on the properties

- To render the maps, its using [React-Leaflet]
- To geocode the addresses, its using Google Maps Platform Geocoding API [Maps-Geocoding-API]
- The map tiles are provided by [OpenStreetMap]
- To handle input data & validation it's using [React-Hook-Form] & [Zod]
- To manage local data storage, [Zustand]
- Material-UI for components 

[React-Leaflet]:https://react-leaflet.js.org
[Maps-Geocoding-API]: https://developers.google.com/maps/documentation/geocoding
[OpenStreetMap]: https://www.openstreetmap.org
[React-Hook-Form]: https://www.react-hook-form.com
[Zod]: https://zod.dev
[Zustand]: https://zustand-demo.pmnd.rs
