import { choiceRandomItems } from '../src/dataRefine'

describe('choiceRandomItems', () => {
    test('선택된 아이템이 유니크한가?', async () => {
        const itemList = await choiceRandomItems()
        const set = new Set()
        itemList.map(item => item.id).forEach((id) => set.add(id))

        expect(itemList.length).toBe(set.size)
    })
})
