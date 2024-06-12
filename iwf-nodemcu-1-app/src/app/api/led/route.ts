import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Data {
  isOn: boolean;
}

const dataFilePath = `/tmp/iwf-nodemcu-1/led.json`;

const ensureDirectoryExistence = (filePath: string) => {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
};

const saveData = (data: Data) => {
  ensureDirectoryExistence(dataFilePath);
  fs.writeFileSync(dataFilePath, JSON.stringify(data), { encoding: 'utf-8' });
};

const getData = (): Data => {
  if (!fs.existsSync(dataFilePath)) {
    ensureDirectoryExistence(dataFilePath);
    const defaultData: Data = { isOn: false };
    saveData(defaultData);
    return defaultData;
  }
  return JSON.parse(fs.readFileSync(dataFilePath, { encoding: 'utf-8' }));
};

export const PATCH = async (req: Request) => {
  const data: Data = await req.json();

  const isOn = data.isOn === true;

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

    return new Response(items.join(';'));
  }

  return NextResponse.json(data);
};
