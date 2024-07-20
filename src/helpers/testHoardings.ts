import hoardingModel from "../Models/hoardingModel";

type generateHoardingT = {
  ownerId?: string;
  hName: string;
  latitude?: number | undefined;
  longitude?: number | undefined;
};

export async function generateHoardings({
  ownerId,
  hName,
  latitude,
  longitude,
}: generateHoardingT) {
  let lat = latitude || 17.4;
  let long = longitude || 74.7;

  let objCreate = {
    owner: ownerId,
    name: hName,
    location: {
      geoLocation: {
        type: "Point",
        coordinates: [long, lat],
      },
    },
  };
  const hoarding = await hoardingModel.create(objCreate);
  return Promise.resolve(hoarding);
}
