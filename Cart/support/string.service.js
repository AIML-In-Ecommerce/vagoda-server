
const lowercaseConsonants = [{key: 'q', value: 'q'}, {key: 'w', value: 'w'}, {key: 'r', value: 'r'}, {key: 't', value: 't'}, {key: 'p', value: 'p'}, {key: 's', value: 's'}, {key: 'd', value: 'd'}, 
    {key: 'đ', value: 'd'}, {key: 'f', value: 'f'}, {key: 'g', value: 'g'}, {key: 'h', value: 'h'}, {key: 'j', value: 'j'}, {key: 'k', value: 'k'}, {key: 'l', value: 'l'}, 
    {key: 'z', value: 'z'}, {key: 'x', value: 'x'}, {key: 'c', value: 'c'}, {key: 'v', value: 'v'}, {key: 'b', value: 'b'}, {key: 'n', value: 'n'}, {key: 'm', value: 'm'}]
const uppercaseConsonants =[{key: 'Q', value: 'Q'}, {key: 'W', value: 'W'}, {key: 'R', value: 'R'}, {key: 'T', value: 'T'}, {key: 'P', value: 'P'}, {key: 'S', value: 'S'}, {key: 'D', value: 'D'}, 
    {key: 'Đ', value: 'D'}, {key: 'F', value: 'F'}, {key: 'G', value: 'G'}, {key: 'H', value: 'H'}, {key: 'J', value: 'J'}, {key: 'K', value: 'K'}, {key: 'L', value: 'L'}, 
    {key: 'Z', value: 'Z'}, {key: 'X', value: 'X'}, {key: 'C', value: 'C'}, {key: 'V', value: 'V'}, {key: 'B', value: 'B'}, {key: 'N', value: 'N'}, {key: 'M', value: 'M'}]

const mapOfLowercaseConsonants = new Map()
const mapOfUppercaseConsonants = new Map()

lowercaseConsonants.forEach((item) =>
{
  mapOfLowercaseConsonants.set(item.key, item.value)
})

uppercaseConsonants.forEach((item) =>
{
  mapOfUppercaseConsonants.set(item.key, item.value)
})


const SupportStringService = 
{
    reduceVowelsInString(targetString, useEnglishAlpha = false)
    {
        let clonedString = ""
        const listOfSearchedVowelsIndex = []
        for(let i = 0; i < targetString.length; i++)
        {
            const charAtIndex = targetString.charAt(i)
            let referenceConsonant = mapOfLowercaseConsonants.get(charAtIndex)
            if(referenceConsonant == undefined)
            {
                referenceConsonant = mapOfUppercaseConsonants.get(charAtIndex)
            }
            if(referenceConsonant == undefined)
            {
                //this is a vowel
                listOfSearchedVowelsIndex.push(i)
            }
            else if(useEnglishAlpha == true)
            {
                clonedString = clonedString.concat(referenceConsonant)
            }
            else
            {
                clonedString = clonedString.concat(charAtIndex)
            }
        }

        return clonedString
    },


}


export default SupportStringService