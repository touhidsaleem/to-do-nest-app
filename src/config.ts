export const PORT = '5000';
export const MONGODBURL = 'mongodb://localhost:27017/';
export const JWT_SECRET =
  '2a45ed6f7f80e4bb087273480e73ce85464c624cde2706116d187408da3ca12aaa16c6aff6aeb6c2764b8f71923f392ed598f541604b94850822a59f'; // env

export const ErrorMessages = {
  VALIDATION_ERROR: 'Validation error',
  USER_ALREADY_EXISTS: 'User already exists',
  USER_NOT_FOUND: 'User not found',
  INVALID_PASSWORD: 'Invalid password',
  INVALID_OR_EXPIRED_TOKEN: 'Invalid or expired token',

  INVALID_INPUT_DATA: 'Invalid input data',
  USER_ID_REQUIRED: 'User ID is required',
  USER_AND_TODO_ID_REQUIRED: 'User ID and Todo ID are required',
  TODO_NOT_FOUND: 'Todo not found or unauthorized',
  TASK_NOT_FOUND: 'Task not found',
  MISSING_FIELDS: 'Missing required fields',

  INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again later.',

  MISSING_TOKEN: 'Missing or invalid Authorization header',
  INVALID_TOKEN: 'Invalid token',
};
