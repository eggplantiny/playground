import fs from 'fs/promises'
import path from 'path'
import GeoData from '../data/geo.json'

interface ImageInfo {
  path: string
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
