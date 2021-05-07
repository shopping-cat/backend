import dayjs from "dayjs"

const startOfTheDate = (date: Date) =>
    dayjs(date)
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
        .toDate()


export default startOfTheDate