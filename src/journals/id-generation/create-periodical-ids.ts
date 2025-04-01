export function genId(instituteCount: string, instituteName: string) {
    const match = instituteCount.match(/\d+$/);
    const instCount = match ? match[0] : "000";

    const newCount = String(Number(instCount) + 1).padStart(instCount.length, '0');

    const instituteNameAbbr = instituteName
        .split(" ")
        .map((item) => (item[0] === item[0].toUpperCase()) ? item[0] : "")
        .join("");

    return `${instituteNameAbbr}${newCount}`;
}
