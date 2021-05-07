import dayjs from "dayjs"

const endOfTheDate = (date: Date) =>
    dayjs(date)
        .set('hour', 23)
        .set('minute', 59)
        .set('second', 59)
        .set('millisecond', 999)
        .toDate()


export default endOfTheDate
