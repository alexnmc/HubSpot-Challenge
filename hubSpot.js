const axios = require('axios')
axios.get('https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=3188ebf5095cfba8d35acc87415e')
.then(res => {
    let countries = {}
    res.data.partners.reduce((acc, partner) => {//get all the valid consecutive dates find the target date and group them by country 
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
                    !acc[partner.country].partners.includes(partner) 
                    && partner.availableDates.includes(acc[partner.country].targetDate[0])
                    && partner.availableDates.includes(acc[partner.country].targetDate[1])
                    && acc[partner.country].partners.push(partner)
                    if(acc[partner.country].consecutiveDates[date + elements[index+1]] > acc[partner.country].maxCount){
                        acc[partner.country].maxCount = acc[partner.country].consecutiveDates[date + elements[index+1]]
                        acc[partner.country].targetDate = [date , elements[index+1]]
                    }
                    let emails = acc[partner.country]["finalCountryObject" + [date , elements[index+1]]] ? 
                    [...acc[partner.country]["finalCountryObject" + [date , elements[index+1]]].attendees, partner.email]:
                    [partner.email]
                    acc[partner.country]["finalCountryObject" + [date , elements[index+1]]] = {
                        attendeeCount: acc[partner.country].partners.length,
                        attendees:  emails,
                        name: partner.country,
                        startDate: acc[partner.country].targetDate[0]
                    }
                    countries[partner.country] = acc[partner.country]["finalCountryObject" +  acc[partner.country].targetDate]
                }else{
                    acc[partner.country] = {
                        consecutiveDates: {[date + elements[index+1]]: 1}, 
                        partners: partner.availableDates.includes(date) && partner.availableDates.includes(elements[index+1]) ? [partner] : [], 
                        targetDate: [date , elements[index+1]], 
                        maxCount: 1,
                        ["finalCountryObject" + [date , elements[index+1]]]: {
                            attendeeCount: 1,
                            attendees: [partner.email],
                            name: partner.country,
                            startDate: date
                        }
                    }
                    countries[partner.country] = acc[partner.country]["finalCountryObject" +  acc[partner.country].targetDate]
                }
            }
        })
        return acc
    }, {})

    const final = {countries: Object.values(countries)}

    axios.post('https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=3188ebf5095cfba8d35acc87415e', final)
    .then(res => console.log(res))
})


