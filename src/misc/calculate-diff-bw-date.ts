export function CalculateDaysFromDate(d1: Date, d2: Date) {
    let Difference_In_Time = d1.getTime() - d2.getTime();
    let Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));
    return Difference_In_Days;
}