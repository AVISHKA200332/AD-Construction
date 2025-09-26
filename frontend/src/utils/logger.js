// Logger utility for handling errors and debugging in development
const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  log(message, ...args) {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  }

  warn(message, ...args) {
    if (isDevelopment) {
      console.warn(message, ...args);
    }
  }

  error(message, error) {
    if (isDevelopment) {
      console.error(message, error);
    }
    // In production, you could send errors to a monitoring service
  }

  debug(message, ...args) {
    if (isDevelopment) {
      console.debug(message, ...args);
    }
  }
}

export default new Logger();
