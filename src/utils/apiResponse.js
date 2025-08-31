class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  static success(data, message = 'Success') {
    return new ApiResponse(200, data, message);
  }

  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  static noContent(message = 'No content') {
    return new ApiResponse(204, null, message);
  }

  static badRequest(message = 'Bad Request') {
    return new ApiResponse(400, null, message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiResponse(401, null, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiResponse(403, null, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiResponse(404, null, message);
  }

  static conflict(message = 'Resource already exists') {
    return new ApiResponse(409, null, message);
  }

  static error(message = 'Internal Server Error', statusCode = 500) {
    return new ApiResponse(statusCode, null, message);
  }
}

export default ApiResponse;
