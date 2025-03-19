// pages/index.tsx
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Map from './Map';
import RouteForm from './RouteForm';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';

interface Location {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  total_sales: number;
  category: string;
  address: string;
}

const Home: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [route, setRoute] = useState<[number, number][] | []>([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/store-optimization').then((response) => {
      setLocations(response.data.locations || []);
      setRoute(response.data.optimal_route || []);
    });
  }, []);

  return (
    <div>
      <Head>
        <title>Store & Route Optimization</title>
        <meta name="description" content="Optimize store locations and routing using AI" />
      </Head>

      <main>
        <h1>Store and Route Optimization</h1>
        <p>Optimized store locations, routes, and demand visualization.</p>

        <RouteForm locations={locations} setRoute={setRoute} />
        <Map apiEndpoint="/api/store-optimization" />

        <ToastContainer />
      </main>
    </div>
  );
};

export default Home;
