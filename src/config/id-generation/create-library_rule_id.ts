//  {institute_id}-{count}

export function genRuleId(institute_id:string, count:string){
    const match = count.match(/\d+$/)
    const instCount = match ? match[0] : "000"
    
    const newCount = String(Number(instCount)+1).padStart(instCount.length, '0')

    const id = `${institute_id}-${newCount}`

    return id
}
