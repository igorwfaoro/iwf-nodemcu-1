'use client';

import { useEffect, useState } from 'react';

interface Data {
  isOn: boolean;
}

export default function IndexPage() {
  const [ledIsOn, setLedIsOn] = useState(false);

  useEffect(() => {
    const timeout = setInterval(getLedData, 1000);

    return () => {
      clearInterval(timeout);
    };
  }, []);

  const getLedData = () => {
    fetch('/api/led')
      .then((response) => response.json())
      .then((data: Data) => data.isOn)
      .then(setLedIsOn);
  };

  const setLedData = (isOn: boolean) =>
    fetch(`/api/led?isOn=${isOn ? '1' : '0'}`, { method: 'PATCH' })
      .then((response) => response.json())
      .then((data: Data) => data.isOn)
      .then(setLedIsOn);

  return (
    <main className="p-6 space-y-6 w-full h-screen flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold">NodeMCU</h1>

      <h2 className="font-bold">Led is {ledIsOn ? 'ON' : 'OFF'}</h2>

      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={ledIsOn}
          onChange={(e) => setLedData(e.target.checked)}
        />
        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          Led State
        </span>
      </label>
    </main>
  );
}
