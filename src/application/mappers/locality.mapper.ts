import type { NominatimLocalityDto } from '@/application/dto/nominatim.dto';
import type { Locality } from '@/domain/entities/locality.entity';

export const toLocality = (item: NominatimLocalityDto): Locality => {
  const locationParts = item.display_name
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const descriptiveName = locationParts.slice(0, 3).join(', ');

  return {
    name: descriptiveName || item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
  };
};
