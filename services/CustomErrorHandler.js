class CustomErrorHandler extends Error {
    constructor(status, msg) {
        super();
        this.status = status;
        this.message = msg
    }
    
    static alreadyExist(message){
    return new CustomErrorHandler(409 , message)
    }
    
    static wrongCredentials(message = 'username or password does not found'){
    return new CustomErrorHandler(401 , message)
    }
    
    static notFound(message = '404 not found...'){
    return new CustomErrorHandler(404 , message)
    }
    static unAuthorized(message='you are unauthorized'){
    return new CustomErrorHandler(401 , message)
    }
    
    static serverError(message='internal srver error'){
    return new CustomErrorHandler(501, message);
    }
}

export default CustomErrorHandler