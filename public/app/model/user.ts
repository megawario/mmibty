export class User{
    constructor(
        public email?: string,
        public password?: string,
        public username?: number,
        public capcha?:string//optional hence the ?
    ) {  }
}