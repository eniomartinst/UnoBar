import BaseException from './BaseException.js';

class ValidationException extends BaseException {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

export default ValidationException;
