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

export const GET = (req: Request) => {
  const { searchParams } = new URL(req.url);

  const data = getData();

  const returnRawParamValue = searchParams.get('raw');
  const returnRaw =
    returnRawParamValue === 'true' || returnRawParamValue === '1';

  if (returnRaw) {
    const items: string[] = [];

    Object.entries(data).forEach(([key, value]) => {
      const valueToSet =
        typeof value === 'boolean' ? (value ? '1' : '0') : value;

      items.push(`${key}=${valueToSet}`);
    });

    return items.join(';');
  }

  return NextResponse.json(data);
};
