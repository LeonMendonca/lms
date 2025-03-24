export function createNewDate(incBy: number) {
    let todaysDate = new Date();
    let returnDate = new Date();

    returnDate.setDate(todaysDate.getDate() + incBy);

    return returnDate;
}
