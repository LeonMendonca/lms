export function genIdForCopies(copyCount:string, titleId: string){
    const match = copyCount.match(/\d+$/)
    const instCount = match ? match[0] : "000"
    
    const newCount = String(Number(instCount)+1).padStart(instCount.length, '0')

    const id = titleId + "-" + newCount
    console.log(id)
    return id
}