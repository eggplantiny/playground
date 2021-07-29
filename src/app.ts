import { choiceRandomItems, preprocessImage, preprocessThumbnail, saveJson, chunking } from './dataRefine'

async function run () {
  const itemList = await choiceRandomItems()
  await saveJson(itemList, './data/choose/data.json')
  
  const chuckList = chunking(itemList, 10)
  
  let count = 0
  for await (const chuck of chuckList) {
    count += 1
    console.log(`start process ${count} chuck [${count}/${chuckList.length}]`)
    console.time('timer')

    await Promise.all([
      ...chuck.map(item => preprocessImage(item.path, './data/choose/images', item.fileName, 800)),
      ...chuck.map(item => preprocessThumbnail(item.path, './data/choose/thumbnails', `thumbnail_${item.fileName}`, 300))
    ])
    
    console.timeEnd('timer')
  }
}

run()
