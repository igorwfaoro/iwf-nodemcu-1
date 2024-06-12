import { NextResponse } from 'next/server';
import fs from 'fs';

interface Data {
  isOn: boolean;
}

const dataFilePath = `${process.cwd()}/data/led.json`;

const saveData = (data: Data) =>
  fs.writeFileSync(dataFilePath, JSON.stringify(data), { encoding: 'utf-8' });

const getData = (): Data =>
  JSON.parse(fs.readFileSync(dataFilePath, { encoding: 'utf-8' }));

export const PATCH = (req: Request) => {
  const { searchParams } = new URL(req.url);

  const isOnParamValue = searchParams.get('isOn');
  const isOn = isOnParamValue === 'true' || isOnParamValue === '1';

  saveData({ isOn });

  return NextResponse.json({ isOn });
};

export const GET = () => {
  const data = getData();
  return NextResponse.json(data);
};
