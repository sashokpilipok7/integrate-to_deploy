import * as AdmZip from "adm-zip";
import * as fs from "fs";

export const unzipFile = async (
  filePath: string | Buffer,
  destPath: string
) => {
  return new Promise<void>((resolve, reject) => {
    try {
      const zip = new AdmZip(filePath);
      zip.extractAllToAsync(destPath, true, false, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};

export const readDirectory = ({
  path,
  arr = [],
}: {
  path: fs.PathLike;
  arr?: any[];
}) => {
  const returnArray: string[] = [];

  const files = fs.readdirSync(path);

  if (!arr) {
    arr = [];
  }

  files.forEach((file) => {
    let filePath = `${path}/${file}`;
    let stats = fs.statSync(filePath);
    if (stats.isFile()) {
      // console.log(`${filePath} is a file.`);
      returnArray.push(filePath);
    } else if (stats.isDirectory()) {
      // console.log(`${filePath} is a directory.`);
      const newArr = readDirectory({ path: filePath, arr: returnArray });
      returnArray.push(...newArr);
    }
  });

  return returnArray;
};
