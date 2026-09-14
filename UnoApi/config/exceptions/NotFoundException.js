import BaseException from './BaseException.js';

class NotFoundException extends BaseException {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export default NotFoundException;
