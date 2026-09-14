import BaseException from './BaseException.js';

class DatabaseException extends BaseException {
  constructor(message = 'Database error occurred') {
    super(message, 500);
  }
}

export default DatabaseException;
