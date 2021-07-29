import fs from 'fs/promises'
import path from 'path'
import GeoData from '../data/geo.json'
import jimp from 'jimp'

interface ImageInfo {
  path: string
  fileName: string
  type: string
  id: number
}

interface LocationInfo {
  coordinates: {
    latitude: string,
    longitude: string
  },
  address: string,
  guName: string
}

interface Item extends ImageInfo, LocationInfo {
}

interface Choose <T> {
  item: T,
  index: number
}

function choice<T>(array: T[]): Choose<T> {
  const index = Math.floor(Math.random() * array.length)
  const item = array[index]
  return {
    item,
    index
  }
}

export async function fetchImageList (): Promise<ImageInfo[]> {
  const imageStoragePath = path.resolve('./data/이미지_대형폐기물')
  const fileNameList: string[] = await fs.readdir(imageStoragePath)
  return fileNameList
    .reduce((prev: ImageInfo[], fileName) => {
      const [type, idString] = fileName.split('_')
      const item: ImageInfo = {
        path: `${imageStoragePath}\\${fileName}`,
        id: Number(idString.slice(0, -4)),
        fileName,
        type,
      }

      prev.push(item)
      return prev
    }, [])
}

export function fetchLocationInfo (): LocationInfo[] {
  const { DATA } = GeoData

  return DATA.map((item) => ({
    coordinates: {
      latitude: item.ycode,
      longitude: item.xcode
    },
    address: item.addr,
    guName: item.gu_nm
  }))
}

export async function choiceRandomItems (): Promise<Item[]> {
  const result: Item[] = []
  const candidateImageList = await fetchImageList()
  const candidateLocationList = fetchLocationInfo()
  
  for (const locationInfo of candidateLocationList) {
    const { index, item } = choice(candidateImageList)
    const resultItem: Item = {
      ...locationInfo,
      ...item
    }

    result.push(resultItem)
    candidateImageList.splice(index, 1)
  }

  return result
}

export async function saveJson (data: any, path: string): Promise<void> {
  return fs.writeFile(path, JSON.stringify(data), 'utf-8')
}

export function copyFile (src: string, dst:string): Promise<void> {
  return fs.copyFile(src, dst)
}

export async function preprocessImage (src: string, dst: string, fileName: string, size: number): Promise<string> {
  const image = await jimp.read(src)
  await image.resize(size, jimp.AUTO)
  await image.quality(80)
  
  const dstPath = `${dst}/${fileName}`
  await image.writeAsync(dstPath)

  return dstPath
}

export async function preprocessThumbnail (src: string, dst: string, fileName: string, size: number): Promise<string> {
  const image = await jimp.read(src)

  let width = image.getWidth()
  let height = image.getHeight()

  if (width > height) {
    await image.resize(jimp.AUTO, size)
  } else {
    await image.resize(size, jimp.AUTO)
  }
  
  width = image.getWidth()
  height = image.getHeight()
  
  if (width > height) {
    await image.crop(width / 2 - size / 2, 0, size, height)
  } else {
    await image.crop(0, height / 2 - size / 2, width, size)
  }
  
  await image.quality(80)

  const dstPath = `${dst}/${fileName}`
  await image.writeAsync(dstPath)
  
  return dstPath
}

export function chunking<T> (array: T[], chunkSize = 50) {
  return array.reduce<T[][]>(
    (acc, _, index) => (index % chunkSize) ? acc : [...acc, array.slice(index, index + chunkSize)], []
  )
}
