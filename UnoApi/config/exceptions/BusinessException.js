import BaseException from './BaseException.js';

class BusinessException extends BaseException {
  constructor(message = 'Business rule violation') {
    super(message, 422); // Unprocessable Entity is often used for business logic errors
  }
}

export default BusinessException;
