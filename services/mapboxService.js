const axios = require( "axios")

const  getRouteDetails = async (
    pickupcoordinates,
    destinationcoordinates
) => {
     const [pickuplng, pickuplat] = pickupcoordinates;
     const [destinationlng, destinationlat] = destinationcoordinates

       const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/` +
    `${pickuplng},${pickuplat};` +
    `${destinationlng},${destinationlat}`;

    const  response = await axios.get(url ,{
        params:{
            access_token:Process.env.MAPBOX-ACCESS-TOKEN,
            geometries :"geojson",
            overview:"full"

        }
    });


    if (!response.data.routes?.length) {
    throw new Error("Route not found");
  }

  const route = response.data.routes[0];

  return {
    distanceKm: route.distance / 1000,
    durationMinutes: route.duration / 60,
    geometry: route.geometry
  };
};

module.exports = {
  getRouteDetails
};

