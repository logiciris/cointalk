const bcrypt = require('bcrypt');
const password = 'Ad12!@Min13!#';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
