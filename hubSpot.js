const axios = require('axios')
axios.get('https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=3188ebf5095cfba8d35acc87415e')
.then(res => {
    const countryDates = res.data.partners.reduce((acc, partner) => {//get all the valid consecutive dates find the target date and group them by country 
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
                    acc[partner.country].consecutiveDates[date + elements[index+1]] ?  
                    acc[partner.country].consecutiveDates[date + elements[index+1]]++ : 
                    acc[partner.country].consecutiveDates[date + elements[index+1]] = 1
                    !acc[partner.country].partners.includes(partner) && acc[partner.country].partners.push(partner)
                    if(acc[partner.country].consecutiveDates[date + elements[index+1]] > acc[partner.country].maxCount){
                        acc[partner.country].maxCount = acc[partner.country].consecutiveDates[date + elements[index+1]]
                        acc[partner.country].targetDate = [date , elements[index+1]]
                    }
                }else{
                    acc[partner.country] = {
                        consecutiveDates: {[date + elements[index+1]]: 1}, 
                        partners: [partner], 
                        targetDate: [date , elements[index+1]], 
                        maxCount: 1}
                }
            }
        })
        return acc
    }, {})

    
    const final = {countries:[]}
    for(let i in countryDates){
        const targetDate = countryDates[i].targetDate
        const countryObject = {           
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

    axios.post('https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=3188ebf5095cfba8d35acc87415e', final)
    .then(res => console.log(res))
})


