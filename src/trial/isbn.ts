import ISBN from 'isbn3';

let a=ISBN.parse("978-4-87311-336-4");

console.log(a?.isValid);
