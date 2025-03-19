// components/RouteForm.tsx
import { useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { toast } from 'react-toastify';

interface Location {
  id: number;
  name: string;
  value:string;
}

interface RouteFormProps {
  locations: Location[];
  setRoute: React.Dispatch<React.SetStateAction<[number, number][] | []>>;
}

const RouteForm: React.FC<RouteFormProps> = ({ locations, setRoute }) => {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [routeType, setRouteType] = useState<string>('shortest');

  const handleRouteSubmit = () => {
    if (!startLocation || !endLocation) {
      toast.error('Please select both start and end locations');
      return;
    }

    axios.post('http://localhost:5000/api/custom-route', {
      start: startLocation.value,
      end: endLocation.value,
      type: routeType,
    })
    .then(response => {
      setRoute(response.data.route);
      toast.success('Route optimized successfully');
    })
    .catch(error => {
      toast.error('Failed to optimize route');
    });
  };

  const locationOptions = locations.map(location => ({
    value: location.id,
    label: location.name,
  }));

  return (
    <div className="route-form">
      <Select
        options={locationOptions}
        placeholder="Start Location"
        onChange={setStartLocation}
      />
      <Select
        options={locationOptions}
        placeholder="End Location"
        onChange={setEndLocation}
      />
      <Select
        options={[
          { value: 'shortest', label: 'Shortest Path' },
          { value: 'fastest', label: 'Fastest Path' },
          { value: 'cheapest', label: 'Cheapest Path' },
        ]}
        placeholder="Route Type"
        onChange={(selected) => setRouteType(selected.value)}
      />
      <button onClick={handleRouteSubmit}>Optimize Route</button>
    </div>
  );
};

export default RouteForm;
