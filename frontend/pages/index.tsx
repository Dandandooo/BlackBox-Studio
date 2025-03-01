import { useEffect, useState } from 'react';

const Index = () => {
  const [data, setData] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/data')
      .then(response => response.text())
      .then(text => setData(text))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Electron + Next.js + Actix</h1>
      <p>{data}</p>
    </div>
  );
};

export default Index;
