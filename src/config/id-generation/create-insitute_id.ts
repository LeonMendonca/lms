//  {institute_name_abbr}{created_at_year}

export function genInstituteId(institute_name:string, created_at: string){

    const institute_name_abbr = institute_name.split(" ").map((item) => (item[0] === item[0].toUpperCase()) ? item[0] : "").join("");

    const created_at_year = created_at.slice(0,4)

    const id = `${institute_name_abbr}${created_at_year}`
    
    return id
}
