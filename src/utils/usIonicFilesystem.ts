import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

export const useIonicFilesystem = () => {
  const writeFile = async (
    path: string,
    data: any,
    dir?: Directory,
    recursive: boolean = false
  ) => {
    await Filesystem.writeFile({
      path: path,
      data: data,
      directory: dir ? dir : Directory.Cache,
      recursive,
    });
  };



  return { writeFile };
};
