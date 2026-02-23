import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '../api/locations.api';

export const useCities = () => {
  return useQuery({
    queryKey: ['locations', 'cities'],
    queryFn: locationsApi.getCities,
  });
};

export const useSections = (cityId?: number) => {
  return useQuery({
    queryKey: ['locations', 'sections', cityId],
    queryFn: () => locationsApi.getSections(cityId),
    enabled: !!cityId || cityId === undefined, // If undefined, fetch all. If defined, fetch for city.
  });
};

export const useOffices = (sectionId?: number) => {
  return useQuery({
    queryKey: ['locations', 'offices', sectionId],
    queryFn: () => locationsApi.getOffices(sectionId),
    enabled: !!sectionId || sectionId === undefined,
  });
};
