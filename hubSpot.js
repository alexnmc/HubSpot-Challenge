const axios = require('axios')
axios.get('https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=3188ebf5095cfba8d35acc87415e')
.then(res => {
    const countryDates = res.data.partners.reduce((acc, partner) => {//get all the valid consecutive dates from the partners and grouping them by country 
        partner.availableDates.forEach((date, index, elements) => {
            const date1 =  date.split('-')
            const year1 = date1[0]
            const month1 = date1[1]
            const day1 = date1[2]
            const nextDate =  elements[index+1] && elements[index+1].split('-')
            const year2 = nextDate && nextDate[0]
            const month2 = nextDate && nextDate[1]
            const day2 = nextDate && nextDate[2]
            if(year1 === year2 && month1 === month2 && day2 - day1 === 1){
                if(acc[partner.country]) {
                    acc[partner.country].consecutiveDates.push([date, elements[index+1]])
                    !acc[partner.country].partners.includes(partner) && acc[partner.country].partners.push(partner)
                }else{
                    acc[partner.country] = {consecutiveDates: [[date, elements[index+1]]], partners: [partner]}
                }
            }
        })
        return acc
    }, {})

    const mostCommonDate = (arr) => { //finds the earliest most common date 
        return arr.reduce((acc, item)=> { 
        acc[item] ? acc[item]++ : acc[item] = 1
        if(acc[item] > acc.highestCount){
            acc.highestCount = acc[item]
            acc.highestItem = item
        }
        return acc
        },{highestItem: arr[0], highestCount: 1}).highestItem
    }

    let final = {countries:[]}
   
    for(let i in countryDates){
        const targetDate = mostCommonDate(countryDates[i].consecutiveDates)
        let countryObject = {           
            attendeeCount: 0,
            attendees: [],
            name: i,
            startDate: null
        }
        countryDates[i].partners.map(item => { //find the partners which are available on the target date
            if(item.availableDates.includes(targetDate[0]) && item.availableDates.includes(targetDate[1])){
                countryObject.attendeeCount++
                countryObject.attendees.push(item.email)
                countryObject.startDate = targetDate[0]
            }
        })
        final.countries.push(countryObject)
 }
    axios.post('https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=3188ebf5095cfba8d35acc87415e', final).then(res => console.log(res))
})


