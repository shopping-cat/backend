import dayjs from "dayjs"

const firstOfTheDate = (date: Date) =>
    dayjs(date)
        .set('h', 0)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
        .toDate()


export default firstOfTheDate